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
        title: 'Login berhasil',
        status: 'success',
        duration: 3000,
      })
      navigate(`/${data.role}/dashboard`)
    } catch (error) {
      toast({
        title: 'Login gagal',
        description: error.response?.data?.message || 'Terjadi kesalahan',
        status: 'error',
        duration: 3000,
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
            <Heading size="xl" color="brand.600">Online Discussion</Heading>
            <Text color="gray.600">Masuk ke akun Anda</Text>

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
                  Masuk
                </Button>

                <Text>
                  Belum punya akun?{' '}
                  <Link as={RouterLink} to="/register" color="brand.500" fontWeight="bold">
                    Daftar di sini
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
