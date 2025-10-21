import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner, Center } from '@chakra-ui/react'

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}/dashboard`} />
  }

  return children
}

export default PrivateRoute
