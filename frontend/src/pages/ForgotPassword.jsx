import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
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
    Alert,
    AlertIcon,
    AlertDescription,
} from '@chakra-ui/react'
import axios from 'axios'
import HifellaLogo from '../components/HifellaLogo'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const toast = useToast()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
            await axios.post(`${API_URL}/api/auth/forgot-password`, { email })

            setSubmitted(true)
            toast({
                title: 'Email Sent',
                description: 'If an account with that email exists, a password reset link has been sent.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            })
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'An error occurred. Please try again.',
                status: 'error',
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
                            <HifellaLogo size={70} />
                        </Box>
                        <VStack spacing={0.5}>
                            <Heading size="lg" color="brand.600">HIFELLA</Heading>
                            <Text fontSize="xs" color="gray.500" fontWeight="medium">Hi Friends English Learning</Text>
                        </VStack>
                        <Heading size="md" color="gray.700">Lupa Password</Heading>
                        <Text color="gray.600" fontSize="sm" textAlign="center">
                            Masukkan email Anda dan kami akan mengirimkan link untuk mereset password Anda.
                        </Text>

                        {submitted ? (
                            <Alert status="success" borderRadius="md">
                                <AlertIcon />
                                <AlertDescription fontSize="sm">
                                    Link reset password telah dikirim ke email Anda. Silakan cek inbox Anda (dan folder spam jika tidak ditemukan).
                                </AlertDescription>
                            </Alert>
                        ) : (
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

                                    <Button
                                        type="submit"
                                        colorScheme="brand"
                                        size="md"
                                        w="full"
                                        isLoading={loading}
                                        mt={2}
                                    >
                                        Kirim Link Reset Password
                                    </Button>
                                </VStack>
                            </Box>
                        )}

                        <VStack spacing={2} w="full">
                            <Text fontSize="sm">
                                Ingat password Anda?{' '}
                                <Link as={RouterLink} to="/login" color="brand.500" fontWeight="bold">
                                    Login di sini
                                </Link>
                            </Text>
                            <Text fontSize="sm">
                                Belum punya akun?{' '}
                                <Link as={RouterLink} to="/register" color="brand.500" fontWeight="bold">
                                    Daftar di sini
                                </Link>
                            </Text>
                        </VStack>
                    </VStack>
                </CardBody>
            </Card>
        </Container>
    )
}

export default ForgotPassword
