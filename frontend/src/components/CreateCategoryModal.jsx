import { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react'
import api from '../utils/api'

const CreateCategoryModal = ({ isOpen, onClose, onCategoryCreated }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Category name is required',
        status: 'error',
        duration: 3000,
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await api.post('/categories', {
        name: name.trim(),
        description: description.trim(),
      })

      console.log('✅ Category created successfully:', response.data)

      toast({
        title: 'Success',
        description: 'Category created successfully',
        status: 'success',
        duration: 3000,
      })

      setName('')
      setDescription('')
      onCategoryCreated()
      onClose()
    } catch (error) {
      console.error('❌ Error creating category:', error.response?.data || error.message)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create category',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Category</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Category Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter category name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter category description (optional)"
                  rows={3}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                width="full"
                isLoading={isLoading}
                loadingText="Creating..."
              >
                Create Category
              </Button>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default CreateCategoryModal
