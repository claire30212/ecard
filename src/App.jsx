import { useEffect, useState } from 'react'
import './App.css'
import './styles/textures.css'
import CreatePage from './pages/CreatePage'
import ViewPage from './pages/ViewPage'
import MyCardsPage from './pages/MyCardsPage'
import { AuthProvider } from './context/AuthContext'

function readRoute() {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('id')
  const admin = params.get('admin')
  const view = params.get('view')
  if (id) return { type: 'card', id, admin }
  if (view === 'my-cards') return { type: 'my-cards' }
  return { type: 'create' }
}

export default function App() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    function handlePopState() {
      setRoute(readRoute())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function goToCard(id, adminKey) {
    const params = new URLSearchParams()
    params.set('id', id)
    if (adminKey) params.set('admin', adminKey)
    const url = `${window.location.pathname}?${params.toString()}`
    window.history.pushState({}, '', url)
    setRoute({ type: 'card', id, admin: adminKey || null })
  }

  return (
    <AuthProvider>
      {route.type === 'card' && (
        <ViewPage key={`${route.id}:${route.admin || ''}`} cardId={route.id} adminKeyFromUrl={route.admin} />
      )}
      {route.type === 'my-cards' && <MyCardsPage />}
      {route.type === 'create' && <CreatePage onViewCard={goToCard} />}
    </AuthProvider>
  )
}
