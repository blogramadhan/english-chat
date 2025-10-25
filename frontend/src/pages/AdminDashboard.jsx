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
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
} from '@chakra-ui/react'
import { CheckIcon, CloseIcon, DeleteIcon, EditIcon, SearchIcon } from '@chakra-ui/icons'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import EditUserModal from '../components/EditUserModal'
import { useRef } from 'react'

const AdminDashboard = () => {
  const [stats, setStats] = useState({})
  const [pendingUsers, setPendingUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [searchPending, setSearchPending] = useState('')
  const [searchAll, setSearchAll] = useState('')
  const [currentPendingPage, setCurrentPendingPage] = useState(1)
  const [currentAllUsersPage, setCurrentAllUsersPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userToEdit, setUserToEdit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const usersPerPage = 10
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const cancelRef = useRef()
  const toast = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPendingPage(1)
  }, [searchPending])

  useEffect(() => {
    setCurrentAllUsersPage(1)
  }, [searchAll])

  const fetchData = async () => {
    try {
      console.log('AdminDashboard: Starting to fetch data...')
      setLoading(true)
      setError(null)

      const [statsRes, pendingRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users/pending'),
        api.get('/admin/users')
      ])

      console.log('AdminDashboard: Data fetched successfully', {
        stats: statsRes.data,
        pendingUsers: pendingRes.data?.length || 0,
        allUsers: usersRes.data?.length || 0
      })

      setStats(statsRes.data || {})
      setPendingUsers(pendingRes.data || [])
      setAllUsers(usersRes.data || [])
    } catch (error) {
      console.error('AdminDashboard: Error fetching data:', error)
      console.error('AdminDashboard: Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      setError(error.response?.data?.message || 'Failed to load data')
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal memuat data',
        status: 'error',
        duration: 5000,
      })
    } finally {
      console.log('AdminDashboard: Setting loading to false')
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

  const handleEditClick = (user) => {
    setUserToEdit(user)
    onEditOpen()
  }

  const handleUserUpdated = (updatedUser) => {
    // Update user in both lists
    setPendingUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u))
    setAllUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u))

    // Refresh data to get accurate stats
    fetchData()
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
      <Badge colorScheme={colors[status]} fontSize="xs">
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
      <Badge colorScheme={colors[role]} fontSize="xs">
        {role.toUpperCase()}
      </Badge>
    )
  }

  // Show loading state
  if (loading) {
    console.log('AdminDashboard: Rendering loading state')
    return (
      <Box minH="100vh" bg="gray.50">
        <Navbar />
        <Container maxW="container.xl" py={6}>
          <Center py={20}>
            <VStack spacing={4}>
              <Spinner size="xl" color="brand.500" thickness="4px" />
              <Text color="gray.600">Loading dashboard data...</Text>
            </VStack>
          </Center>
        </Container>
      </Box>
    )
  }

  // Show error state
  if (error) {
    console.log('AdminDashboard: Rendering error state', error)
    return (
      <Box minH="100vh" bg="gray.50">
        <Navbar />
        <Container maxW="container.xl" py={6}>
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            minH="200px"
            borderRadius="md"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Failed to Load Dashboard
            </AlertTitle>
            <AlertDescription maxW="sm" mb={4}>
              {error}
            </AlertDescription>
            <Button colorScheme="brand" onClick={fetchData}>
              Retry
            </Button>
          </Alert>
        </Container>
      </Box>
    )
  }

  console.log('AdminDashboard: Rendering main dashboard', {
    loading,
    error,
    statsLoaded: !!stats,
    pendingUsersCount: pendingUsers.length,
    allUsersCount: allUsers.length
  })

  // Filter pending users berdasarkan search query
  const filteredPendingUsers = pendingUsers.filter((user) => {
    if (!user) return false
    const query = searchPending.toLowerCase()
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      (user.nim && user.nim.toLowerCase().includes(query)) ||
      (user.nip && user.nip.toLowerCase().includes(query)) ||
      user.role?.toLowerCase().includes(query)
    )
  })

  // Pagination for pending users
  const indexOfLastPendingUser = currentPendingPage * usersPerPage
  const indexOfFirstPendingUser = indexOfLastPendingUser - usersPerPage
  const currentPendingUsers = filteredPendingUsers.slice(indexOfFirstPendingUser, indexOfLastPendingUser)
  const totalPendingPages = Math.max(1, Math.ceil(filteredPendingUsers.length / usersPerPage))

  // Filter all users berdasarkan search query
  const filteredAllUsers = allUsers.filter((user) => {
    if (!user) return false
    const query = searchAll.toLowerCase()
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      (user.nim && user.nim.toLowerCase().includes(query)) ||
      (user.nip && user.nip.toLowerCase().includes(query)) ||
      user.role?.toLowerCase().includes(query) ||
      user.status?.toLowerCase().includes(query)
    )
  })

  // Pagination for all users
  const indexOfLastAllUser = currentAllUsersPage * usersPerPage
  const indexOfFirstAllUser = indexOfLastAllUser - usersPerPage
  const currentAllUsers = filteredAllUsers.slice(indexOfFirstAllUser, indexOfLastAllUser)
  const totalAllUsersPages = Math.max(1, Math.ceil(filteredAllUsers.length / usersPerPage))

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.xl" py={6}>
        <VStack spacing={5} align="stretch">
          <Heading size="md">Admin Dashboard</Heading>

          {/* Statistics */}
          <Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap={3}>
            <Card size="sm">
              <CardBody py={3}>
                <Stat>
                  <StatLabel fontSize="xs">Total Users</StatLabel>
                  <StatNumber fontSize="2xl">{stats.totalUsers || 0}</StatNumber>
                  <StatHelpText fontSize="xs" mb={0}>Lecturers & Students</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card size="sm">
              <CardBody py={3}>
                <Stat>
                  <StatLabel fontSize="xs">Pending Approval</StatLabel>
                  <StatNumber fontSize="2xl" color="yellow.500">{stats.pendingUsers || 0}</StatNumber>
                  <StatHelpText fontSize="xs" mb={0}>Waiting approval</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card size="sm">
              <CardBody py={3}>
                <Stat>
                  <StatLabel fontSize="xs">Approved Users</StatLabel>
                  <StatNumber fontSize="2xl" color="green.500">{stats.approvedUsers || 0}</StatNumber>
                  <StatHelpText fontSize="xs" mb={0}>Active users</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card size="sm">
              <CardBody py={3}>
                <Stat>
                  <StatLabel fontSize="xs">Total Lecturers</StatLabel>
                  <StatNumber fontSize="2xl" color="blue.500">{stats.totalDosen || 0}</StatNumber>
                  <StatHelpText fontSize="xs" mb={0}>Active lecturers</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card size="sm">
              <CardBody py={3}>
                <Stat>
                  <StatLabel fontSize="xs">Total Students</StatLabel>
                  <StatNumber fontSize="2xl" color="cyan.500">{stats.totalMahasiswa || 0}</StatNumber>
                  <StatHelpText fontSize="xs" mb={0}>Active students</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </Grid>

          {/* Tabs */}
          <Tabs colorScheme="brand" size="sm">
            <TabList>
              <Tab fontSize="sm">Pending Approval ({pendingUsers.length})</Tab>
              <Tab fontSize="sm">All Users ({allUsers.length})</Tab>
            </TabList>

            <TabPanels>
              {/* Pending Users Tab */}
              <TabPanel px={0}>
                <Card size="sm">
                  <CardHeader pb={2}>
                    <VStack align="stretch" spacing={3}>
                      <Heading size="sm">Pending Users</Heading>
                      <InputGroup size="sm">
                        <InputLeftElement pointerEvents="none">
                          <SearchIcon color="gray.300" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search by name, email, NIM/NIP, or role..."
                          value={searchPending}
                          onChange={(e) => setSearchPending(e.target.value)}
                        />
                      </InputGroup>
                    </VStack>
                  </CardHeader>
                  <CardBody pt={2}>
                    {pendingUsers.length === 0 ? (
                      <Text color="gray.500" fontSize="sm" py={4}>No users waiting for approval</Text>
                    ) : filteredPendingUsers.length === 0 ? (
                      <Text color="gray.500" fontSize="sm" py={4}>No users found matching your search</Text>
                    ) : (
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th fontSize="xs" py={2}>Name</Th>
                            <Th fontSize="xs" py={2}>Email</Th>
                            <Th fontSize="xs" py={2}>Role</Th>
                            <Th fontSize="xs" py={2}>NIM/NIP</Th>
                            <Th fontSize="xs" py={2}>Registered</Th>
                            <Th fontSize="xs" py={2}>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {currentPendingUsers.map((user) => (
                            <Tr key={user._id}>
                              <Td fontSize="sm" py={2}>{user.name}</Td>
                              <Td fontSize="sm" py={2}>{user.email}</Td>
                              <Td py={2}>{getRoleBadge(user.role)}</Td>
                              <Td fontSize="sm" py={2}>{user.nim || user.nip || '-'}</Td>
                              <Td fontSize="sm" py={2}>
                                {new Date(user.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </Td>
                              <Td py={2}>
                                <HStack spacing={1}>
                                  <IconButton
                                    icon={<CheckIcon />}
                                    colorScheme="green"
                                    size="xs"
                                    onClick={() => handleApprove(user._id)}
                                    aria-label="Approve"
                                  />
                                  <IconButton
                                    icon={<CloseIcon />}
                                    colorScheme="red"
                                    size="xs"
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

                    {/* Pagination for Pending Users */}
                    {filteredPendingUsers.length > usersPerPage && (
                      <Flex justify="space-between" align="center" mt={4} pt={3} borderTop="1px" borderColor="gray.200">
                        <Text fontSize="sm" color="gray.600">
                          Showing {indexOfFirstPendingUser + 1} to {Math.min(indexOfLastPendingUser, filteredPendingUsers.length)} of {filteredPendingUsers.length} users
                        </Text>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            onClick={() => setCurrentPendingPage(prev => Math.max(prev - 1, 1))}
                            isDisabled={currentPendingPage === 1}
                          >
                            Previous
                          </Button>
                          <Text fontSize="sm" px={2}>
                            Page {currentPendingPage} of {totalPendingPages}
                          </Text>
                          <Button
                            size="sm"
                            onClick={() => setCurrentPendingPage(prev => Math.min(prev + 1, totalPendingPages))}
                            isDisabled={currentPendingPage === totalPendingPages}
                          >
                            Next
                          </Button>
                        </HStack>
                      </Flex>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>

              {/* All Users Tab */}
              <TabPanel px={0}>
                <Card size="sm">
                  <CardHeader pb={2}>
                    <VStack align="stretch" spacing={3}>
                      <Heading size="sm">All Users</Heading>
                      <InputGroup size="sm">
                        <InputLeftElement pointerEvents="none">
                          <SearchIcon color="gray.300" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search by name, email, NIM/NIP, role, or status..."
                          value={searchAll}
                          onChange={(e) => setSearchAll(e.target.value)}
                        />
                      </InputGroup>
                    </VStack>
                  </CardHeader>
                  <CardBody pt={2}>
                    {filteredAllUsers.length === 0 ? (
                      <Text color="gray.500" fontSize="sm" py={4}>
                        {allUsers.length === 0 ? 'No users found' : 'No users found matching your search'}
                      </Text>
                    ) : (
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th fontSize="xs" py={2}>Name</Th>
                            <Th fontSize="xs" py={2}>Email</Th>
                            <Th fontSize="xs" py={2}>Role</Th>
                            <Th fontSize="xs" py={2}>Status</Th>
                            <Th fontSize="xs" py={2}>NIM/NIP</Th>
                            <Th fontSize="xs" py={2}>Registered</Th>
                            <Th fontSize="xs" py={2}>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {currentAllUsers.map((user) => (
                          <Tr key={user._id}>
                            <Td fontSize="sm" py={2}>{user.name}</Td>
                            <Td fontSize="sm" py={2}>{user.email}</Td>
                            <Td py={2}>{getRoleBadge(user.role)}</Td>
                            <Td py={2}>{getStatusBadge(user.status)}</Td>
                            <Td fontSize="sm" py={2}>{user.nim || user.nip || '-'}</Td>
                            <Td fontSize="sm" py={2}>
                              {new Date(user.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </Td>
                            <Td py={2}>
                              <HStack spacing={1}>
                                {user.status === 'pending' && (
                                  <>
                                    <IconButton
                                      icon={<CheckIcon />}
                                      colorScheme="green"
                                      size="xs"
                                      onClick={() => handleApprove(user._id)}
                                      aria-label="Approve"
                                    />
                                    <IconButton
                                      icon={<CloseIcon />}
                                      colorScheme="orange"
                                      size="xs"
                                      onClick={() => handleReject(user._id)}
                                      aria-label="Reject"
                                    />
                                  </>
                                )}
                                {user.role !== 'admin' && (
                                  <>
                                    <IconButton
                                      icon={<EditIcon />}
                                      colorScheme="blue"
                                      size="xs"
                                      onClick={() => handleEditClick(user)}
                                      aria-label="Edit"
                                    />
                                    <IconButton
                                      icon={<DeleteIcon />}
                                      colorScheme="red"
                                      size="xs"
                                      onClick={() => handleDeleteClick(user)}
                                      aria-label="Delete"
                                    />
                                  </>
                                )}
                              </HStack>
                            </Td>
                          </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    )}

                    {/* Pagination for All Users */}
                    {filteredAllUsers.length > usersPerPage && (
                      <Flex justify="space-between" align="center" mt={4} pt={3} borderTop="1px" borderColor="gray.200">
                        <Text fontSize="sm" color="gray.600">
                          Showing {indexOfFirstAllUser + 1} to {Math.min(indexOfLastAllUser, filteredAllUsers.length)} of {filteredAllUsers.length} users
                        </Text>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            onClick={() => setCurrentAllUsersPage(prev => Math.max(prev - 1, 1))}
                            isDisabled={currentAllUsersPage === 1}
                          >
                            Previous
                          </Button>
                          <Text fontSize="sm" px={2}>
                            Page {currentAllUsersPage} of {totalAllUsersPages}
                          </Text>
                          <Button
                            size="sm"
                            onClick={() => setCurrentAllUsersPage(prev => Math.min(prev + 1, totalAllUsersPages))}
                            isDisabled={currentAllUsersPage === totalAllUsersPages}
                          >
                            Next
                          </Button>
                        </HStack>
                      </Flex>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        user={userToEdit}
        onUserUpdated={handleUserUpdated}
      />

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
