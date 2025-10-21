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
} from '@chakra-ui/react'
import { AttachmentIcon } from '@chakra-ui/icons'
import { FaSmile, FaPaperPlane } from 'react-icons/fa'
import EmojiPicker from 'emoji-picker-react'

const MessageInput = ({ onSendMessage, onSendFile }) => {
  const [message, setMessage] = useState('')
  const fileInputRef = useRef(null)
  const { isOpen, onToggle, onClose } = useDisclosure()

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage({
        content: message,
        messageType: 'text'
      })
      setMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      onSendFile(file, '')
      e.target.value = null
    }
  }

  return (
    <Box bg="white" p={4} borderRadius="lg" boxShadow="sm">
      <HStack spacing={2}>
        <IconButton
          icon={<AttachmentIcon />}
          onClick={() => fileInputRef.current?.click()}
          variant="ghost"
          aria-label="Attach file"
        />
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
        />

        <Popover isOpen={isOpen} onClose={onClose}>
          <PopoverTrigger>
            <IconButton
              icon={<FaSmile />}
              onClick={onToggle}
              variant="ghost"
              aria-label="Emoji"
            />
          </PopoverTrigger>
          <PopoverContent>
            <PopoverBody p={0}>
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width="100%"
                height="400px"
              />
            </PopoverBody>
          </PopoverContent>
        </Popover>

        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ketik pesan..."
          flex={1}
        />

        <IconButton
          icon={<FaPaperPlane />}
          onClick={handleSend}
          colorScheme="brand"
          isDisabled={!message.trim()}
          aria-label="Send message"
        />
      </HStack>
    </Box>
  )
}

export default MessageInput
