import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { prisma } from './db.js'

const app = express()
app.use(cors())
app.use(express.json())

const chave = Buffer.from(process.env.CRYPTO_KEY, 'hex')
const iv = Buffer.from(process.env.CRYPTO_IV, 'hex')

function criptografar(texto) {
  const cifra = crypto.createCipheriv('aes-256-cbc', chave, iv)
  return cifra.update(texto, 'utf8', 'hex') + cifra.final('hex')
}

function descriptografar(texto) {
  const decifra = crypto.createDecipheriv('aes-256-cbc', chave, iv)
  return decifra.update(texto, 'hex', 'utf8') + decifra.final('utf8')
}

function gerarHashCpf(cpf) {
  return crypto.createHmac('sha256', chave).update(cpf).digest('hex')
}

const soNumeros = (texto) => String(texto || '').replace(/\D/g, '')
const limparEmail = (email) => String(email || '').trim().toLowerCase()

function autenticar(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' })
  }
}

app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe o e-mail e a senha.' })
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email_cripto: criptografar(limparEmail(email)) },
  })

  if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
    return res.status(401).json({ erro: 'Usuário ou senha inválidos.' })
  }

  const token = jwt.sign({ id: usuario.id, nome: usuario.nome }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  })
  res.json({ token, nome: usuario.nome })
})

app.get('/api/resumo', autenticar, async (req, res) => {
  const usuarios = await prisma.usuario.count()
  const tarefas = await prisma.tarefa.count()
  res.json({ usuarios, tarefas })
})

function mostrarUsuario(u) {
  return {
    id: u.id,
    nome: u.nome,
    email: descriptografar(u.email_cripto),
    perfil: u.perfil,
  }
}

function validarUsuario({ nome, email, cpf, senha, perfil }, novo) {
  if (!nome || !nome.trim()) return 'O nome é obrigatório.'
  if (!email || !email.includes('@')) return 'Informe um e-mail válido.'
  if (!perfil) return 'Selecione o perfil.'
  if ((novo || cpf) && soNumeros(cpf).length !== 11) return 'O CPF deve ter 11 números.'
  if (novo && !senha) return 'A senha é obrigatória.'
  if (senha && senha.length < 6) return 'A senha deve ter no mínimo 6 caracteres.'
  return null
}

app.get('/api/usuarios', autenticar, async (req, res) => {
  const busca = (req.query.busca || '').trim()
  let where = {}

  if (busca) {
    where = {
      OR: [
        { nome: { contains: busca, mode: 'insensitive' } },
        { email_cripto: criptografar(limparEmail(busca)) },
      ],
    }
    if (soNumeros(busca).length === 11) {
      where.OR.push({ cpf_hash: gerarHashCpf(soNumeros(busca)) })
    }
  }

  const lista = await prisma.usuario.findMany({ where, orderBy: { nome: 'asc' } })
  res.json(lista.map(mostrarUsuario))
})

app.post('/api/usuarios', autenticar, async (req, res) => {
  const erro = validarUsuario(req.body, true)
  if (erro) return res.status(400).json({ erro })

  const { nome, email, cpf, senha, perfil } = req.body
  const criado = await prisma.usuario.create({
    data: {
      nome: nome.trim(),
      cpf_hash: gerarHashCpf(soNumeros(cpf)),
      email_cripto: criptografar(limparEmail(email)),
      senha_hash: await bcrypt.hash(senha, 10),
      perfil,
    },
  })
  res.status(201).json(mostrarUsuario(criado))
})

app.put('/api/usuarios/:id', autenticar, async (req, res) => {
  const erro = validarUsuario(req.body, false)
  if (erro) return res.status(400).json({ erro })

  const { nome, email, cpf, senha, perfil } = req.body
  const dados = {
    nome: nome.trim(),
    email_cripto: criptografar(limparEmail(email)),
    perfil,
  }
  if (cpf) dados.cpf_hash = gerarHashCpf(soNumeros(cpf))
  if (senha) dados.senha_hash = await bcrypt.hash(senha, 10)

  const atualizado = await prisma.usuario.update({
    where: { id: Number(req.params.id) },
    data: dados,
  })
  res.json(mostrarUsuario(atualizado))
})

app.delete('/api/usuarios/:id', autenticar, async (req, res) => {
  await prisma.usuario.delete({ where: { id: Number(req.params.id) } })
  res.status(204).end()
})

app.get('/api/projetos', autenticar, async (req, res) => {
  const projetos = await prisma.projeto.findMany({ orderBy: { nome: 'asc' } })
  res.json(projetos)
})

const comDetalhes = {
  projeto: { select: { id: true, nome: true } },
  responsavel: { select: { id: true, nome: true, email_cripto: true, perfil: true } },
}

function mostrarTarefa(t) {
  return {
    id: t.id,
    titulo: t.titulo,
    status: t.status,
    data_hora: t.data_hora.toISOString().slice(0, 16),
    id_projeto: t.id_projeto,
    id_responsavel: t.id_responsavel,
    projeto: t.projeto,
    responsavel: {
      id: t.responsavel.id,
      nome: t.responsavel.nome,
      email: descriptografar(t.responsavel.email_cripto),
      perfil: t.responsavel.perfil,
    },
  }
}

async function validarTarefa({ titulo, status, data_hora, id_projeto, id_responsavel }) {
  if (!titulo || !titulo.trim()) return 'O título é obrigatório.'
  if (!status) return 'Selecione o status.'
  if (!data_hora) return 'Informe a data e a hora de entrega.'
  if (!id_projeto) return 'Selecione o projeto.'
  if (!id_responsavel) return 'Selecione o colaborador responsável.'

  const responsavel = await prisma.usuario.findUnique({ where: { id: Number(id_responsavel) } })
  if (!responsavel) return 'O colaborador informado não existe.'
  return null
}

function dadosTarefa(body) {
  return {
    titulo: body.titulo.trim(),
    status: body.status,
    data_hora: new Date(body.data_hora + ':00Z'),
    id_projeto: Number(body.id_projeto),
    id_responsavel: Number(body.id_responsavel),
  }
}

app.get('/api/tarefas', autenticar, async (req, res) => {
  const tarefas = await prisma.tarefa.findMany({ include: comDetalhes, orderBy: { id: 'desc' } })
  res.json(tarefas.map(mostrarTarefa))
})

app.post('/api/tarefas', autenticar, async (req, res) => {
  const erro = await validarTarefa(req.body)
  if (erro) return res.status(400).json({ erro })

  const criada = await prisma.tarefa.create({ data: dadosTarefa(req.body), include: comDetalhes })
  res.status(201).json(mostrarTarefa(criada))
})

app.put('/api/tarefas/:id', autenticar, async (req, res) => {
  const erro = await validarTarefa(req.body)
  if (erro) return res.status(400).json({ erro })

  const atualizada = await prisma.tarefa.update({
    where: { id: Number(req.params.id) },
    data: dadosTarefa(req.body),
    include: comDetalhes,
  })
  res.json(mostrarTarefa(atualizada))
})

app.delete('/api/tarefas/:id', autenticar, async (req, res) => {
  await prisma.tarefa.delete({ where: { id: Number(req.params.id) } })
  res.status(204).end()
})

app.get('/api/agendamentos', autenticar, async (req, res) => {
  const tarefas = await prisma.tarefa.findMany({
    include: comDetalhes,
    orderBy: { data_hora: 'asc' },
  })
  res.json(tarefas.map(mostrarTarefa))
})

app.use((err, req, res, next) => {
  console.error(err)
  if (err.code === 'P2002') {
    return res.status(409).json({ erro: 'Já existe um colaborador com este e-mail ou CPF.' })
  }
  if (err.code === 'P2003') {
    return res.status(409).json({ erro: 'Não é possível excluir: existem registros vinculados.' })
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ erro: 'Registro não encontrado.' })
  }
  res.status(500).json({ erro: 'Erro interno no servidor.' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`))
