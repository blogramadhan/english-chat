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
} from '@chakra-ui/react'
import api from '../utils/api'

const CreateGroupModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [mahasiswa, setMahasiswa] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Buat Grup Baru</ModalHeader>
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
                />
              </FormControl>

              <FormControl>
                <FormLabel>Pilih Mahasiswa</FormLabel>
                <Stack maxH="200px" overflowY="auto" spacing={2}>
                  <CheckboxGroup value={selectedMembers} onChange={setSelectedMembers}>
                    {mahasiswa.map((m) => (
                      <Checkbox key={m._id} value={m._id}>
                        {m.name} ({m.email})
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                </Stack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" colorScheme="brand" isLoading={loading}>
              Buat Grup
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default CreateGroupModal
