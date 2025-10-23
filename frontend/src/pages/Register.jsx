import { useState, useEffect } from 'react'
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
import axios from 'axios'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'mahasiswa',
    nim: '',
    nip: '',
    lecturer: ''
  })
  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    fetchLecturers()
  }, [])

  const fetchLecturers = async () => {
    try {
      const response = await axios.get('/api/users/lecturers')
      setLecturers(response.data)
    } catch (error) {
      console.error('Failed to fetch lecturers:', error)
    }
  }

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
        title: 'Registration successful',
        description: response.message || 'Your account has been created. Please wait for admin approval.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      // Redirect to login after registration
      navigate('/login')
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || 'An error occurred',
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
            <Heading size="xl" color="brand.600">THYNK</Heading>
            <Text color="gray.600">Create new account</Text>

            <Box as="form" onSubmit={handleSubmit} w="full">
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
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
                    placeholder="Minimum 6 characters"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Role</FormLabel>
                  <Select name="role" value={formData.role} onChange={handleChange}>
                    <option value="mahasiswa">Student</option>
                    <option value="dosen">Lecturer</option>
                  </Select>
                </FormControl>

                {formData.role === 'mahasiswa' && (
                  <>
                    <FormControl>
                      <FormLabel>Student ID (NIM)</FormLabel>
                      <Input
                        name="nim"
                        value={formData.nim}
                        onChange={handleChange}
                        placeholder="Student ID number"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Select Your Lecturer</FormLabel>
                      <Select
                        name="lecturer"
                        value={formData.lecturer}
                        onChange={handleChange}
                        placeholder="Choose a lecturer"
                      >
                        {lecturers.map((lecturer) => (
                          <option key={lecturer._id} value={lecturer._id}>
                            {lecturer.name} {lecturer.nip ? `(${lecturer.nip})` : ''}
                          </option>
                        ))}
                      </Select>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        You will only appear in groups created by this lecturer
                      </Text>
                    </FormControl>
                  </>
                )}

                {formData.role === 'dosen' && (
                  <FormControl>
                    <FormLabel>Employee ID (NIP)</FormLabel>
                    <Input
                      name="nip"
                      value={formData.nip}
                      onChange={handleChange}
                      placeholder="Employee ID number"
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
                  Register
                </Button>

                <Text>
                  Already have an account?{' '}
                  <Link as={RouterLink} to="/login" color="brand.500" fontWeight="bold">
                    Sign in here
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
