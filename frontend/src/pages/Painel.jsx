import { useEffect, useState } from 'react'
import { api } from '../api.js'

function Painel({ nome, irPara }) {
  const [resumo, setResumo] = useState({ usuarios: 0, tarefas: 0 })

  useEffect(() => {
    api('/resumo').then(setResumo)
  }, [])

  return (
    <div>
      <h1>Bem-vindo(a), {nome}!</h1>
      <p>Escolha uma opção para começar.</p>

      <div className="cartoes">
        <div className="caixa cartao" onClick={() => irPara('colaboradores')}>
          <span className="numero">{resumo.usuarios}</span>
          <h2>Colaboradores</h2>
          <p>Cadastre e busque os responsáveis.</p>
        </div>

        <div className="caixa cartao" onClick={() => irPara('tarefas')}>
          <span className="numero">{resumo.tarefas}</span>
          <h2>Tarefas</h2>
          <p>Crie tarefas e escolha o responsável.</p>
        </div>

        <div className="caixa cartao" onClick={() => irPara('agendamento')}>
          <span className="numero">{resumo.tarefas}</span>
          <h2>Agendamento</h2>
          <p>Veja as tarefas por data de entrega.</p>
        </div>
      </div>
    </div>
  )
}

export default Painel
