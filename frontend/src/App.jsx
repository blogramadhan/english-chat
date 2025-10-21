import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import DosenDashboard from './pages/DosenDashboard'
import MahasiswaDashboard from './pages/MahasiswaDashboard'
import Discussion from './pages/Discussion'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Box minH="100vh" bg="gray.50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

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

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Box>
      </Router>
    </AuthProvider>
  )
}

export default App
