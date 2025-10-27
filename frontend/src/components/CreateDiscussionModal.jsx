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
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import api from '../utils/api'

const CreateDiscussionModal = ({ isOpen, onClose, onSuccess, groups, categories }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedGroups, setSelectedGroups] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
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

  // Filter groups based on search query
  const filteredGroups = groups.filter(group => {
    if (!group.isActive) return false
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      group.name.toLowerCase().includes(query) ||
      (group.description && group.description.toLowerCase().includes(query))
    )
  })

  // Sort groups to show selected ones at the top
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    const aSelected = selectedGroups.includes(a._id)
    const bSelected = selectedGroups.includes(b._id)
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    return 0
  })

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
      setSearchQuery('')
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

                {/* Search input */}
                <InputGroup mb={3}>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>

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
                      ) : sortedGroups.length === 0 ? (
                        <Text color="gray.500" fontSize="sm">
                          No groups found matching "{searchQuery}"
                        </Text>
                      ) : (
                        <Stack spacing={2}>
                          {sortedGroups.map((group) => {
                            const isSelected = selectedGroups.includes(group._id)
                            return (
                              <Checkbox
                                key={group._id}
                                colorScheme="red"
                                isChecked={isSelected}
                                onChange={() => handleGroupToggle(group._id)}
                              >
                                <Text
                                  color={isSelected ? 'red.600' : 'inherit'}
                                  fontWeight={isSelected ? 'semibold' : 'normal'}
                                >
                                  {group.name}
                                </Text>
                              </Checkbox>
                            )
                          })}
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
