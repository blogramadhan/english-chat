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
  FormErrorMessage,
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
  Select,
} from '@chakra-ui/react'
import api from '../utils/api'

const EditDiscussionModal = ({ isOpen, onClose, onSuccess, discussion, groups, categories }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedGroups, setSelectedGroups] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
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

      // Set category
      if (discussion.category) {
        const categoryId = typeof discussion.category === 'string' ? discussion.category : discussion.category._id
        setSelectedCategory(categoryId)
      } else {
        setSelectedCategory('')
      }

      setIsActive(discussion.isActive)
    }
  }, [isOpen, discussion])

  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev => {
      const newSelection = prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]

      console.log('✅ Group toggled (Edit):', {
        groupId,
        action: prev.includes(groupId) ? 'removed' : 'added',
        selectedGroups: newSelection
      })

      return newSelection
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log('🚀 Update discussion:', {
      discussionId: discussion._id,
      title,
      content: content.substring(0, 50),
      selectedGroups,
      groupCount: selectedGroups.length,
      isActive
    })

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
      const response = await api.put(`/discussions/${discussion._id}`, {
        title,
        content,
        isActive,
        groups: selectedGroups,
        category: selectedCategory || null
      })

      console.log('✅ Discussion updated:', response.data)

      toast({
        title: 'Discussion updated successfully',
        status: 'success',
        duration: 3000,
      })

      onSuccess()
      handleClose()
    } catch (error) {
      console.error('❌ Failed to update discussion:', error.response?.data || error.message)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update discussion',
        status: 'error',
        duration: 5000,
        isClosable: true,
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

              <FormControl>
                <FormLabel>Category (Optional)</FormLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  placeholder="Select category"
                >
                  {categories?.filter(cat => cat.isActive).map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Optionally assign this discussion to a category for better organization.
                </Text>
              </FormControl>

              <FormControl isInvalid={selectedGroups.length === 0}>
                <FormLabel>
                  Groups ({selectedGroups.length} selected) <Text as="span" color="red.500">*</Text>
                </FormLabel>
                <Box
                  maxH="200px"
                  overflowY="auto"
                  border="1px"
                  borderColor={selectedGroups.length === 0 ? "red.200" : "gray.200"}
                  borderRadius="md"
                  p={3}
                >
                  {groups && groups.length === 0 ? (
                    <Text color="gray.500" fontSize="sm">No groups available. Please create a group first.</Text>
                  ) : (
                    <>
                      {groups?.filter(group => group.isActive).length === 0 ? (
                        <Text color="orange.500" fontSize="sm">
                          No active groups available. Please activate a group first.
                        </Text>
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
                                {group.name} ({group.members?.length || 0} members)
                              </Checkbox>
                            ))}
                        </Stack>
                      )}
                    </>
                  )}
                </Box>
                <FormErrorMessage>
                  Please select at least one group for this discussion.
                </FormErrorMessage>
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
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={loading}
              isDisabled={!title || !content || selectedGroups.length === 0}
            >
              Update Discussion
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default EditDiscussionModal
