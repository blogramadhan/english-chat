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
        description: 'Failed to load data',
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

          {/* Active Groups */}
          <Box>
            <Heading size="md" mb={4}>Active Groups</Heading>
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
              {groups.filter(group => group.isActive).map((group) => (
                <Card key={group._id}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="sm">{group.name}</Heading>
                      <HStack>
                        <Badge colorScheme="green">Active</Badge>
                        <Badge colorScheme="blue">Member</Badge>
                      </HStack>
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
              {groups.filter(group => group.isActive).length === 0 && (
                <Text color="gray.500">No active groups</Text>
              )}
            </Grid>
          </Box>

          {/* Inactive Groups */}
          <Box>
            <Heading size="md" mb={4}>Inactive Groups</Heading>
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
              {groups.filter(group => !group.isActive).map((group) => (
                <Card key={group._id} opacity={0.7}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="sm">{group.name}</Heading>
                      <HStack>
                        <Badge colorScheme="red">Inactive</Badge>
                        <Badge colorScheme="blue">Member</Badge>
                      </HStack>
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
              {groups.filter(group => !group.isActive).length === 0 && (
                <Text color="gray.500">No inactive groups</Text>
              )}
            </Grid>
          </Box>

          {/* Active Discussions */}
          <Box>
            <Heading size="md" mb={4}>Active Discussions</Heading>
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
              {discussions.filter(discussion => discussion.isActive).map((discussion) => (
                <Card
                  key={discussion._id}
                  cursor="pointer"
                  _hover={{ shadow: 'lg' }}
                  onClick={() => navigate(`/discussion/${discussion._id}`)}
                >
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="sm">{discussion.title}</Heading>
                      <Badge colorScheme="green">Active</Badge>
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
                      {discussion.groups && discussion.groups.length > 0 ? (
                        <>Groups: {discussion.groups.map(g => g.name).join(', ')}</>
                      ) : (
                        <>Group: {discussion.group?.name}</>
                      )}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(discussion.createdAt).toLocaleDateString('en-US')}
                    </Text>
                  </CardBody>
                </Card>
              ))}
              {discussions.filter(discussion => discussion.isActive).length === 0 && (
                <Text color="gray.500">No active discussions</Text>
              )}
            </Grid>
          </Box>

          {/* Inactive Discussions */}
          <Box>
            <Heading size="md" mb={4}>Inactive Discussions</Heading>
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
              {discussions.filter(discussion => !discussion.isActive).map((discussion) => (
                <Card
                  key={discussion._id}
                  cursor="pointer"
                  _hover={{ shadow: 'lg' }}
                  onClick={() => navigate(`/discussion/${discussion._id}`)}
                  opacity={0.7}
                >
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="sm">{discussion.title}</Heading>
                      <Badge colorScheme="red">Inactive</Badge>
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
                      {discussion.groups && discussion.groups.length > 0 ? (
                        <>Groups: {discussion.groups.map(g => g.name).join(', ')}</>
                      ) : (
                        <>Group: {discussion.group?.name}</>
                      )}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(discussion.createdAt).toLocaleDateString('en-US')}
                    </Text>
                  </CardBody>
                </Card>
              ))}
              {discussions.filter(discussion => !discussion.isActive).length === 0 && (
                <Text color="gray.500">No inactive discussions</Text>
              )}
            </Grid>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

export default MahasiswaDashboard
