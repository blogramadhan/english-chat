import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  HStack,
  useToast,
  useDisclosure,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Text,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { AddIcon, SettingsIcon } from '@chakra-ui/icons'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import CreateGroupModal from '../components/CreateGroupModal'
import CreateDiscussionModal from '../components/CreateDiscussionModal'
import Navbar from '../components/Navbar'

const DosenDashboard = () => {
  const [groups, setGroups] = useState([])
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen: isGroupOpen, onOpen: onGroupOpen, onClose: onGroupClose } = useDisclosure()
  const { isOpen: isDiscussionOpen, onOpen: onDiscussionOpen, onClose: onDiscussionClose } = useDisclosure()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [groupsRes, discussionsRes] = await Promise.all([
        api.get('/groups'),
        api.get('/discussions')
      ])
      setGroups(groupsRes.data)
      setDiscussions(discussionsRes.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGroupCreated = () => {
    fetchData()
    onGroupClose()
  }

  const handleDiscussionCreated = () => {
    fetchData()
    onDiscussionClose()
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between">
            <Heading size="lg">Dashboard Dosen</Heading>
            <HStack>
              <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={onGroupOpen}>
                Buat Grup
              </Button>
              <Button leftIcon={<AddIcon />} colorScheme="green" onClick={onDiscussionOpen}>
                Buat Diskusi
              </Button>
            </HStack>
          </HStack>

          <Box>
            <Heading size="md" mb={4}>Grup Saya</Heading>
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
              {groups.map((group) => (
                <Card key={group._id} cursor="pointer" _hover={{ shadow: 'lg' }}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="sm">{group.name}</Heading>
                      <Badge colorScheme={group.isActive ? 'green' : 'red'}>
                        {group.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      {group.description || 'Tidak ada deskripsi'}
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {group.members?.length || 0} Mahasiswa
                    </Text>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          </Box>

          <Box>
            <Heading size="md" mb={4}>Diskusi Aktif</Heading>
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
              {discussions.map((discussion) => (
                <Card
                  key={discussion._id}
                  cursor="pointer"
                  _hover={{ shadow: 'lg' }}
                  onClick={() => navigate(`/discussion/${discussion._id}`)}
                >
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="sm">{discussion.title}</Heading>
                      <Badge colorScheme={discussion.isActive ? 'green' : 'red'}>
                        {discussion.isActive ? 'Aktif' : 'Selesai'}
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="sm" color="gray.600" noOfLines={2} mb={2}>
                      {discussion.content}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Grup: {discussion.group?.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(discussion.createdAt).toLocaleDateString('id-ID')}
                    </Text>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          </Box>
        </VStack>
      </Container>

      <CreateGroupModal
        isOpen={isGroupOpen}
        onClose={onGroupClose}
        onSuccess={handleGroupCreated}
      />

      <CreateDiscussionModal
        isOpen={isDiscussionOpen}
        onClose={onDiscussionClose}
        onSuccess={handleDiscussionCreated}
        groups={groups}
      />
    </Box>
  )
}

export default DosenDashboard
