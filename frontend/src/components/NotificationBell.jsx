import { useState, useEffect } from 'react'
import {
  Box,
  IconButton,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Divider,
  useToast,
} from '@chakra-ui/react'
import { BellIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications/unread')
      setUnreadCount(data.count)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await api.put(`/notifications/${notification._id}/read`)
        fetchUnreadCount()
      }

      // Navigate to discussion
      navigate(`/discussion/${notification.discussion._id}`)
      setIsOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open discussion',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read')
      fetchNotifications()
      fetchUnreadCount()
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
        status: 'success',
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all as read',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const formatTime = (date) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diffMs = now - notifDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return notifDate.toLocaleDateString()
  }

  return (
    <Popover isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <PopoverTrigger>
        <Box position="relative" display="inline-block">
          <IconButton
            icon={<BellIcon />}
            variant="ghost"
            aria-label="Notifications"
            onClick={() => {
              setIsOpen(!isOpen)
              if (!isOpen) {
                fetchNotifications()
              }
            }}
          />
          {unreadCount > 0 && (
            <Badge
              colorScheme="red"
              borderRadius="full"
              position="absolute"
              top="-1"
              right="-1"
              fontSize="0.7em"
              minW="18px"
              h="18px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent maxW="350px">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontWeight="semibold">
          <HStack justify="space-between" pr={6}>
            <Text>Notifications</Text>
            {unreadCount > 0 && (
              <Button size="xs" variant="ghost" onClick={handleMarkAllRead}>
                Mark all read
              </Button>
            )}
          </HStack>
        </PopoverHeader>
        <PopoverBody p={0} maxH="400px" overflowY="auto">
          {notifications.length === 0 ? (
            <Box p={4} textAlign="center">
              <Text color="gray.500" fontSize="sm">No notifications</Text>
            </Box>
          ) : (
            <VStack spacing={0} align="stretch">
              {notifications.map((notif, index) => (
                <Box key={notif._id}>
                  <Box
                    p={3}
                    cursor="pointer"
                    bg={notif.isRead ? 'white' : 'blue.50'}
                    _hover={{ bg: notif.isRead ? 'gray.50' : 'blue.100' }}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <VStack align="stretch" spacing={1}>
                      <HStack justify="space-between">
                        <Text fontSize="xs" fontWeight="bold" color="brand.600">
                          {notif.discussion?.title}
                        </Text>
                        {!notif.isRead && (
                          <Box w={2} h={2} borderRadius="full" bg="blue.500" />
                        )}
                      </HStack>
                      <Text fontSize="sm">
                        <Text as="span" fontWeight="semibold">
                          {notif.sender?.name}
                        </Text>
                        {' '}
                        {notif.content}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatTime(notif.createdAt)}
                      </Text>
                    </VStack>
                  </Box>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </VStack>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationBell
