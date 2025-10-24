import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Heading,
  VStack,
  Card,
  CardBody,
  Text,
  Badge,
  useToast,
  HStack,
  Button,
  useDisclosure,
  Flex,
  SimpleGrid,
} from '@chakra-ui/react'
import { ViewIcon } from '@chakra-ui/icons'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import GroupMembersModal from '../components/GroupMembersModal'

const MahasiswaDashboard = () => {
  const [groups, setGroups] = useState([])
  const [discussions, setDiscussions] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentActiveGroupPage, setCurrentActiveGroupPage] = useState(1)
  const [currentInactiveGroupPage, setCurrentInactiveGroupPage] = useState(1)
  const [currentActiveDiscussionPage, setCurrentActiveDiscussionPage] = useState(1)
  const [currentInactiveDiscussionPage, setCurrentInactiveDiscussionPage] = useState(1)
  const groupsPerPage = 6
  const discussionsPerPage = 6
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen: isMembersOpen, onOpen: onMembersOpen, onClose: onMembersClose } = useDisclosure()

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

  const handleViewMembers = (group) => {
    setSelectedGroup(group)
    onMembersOpen()
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading size="lg">Student Dashboard</Heading>

          {/* Active Groups */}
          <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Active Groups</Heading>
              <Text fontSize="sm" color="gray.600">
                {groups.filter(group => group.isActive).length} groups
              </Text>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={4}>
              {groups
                .filter(group => group.isActive)
                .slice((currentActiveGroupPage - 1) * groupsPerPage, currentActiveGroupPage * groupsPerPage)
                .map((group) => (
                  <Card key={group._id} _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s">
                    <CardBody>
                      <Flex justify="space-between" align="start" mb={2}>
                        <Box flex={1}>
                          <Heading size="sm" mb={1}>{group.name}</Heading>
                          <HStack spacing={1}>
                            <Badge colorScheme="green" fontSize="xs">Active</Badge>
                            <Badge colorScheme="blue" fontSize="xs">Member</Badge>
                          </HStack>
                        </Box>
                      </Flex>
                      <Text fontSize="xs" color="gray.600" noOfLines={2} mb={2}>
                        {group.description || 'No description'}
                      </Text>
                      <Text fontSize="xs" mb={1}>
                        <Text as="span" fontWeight="semibold">Lecturer:</Text> {group.createdBy?.name}
                      </Text>
                      <Text fontSize="xs" color="gray.600" mb={3}>
                        {group.members?.length || 0} Students
                      </Text>
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="outline"
                        leftIcon={<ViewIcon />}
                        onClick={() => handleViewMembers(group)}
                        width="full"
                      >
                        View Members
                      </Button>
                    </CardBody>
                  </Card>
                ))}
            </SimpleGrid>

            {groups.filter(group => group.isActive).length === 0 && (
              <Text color="gray.500" textAlign="center" py={8}>No active groups</Text>
            )}

            {/* Pagination for Active Groups */}
            {groups.filter(group => group.isActive).length > groupsPerPage && (
              <Flex justify="center" align="center" gap={2} mt={4}>
                <Button
                  size="sm"
                  onClick={() => setCurrentActiveGroupPage(prev => Math.max(prev - 1, 1))}
                  isDisabled={currentActiveGroupPage === 1}
                >
                  Previous
                </Button>
                <Text fontSize="sm">
                  Page {currentActiveGroupPage} of {Math.ceil(groups.filter(group => group.isActive).length / groupsPerPage)}
                </Text>
                <Button
                  size="sm"
                  onClick={() => setCurrentActiveGroupPage(prev => prev + 1)}
                  isDisabled={currentActiveGroupPage >= Math.ceil(groups.filter(group => group.isActive).length / groupsPerPage)}
                >
                  Next
                </Button>
              </Flex>
            )}
          </Box>

          {/* Inactive Groups */}
          <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Inactive Groups</Heading>
              <Text fontSize="sm" color="gray.600">
                {groups.filter(group => !group.isActive).length} groups
              </Text>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={4}>
              {groups
                .filter(group => !group.isActive)
                .slice((currentInactiveGroupPage - 1) * groupsPerPage, currentInactiveGroupPage * groupsPerPage)
                .map((group) => (
                  <Card key={group._id} _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s" opacity={0.7}>
                    <CardBody>
                      <Flex justify="space-between" align="start" mb={2}>
                        <Box flex={1}>
                          <Heading size="sm" mb={1}>{group.name}</Heading>
                          <HStack spacing={1}>
                            <Badge colorScheme="red" fontSize="xs">Inactive</Badge>
                            <Badge colorScheme="blue" fontSize="xs">Member</Badge>
                          </HStack>
                        </Box>
                      </Flex>
                      <Text fontSize="xs" color="gray.600" noOfLines={2} mb={2}>
                        {group.description || 'No description'}
                      </Text>
                      <Text fontSize="xs" mb={1}>
                        <Text as="span" fontWeight="semibold">Lecturer:</Text> {group.createdBy?.name}
                      </Text>
                      <Text fontSize="xs" color="gray.600" mb={3}>
                        {group.members?.length || 0} Students
                      </Text>
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="outline"
                        leftIcon={<ViewIcon />}
                        onClick={() => handleViewMembers(group)}
                        width="full"
                      >
                        View Members
                      </Button>
                    </CardBody>
                  </Card>
                ))}
            </SimpleGrid>

            {groups.filter(group => !group.isActive).length === 0 && (
              <Text color="gray.500" textAlign="center" py={8}>No inactive groups</Text>
            )}

            {/* Pagination for Inactive Groups */}
            {groups.filter(group => !group.isActive).length > groupsPerPage && (
              <Flex justify="center" align="center" gap={2} mt={4}>
                <Button
                  size="sm"
                  onClick={() => setCurrentInactiveGroupPage(prev => Math.max(prev - 1, 1))}
                  isDisabled={currentInactiveGroupPage === 1}
                >
                  Previous
                </Button>
                <Text fontSize="sm">
                  Page {currentInactiveGroupPage} of {Math.ceil(groups.filter(group => !group.isActive).length / groupsPerPage)}
                </Text>
                <Button
                  size="sm"
                  onClick={() => setCurrentInactiveGroupPage(prev => prev + 1)}
                  isDisabled={currentInactiveGroupPage >= Math.ceil(groups.filter(group => !group.isActive).length / groupsPerPage)}
                >
                  Next
                </Button>
              </Flex>
            )}
          </Box>

          {/* Active Discussions */}
          <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Active Discussions</Heading>
              <Text fontSize="sm" color="gray.600">
                {discussions.filter(discussion => discussion.isActive).length} discussions
              </Text>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={4}>
              {discussions
                .filter(discussion => discussion.isActive)
                .slice((currentActiveDiscussionPage - 1) * discussionsPerPage, currentActiveDiscussionPage * discussionsPerPage)
                .map((discussion) => (
                  <Card
                    key={discussion._id}
                    cursor="pointer"
                    _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                    onClick={() => navigate(`/discussion/${discussion._id}`)}
                  >
                    <CardBody>
                      <Flex justify="space-between" align="start" mb={2}>
                        <Box flex={1}>
                          <Heading size="sm" mb={1} noOfLines={1}>{discussion.title}</Heading>
                          <Badge colorScheme="green" fontSize="xs">Active</Badge>
                        </Box>
                      </Flex>
                      <Text fontSize="xs" color="gray.600" noOfLines={2} mb={2}>
                        {discussion.content}
                      </Text>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        <Text as="span" fontWeight="semibold">Lecturer:</Text> {discussion.createdBy?.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500" mb={1} noOfLines={1}>
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
            </SimpleGrid>

            {discussions.filter(discussion => discussion.isActive).length === 0 && (
              <Text color="gray.500" textAlign="center" py={8}>No active discussions</Text>
            )}

            {/* Pagination for Active Discussions */}
            {discussions.filter(discussion => discussion.isActive).length > discussionsPerPage && (
              <Flex justify="center" align="center" gap={2} mt={4}>
                <Button
                  size="sm"
                  onClick={() => setCurrentActiveDiscussionPage(prev => Math.max(prev - 1, 1))}
                  isDisabled={currentActiveDiscussionPage === 1}
                >
                  Previous
                </Button>
                <Text fontSize="sm">
                  Page {currentActiveDiscussionPage} of {Math.ceil(discussions.filter(discussion => discussion.isActive).length / discussionsPerPage)}
                </Text>
                <Button
                  size="sm"
                  onClick={() => setCurrentActiveDiscussionPage(prev => prev + 1)}
                  isDisabled={currentActiveDiscussionPage >= Math.ceil(discussions.filter(discussion => discussion.isActive).length / discussionsPerPage)}
                >
                  Next
                </Button>
              </Flex>
            )}
          </Box>

          {/* Inactive Discussions */}
          <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Inactive Discussions</Heading>
              <Text fontSize="sm" color="gray.600">
                {discussions.filter(discussion => !discussion.isActive).length} discussions
              </Text>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={4}>
              {discussions
                .filter(discussion => !discussion.isActive)
                .slice((currentInactiveDiscussionPage - 1) * discussionsPerPage, currentInactiveDiscussionPage * discussionsPerPage)
                .map((discussion) => (
                  <Card
                    key={discussion._id}
                    cursor="pointer"
                    _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                    onClick={() => navigate(`/discussion/${discussion._id}`)}
                    opacity={0.7}
                  >
                    <CardBody>
                      <Flex justify="space-between" align="start" mb={2}>
                        <Box flex={1}>
                          <Heading size="sm" mb={1} noOfLines={1}>{discussion.title}</Heading>
                          <Badge colorScheme="red" fontSize="xs">Inactive</Badge>
                        </Box>
                      </Flex>
                      <Text fontSize="xs" color="gray.600" noOfLines={2} mb={2}>
                        {discussion.content}
                      </Text>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        <Text as="span" fontWeight="semibold">Lecturer:</Text> {discussion.createdBy?.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500" mb={1} noOfLines={1}>
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
            </SimpleGrid>

            {discussions.filter(discussion => !discussion.isActive).length === 0 && (
              <Text color="gray.500" textAlign="center" py={8}>No inactive discussions</Text>
            )}

            {/* Pagination for Inactive Discussions */}
            {discussions.filter(discussion => !discussion.isActive).length > discussionsPerPage && (
              <Flex justify="center" align="center" gap={2} mt={4}>
                <Button
                  size="sm"
                  onClick={() => setCurrentInactiveDiscussionPage(prev => Math.max(prev - 1, 1))}
                  isDisabled={currentInactiveDiscussionPage === 1}
                >
                  Previous
                </Button>
                <Text fontSize="sm">
                  Page {currentInactiveDiscussionPage} of {Math.ceil(discussions.filter(discussion => !discussion.isActive).length / discussionsPerPage)}
                </Text>
                <Button
                  size="sm"
                  onClick={() => setCurrentInactiveDiscussionPage(prev => prev + 1)}
                  isDisabled={currentInactiveDiscussionPage >= Math.ceil(discussions.filter(discussion => !discussion.isActive).length / discussionsPerPage)}
                >
                  Next
                </Button>
              </Flex>
            )}
          </Box>
        </VStack>
      </Container>

      {/* Group Members Modal */}
      <GroupMembersModal
        isOpen={isMembersOpen}
        onClose={onMembersClose}
        group={selectedGroup}
      />
    </Box>
  )
}

export default MahasiswaDashboard
