import { useState, useEffect, useRef } from 'react'
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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import { AddIcon, EditIcon, DownloadIcon, DeleteIcon } from '@chakra-ui/icons'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import CreateGroupModal from '../components/CreateGroupModal'
import CreateDiscussionModal from '../components/CreateDiscussionModal'
import EditGroupModal from '../components/EditGroupModal'
import EditDiscussionModal from '../components/EditDiscussionModal'
import ExportPDFModal from '../components/ExportPDFModal'
import Navbar from '../components/Navbar'

const DosenDashboard = () => {
  const [groups, setGroups] = useState([])
  const [discussions, setDiscussions] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedDiscussion, setSelectedDiscussion] = useState(null)
  const [selectedDiscussionForPDF, setSelectedDiscussionForPDF] = useState(null)
  const [groupToDelete, setGroupToDelete] = useState(null)
  const [discussionToDelete, setDiscussionToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletingDiscussion, setIsDeletingDiscussion] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const cancelRef = useRef()
  const cancelDiscussionRef = useRef()
  const { isOpen: isGroupOpen, onOpen: onGroupOpen, onClose: onGroupClose } = useDisclosure()
  const { isOpen: isDiscussionOpen, onOpen: onDiscussionOpen, onClose: onDiscussionClose } = useDisclosure()
  const { isOpen: isEditGroupOpen, onOpen: onEditGroupOpen, onClose: onEditGroupClose } = useDisclosure()
  const { isOpen: isEditDiscussionOpen, onOpen: onEditDiscussionOpen, onClose: onEditDiscussionClose } = useDisclosure()
  const { isOpen: isExportPDFOpen, onOpen: onExportPDFOpen, onClose: onExportPDFClose } = useDisclosure()
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure()
  const { isOpen: isDeleteDiscussionAlertOpen, onOpen: onDeleteDiscussionAlertOpen, onClose: onDeleteDiscussionAlertClose } = useDisclosure()

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

  const handleDownloadPDF = (e, discussion) => {
    e.stopPropagation() // Prevent card click
    setSelectedDiscussionForPDF(discussion)
    onExportPDFOpen()
  }

  const handleDeleteGroup = (e, group) => {
    e.stopPropagation() // Prevent card click
    console.log('🗑️ Delete group requested:', { id: group._id, name: group.name })
    setGroupToDelete(group)
    onDeleteAlertOpen()
  }

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return

    setIsDeleting(true)
    console.log('🗑️ Deleting group:', groupToDelete._id)

    try {
      await api.delete(`/groups/${groupToDelete._id}`)

      console.log('✅ Group deleted successfully')

      toast({
        title: 'Group deleted successfully',
        description: `${groupToDelete.name} has been removed. Students in this group are not affected.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      fetchData() // Refresh data
      onDeleteAlertClose()
      setGroupToDelete(null)
    } catch (error) {
      console.error('❌ Failed to delete group:', error.response?.data || error.message)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete group',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    console.log('❌ Delete cancelled')
    setGroupToDelete(null)
    onDeleteAlertClose()
  }

  const handleDeleteDiscussion = (e, discussion) => {
    e.stopPropagation() // Prevent card click
    console.log('🗑️ Delete discussion requested:', { id: discussion._id, title: discussion.title })
    setDiscussionToDelete(discussion)
    onDeleteDiscussionAlertOpen()
  }

  const confirmDeleteDiscussion = async () => {
    if (!discussionToDelete) return

    setIsDeletingDiscussion(true)
    console.log('🗑️ Deleting discussion:', discussionToDelete._id)

    try {
      await api.delete(`/discussions/${discussionToDelete._id}`)

      console.log('✅ Discussion deleted successfully')

      toast({
        title: 'Discussion deleted successfully',
        description: `${discussionToDelete.title} has been removed.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      fetchData() // Refresh data
      onDeleteDiscussionAlertClose()
      setDiscussionToDelete(null)
    } catch (error) {
      console.error('❌ Failed to delete discussion:', error.response?.data || error.message)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete discussion',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsDeletingDiscussion(false)
    }
  }

  const handleCancelDeleteDiscussion = () => {
    console.log('❌ Delete discussion cancelled')
    setDiscussionToDelete(null)
    onDeleteDiscussionAlertClose()
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
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={(e) => handleDeleteGroup(e, group)}
                          aria-label="Delete group"
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
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={(e) => handleDeleteGroup(e, group)}
                          aria-label="Delete group"
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
                          onClick={(e) => handleDownloadPDF(e, discussion)}
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
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={(e) => handleDeleteDiscussion(e, discussion)}
                          aria-label="Delete discussion"
                          title="Delete Discussion"
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
                          onClick={(e) => handleDownloadPDF(e, discussion)}
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
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={(e) => handleDeleteDiscussion(e, discussion)}
                          aria-label="Delete discussion"
                          title="Delete Discussion"
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

      <ExportPDFModal
        isOpen={isExportPDFOpen}
        onClose={onExportPDFClose}
        discussion={selectedDiscussionForPDF}
      />

      {/* Delete Group Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleCancelDelete}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Group
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete <strong>{groupToDelete?.name}</strong>?
              <Text mt={2} fontSize="sm" color="gray.600">
                This action cannot be undone. However, students in this group will not be affected.
                They will remain in the system.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDeleteGroup}
                ml={3}
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Delete Discussion Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDiscussionAlertOpen}
        leastDestructiveRef={cancelDiscussionRef}
        onClose={handleCancelDeleteDiscussion}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Discussion
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete <strong>{discussionToDelete?.title}</strong>?
              <Text mt={2} fontSize="sm" color="gray.600">
                This action cannot be undone. All messages in this discussion will also be removed.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelDiscussionRef} onClick={handleCancelDeleteDiscussion}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDeleteDiscussion}
                ml={3}
                isLoading={isDeletingDiscussion}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

export default DosenDashboard
