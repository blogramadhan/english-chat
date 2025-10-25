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
  Checkbox,
  Stack,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import LoomaLogo from '../components/LoomaLogo'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'mahasiswa',
    nim: '',
    nip: ''
  })
  const [selectedLecturers, setSelectedLecturers] = useState([])
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
      const response = await api.get('/users/lecturers')
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

  const handleLecturerToggle = (lecturerId) => {
    setSelectedLecturers(prev => {
      if (prev.includes(lecturerId)) {
        return prev.filter(id => id !== lecturerId)
      } else {
        return [...prev, lecturerId]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.role === 'mahasiswa' && selectedLecturers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one lecturer',
        status: 'error',
        duration: 3000,
      })
      return
    }

    setLoading(true)

    try {
      const dataToSubmit = {
        ...formData,
        lecturers: formData.role === 'mahasiswa' ? selectedLecturers : undefined
      }
      const response = await register(dataToSubmit)

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
            <Text color="gray.600" fontSize="sm">Create new account</Text>

            <Box as="form" onSubmit={handleSubmit} w="full">
              <VStack spacing={3}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Full Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    size="sm"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Email</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    size="sm"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Password</FormLabel>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    size="sm"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Role</FormLabel>
                  <Select name="role" value={formData.role} onChange={handleChange} size="sm">
                    <option value="mahasiswa">Student</option>
                    <option value="dosen">Lecturer</option>
                  </Select>
                </FormControl>

                {formData.role === 'mahasiswa' && (
                  <>
                    <FormControl>
                      <FormLabel fontSize="sm">Student ID (NIM)</FormLabel>
                      <Input
                        name="nim"
                        value={formData.nim}
                        onChange={handleChange}
                        placeholder="Student ID number"
                        size="sm"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="sm">
                        Select Your Lecturers ({selectedLecturers.length} selected)
                      </FormLabel>
                      <Box
                        maxH="150px"
                        overflowY="auto"
                        border="1px"
                        borderColor="gray.200"
                        borderRadius="md"
                        p={2}
                      >
                        {lecturers.length === 0 ? (
                          <Text color="gray.500" fontSize="xs">No lecturers available</Text>
                        ) : (
                          <Stack spacing={1.5}>
                            {lecturers.map((lecturer) => (
                              <Checkbox
                                key={lecturer._id}
                                isChecked={selectedLecturers.includes(lecturer._id)}
                                onChange={() => handleLecturerToggle(lecturer._id)}
                                size="sm"
                              >
                                <Text fontSize="sm">{lecturer.name} {lecturer.nip ? `(${lecturer.nip})` : ''}</Text>
                              </Checkbox>
                            ))}
                          </Stack>
                        )}
                      </Box>
                      <Text fontSize="2xs" color="gray.500" mt={1}>
                        Select one or more lecturers. You will appear in groups created by selected lecturers.
                      </Text>
                    </FormControl>
                  </>
                )}

                {formData.role === 'dosen' && (
                  <FormControl>
                    <FormLabel fontSize="sm">Employee ID (NIP)</FormLabel>
                    <Input
                      name="nip"
                      value={formData.nip}
                      onChange={handleChange}
                      placeholder="Employee ID number"
                      size="sm"
                    />
                  </FormControl>
                )}

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="md"
                  w="full"
                  isLoading={loading}
                  mt={2}
                >
                  Register
                </Button>

                <Text fontSize="sm">
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
