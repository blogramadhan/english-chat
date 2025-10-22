import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Link,
  Card,
  CardBody,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = await login(email, password)
      toast({
        title: 'Login successful',
        description: `Welcome, ${data.name}!`,
        status: 'success',
        duration: 3000,
      })
      navigate(`/${data.role}/dashboard`)
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred'
      const isApprovalError = error.response?.status === 403

      toast({
        title: isApprovalError ? 'Account Not Approved' : 'Login failed',
        description: errorMessage,
        status: isApprovalError ? 'warning' : 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="md" centerContent py={20}>
      <Card w="full" boxShadow="xl">
        <CardBody>
          <VStack spacing={8}>
            <Heading size="xl" color="brand.600">THYNK</Heading>
            <Text color="gray.600">Sign in to your account</Text>

            <Box as="form" onSubmit={handleSubmit} w="full">
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="******"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  w="full"
                  isLoading={loading}
                >
                  Sign In
                </Button>

                <Text>
                  Don't have an account?{' '}
                  <Link as={RouterLink} to="/register" color="brand.500" fontWeight="bold">
                    Register here
                  </Link>
                </Text>
              </VStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  )
}

export default Login
