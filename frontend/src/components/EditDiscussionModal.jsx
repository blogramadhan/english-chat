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
  Select,
} from '@chakra-ui/react'
import api from '../utils/api'

const EditDiscussionModal = ({ isOpen, onClose, onSuccess, discussion, groups }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (isOpen && discussion) {
      setTitle(discussion.title)
      setContent(discussion.content)
      setSelectedGroup(discussion.group?._id || '')
      setIsActive(discussion.isActive)
    }
  }, [isOpen, discussion])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.put(`/discussions/${discussion._id}`, {
        title,
        content,
        isActive
      })

      toast({
        title: 'Diskusi berhasil diupdate',
        status: 'success',
        duration: 3000,
      })

      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal update diskusi',
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
    setSelectedGroup('')
    setIsActive(true)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Diskusi: {discussion?.title}</ModalHeader>
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

              <FormControl isDisabled>
                <FormLabel>Grup</FormLabel>
                <Select value={selectedGroup} disabled>
                  {groups?.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
                  ))}
                </Select>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Grup tidak dapat diubah setelah diskusi dibuat
                </Text>
              </FormControl>

              <FormControl>
                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="medium">Status Diskusi</Text>
                    <Text fontSize="sm" color="gray.600">
                      {isActive ? 'Diskusi sedang aktif' : 'Diskusi dinonaktifkan'}
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
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" colorScheme="brand" isLoading={loading}>
              Update Diskusi
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default EditDiscussionModal
