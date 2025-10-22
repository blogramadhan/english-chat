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
} from '@chakra-ui/react'
import api from '../utils/api'

const EditGroupModal = ({ isOpen, onClose, onSuccess, group }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [mahasiswa, setMahasiswa] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
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
    onClose()
  }

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
                      {mahasiswa.map((m) => (
                        <Checkbox key={m._id} value={m._id}>
                          <HStack spacing={2}>
                            <Text>{m.name}</Text>
                            <Text fontSize="sm" color="gray.500">
                              ({m.email})
                            </Text>
                            {m.nim && (
                              <Badge colorScheme="cyan" fontSize="xs">
                                {m.nim}
                              </Badge>
                            )}
                          </HStack>
                        </Checkbox>
                      ))}
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
