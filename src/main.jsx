import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import GlobalCommand from './GlobalCommand.jsx'
import CommandCenterPro from './CommandCenterPro.jsx'
import './styles.css'
import './polish.css'
import './command.css'
import './advanced.css'
import './command-center-pro.css'

const basename=(import.meta.env.BASE_URL||'/').replace(/\/$/,'')||'/'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
      <GlobalCommand />
      <CommandCenterPro />
    </BrowserRouter>
  </React.StrictMode>,
)
