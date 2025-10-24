import { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  VStack,
  useToast,
} from '@chakra-ui/react'

const ExportPDFModal = ({ isOpen, onClose, discussion }) => {
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [isDownloading, setIsDownloading] = useState(false)
  const toast = useToast()

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      const userInfo = localStorage.getItem('userInfo')
      const { token } = JSON.parse(userInfo)

      // Build URL with group parameter
      let url = `/api/discussions/${discussion._id}/export-pdf`
      if (selectedGroup !== 'all') {
        url += `?group=${selectedGroup}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to download PDF')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl

      // Add group name to filename if specific group selected
      const groupSuffix = selectedGroup !== 'all'
        ? `-${discussion.groups.find(g => g._id === selectedGroup)?.name || 'group'}`
        : ''
      a.download = `discussion-${discussion.title.replace(/\s+/g, '-')}${groupSuffix}.pdf`

      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)

      toast({
        title: 'PDF downloaded successfully',
        status: 'success',
        duration: 3000,
      })

      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download PDF',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleClose = () => {
    setSelectedGroup('all')
    onClose()
  }

  if (!discussion) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Export Discussion to PDF</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Discussion</FormLabel>
              <Select value={discussion._id} isDisabled>
                <option value={discussion._id}>{discussion.title}</option>
              </Select>
            </FormControl>

            {discussion.groups && discussion.groups.length > 1 && (
              <FormControl>
                <FormLabel>Select Group</FormLabel>
                <Select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  <option value="all">All Groups</option>
                  {discussion.groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            {discussion.groups && discussion.groups.length === 1 && (
              <FormControl>
                <FormLabel>Group</FormLabel>
                <Select value={discussion.groups[0]._id} isDisabled>
                  <option value={discussion.groups[0]._id}>
                    {discussion.groups[0].name}
                  </option>
                </Select>
              </FormControl>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="green"
            onClick={handleDownload}
            isLoading={isDownloading}
            loadingText="Downloading..."
          >
            Download PDF
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ExportPDFModal
