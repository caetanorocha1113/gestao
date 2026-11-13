import { useState } from 'react'
import Login from './pages/Login.jsx'
import Painel from './pages/Painel.jsx'
import Colaboradores from './pages/Colaboradores.jsx'
import Tarefas from './pages/Tarefas.jsx'
import Agendamento from './pages/Agendamento.jsx'

function App() {
  const [nome, setNome] = useState(localStorage.getItem('nome'))
  const [pagina, setPagina] = useState('painel')

  function entrar(dados) {
    localStorage.setItem('token', dados.token)
    localStorage.setItem('nome', dados.nome)
    setNome(dados.nome)
    setPagina('painel')
  }

  function sair() {
    localStorage.clear()
    setNome(null)
  }

  if (!nome) {
    return <Login aoEntrar={entrar} />
  }

  const menu = [
    ['painel', 'Painel'],
    ['colaboradores', 'Colaboradores'],
    ['tarefas', 'Tarefas'],
    ['agendamento', 'Agendamento'],
  ]

  return (
    <div>
      <header className="topo">
        <strong>Gestão de Tarefas</strong>

        <nav>
          {menu.map(([id, texto]) => (
            <button
              key={id}
              className={pagina === id ? 'ativo' : ''}
              onClick={() => setPagina(id)}
            >
              {texto}
            </button>
          ))}
        </nav>

        <span>Olá, {nome}</span>
        <button className="sair" onClick={sair}>Sair</button>
      </header>

      <main>
        {pagina === 'painel' && <Painel nome={nome} irPara={setPagina} />}
        {pagina === 'colaboradores' && <Colaboradores />}
        {pagina === 'tarefas' && <Tarefas />}
        {pagina === 'agendamento' && <Agendamento />}
      </main>
    </div>
  )
}

export default App
