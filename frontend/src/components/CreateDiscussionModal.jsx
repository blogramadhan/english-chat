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
  Input,
  Textarea,
  Select,
  VStack,
  useToast,
} from '@chakra-ui/react'
import api from '../utils/api'

const CreateDiscussionModal = ({ isOpen, onClose, onSuccess, groups }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/discussions', {
        title,
        content,
        group: selectedGroup
      })

      toast({
        title: 'Diskusi berhasil dibuat',
        status: 'success',
        duration: 3000,
      })

      setTitle('')
      setContent('')
      setSelectedGroup('')
      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal membuat diskusi',
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
        <ModalHeader>Buat Diskusi / Pertanyaan Baru</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Judul</FormLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul diskusi..."
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Pertanyaan / Topik</FormLabel>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Deskripsikan pertanyaan atau topik diskusi..."
                  rows={6}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Grup</FormLabel>
                <Select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  placeholder="Pilih grup"
                >
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" colorScheme="green" isLoading={loading}>
              Buat Diskusi
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default CreateDiscussionModal
