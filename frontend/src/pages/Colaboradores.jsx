import { useEffect, useState } from 'react'
import { api } from '../api.js'

const VAZIO = { nome: '', email: '', cpf: '', senha: '', perfil: 'colaborador' }

function Colaboradores() {
  const [lista, setLista] = useState([])
  const [form, setForm] = useState(VAZIO)
  const [editandoId, setEditandoId] = useState(null)
  const [termo, setTermo] = useState('')
  const [mensagem, setMensagem] = useState(null)

  async function carregar(busca = '') {
    try {
      setLista(await api('/usuarios?busca=' + encodeURIComponent(busca)))
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message })
    }
  }

  useEffect(() => {
    api('/usuarios?busca=')
      .then(setLista)
      .catch((err) => setMensagem({ tipo: 'erro', texto: err.message }))
  }, [])

  function buscar(e) {
    e.preventDefault()
    carregar(termo.trim())
  }

  function limparBusca() {
    setTermo('')
    carregar()
  }

  async function salvar(e) {
    e.preventDefault()
    setMensagem(null)
    try {
      if (editandoId) {
        await api('/usuarios/' + editandoId, 'PUT', form)
        setMensagem({ tipo: 'ok', texto: 'Colaborador atualizado!' })
      } else {
        await api('/usuarios', 'POST', form)
        setMensagem({ tipo: 'ok', texto: 'Colaborador cadastrado!' })
      }
      setForm(VAZIO)
      setEditandoId(null)
      carregar(termo.trim())
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message })
    }
  }

  function editar(u) {
    setEditandoId(u.id)
    setForm({ nome: u.nome, email: u.email, cpf: '', senha: '', perfil: u.perfil })
  }

  async function excluir(u) {
    if (!window.confirm('Excluir ' + u.nome + '?')) return
    try {
      await api('/usuarios/' + u.id, 'DELETE')
      setMensagem({ tipo: 'ok', texto: 'Colaborador excluído!' })
      carregar(termo.trim())
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message })
    }
  }

  const mudar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  return (
    <div>
      <h1>Colaboradores</h1>

      {mensagem && <div className={mensagem.tipo}>{mensagem.texto}</div>}

      <form className="caixa" onSubmit={salvar}>
        <h2>{editandoId ? 'Editar colaborador' : 'Novo colaborador'}</h2>

        <label>Nome</label>
        <input value={form.nome} onChange={mudar('nome')} />

        <label>E-mail</label>
        <input value={form.email} onChange={mudar('email')} />

        <label>{editandoId ? 'Novo CPF (deixe em branco para manter)' : 'CPF'}</label>
        <input value={form.cpf} onChange={mudar('cpf')} placeholder="000.000.000-00" />

        <label>{editandoId ? 'Nova senha (deixe em branco para manter)' : 'Senha'}</label>
        <input type="password" value={form.senha} onChange={mudar('senha')} />

        <label>Perfil</label>
        <select value={form.perfil} onChange={mudar('perfil')}>
          <option value="colaborador">Colaborador</option>
          <option value="gestor">Gestor</option>
          <option value="admin">Administrador</option>
        </select>

        <div className="linha">
          <button>{editandoId ? 'Salvar' : 'Cadastrar'}</button>
          {editandoId && (
            <button
              type="button"
              className="cinza"
              onClick={() => {
                setEditandoId(null)
                setForm(VAZIO)
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <form className="caixa linha" onSubmit={buscar}>
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por nome, e-mail completo ou CPF completo"
        />
        <button>Buscar</button>
        <button type="button" className="cinza" onClick={limparBusca}>
          Limpar
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Perfil</th>
            <th>CPF</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((u) => (
            <tr key={u.id}>
              <td>{u.nome}</td>
              <td>{u.email}</td>
              <td>{u.perfil}</td>
              <td>Protegido</td>
              <td>
                <button className="cinza" onClick={() => editar(u)}>Editar</button>
                <button className="vermelho" onClick={() => excluir(u)}>Excluir</button>
              </td>
            </tr>
          ))}
          {lista.length === 0 && (
            <tr>
              <td colSpan="5">Nenhum colaborador encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Colaboradores
