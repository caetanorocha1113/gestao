import { useState } from 'react'
import { api } from '../api.js'

function Login({ aoEntrar }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  async function entrar(e) {
    e.preventDefault()
    setErro('')

    if (!email || !senha) {
      setErro('Informe o e-mail e a senha.')
      return
    }

    try {
      const dados = await api('/login', 'POST', { email, senha })
      aoEntrar(dados)
    } catch (err) {
      setErro(err.message)
    }
  }

  return (
    <div className="login">
      <form className="caixa" onSubmit={entrar}>
        <h1>Entrar</h1>
        <p>Sistema de Gestão e Agendamento de Tarefas</p>

        {erro && <div className="erro">{erro}</div>}

        <label>E-mail</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Senha</label>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />

        <button>Entrar</button>
      </form>
    </div>
  )
}

export default Login
