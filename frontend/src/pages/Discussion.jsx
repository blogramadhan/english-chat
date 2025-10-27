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
  const [selectedTargetGroup, setSelectedTargetGroup] = useState('all') // For dosen to select which group to send message to
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

        // For mahasiswa: filter based on message target
        if (user.role === 'mahasiswa' && userGroup) {
          // Show message if:
          // 1. It's from their own group (mahasiswa messages)
          // 2. It's a broadcast from dosen (isForAllGroups = true)
          // 3. It's targeted to their group specifically
          const messageGroupId = typeof message.group === 'object' ? message.group?._id : message.group
          const targetGroupId = typeof message.targetGroup === 'object' ? message.targetGroup?._id : message.targetGroup

          const isOwnGroupMessage = messageGroupId === userGroup
          const isBroadcast = message.isForAllGroups === true
          const isTargetedToGroup = targetGroupId === userGroup

          if (!isOwnGroupMessage && !isBroadcast && !isTargetedToGroup) {
            return prev // Don't add messages not for this student
          }
        }

        // For dosen: filter by selected group if not 'all'
        if (user.role === 'dosen' && selectedGroupFilter !== 'all') {
          const messageGroupId = typeof message.group === 'object' ? message.group?._id : message.group
          const targetGroupId = typeof message.targetGroup === 'object' ? message.targetGroup?._id : message.targetGroup

          // Show message if it's from the selected group or targeted to the selected group
          const isFromSelectedGroup = messageGroupId === selectedGroupFilter
          const isTargetedToSelectedGroup = targetGroupId === selectedGroupFilter
          const isBroadcast = message.isForAllGroups === true

          if (!isFromSelectedGroup && !isTargetedToSelectedGroup && !isBroadcast) {
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
      console.log('📋 Discussion fetched:', {
        id: data._id,
        title: data.title,
        groups: data.groups?.map(g => ({ id: g._id, name: g.name })) || [],
        groupCount: data.groups?.length || 0
      })
      setDiscussion(data)

      // Find user's group in this discussion (for mahasiswa)
      if (user.role === 'mahasiswa' && data.groups && data.groups.length > 0) {
        for (const group of data.groups) {
          const isMember = group.members?.some(memberId => {
            const memberIdStr = typeof memberId === 'object' ? memberId._id || memberId : memberId
            return memberIdStr === user._id || memberIdStr.toString() === user._id.toString()
          })
          if (isMember) {
            console.log('👤 User group found:', { groupId: group._id, groupName: group.name })
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
      console.log('📥 Messages fetched:', {
        count: data.length,
        sampleMessage: data[0] ? {
          id: data[0]._id,
          content: data[0].content?.substring(0, 30),
          group: data[0].group,
          groupType: typeof data[0].group,
          hasGroupId: data[0].group?._id ? true : false
        } : 'No messages',
        allGroups: [...new Set(data.map(m => m.group?._id || m.group).filter(Boolean))]
      })
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
      // For dosen: include targetGroup in the message
      const payload = {
        discussion: id,
        ...messageData
      }

      if (user.role === 'dosen') {
        payload.targetGroup = selectedTargetGroup
      }

      const { data } = await api.post('/messages', payload)

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

      // For dosen: include targetGroup
      if (user.role === 'dosen') {
        formData.append('targetGroup', selectedTargetGroup)
      }

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
        // Extract group IDs - handle berbagai format
        const messageGroupId = typeof msg.group === 'object' ? msg.group?._id : msg.group
        const targetGroupId = typeof msg.targetGroup === 'object' ? msg.targetGroup?._id : msg.targetGroup

        // Show message if:
        // 1. It's from the selected group (mahasiswa messages)
        // 2. It's targeted to the selected group (dosen messages)
        // 3. It's a broadcast message (isForAllGroups)
        const isFromSelectedGroup = messageGroupId === selectedGroupFilter
        const isTargetedToSelectedGroup = targetGroupId === selectedGroupFilter
        const isBroadcast = msg.isForAllGroups === true

        return isFromSelectedGroup || isTargetedToSelectedGroup || isBroadcast
      })
    : messages

  if (loading) return null

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.xl" py={3}>
        <VStack spacing={3} align="stretch" h="calc(100vh - 130px)">
          {/* Header - Compact */}
          <HStack spacing={2} bg="white" p={3} borderRadius="md" boxShadow="sm">
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={() => navigate(`/${user?.role}/dashboard`)}
              variant="ghost"
              size="sm"
            />
            <Box flex={1}>
              <HStack justify="space-between" align="start">
                <Box flex={1}>
                  <Heading size="sm" mb={1}>{discussion?.title}</Heading>
                  <Text fontSize="xs" color="gray.600" noOfLines={1}>
                    {discussion?.content}
                  </Text>
                </Box>
                <Badge colorScheme={discussion?.isActive ? 'green' : 'gray'} fontSize="xs">
                  {discussion?.isActive ? 'Active' : 'Completed'}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {discussion?.groups && discussion.groups.length > 0 ? (
                  <>Groups: {discussion.groups.map(g => g.name).join(', ')}</>
                ) : (
                  <>Group: {discussion?.group?.name}</>
                )} • {discussion?.createdBy?.name}
              </Text>
            </Box>
          </HStack>

          {/* Group selector for dosen - Compact */}
          {user?.role === 'dosen' && discussion?.groups && discussion.groups.length > 1 && (
            <HStack spacing={2} bg="white" px={3} py={2} borderRadius="md" boxShadow="sm">
              <Text fontSize="xs" fontWeight="medium" color="gray.600">View:</Text>
              <Select
                size="xs"
                maxW="200px"
                value={selectedGroupFilter}
                onChange={(e) => {
                  const newValue = e.target.value
                  console.log('🎯 Group filter changed:', {
                    oldValue: selectedGroupFilter,
                    newValue: newValue,
                    availableGroups: discussion.groups.map(g => ({ id: g._id, name: g.name }))
                  })
                  setSelectedGroupFilter(newValue)
                }}
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

          <ChatBox
            messages={displayedMessages}
            currentUser={user}
            onReply={handleReply}
          />

          {/* Send to selector for dosen - Compact */}
          {user?.role === 'dosen' && discussion?.groups && discussion.groups.length > 1 && (
            <HStack spacing={2} bg="white" px={3} py={2} borderRadius="md" boxShadow="sm">
              <Text fontSize="xs" fontWeight="medium" color="gray.600">Send to:</Text>
              <Select
                size="xs"
                maxW="200px"
                value={selectedTargetGroup}
                onChange={(e) => setSelectedTargetGroup(e.target.value)}
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
