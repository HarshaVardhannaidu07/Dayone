import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Dashboard from '@/pages/Dashboard'
import CreateChallenge from '@/pages/CreateChallenge'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/challenge/create"
            element={
              <ProtectedRoute>
                <CreateChallenge />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
