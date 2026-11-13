import { useEffect, useState } from 'react'
import { api, formatarDataHora } from '../api.js'

const VAZIO = { titulo: '', status: 'Pendente', data_hora: '', id_projeto: '', id_responsavel: '' }

function Tarefas() {
  const [tarefas, setTarefas] = useState([])
  const [colaboradores, setColaboradores] = useState([])
  const [projetos, setProjetos] = useState([])
  const [form, setForm] = useState(VAZIO)
  const [editandoId, setEditandoId] = useState(null)
  const [mensagem, setMensagem] = useState(null)

  async function carregar() {
    try {
      setTarefas(await api('/tarefas'))
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message })
    }
  }

  useEffect(() => {
    Promise.all([api('/tarefas'), api('/usuarios'), api('/projetos')])
      .then(([t, c, p]) => {
        setTarefas(t)
        setColaboradores(c)
        setProjetos(p)
      })
      .catch((err) => setMensagem({ tipo: 'erro', texto: err.message }))
  }, [])

  async function salvar(e) {
    e.preventDefault()
    setMensagem(null)
    try {
      if (editandoId) {
        await api('/tarefas/' + editandoId, 'PUT', form)
        setMensagem({ tipo: 'ok', texto: 'Tarefa atualizada!' })
      } else {
        await api('/tarefas', 'POST', form)
        setMensagem({ tipo: 'ok', texto: 'Tarefa cadastrada!' })
      }
      setForm(VAZIO)
      setEditandoId(null)
      carregar()
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message })
    }
  }

  function editar(t) {
    setEditandoId(t.id)
    setForm({
      titulo: t.titulo,
      status: t.status,
      data_hora: t.data_hora,
      id_projeto: t.id_projeto,
      id_responsavel: t.id_responsavel,
    })
  }

  async function excluir(t) {
    if (!window.confirm('Excluir a tarefa "' + t.titulo + '"?')) return
    try {
      await api('/tarefas/' + t.id, 'DELETE')
      setMensagem({ tipo: 'ok', texto: 'Tarefa excluída!' })
      carregar()
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message })
    }
  }

  const mudar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  return (
    <div>
      <h1>Tarefas</h1>

      {mensagem && <div className={mensagem.tipo}>{mensagem.texto}</div>}

      <form className="caixa" onSubmit={salvar}>
        <h2>{editandoId ? 'Editar tarefa' : 'Nova tarefa'}</h2>

        <label>Título</label>
        <input value={form.titulo} onChange={mudar('titulo')} />

        <label>Projeto</label>
        <select value={form.id_projeto} onChange={mudar('id_projeto')}>
          <option value="">Selecione...</option>
          {projetos.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>

        <label>Responsável (obrigatório)</label>
        <select value={form.id_responsavel} onChange={mudar('id_responsavel')}>
          <option value="">Selecione...</option>
          {colaboradores.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>

        <label>Data e hora de entrega</label>
        <input type="datetime-local" value={form.data_hora} onChange={mudar('data_hora')} />

        <label>Status</label>
        <select value={form.status} onChange={mudar('status')}>
          <option>Pendente</option>
          <option>Em andamento</option>
          <option>Concluída</option>
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

      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Projeto</th>
            <th>Entrega</th>
            <th>Status</th>
            <th>Responsável</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {tarefas.map((t) => (
            <tr key={t.id}>
              <td>{t.titulo}</td>
              <td>{t.projeto.nome}</td>
              <td>{formatarDataHora(t.data_hora)}</td>
              <td>{t.status}</td>
              <td>{t.responsavel.nome}</td>
              <td>
                <button className="cinza" onClick={() => editar(t)}>Editar</button>
                <button className="vermelho" onClick={() => excluir(t)}>Excluir</button>
              </td>
            </tr>
          ))}
          {tarefas.length === 0 && (
            <tr>
              <td colSpan="6">Nenhuma tarefa cadastrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Tarefas
