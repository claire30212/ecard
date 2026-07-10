import { useEffect, useState } from 'react'
import './App.css'
import CreatePage from './pages/CreatePage'
import ViewPage from './pages/ViewPage'

function readRoute() {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('id')
  const admin = params.get('admin')
  return id ? { id, admin } : null
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
    setRoute({ id, admin: adminKey || null })
  }

  if (route) {
    return <ViewPage key={`${route.id}:${route.admin || ''}`} cardId={route.id} adminKeyFromUrl={route.admin} />
  }
  return <CreatePage onViewCard={goToCard} />
}
