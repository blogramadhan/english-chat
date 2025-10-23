import { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Switch,
  HStack,
  Text,
  Box,
  Badge,
  Checkbox,
  Stack,
} from '@chakra-ui/react'
import api from '../utils/api'

const EditDiscussionModal = ({ isOpen, onClose, onSuccess, discussion, groups }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedGroups, setSelectedGroups] = useState([])
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (isOpen && discussion) {
      setTitle(discussion.title)
      setContent(discussion.content)

      // Support both old single group and new multiple groups
      let groupIds = []

      if (discussion.groups && discussion.groups.length > 0) {
        // New schema: multiple groups
        groupIds = discussion.groups.map(g => {
          // Handle both populated (object) and unpopulated (string) references
          return typeof g === 'string' ? g : g._id
        })
      } else if (discussion.group) {
        // Old schema: single group
        // Handle both populated (object) and unpopulated (string) reference
        const groupId = typeof discussion.group === 'string' ? discussion.group : discussion.group._id
        groupIds = [groupId]
      }

      setSelectedGroups(groupIds)
      setIsActive(discussion.isActive)
    }
  }, [isOpen, discussion])

  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId)
      } else {
        return [...prev, groupId]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (selectedGroups.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one group',
        status: 'error',
        duration: 3000,
      })
      return
    }

    setLoading(true)

    try {
      await api.put(`/discussions/${discussion._id}`, {
        title,
        content,
        isActive,
        groups: selectedGroups
      })

      toast({
        title: 'Discussion updated successfully',
        status: 'success',
        duration: 3000,
      })

      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update discussion',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setContent('')
    setSelectedGroups([])
    setIsActive(true)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Discussion: {discussion?.title}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Discussion title..."
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Question / Topic</FormLabel>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe the question or discussion topic..."
                  rows={6}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>
                  Groups ({selectedGroups.length} selected)
                </FormLabel>
                <Box
                  maxH="200px"
                  overflowY="auto"
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={3}
                >
                  {groups && groups.length === 0 ? (
                    <Text color="gray.500" fontSize="sm">No groups available</Text>
                  ) : (
                    <Stack spacing={2}>
                      {groups
                        ?.filter(group => group.isActive)
                        .map((group) => (
                          <Checkbox
                            key={group._id}
                            isChecked={selectedGroups.includes(group._id)}
                            onChange={() => handleGroupToggle(group._id)}
                          >
                            {group.name}
                          </Checkbox>
                        ))}
                    </Stack>
                  )}
                </Box>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  You can update which groups this discussion is available to
                </Text>
              </FormControl>

              <FormControl>
                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="medium">Discussion Status</Text>
                    <Text fontSize="sm" color="gray.600">
                      {isActive ? 'Discussion is active' : 'Discussion is inactive'}
                    </Text>
                  </Box>
                  <HStack>
                    <Badge colorScheme={isActive ? 'green' : 'red'}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Switch
                      isChecked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      colorScheme="green"
                      size="lg"
                    />
                  </HStack>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" colorScheme="brand" isLoading={loading}>
              Update Discussion
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default EditDiscussionModal
