import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  useToast,
  Divider,
  Badge,
  IconButton,
} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import ChatBox from '../components/ChatBox'
import MessageInput from '../components/MessageInput'

const Discussion = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const socketRef = useRef(null)

  const [discussion, setDiscussion] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDiscussion()
    fetchMessages()

    // Setup socket connection
    socketRef.current = io('http://localhost:5000')

    socketRef.current.emit('join-discussion', id)

    socketRef.current.on('receive-message', (message) => {
      // Only add message if it's not from current user (to avoid duplicates)
      // Messages from current user are already added optimistically
      setMessages((prev) => {
        // Check if message already exists (by _id or timestamp + sender)
        const exists = prev.some(m => m._id === message._id)
        if (exists) return prev
        return [...prev, message]
      })
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [id])

  const fetchDiscussion = async () => {
    try {
      const { data } = await api.get(`/discussions/${id}`)
      setDiscussion(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load discussion',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const { data } = await api.get(`/messages/${id}`)
      setMessages(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleSendMessage = async (messageData) => {
    try {
      const { data } = await api.post('/messages', {
        discussion: id,
        ...messageData
      })

      // Add message to local state immediately (optimistic update)
      setMessages((prev) => [...prev, data])

      // Emit to socket for other users to receive
      socketRef.current.emit('send-message', {
        discussionId: id,
        ...data
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleSendFile = async (file, content) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('discussion', id)
      formData.append('content', content || file.name)

      const { data } = await api.post('/messages/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Add message to local state immediately (optimistic update)
      setMessages((prev) => [...prev, data])

      // Emit to socket for other users to receive
      socketRef.current.emit('send-message', {
        discussionId: id,
        ...data
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send file',
        status: 'error',
        duration: 3000,
      })
    }
  }

  if (loading) return null

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.xl" py={4}>
        <VStack spacing={4} align="stretch" h="calc(100vh - 150px)">
          <HStack>
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={() => navigate(`/${user?.role}/dashboard`)}
              variant="ghost"
            />
            <Box flex={1}>
              <HStack justify="space-between">
                <Heading size="md">{discussion?.title}</Heading>
                <Badge colorScheme={discussion?.isActive ? 'green' : 'gray'}>
                  {discussion?.isActive ? 'Active' : 'Completed'}
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                {discussion?.content}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Group: {discussion?.group?.name} | Lecturer: {discussion?.createdBy?.name}
              </Text>
            </Box>
          </HStack>

          <Divider />

          <ChatBox messages={messages} currentUser={user} />

          <MessageInput
            onSendMessage={handleSendMessage}
            onSendFile={handleSendFile}
          />
        </VStack>
      </Container>
    </Box>
  )
}

export default Discussion
