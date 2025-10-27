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
  VStack,
  useToast,
  Text,
  HStack,
  Avatar,
  IconButton,
  Box,
  Divider,
  Badge,
} from '@chakra-ui/react'
import { DeleteIcon, AddIcon } from '@chakra-ui/icons'
import api from '../utils/api'
import { getAvatarUrl } from '../utils/avatar'

const ManageCollaboratorsModal = ({ isOpen, onClose, discussion, onSuccess }) => {
  const [availableDosen, setAvailableDosen] = useState([])
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchDosen()
    }
  }, [isOpen])

  const fetchDosen = async () => {
    try {
      const { data } = await api.get('/users/lecturers')
      // Filter out the creator and existing collaborators
      const filtered = data.filter(dosen =>
        dosen._id !== discussion?.createdBy?._id &&
        !discussion?.collaborators?.some(collab => collab._id === dosen._id)
      )
      setAvailableDosen(filtered)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load lecturers',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleAddCollaborator = async (dosenId) => {
    setLoading(true)
    try {
      await api.post(`/discussions/${discussion._id}/collaborators`, { dosenId })

      toast({
        title: 'Collaborator added',
        description: 'Lecturer has been added as collaborator',
        status: 'success',
        duration: 3000,
      })

      onSuccess()
      fetchDosen() // Refresh the list
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add collaborator',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCollaborator = async (dosenId) => {
    setLoading(true)
    try {
      await api.delete(`/discussions/${discussion._id}/collaborators/${dosenId}`)

      toast({
        title: 'Collaborator removed',
        description: 'Lecturer has been removed from collaborators',
        status: 'success',
        duration: 3000,
      })

      onSuccess()
      fetchDosen() // Refresh the list
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove collaborator',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage Collaborators</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Current Collaborators */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={2}>
                Current Collaborators ({discussion?.collaborators?.length || 0})
              </Text>
              {discussion?.collaborators && discussion.collaborators.length > 0 ? (
                <VStack spacing={2} align="stretch">
                  {discussion.collaborators.map((collab) => (
                    <HStack
                      key={collab._id}
                      p={2}
                      bg="gray.50"
                      borderRadius="md"
                      justify="space-between"
                    >
                      <HStack spacing={2}>
                        <Avatar
                          size="sm"
                          name={collab.name}
                          src={getAvatarUrl(collab.avatar)}
                        />
                        <Box>
                          <Text fontSize="sm" fontWeight="medium">
                            {collab.name}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {collab.email}
                          </Text>
                        </Box>
                      </HStack>
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleRemoveCollaborator(collab._id)}
                        isLoading={loading}
                        aria-label="Remove collaborator"
                      />
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Text fontSize="sm" color="gray.500">
                  No collaborators yet
                </Text>
              )}
            </Box>

            <Divider />

            {/* Available Lecturers */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={2}>
                Add Collaborators
              </Text>
              {availableDosen.length > 0 ? (
                <VStack spacing={2} align="stretch" maxH="300px" overflowY="auto">
                  {availableDosen.map((dosen) => (
                    <HStack
                      key={dosen._id}
                      p={2}
                      bg="white"
                      borderRadius="md"
                      border="1px"
                      borderColor="gray.200"
                      justify="space-between"
                    >
                      <HStack spacing={2}>
                        <Avatar
                          size="sm"
                          name={dosen.name}
                          src={getAvatarUrl(dosen.avatar)}
                        />
                        <Box>
                          <Text fontSize="sm" fontWeight="medium">
                            {dosen.name}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {dosen.email}
                          </Text>
                        </Box>
                      </HStack>
                      <IconButton
                        icon={<AddIcon />}
                        size="sm"
                        colorScheme="brand"
                        variant="ghost"
                        onClick={() => handleAddCollaborator(dosen._id)}
                        isLoading={loading}
                        aria-label="Add collaborator"
                      />
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Text fontSize="sm" color="gray.500">
                  No other lecturers available
                </Text>
              )}
            </Box>

            <Box bg="blue.50" p={3} borderRadius="md">
              <Text fontSize="xs" color="blue.800">
                <strong>Note:</strong> Collaborators can view, send messages, edit, and manage this discussion just like the creator.
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ManageCollaboratorsModal
