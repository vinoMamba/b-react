import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

const Node = <div><span>hello</span></div>

function App() {
  const [n] = useState(1000)
  return <div>{n}</div>
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App/>)
