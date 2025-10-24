import {
  Box,
  HStack,
  Text,
  IconButton,
} from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'
import { FaReply } from 'react-icons/fa'

const ReplyPreview = ({ replyToMessage, onCancel }) => {
  if (!replyToMessage) return null

  const getTruncatedContent = (message) => {
    if (message.messageType === 'file') {
      return `📎 ${message.fileName || 'File'}`
    }
    const maxLength = 50
    return message.content.length > maxLength
      ? message.content.substring(0, maxLength) + '...'
      : message.content
  }

  return (
    <Box
      bg="gray.50"
      borderLeft="3px solid"
      borderColor="brand.500"
      p={3}
      mb={2}
      borderRadius="md"
    >
      <HStack justify="space-between">
        <HStack spacing={2} flex={1} overflow="hidden">
          <FaReply color="gray" size={12} />
          <Box flex={1} overflow="hidden">
            <Text fontSize="xs" fontWeight="medium" color="brand.600">
              Replying to {replyToMessage.sender?.name || 'User'}
            </Text>
            <Text fontSize="sm" color="gray.600" noOfLines={1}>
              {getTruncatedContent(replyToMessage)}
            </Text>
          </Box>
        </HStack>
        <IconButton
          icon={<CloseIcon />}
          size="xs"
          variant="ghost"
          onClick={onCancel}
          aria-label="Cancel reply"
        />
      </HStack>
    </Box>
  )
}

export default ReplyPreview
