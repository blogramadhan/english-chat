import { useState } from 'react'
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
  Checkbox,
  Stack,
  Text,
  Box,
  Select,
} from '@chakra-ui/react'
import api from '../utils/api'

const CreateDiscussionModal = ({ isOpen, onClose, onSuccess, groups, categories }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedGroups, setSelectedGroups] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  // Debug logging untuk groups
  console.log('📋 CreateDiscussionModal - Groups:', {
    totalGroups: groups?.length || 0,
    activeGroups: groups?.filter(g => g.isActive).length || 0,
    groups: groups?.map(g => ({ id: g._id, name: g.name, isActive: g.isActive })) || []
  })

  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev => {
      const newSelection = prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]

      console.log('✅ Group toggled:', {
        groupId,
        action: prev.includes(groupId) ? 'removed' : 'added',
        selectedGroups: newSelection
      })

      return newSelection
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log('🚀 Submit discussion:', {
      title,
      content: content.substring(0, 50),
      selectedGroups,
      groupCount: selectedGroups.length
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
      const response = await api.post('/discussions', {
        title,
        content,
        groups: selectedGroups,
        category: selectedCategory || null
      })

      console.log('✅ Discussion created:', response.data)

      toast({
        title: 'Discussion created successfully',
        status: 'success',
        duration: 3000,
      })

      setTitle('')
      setContent('')
      setSelectedGroups([])
      setSelectedCategory('')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('❌ Failed to create discussion:', error.response?.data || error.message)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create discussion',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Discussion / Question</ModalHeader>
        <ModalCloseButton />
        <Text fontSize="sm" color="gray.600" px={6} pt={2}>
          Create a discussion topic that can be used by one or more student groups.
          Each group will have their own separate chat space within the same topic.
        </Text>
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
                  {groups.length === 0 ? (
                    <Text color="gray.500" fontSize="sm">No groups available. Please create a group first.</Text>
                  ) : (
                    <>
                      {groups.filter(group => group.isActive).length === 0 ? (
                        <Text color="orange.500" fontSize="sm">
                          No active groups available. Please activate a group first.
                        </Text>
                      ) : (
                        <Stack spacing={2}>
                          {groups
                            .filter(group => group.isActive)
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
                  Select one or more groups for this discussion. Only active groups are shown.
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="green"
              isLoading={loading}
              isDisabled={!title || !content || selectedGroups.length === 0}
            >
              Create Discussion
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default CreateDiscussionModal
