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
  Checkbox,
  CheckboxGroup,
  Stack,
  Switch,
  HStack,
  Text,
  Box,
  Badge,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import api from '../utils/api'

const EditGroupModal = ({ isOpen, onClose, onSuccess, group }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [mahasiswa, setMahasiswa] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (isOpen && group) {
      setName(group.name)
      setDescription(group.description || '')
      setIsActive(group.isActive)
      setSelectedMembers(group.members?.map(m => m._id) || [])
      fetchMahasiswa()
    }
  }, [isOpen, group])

  const fetchMahasiswa = async () => {
    try {
      const { data } = await api.get('/users/mahasiswa')
      setMahasiswa(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load student list',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.put(`/groups/${group._id}`, {
        name,
        description,
        members: selectedMembers,
        isActive
      })

      toast({
        title: 'Group updated successfully',
        status: 'success',
        duration: 3000,
      })

      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update group',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setIsActive(true)
    setSelectedMembers([])
    setSearchQuery('')
    onClose()
  }

  // Filter mahasiswa berdasarkan search query
  const filteredMahasiswa = mahasiswa.filter((m) => {
    const query = searchQuery.toLowerCase()
    return (
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      (m.nim && m.nim.toLowerCase().includes(query))
    )
  })

  // Sort: mahasiswa yang dipilih di atas
  const sortedMahasiswa = [...filteredMahasiswa].sort((a, b) => {
    const aSelected = selectedMembers.includes(a._id)
    const bSelected = selectedMembers.includes(b._id)
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    return 0
  })

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Group: {group?.name}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Group Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Example: Group A"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Group description..."
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="medium">Group Status</Text>
                    <Text fontSize="sm" color="gray.600">
                      {isActive ? 'Group is active' : 'Group is inactive'}
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

              <FormControl>
                <FormLabel>
                  Student Members ({selectedMembers.length} selected)
                </FormLabel>
                <InputGroup mb={3}>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by name, email, or NIM..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
                <Box
                  maxH="300px"
                  overflowY="auto"
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={3}
                >
                  <CheckboxGroup value={selectedMembers} onChange={setSelectedMembers}>
                    <Stack spacing={2}>
                      {sortedMahasiswa.length > 0 ? (
                        sortedMahasiswa.map((m) => {
                          const isSelected = selectedMembers.includes(m._id)
                          return (
                            <Checkbox
                              key={m._id}
                              value={m._id}
                              colorScheme="red"
                            >
                              <HStack spacing={2}>
                                <Text color={isSelected ? 'red.600' : 'inherit'} fontWeight={isSelected ? 'semibold' : 'normal'}>
                                  {m.name}
                                </Text>
                                <Text fontSize="sm" color={isSelected ? 'red.500' : 'gray.500'}>
                                  ({m.email})
                                </Text>
                                {m.nim && (
                                  <Badge colorScheme={isSelected ? 'red' : 'cyan'} fontSize="xs">
                                    {m.nim}
                                  </Badge>
                                )}
                              </HStack>
                            </Checkbox>
                          )
                        })
                      ) : (
                        <Text color="gray.500" textAlign="center" py={4}>
                          {searchQuery ? 'No students found' : 'No students available'}
                        </Text>
                      )}
                    </Stack>
                  </CheckboxGroup>
                </Box>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" colorScheme="brand" isLoading={loading}>
              Update Group
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default EditGroupModal
