import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import MemorySpaceArchive from './MemorySpaceArchive.jsx'
import './styles.css'
import './glass.css'
import './memory-space.css'
import './memory-space-v2.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <MemorySpaceArchive />
    </BrowserRouter>
  </React.StrictMode>,
)

// Temporary product identity while the underlying modules continue to evolve.
// Keeping this at the shell layer lets us rename the workspace without
// changing the existing module architecture or stored user data.
const applyMemorySpaceIdentity = () => {
  const brandTitle = document.querySelector('.brand h1')
  const brandSubtitle = document.querySelector('.brand p')
  if (brandTitle && brandTitle.textContent !== 'Memory Space') brandTitle.textContent = 'Memory Space'
  if (brandSubtitle && brandSubtitle.textContent !== 'Personal Life & Business OS') brandSubtitle.textContent = 'Personal Life & Business OS'

  const pageTitle = document.querySelector('.pageTitle h2')
  if (window.location.pathname === '/' && pageTitle?.textContent === 'Command Center') {
    pageTitle.textContent = 'Memory Space'
  }
}

applyMemorySpaceIdentity()
const identityObserver = new MutationObserver(applyMemorySpaceIdentity)
identityObserver.observe(document.getElementById('root'), { childList: true, subtree: true })
