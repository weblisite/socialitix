import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import { Layout } from './components/layout/Layout'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ScrollToTop } from './components/ScrollToTop'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Pricing } from './pages/Pricing'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import { Features } from './pages/Features'
import { Help } from './pages/Help'
import { Blog } from './pages/Blog'
import { Tutorials } from './pages/Tutorials'
import { DebugUpload } from './pages/DebugUpload'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

function App() {
  const { isAuthenticated, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/features" element={<Layout><Features /></Layout>} />
        <Route path="/help" element={<Layout><Help /></Layout>} />
        <Route path="/blog" element={<Layout><Blog /></Layout>} />
        <Route path="/tutorials" element={<Layout><Tutorials /></Layout>} />
        <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
        <Route path="/terms" element={<Layout><Terms /></Layout>} />
        <Route path="/debug" element={<DebugUpload />} />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Layout><Login /></Layout>} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Layout><Register /></Layout>} 
        />
        
        {/* Protected dashboard routes - with header restored */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <DashboardLayout><Dashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* Redirect dashboard-related routes to main dashboard */}
        <Route path="/upload" element={<Navigate to="/dashboard" />} />
        <Route path="/editor/:videoId" element={<Navigate to="/dashboard" />} />
        <Route path="/profile" element={<Navigate to="/dashboard" />} />
        <Route path="/analytics" element={<Navigate to="/dashboard" />} />
        <Route path="/settings" element={<Navigate to="/dashboard" />} />
        <Route path="/video-library" element={<Navigate to="/dashboard" />} />
        <Route path="/clip-library" element={<Navigate to="/dashboard" />} />
        <Route path="/team" element={<Navigate to="/dashboard" />} />
        <Route path="/projects" element={<Navigate to="/dashboard" />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App 