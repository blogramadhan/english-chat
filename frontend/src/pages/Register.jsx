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
  Select,
  Card,
  CardBody,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'mahasiswa',
    nim: '',
    nip: ''
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await register(formData)

      toast({
        title: 'Registrasi berhasil',
        description: response.message || 'Akun Anda berhasil dibuat. Silakan tunggu approval dari admin.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      // Redirect to login after registration
      navigate('/login')
    } catch (error) {
      toast({
        title: 'Registrasi gagal',
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
            <Text color="gray.600">Daftar akun baru</Text>

            <Box as="form" onSubmit={handleSubmit} w="full">
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nama lengkap Anda"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimal 6 karakter"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Role</FormLabel>
                  <Select name="role" value={formData.role} onChange={handleChange}>
                    <option value="mahasiswa">Mahasiswa</option>
                    <option value="dosen">Dosen</option>
                  </Select>
                </FormControl>

                {formData.role === 'mahasiswa' && (
                  <FormControl>
                    <FormLabel>NIM</FormLabel>
                    <Input
                      name="nim"
                      value={formData.nim}
                      onChange={handleChange}
                      placeholder="Nomor Induk Mahasiswa"
                    />
                  </FormControl>
                )}

                {formData.role === 'dosen' && (
                  <FormControl>
                    <FormLabel>NIP</FormLabel>
                    <Input
                      name="nip"
                      value={formData.nip}
                      onChange={handleChange}
                      placeholder="Nomor Induk Pegawai"
                    />
                  </FormControl>
                )}

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  w="full"
                  isLoading={loading}
                >
                  Daftar
                </Button>

                <Text>
                  Sudah punya akun?{' '}
                  <Link as={RouterLink} to="/login" color="brand.500" fontWeight="bold">
                    Masuk di sini
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

export default Register
