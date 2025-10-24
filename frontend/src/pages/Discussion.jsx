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
  Select,
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
  const [userGroup, setUserGroup] = useState(null) // Track user's group in this discussion
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all') // For dosen to filter by group
  const [replyToMessage, setReplyToMessage] = useState(null) // Track message being replied to

  useEffect(() => {
    fetchDiscussion()
    fetchMessages()

    // Setup socket connection
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'
    socketRef.current = io(SOCKET_URL)

    socketRef.current.emit('join-discussion', id)

    socketRef.current.on('receive-message', (message) => {
      // Only add message if it's not from current user (to avoid duplicates)
      // Messages from current user are already added optimistically
      setMessages((prev) => {
        // Check if message already exists (by _id or timestamp + sender)
        const exists = prev.some(m => m._id === message._id)
        if (exists) return prev

        // For mahasiswa: only show messages from their own group
        if (user.role === 'mahasiswa' && userGroup) {
          // If message has a group, check if it matches user's group
          const messageGroupId = typeof message.group === 'object' ? message.group._id || message.group : message.group
          if (message.group && messageGroupId !== userGroup) {
            return prev // Don't add messages from other groups
          }
        }

        // For dosen: filter by selected group if not 'all'
        if (user.role === 'dosen' && selectedGroupFilter !== 'all') {
          const messageGroupId = typeof message.group === 'object' ? message.group._id || message.group : message.group
          if (message.group && messageGroupId !== selectedGroupFilter) {
            return prev // Don't add messages from other groups
          }
        }

        return [...prev, message]
      })
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [id, user, userGroup, selectedGroupFilter])

  const fetchDiscussion = async () => {
    try {
      const { data } = await api.get(`/discussions/${id}`)
      setDiscussion(data)

      // Find user's group in this discussion (for mahasiswa)
      if (user.role === 'mahasiswa' && data.groups && data.groups.length > 0) {
        for (const group of data.groups) {
          const isMember = group.members?.some(memberId => {
            const memberIdStr = typeof memberId === 'object' ? memberId._id || memberId : memberId
            return memberIdStr === user._id || memberIdStr.toString() === user._id.toString()
          })
          if (isMember) {
            setUserGroup(group._id)
            break
          }
        }
      }
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

      // Clear reply state after sending
      setReplyToMessage(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleReply = (message) => {
    setReplyToMessage(message)
  }

  const handleCancelReply = () => {
    setReplyToMessage(null)
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

  // Filter messages for display based on selected group (for dosen)
  const displayedMessages = user?.role === 'dosen' && selectedGroupFilter !== 'all'
    ? messages.filter(msg => {
        // Jika message tidak punya group, skip (jangan tampilkan)
        // Karena semua message seharusnya punya group di sistem multi-group
        if (!msg.group) {
          console.log('Message without group:', msg._id, msg.content?.substring(0, 30))
          return false
        }

        const messageGroupId = typeof msg.group === 'object' ? msg.group._id || msg.group : msg.group
        const shouldShow = messageGroupId === selectedGroupFilter

        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('Filter check:', {
            messageId: msg._id,
            messageGroupId,
            selectedGroupFilter,
            shouldShow,
            groupObject: msg.group
          })
        }

        return shouldShow
      })
    : messages

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
                {discussion?.groups && discussion.groups.length > 0 ? (
                  <>Groups: {discussion.groups.map(g => g.name).join(', ')}</>
                ) : (
                  <>Group: {discussion?.group?.name}</>
                )} | Lecturer: {discussion?.createdBy?.name}
              </Text>
            </Box>
          </HStack>

          {/* Group selector for dosen */}
          {user?.role === 'dosen' && discussion?.groups && discussion.groups.length > 1 && (
            <HStack>
              <Text fontSize="sm" fontWeight="medium">View Group:</Text>
              <Select
                size="sm"
                maxW="300px"
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value)}
              >
                <option value="all">All Groups</option>
                {discussion.groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </Select>
            </HStack>
          )}

          <Divider />

          <ChatBox
            messages={displayedMessages}
            currentUser={user}
            onReply={handleReply}
          />

          <MessageInput
            onSendMessage={handleSendMessage}
            onSendFile={handleSendFile}
            replyToMessage={replyToMessage}
            onCancelReply={handleCancelReply}
          />
        </VStack>
      </Container>
    </Box>
  )
}

export default Discussion
