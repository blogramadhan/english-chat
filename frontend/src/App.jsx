import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import { AuthProvider, useAuth } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/AdminDashboard'
import DosenDashboard from './pages/DosenDashboard'
import MahasiswaDashboard from './pages/MahasiswaDashboard'
import Discussion from './pages/Discussion'
import Profile from './pages/Profile'

// Component to handle root redirect
const RootRedirect = () => {
  const { user } = useAuth()

  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />
  }

  return <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Box minH="100vh" bg="gray.50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/dosen/dashboard"
              element={
                <PrivateRoute role="dosen">
                  <DosenDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/mahasiswa/dashboard"
              element={
                <PrivateRoute role="mahasiswa">
                  <MahasiswaDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/discussion/:id"
              element={
                <PrivateRoute>
                  <Discussion />
                </PrivateRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            <Route path="/" element={<RootRedirect />} />
          </Routes>
        </Box>
      </Router>
    </AuthProvider>
  )
}

export default App
