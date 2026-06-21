import { Routes, Route, Navigate } from 'react-router-dom'
import { isConfigured } from './lib/config.js'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import { WorkspaceProvider } from './hooks/useWorkspace.jsx'
import { DataProvider } from './hooks/useData.jsx'
import Layout from './components/Layout.jsx'
import Setup from './pages/Setup.jsx'
import Login from './pages/Login.jsx'
import Inbox from './pages/Inbox.jsx'
import NextActions from './pages/NextActions.jsx'
import Today from './pages/Today.jsx'
import Projects from './pages/Projects.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import More from './pages/More.jsx'
import Contexts from './pages/Contexts.jsx'
import ListView from './pages/ListView.jsx'
import Review from './pages/Review.jsx'
import Search from './pages/Search.jsx'
import Team from './pages/Team.jsx'
import Settings from './pages/Settings.jsx'

function Gate() {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner" />
  if (!user) return <Login />
  return (
    <WorkspaceProvider>
      <DataProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Inbox />} />
            <Route path="next" element={<NextActions />} />
            <Route path="today" element={<Today />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="more" element={<More />} />
            <Route path="contexts" element={<Contexts />} />
            <Route path="waiting" element={<ListView status="waiting" />} />
            <Route path="someday" element={<ListView status="someday" />} />
            <Route path="scheduled" element={<ListView status="scheduled" />} />
            <Route path="done" element={<ListView status="done" />} />
            <Route path="review" element={<Review />} />
            <Route path="search" element={<Search />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DataProvider>
    </WorkspaceProvider>
  )
}

export default function App() {
  if (!isConfigured()) return <Setup />
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
