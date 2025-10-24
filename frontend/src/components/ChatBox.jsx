import { useEffect, useRef } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Image,
  Link,
  IconButton,
} from '@chakra-ui/react'
import { AttachmentIcon } from '@chakra-ui/icons'
import { FaReply } from 'react-icons/fa'
import { getAvatarUrl, getFileUrl } from '../utils/avatar'

const ChatBox = ({ messages, currentUser, onReply }) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const isOwnMessage = (message) => {
    return message.sender._id === currentUser._id
  }

  const renderReplyMessage = (replyTo, isOwn) => {
    if (!replyTo) return null

    const replyContent = replyTo.messageType === 'file'
      ? `📎 ${replyTo.fileName || 'File'}`
      : replyTo.content

    return (
      <Box
        bg={isOwn ? 'whiteAlpha.300' : 'gray.200'}
        borderLeft="3px solid"
        borderColor={isOwn ? 'whiteAlpha.600' : 'brand.400'}
        p={2}
        mb={2}
        borderRadius="md"
      >
        <Text fontSize="xs" fontWeight="medium" color={isOwn ? 'whiteAlpha.800' : 'brand.600'}>
          {replyTo.sender?.name || 'User'}
        </Text>
        <Text fontSize="xs" color={isOwn ? 'whiteAlpha.700' : 'gray.600'} noOfLines={2}>
          {replyContent}
        </Text>
      </Box>
    )
  }

  const renderMessageContent = (message) => {
    if (message.messageType === 'file') {
      const isImage = message.fileName?.match(/\.(jpg|jpeg|png|gif)$/i)

      return (
        <Box>
          {isImage ? (
            <Image
              src={getFileUrl(message.fileUrl)}
              alt={message.fileName}
              maxW="300px"
              borderRadius="md"
            />
          ) : (
            <Link
              href={getFileUrl(message.fileUrl)}
              isExternal
              color="blue.500"
            >
              <HStack>
                <AttachmentIcon />
                <Text>{message.fileName}</Text>
              </HStack>
            </Link>
          )}
          {message.content !== message.fileName && (
            <Text mt={2}>{message.content}</Text>
          )}
        </Box>
      )
    }

    return <Text whiteSpace="pre-wrap">{message.content}</Text>
  }

  return (
    <Box
      flex={1}
      bg="white"
      borderRadius="lg"
      p={4}
      overflowY="auto"
      boxShadow="sm"
    >
      <VStack spacing={4} align="stretch">
        {messages.map((message) => {
          const isOwn = isOwnMessage(message)

          return (
            <HStack
              key={message._id}
              justify={isOwn ? 'flex-end' : 'flex-start'}
              align="flex-start"
            >
              {!isOwn && (
                <Avatar
                  size="sm"
                  name={message.sender?.name}
                  src={getAvatarUrl(message.sender?.avatar)}
                />
              )}

              <Box maxW="70%" position="relative" role="group">
                {!isOwn && (
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    {message.sender?.name}
                  </Text>
                )}
                <Box
                  bg={isOwn ? 'brand.500' : 'gray.100'}
                  color={isOwn ? 'white' : 'black'}
                  px={4}
                  py={2}
                  borderRadius="lg"
                  borderTopLeftRadius={!isOwn ? 0 : 'lg'}
                  borderTopRightRadius={isOwn ? 0 : 'lg'}
                  position="relative"
                >
                  {renderReplyMessage(message.replyTo, isOwn)}
                  {renderMessageContent(message)}
                  {message.isEdited && (
                    <Text fontSize="xs" color={isOwn ? 'whiteAlpha.700' : 'gray.500'} mt={1}>
                      (edited)
                    </Text>
                  )}

                  {/* Reply button - shows on hover */}
                  <IconButton
                    icon={<FaReply />}
                    size="xs"
                    variant="ghost"
                    position="absolute"
                    top={1}
                    right={1}
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    colorScheme={isOwn ? 'whiteAlpha' : 'gray'}
                    onClick={() => onReply && onReply(message)}
                    aria-label="Reply to message"
                  />
                </Box>
                <Text fontSize="xs" color="gray.400" mt={1}>
                  {new Date(message.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </Box>

              {isOwn && (
                <Avatar
                  size="sm"
                  name={message.sender?.name}
                  src={getAvatarUrl(message.sender?.avatar)}
                />
              )}
            </HStack>
          )
        })}
        <div ref={messagesEndRef} />
      </VStack>
    </Box>
  )
}

export default ChatBox
