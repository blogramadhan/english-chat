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
  HStack,
  Text,
  Avatar,
  Box,
  Badge,
  Divider,
} from '@chakra-ui/react'
import { getAvatarUrl } from '../utils/avatar'

const GroupMembersModal = ({ isOpen, onClose, group }) => {
  if (!group) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack align="start" spacing={1}>
            <Text>Group Members</Text>
            <Text fontSize="md" fontWeight="normal" color="gray.600">
              {group.name}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Lecturer Info */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={2}>
                LECTURER
              </Text>
              <HStack spacing={3} p={3} bg="blue.50" borderRadius="md">
                <Avatar
                  size="md"
                  name={group.createdBy?.name}
                  src={getAvatarUrl(group.createdBy?.avatar)}
                />
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontWeight="semibold">{group.createdBy?.name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {group.createdBy?.email}
                  </Text>
                </VStack>
                <Badge colorScheme="blue">Lecturer</Badge>
              </HStack>
            </Box>

            <Divider />

            {/* Members List */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={2}>
                STUDENTS ({group.members?.length || 0})
              </Text>
              <VStack spacing={2} align="stretch">
                {group.members && group.members.length > 0 ? (
                  group.members.map((member) => (
                    <HStack
                      key={member._id}
                      spacing={3}
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                      _hover={{ bg: 'gray.100' }}
                    >
                      <Avatar
                        size="sm"
                        name={member.name}
                        src={getAvatarUrl(member.avatar)}
                      />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontWeight="medium">{member.name}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {member.email}
                        </Text>
                      </VStack>
                      {member.nim && (
                        <Badge colorScheme="cyan" fontSize="xs">
                          {member.nim}
                        </Badge>
                      )}
                    </HStack>
                  ))
                ) : (
                  <Text color="gray.500" textAlign="center" py={4}>
                    No members in this group
                  </Text>
                )}
              </VStack>
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

export default GroupMembersModal
