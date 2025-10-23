import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  HStack,
  useToast,
  useDisclosure,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Text,
  Badge,
  IconButton,
} from '@chakra-ui/react'
import { AddIcon, EditIcon, DownloadIcon } from '@chakra-ui/icons'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import CreateGroupModal from '../components/CreateGroupModal'
import CreateDiscussionModal from '../components/CreateDiscussionModal'
import EditGroupModal from '../components/EditGroupModal'
import EditDiscussionModal from '../components/EditDiscussionModal'
import Navbar from '../components/Navbar'

const DosenDashboard = () => {
  const [groups, setGroups] = useState([])
  const [discussions, setDiscussions] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedDiscussion, setSelectedDiscussion] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen: isGroupOpen, onOpen: onGroupOpen, onClose: onGroupClose } = useDisclosure()
  const { isOpen: isDiscussionOpen, onOpen: onDiscussionOpen, onClose: onDiscussionClose } = useDisclosure()
  const { isOpen: isEditGroupOpen, onOpen: onEditGroupOpen, onClose: onEditGroupClose } = useDisclosure()
  const { isOpen: isEditDiscussionOpen, onOpen: onEditDiscussionOpen, onClose: onEditDiscussionClose } = useDisclosure()

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

  const handleGroupCreated = () => {
    fetchData()
    onGroupClose()
  }

  const handleDiscussionCreated = () => {
    fetchData()
    onDiscussionClose()
  }

  const handleEditGroup = (group) => {
    setSelectedGroup(group)
    onEditGroupOpen()
  }

  const handleGroupUpdated = () => {
    fetchData()
    onEditGroupClose()
  }

  const handleEditDiscussion = (e, discussion) => {
    e.stopPropagation() // Prevent card click
    setSelectedDiscussion(discussion)
    onEditDiscussionOpen()
  }

  const handleDiscussionUpdated = () => {
    fetchData()
    onEditDiscussionClose()
  }

  const handleDownloadPDF = async (e, discussionId, discussionTitle) => {
    e.stopPropagation() // Prevent card click

    try {
      const userInfo = localStorage.getItem('userInfo')
      const { token } = JSON.parse(userInfo)

      const response = await fetch(`/api/discussions/${discussionId}/export-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to download PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `discussion-${discussionTitle.replace(/\s+/g, '-')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'PDF downloaded successfully',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download PDF',
        status: 'error',
        duration: 3000,
      })
    }
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between">
            <Heading size="lg">Lecturer Dashboard</Heading>
            <HStack>
              <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={onGroupOpen}>
                Create Group
              </Button>
              <Button leftIcon={<AddIcon />} colorScheme="green" onClick={onDiscussionOpen}>
                Create Discussion
              </Button>
            </HStack>
          </HStack>

          {/* Active Groups */}
          <Box>
            <Heading size="md" mb={4}>Active Groups</Heading>
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
              {groups.filter(group => group.isActive).map((group) => (
                <Card key={group._id} _hover={{ shadow: 'lg' }}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="sm">{group.name}</Heading>
                      <HStack>
                        <Badge colorScheme="green">Active</Badge>
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => handleEditGroup(group)}
                          aria-label="Edit group"
                        />
                      </HStack>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      {group.description || 'No description'}
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
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
                <Card key={group._id} _hover={{ shadow: 'lg' }} opacity={0.7}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="sm">{group.name}</Heading>
                      <HStack>
                        <Badge colorScheme="red">Inactive</Badge>
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => handleEditGroup(group)}
                          aria-label="Edit group"
                        />
                      </HStack>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      {group.description || 'No description'}
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
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
                      <Heading size="sm" flex={1}>{discussion.title}</Heading>
                      <HStack spacing={1}>
                        <Badge colorScheme="green">Active</Badge>
                        <IconButton
                          icon={<DownloadIcon />}
                          size="sm"
                          colorScheme="green"
                          variant="ghost"
                          onClick={(e) => handleDownloadPDF(e, discussion._id, discussion.title)}
                          aria-label="Download PDF"
                          title="Download PDF"
                        />
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={(e) => handleEditDiscussion(e, discussion)}
                          aria-label="Edit discussion"
                          title="Edit Discussion"
                        />
                      </HStack>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="sm" color="gray.600" noOfLines={2} mb={2}>
                      {discussion.content}
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
                      <Heading size="sm" flex={1}>{discussion.title}</Heading>
                      <HStack spacing={1}>
                        <Badge colorScheme="red">Inactive</Badge>
                        <IconButton
                          icon={<DownloadIcon />}
                          size="sm"
                          colorScheme="green"
                          variant="ghost"
                          onClick={(e) => handleDownloadPDF(e, discussion._id, discussion.title)}
                          aria-label="Download PDF"
                          title="Download PDF"
                        />
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={(e) => handleEditDiscussion(e, discussion)}
                          aria-label="Edit discussion"
                          title="Edit Discussion"
                        />
                      </HStack>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="sm" color="gray.600" noOfLines={2} mb={2}>
                      {discussion.content}
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

      <CreateGroupModal
        isOpen={isGroupOpen}
        onClose={onGroupClose}
        onSuccess={handleGroupCreated}
      />

      <CreateDiscussionModal
        isOpen={isDiscussionOpen}
        onClose={onDiscussionClose}
        onSuccess={handleDiscussionCreated}
        groups={groups}
      />

      <EditGroupModal
        isOpen={isEditGroupOpen}
        onClose={onEditGroupClose}
        onSuccess={handleGroupUpdated}
        group={selectedGroup}
      />

      <EditDiscussionModal
        isOpen={isEditDiscussionOpen}
        onClose={onEditDiscussionClose}
        onSuccess={handleDiscussionUpdated}
        discussion={selectedDiscussion}
        groups={groups}
      />
    </Box>
  )
}

export default DosenDashboard
