import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

function Child() {
  return <span>child</span>
}

function App() {
  const [n, setN] = useState(1000)
  window.setN = setN
  return n === 3 ? <Child/> : <div>{n}</div>
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App/>)
