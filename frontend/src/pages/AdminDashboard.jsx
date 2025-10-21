import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Text,
  Badge,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react'
import { CheckIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import { useRef } from 'react'

const AdminDashboard = () => {
  const [stats, setStats] = useState({})
  const [pendingUsers, setPendingUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef()
  const toast = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users/pending'),
        api.get('/admin/users')
      ])

      setStats(statsRes.data)
      setPendingUsers(pendingRes.data)
      setAllUsers(usersRes.data)
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

  const handleApprove = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/approve`)

      toast({
        title: 'User approved',
        description: 'User berhasil disetujui',
        status: 'success',
        duration: 3000,
      })

      fetchData()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal approve user',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleReject = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/reject`)

      toast({
        title: 'User rejected',
        description: 'User ditolak',
        status: 'success',
        duration: 3000,
      })

      fetchData()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal reject user',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleDeleteClick = (user) => {
    setSelectedUser(user)
    onOpen()
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/users/${selectedUser._id}`)

      toast({
        title: 'User deleted',
        description: 'User berhasil dihapus',
        status: 'success',
        duration: 3000,
      })

      onClose()
      fetchData()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal hapus user',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'yellow',
      approved: 'green',
      rejected: 'red'
    }

    return (
      <Badge colorScheme={colors[status]}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'purple',
      dosen: 'blue',
      mahasiswa: 'cyan'
    }

    return (
      <Badge colorScheme={colors[role]}>
        {role.toUpperCase()}
      </Badge>
    )
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading size="lg">Admin Dashboard</Heading>

          {/* Statistics */}
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Users</StatLabel>
                  <StatNumber>{stats.totalUsers || 0}</StatNumber>
                  <StatHelpText>Dosen & Mahasiswa</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Pending Approval</StatLabel>
                  <StatNumber color="yellow.500">{stats.pendingUsers || 0}</StatNumber>
                  <StatHelpText>Menunggu persetujuan</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Approved Users</StatLabel>
                  <StatNumber color="green.500">{stats.approvedUsers || 0}</StatNumber>
                  <StatHelpText>User aktif</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Dosen</StatLabel>
                  <StatNumber color="blue.500">{stats.totalDosen || 0}</StatNumber>
                  <StatHelpText>Dosen aktif</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Mahasiswa</StatLabel>
                  <StatNumber color="cyan.500">{stats.totalMahasiswa || 0}</StatNumber>
                  <StatHelpText>Mahasiswa aktif</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </Grid>

          {/* Tabs */}
          <Tabs colorScheme="brand">
            <TabList>
              <Tab>Pending Approval ({pendingUsers.length})</Tab>
              <Tab>All Users ({allUsers.length})</Tab>
            </TabList>

            <TabPanels>
              {/* Pending Users Tab */}
              <TabPanel>
                <Card>
                  <CardHeader>
                    <Heading size="md">Pending Users</Heading>
                  </CardHeader>
                  <CardBody>
                    {pendingUsers.length === 0 ? (
                      <Text color="gray.500">Tidak ada user yang menunggu approval</Text>
                    ) : (
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Name</Th>
                            <Th>Email</Th>
                            <Th>Role</Th>
                            <Th>NIM/NIP</Th>
                            <Th>Registered At</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {pendingUsers.map((user) => (
                            <Tr key={user._id}>
                              <Td>{user.name}</Td>
                              <Td>{user.email}</Td>
                              <Td>{getRoleBadge(user.role)}</Td>
                              <Td>{user.nim || user.nip || '-'}</Td>
                              <Td>
                                {new Date(user.createdAt).toLocaleDateString('id-ID')}
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <IconButton
                                    icon={<CheckIcon />}
                                    colorScheme="green"
                                    size="sm"
                                    onClick={() => handleApprove(user._id)}
                                    aria-label="Approve"
                                  />
                                  <IconButton
                                    icon={<CloseIcon />}
                                    colorScheme="red"
                                    size="sm"
                                    onClick={() => handleReject(user._id)}
                                    aria-label="Reject"
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>

              {/* All Users Tab */}
              <TabPanel>
                <Card>
                  <CardHeader>
                    <Heading size="md">All Users</Heading>
                  </CardHeader>
                  <CardBody>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>Email</Th>
                          <Th>Role</Th>
                          <Th>Status</Th>
                          <Th>NIM/NIP</Th>
                          <Th>Registered At</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {allUsers.map((user) => (
                          <Tr key={user._id}>
                            <Td>{user.name}</Td>
                            <Td>{user.email}</Td>
                            <Td>{getRoleBadge(user.role)}</Td>
                            <Td>{getStatusBadge(user.status)}</Td>
                            <Td>{user.nim || user.nip || '-'}</Td>
                            <Td>
                              {new Date(user.createdAt).toLocaleDateString('id-ID')}
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                {user.status === 'pending' && (
                                  <>
                                    <IconButton
                                      icon={<CheckIcon />}
                                      colorScheme="green"
                                      size="sm"
                                      onClick={() => handleApprove(user._id)}
                                      aria-label="Approve"
                                    />
                                    <IconButton
                                      icon={<CloseIcon />}
                                      colorScheme="orange"
                                      size="sm"
                                      onClick={() => handleReject(user._id)}
                                      aria-label="Reject"
                                    />
                                  </>
                                )}
                                {user.role !== 'admin' && (
                                  <IconButton
                                    icon={<DeleteIcon />}
                                    colorScheme="red"
                                    size="sm"
                                    onClick={() => handleDeleteClick(user)}
                                    aria-label="Delete"
                                  />
                                )}
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete User
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete user <strong>{selectedUser?.name}</strong>?
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

export default AdminDashboard
