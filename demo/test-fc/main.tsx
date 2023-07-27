import React from 'react'
import ReactDOM from 'react-dom/client'

const Node = <div><span>hello</span></div>

function App() {
  return <div>{Node}</div>
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App/>)
