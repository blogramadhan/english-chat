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
import LoomaLogo from '../components/LoomaLogo'

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
    <Container maxW="sm" centerContent py={12}>
      <Card w="full" boxShadow="md">
        <CardBody p={6}>
          <VStack spacing={4}>
            <Box pt={2}>
              <LoomaLogo size={70} />
            </Box>
            <VStack spacing={0.5}>
              <Heading size="lg" color="brand.600">LOOMA</Heading>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">Learning Online Platform</Text>
            </VStack>
            <Text color="gray.600" fontSize="sm">Sign in to your account</Text>

            <Box as="form" onSubmit={handleSubmit} w="full">
              <VStack spacing={3}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    size="sm"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="******"
                    size="sm"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="md"
                  w="full"
                  isLoading={loading}
                  mt={2}
                >
                  Sign In
                </Button>

                <Text fontSize="sm">
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
