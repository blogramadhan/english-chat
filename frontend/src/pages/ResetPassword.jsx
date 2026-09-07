import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom'
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
import api from '../utils/api'
import HifellaLogo from '../components/HifellaLogo'

const ResetPassword = () => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const toast = useToast()
    const token = searchParams.get('token')

    useEffect(() => {
        if (!token) {
            toast({
                title: 'Invalid Link',
                description: 'Reset password link is invalid or missing.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
            navigate('/login')
        }
    }, [token, navigate, toast])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast({
                title: 'Password Mismatch',
                description: 'Password and confirmation password do not match.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
            return
        }

        if (password.length < 6) {
            toast({
                title: 'Password Too Short',
                description: 'Password must be at least 6 characters.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
            return
        }

        setLoading(true)

        try {
            await api.post('/auth/reset-password', {
                token,
                password,
            })

            toast({
                title: 'Password Reset Successful',
                description: 'Your password has been successfully reset. Please login with your new password.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            })

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login')
            }, 2000)
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.'
            toast({
                title: 'Reset Failed',
                description: errorMessage,
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return null
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
                            <Text fontSize="xs" color="gray.500" fontWeight="medium">Human Interaction-Facilitated Environment for Language Learning and Argumentation</Text>
                        </VStack>
                        <Heading size="md" color="gray.700">Reset Password</Heading>
                        <Text color="gray.600" fontSize="sm" textAlign="center">
                            Enter your new password.
                        </Text>

                        <Alert status="info" borderRadius="md" fontSize="sm">
                            <AlertIcon />
                            <AlertDescription>
                                Password must be at least 6 characters.
                            </AlertDescription>
                        </Alert>

                        <Box as="form" onSubmit={handleSubmit} w="full">
                            <VStack spacing={3}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">New Password</FormLabel>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="******"
                                        size="sm"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">Confirm Password</FormLabel>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    Reset Password
                                </Button>

                                <Text fontSize="sm">
                                    Remember your password?{' '}
                                    <Link as={RouterLink} to="/login" color="brand.500" fontWeight="bold">
                                        Login here
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

export default ResetPassword
