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
  InputGroup,
  InputLeftElement,
  Text,
  Badge,
  HStack,
  Box,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import api from '../utils/api'

const CreateGroupModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [mahasiswa, setMahasiswa] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchMahasiswa()
    }
  }, [isOpen])

  const fetchMahasiswa = async () => {
    try {
      const { data } = await api.get('/users/mahasiswa')
      setMahasiswa(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat daftar mahasiswa',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/groups', {
        name,
        description,
        members: selectedMembers
      })

      toast({
        title: 'Grup berhasil dibuat',
        status: 'success',
        duration: 3000,
      })

      setName('')
      setDescription('')
      setSelectedMembers([])
      setSearchQuery('')
      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal membuat grup',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Group</ModalHeader>
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
                />
              </FormControl>

              <FormControl>
                <FormLabel>
                  Select Students ({selectedMembers.length} selected)
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
                  maxH="250px"
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
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" colorScheme="brand" isLoading={loading}>
              Create Group
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default CreateGroupModal
