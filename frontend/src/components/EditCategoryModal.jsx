import { useState, useEffect } from 'react'
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
  Switch,
  useToast,
} from '@chakra-ui/react'
import api from '../utils/api'

const EditCategoryModal = ({ isOpen, onClose, category, onCategoryUpdated }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (category) {
      setName(category.name || '')
      setDescription(category.description || '')
      setIsActive(category.isActive !== undefined ? category.isActive : true)
    }
  }, [category])

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
      const response = await api.put(`/categories/${category._id}`, {
        name: name.trim(),
        description: description.trim(),
        isActive,
      })

      console.log('✅ Category updated successfully:', response.data)

      toast({
        title: 'Success',
        description: 'Category updated successfully',
        status: 'success',
        duration: 3000,
      })

      onCategoryUpdated()
      onClose()
    } catch (error) {
      console.error('❌ Error updating category:', error.response?.data || error.message)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update category',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Category</ModalHeader>
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

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Active</FormLabel>
                <Switch
                  isChecked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  colorScheme="brand"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                width="full"
                isLoading={isLoading}
                loadingText="Updating..."
              >
                Update Category
              </Button>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default EditCategoryModal
