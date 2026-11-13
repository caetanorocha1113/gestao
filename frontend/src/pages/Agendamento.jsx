import { useEffect, useState } from 'react'
import { api, formatarDataHora } from '../api.js'

function Agendamento() {
  const [itens, setItens] = useState([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    api('/agendamentos')
      .then(setItens)
      .catch((err) => setErro(err.message))
  }, [])

  return (
    <div>
      <h1>Agendamento de prazos</h1>
      <p>Todas as tarefas ordenadas pela data de entrega.</p>

      {erro && <div className="erro">{erro}</div>}

      <table>
        <thead>
          <tr>
            <th>Entrega</th>
            <th>Tarefa</th>
            <th>Status</th>
            <th>Projeto</th>
            <th>Responsável</th>
            <th>E-mail</th>
            <th>Perfil</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((t) => (
            <tr key={t.id}>
              <td>{formatarDataHora(t.data_hora)}</td>
              <td>{t.titulo}</td>
              <td>{t.status}</td>
              <td>{t.projeto.nome}</td>
              <td>{t.responsavel.nome}</td>
              <td>{t.responsavel.email}</td>
              <td>{t.responsavel.perfil}</td>
            </tr>
          ))}
          {itens.length === 0 && (
            <tr>
              <td colSpan="7">Nenhuma tarefa agendada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Agendamento
