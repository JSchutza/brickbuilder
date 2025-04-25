import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { useAuthStore } from './features/auth/authStore'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './features/auth/Login'
import Register from './features/auth/Register'
import EditorPage from './pages/EditorPage'
import SavedBuilds from './pages/SavedBuilds'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/editor" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/editor" />} />
            
            <Route path="/editor" element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            } />
            
            <Route path="/builds" element={
              <ProtectedRoute>
                <SavedBuilds />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; {new Date().getFullYear()} BrickBuilder</p>
      </footer>
    </div>
  )
}

export default App 