export async function api(url, metodo = 'GET', corpo) {
  const resposta = await fetch('/api' + url, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  })

  if (resposta.status === 204) return null

  const dados = await resposta.json()

  if (!resposta.ok) {
    if (resposta.status === 401 && url !== '/login') {
      localStorage.clear()
      alert(dados.erro)
      window.location.reload()
    }
    throw new Error(dados.erro)
  }
  return dados
}

export function formatarDataHora(texto) {
  const [data, hora] = texto.split('T')
  return data.split('-').reverse().join('/') + ' ' + hora
}
