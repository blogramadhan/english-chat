import { useEffect, useRef } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Image,
  Link,
} from '@chakra-ui/react'
import { AttachmentIcon } from '@chakra-ui/icons'
import { getAvatarUrl } from '../utils/avatar'

const ChatBox = ({ messages, currentUser }) => {
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

  const renderMessageContent = (message) => {
    if (message.messageType === 'file') {
      const isImage = message.fileName?.match(/\.(jpg|jpeg|png|gif)$/i)

      return (
        <Box>
          {isImage ? (
            <Image
              src={`http://localhost:5000${message.fileUrl}`}
              alt={message.fileName}
              maxW="300px"
              borderRadius="md"
            />
          ) : (
            <Link
              href={`http://localhost:5000${message.fileUrl}`}
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

              <Box maxW="70%">
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
                >
                  {renderMessageContent(message)}
                  {message.isEdited && (
                    <Text fontSize="xs" color={isOwn ? 'whiteAlpha.700' : 'gray.500'} mt={1}>
                      (edited)
                    </Text>
                  )}
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
