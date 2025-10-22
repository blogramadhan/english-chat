import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Heading,
  VStack,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Text,
  Badge,
  useToast,
  HStack,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Navbar from '../components/Navbar'

const MahasiswaDashboard = () => {
  const [groups, setGroups] = useState([])
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [groupsRes, discussionsRes] = await Promise.all([
        api.get('/groups'),
        api.get('/discussions')
      ])
      setGroups(groupsRes.data)
      setDiscussions(discussionsRes.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading size="lg">Student Dashboard</Heading>

          <Box>
            <Heading size="md" mb={4}>My Groups</Heading>
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
              {groups.map((group) => (
                <Card key={group._id}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="sm">{group.name}</Heading>
                      <Badge colorScheme="blue">Member</Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      {group.description || 'No description'}
                    </Text>
                    <Text fontSize="sm">
                      Lecturer: {group.createdBy?.name}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {group.members?.length || 0} Students
                    </Text>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          </Box>

          <Box>
            <Heading size="md" mb={4}>Available Discussions</Heading>
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
              {discussions.map((discussion) => (
                <Card
                  key={discussion._id}
                  cursor="pointer"
                  _hover={{ shadow: 'lg' }}
                  onClick={() => navigate(`/discussion/${discussion._id}`)}
                >
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="sm">{discussion.title}</Heading>
                      <Badge colorScheme={discussion.isActive ? 'green' : 'gray'}>
                        {discussion.isActive ? 'Active' : 'Completed'}
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="sm" color="gray.600" noOfLines={2} mb={2}>
                      {discussion.content}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Lecturer: {discussion.createdBy?.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Group: {discussion.group?.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(discussion.createdAt).toLocaleDateString('en-US')}
                    </Text>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

export default MahasiswaDashboard
