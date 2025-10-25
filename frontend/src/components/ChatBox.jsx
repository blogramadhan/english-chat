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
        borderLeft="2px solid"
        borderColor={isOwn ? 'whiteAlpha.600' : 'brand.400'}
        px={2}
        py={1}
        mb={1.5}
        borderRadius="sm"
      >
        <Text fontSize="2xs" fontWeight="semibold" color={isOwn ? 'whiteAlpha.900' : 'brand.600'}>
          {replyTo.sender?.name || 'User'}
        </Text>
        <Text fontSize="2xs" color={isOwn ? 'whiteAlpha.800' : 'gray.600'} noOfLines={1}>
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
              maxW="250px"
              borderRadius="md"
            />
          ) : (
            <Link
              href={getFileUrl(message.fileUrl)}
              isExternal
              color="blue.400"
              fontSize="sm"
            >
              <HStack spacing={1}>
                <AttachmentIcon boxSize={3} />
                <Text>{message.fileName}</Text>
              </HStack>
            </Link>
          )}
          {message.content !== message.fileName && (
            <Text mt={1} fontSize="sm">{message.content}</Text>
          )}
        </Box>
      )
    }

    return <Text whiteSpace="pre-wrap" fontSize="sm">{message.content}</Text>
  }

  return (
    <Box
      flex={1}
      bg="white"
      borderRadius="md"
      p={3}
      overflowY="auto"
      boxShadow="sm"
    >
      <VStack spacing={2} align="stretch">
        {messages.map((message) => {
          const isOwn = isOwnMessage(message)

          return (
            <HStack
              key={message._id}
              justify={isOwn ? 'flex-end' : 'flex-start'}
              align="flex-start"
              spacing={2}
            >
              {!isOwn && (
                <Avatar
                  size="xs"
                  name={message.sender?.name}
                  src={getAvatarUrl(message.sender?.avatar)}
                />
              )}

              <Box maxW="75%" position="relative" role="group">
                {!isOwn && (
                  <Text fontSize="xs" color="gray.600" mb={0.5} fontWeight="medium">
                    {message.sender?.name}
                  </Text>
                )}
                <Box
                  bg={isOwn ? 'brand.500' : 'gray.100'}
                  color={isOwn ? 'white' : 'black'}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  borderTopLeftRadius={!isOwn ? 'sm' : 'lg'}
                  borderTopRightRadius={isOwn ? 'sm' : 'lg'}
                  position="relative"
                  fontSize="sm"
                >
                  {renderReplyMessage(message.replyTo, isOwn)}
                  {renderMessageContent(message)}
                  {message.isEdited && (
                    <Text fontSize="2xs" color={isOwn ? 'whiteAlpha.700' : 'gray.500'} mt={0.5}>
                      (edited)
                    </Text>
                  )}

                  {/* Reply button - shows on hover */}
                  <IconButton
                    icon={<FaReply />}
                    size="2xs"
                    variant="ghost"
                    position="absolute"
                    top={0.5}
                    right={0.5}
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    colorScheme={isOwn ? 'whiteAlpha' : 'gray'}
                    onClick={() => onReply && onReply(message)}
                    aria-label="Reply to message"
                  />
                </Box>
                <Text fontSize="2xs" color="gray.400" mt={0.5}>
                  {new Date(message.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </Box>

              {isOwn && (
                <Avatar
                  size="xs"
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
