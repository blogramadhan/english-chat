import { useState, useRef } from 'react'
import {
  Box,
  HStack,
  Input,
  IconButton,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  VStack,
} from '@chakra-ui/react'
import { AttachmentIcon } from '@chakra-ui/icons'
import { FaSmile, FaPaperPlane } from 'react-icons/fa'
import EmojiPicker from 'emoji-picker-react'
import ReplyPreview from './ReplyPreview'

const MessageInput = ({ onSendMessage, onSendFile, replyToMessage, onCancelReply }) => {
  const [message, setMessage] = useState('')
  const fileInputRef = useRef(null)
  const { isOpen, onToggle, onClose } = useDisclosure()

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage({
        content: message,
        messageType: 'text',
        replyTo: replyToMessage?._id || null
      })
      setMessage('')
      if (onCancelReply) {
        onCancelReply()
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji)
    // Keep popover open so user can select multiple emojis
    // User can close it by clicking outside or pressing Escape
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      onSendFile(file, '')
      e.target.value = null
    }
  }

  return (
    <Box bg="white" p={2} borderRadius="md" boxShadow="sm">
      <VStack spacing={0} align="stretch">
        <ReplyPreview replyToMessage={replyToMessage} onCancel={onCancelReply} />

        <HStack spacing={1}>
          <IconButton
            icon={<AttachmentIcon />}
            onClick={() => fileInputRef.current?.click()}
            variant="ghost"
            size="sm"
            aria-label="Attach file"
          />
          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileSelect}
            accept="image/jpeg,image/jpg,image/png,image/gif"
          />

          <Popover
            isOpen={isOpen}
            onClose={onClose}
            closeOnBlur={false}
            placement="top-start"
          >
            <PopoverTrigger>
              <IconButton
                icon={<FaSmile />}
                onClick={onToggle}
                variant="ghost"
                size="sm"
                aria-label="Emoji"
              />
            </PopoverTrigger>
            <PopoverContent width="auto">
              <PopoverBody p={0}>
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width="320px"
                  height="350px"
                />
              </PopoverBody>
            </PopoverContent>
          </Popover>

          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            flex={1}
            size="sm"
          />

          <IconButton
            icon={<FaPaperPlane />}
            onClick={handleSend}
            colorScheme="brand"
            size="sm"
            isDisabled={!message.trim()}
            aria-label="Send message"
          />
        </HStack>
      </VStack>
    </Box>
  )
}

export default MessageInput
