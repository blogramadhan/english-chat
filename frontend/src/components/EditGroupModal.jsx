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
      await api.put(`/groups/${group._id}`, {
        name,
        description,
        members: selectedMembers,
        isActive
      })

      toast({
        title: 'Grup berhasil diupdate',
        status: 'success',
        duration: 3000,
      })

      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal update grup',
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
        <ModalHeader>Edit Grup: {group?.name}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nama Grup</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Kelompok A"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Deskripsi</FormLabel>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi grup..."
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="medium">Status Grup</Text>
                    <Text fontSize="sm" color="gray.600">
                      {isActive ? 'Grup sedang aktif' : 'Grup dinonaktifkan'}
                    </Text>
                  </Box>
                  <HStack>
                    <Badge colorScheme={isActive ? 'green' : 'red'}>
                      {isActive ? 'Aktif' : 'Nonaktif'}
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
                  Anggota Mahasiswa ({selectedMembers.length} terpilih)
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
              Batal
            </Button>
            <Button type="submit" colorScheme="brand" isLoading={loading}>
              Update Grup
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default EditGroupModal
