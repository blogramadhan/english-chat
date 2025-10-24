import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  HStack,
  Flex,
  useToast,
  useDisclosure,
  Card,
  CardBody,
  Text,
  Badge,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { AddIcon, EditIcon, DownloadIcon, DeleteIcon } from '@chakra-ui/icons'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import CreateGroupModal from '../components/CreateGroupModal'
import CreateDiscussionModal from '../components/CreateDiscussionModal'
import CreateCategoryModal from '../components/CreateCategoryModal'
import EditGroupModal from '../components/EditGroupModal'
import EditDiscussionModal from '../components/EditDiscussionModal'
import EditCategoryModal from '../components/EditCategoryModal'
import ExportPDFModal from '../components/ExportPDFModal'
import Navbar from '../components/Navbar'

const DosenDashboard = () => {
  const [groups, setGroups] = useState([])
  const [discussions, setDiscussions] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedDiscussion, setSelectedDiscussion] = useState(null)
  const [selectedDiscussionForPDF, setSelectedDiscussionForPDF] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [groupToDelete, setGroupToDelete] = useState(null)
  const [discussionToDelete, setDiscussionToDelete] = useState(null)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletingDiscussion, setIsDeletingDiscussion] = useState(false)
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)
  const [currentActiveGroupPage, setCurrentActiveGroupPage] = useState(1)
  const [currentInactiveGroupPage, setCurrentInactiveGroupPage] = useState(1)
  const [currentActiveDiscussionPage, setCurrentActiveDiscussionPage] = useState(1)
  const [currentInactiveDiscussionPage, setCurrentInactiveDiscussionPage] = useState(1)
  const [currentActiveCategoryPage, setCurrentActiveCategoryPage] = useState(1)
  const [currentInactiveCategoryPage, setCurrentInactiveCategoryPage] = useState(1)
  const groupsPerPage = 6
  const discussionsPerPage = 6
  const categoriesPerPage = 6
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const cancelRef = useRef()
  const cancelDiscussionRef = useRef()
  const cancelCategoryRef = useRef()
  const { isOpen: isGroupOpen, onOpen: onGroupOpen, onClose: onGroupClose } = useDisclosure()
  const { isOpen: isDiscussionOpen, onOpen: onDiscussionOpen, onClose: onDiscussionClose } = useDisclosure()
  const { isOpen: isCategoryOpen, onOpen: onCategoryOpen, onClose: onCategoryClose } = useDisclosure()
  const { isOpen: isEditGroupOpen, onOpen: onEditGroupOpen, onClose: onEditGroupClose } = useDisclosure()
  const { isOpen: isEditDiscussionOpen, onOpen: onEditDiscussionOpen, onClose: onEditDiscussionClose } = useDisclosure()
  const { isOpen: isEditCategoryOpen, onOpen: onEditCategoryOpen, onClose: onEditCategoryClose } = useDisclosure()
  const { isOpen: isExportPDFOpen, onOpen: onExportPDFOpen, onClose: onExportPDFClose } = useDisclosure()
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure()
  const { isOpen: isDeleteDiscussionAlertOpen, onOpen: onDeleteDiscussionAlertOpen, onClose: onDeleteDiscussionAlertClose } = useDisclosure()
  const { isOpen: isDeleteCategoryAlertOpen, onOpen: onDeleteCategoryAlertOpen, onClose: onDeleteCategoryAlertClose } = useDisclosure()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [groupsRes, discussionsRes, categoriesRes] = await Promise.all([
        api.get('/groups'),
        api.get('/discussions'),
        api.get('/categories')
      ])
      setGroups(groupsRes.data)
      setDiscussions(discussionsRes.data)
      setCategories(categoriesRes.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
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

  const handleEditGroup = (group) => {
    setSelectedGroup(group)
    onEditGroupOpen()
  }

  const handleGroupUpdated = () => {
    fetchData()
    onEditGroupClose()
  }

  const handleEditDiscussion = (e, discussion) => {
    e.stopPropagation() // Prevent card click
    setSelectedDiscussion(discussion)
    onEditDiscussionOpen()
  }

  const handleDiscussionUpdated = () => {
    fetchData()
    onEditDiscussionClose()
  }

  const handleDownloadPDF = (e, discussion) => {
    e.stopPropagation() // Prevent card click
    setSelectedDiscussionForPDF(discussion)
    onExportPDFOpen()
  }

  const handleDeleteGroup = (e, group) => {
    e.stopPropagation() // Prevent card click
    console.log('🗑️ Delete group requested:', { id: group._id, name: group.name })
    setGroupToDelete(group)
    onDeleteAlertOpen()
  }

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return

    setIsDeleting(true)
    console.log('🗑️ Deleting group:', groupToDelete._id)

    try {
      await api.delete(`/groups/${groupToDelete._id}`)

      console.log('✅ Group deleted successfully')

      toast({
        title: 'Group deleted successfully',
        description: `${groupToDelete.name} has been removed. Students in this group are not affected.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      fetchData() // Refresh data
      onDeleteAlertClose()
      setGroupToDelete(null)
    } catch (error) {
      console.error('❌ Failed to delete group:', error.response?.data || error.message)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete group',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    console.log('❌ Delete cancelled')
    setGroupToDelete(null)
    onDeleteAlertClose()
  }

  const handleDeleteDiscussion = (e, discussion) => {
    e.stopPropagation() // Prevent card click
    console.log('🗑️ Delete discussion requested:', { id: discussion._id, title: discussion.title })
    setDiscussionToDelete(discussion)
    onDeleteDiscussionAlertOpen()
  }

  const confirmDeleteDiscussion = async () => {
    if (!discussionToDelete) return

    setIsDeletingDiscussion(true)
    console.log('🗑️ Deleting discussion:', discussionToDelete._id)

    try {
      await api.delete(`/discussions/${discussionToDelete._id}`)

      console.log('✅ Discussion deleted successfully')

      toast({
        title: 'Discussion deleted successfully',
        description: `${discussionToDelete.title} has been removed.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      fetchData() // Refresh data
      onDeleteDiscussionAlertClose()
      setDiscussionToDelete(null)
    } catch (error) {
      console.error('❌ Failed to delete discussion:', error.response?.data || error.message)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete discussion',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsDeletingDiscussion(false)
    }
  }

  const handleCancelDeleteDiscussion = () => {
    console.log('❌ Delete discussion cancelled')
    setDiscussionToDelete(null)
    onDeleteDiscussionAlertClose()
  }

  const handleCategoryCreated = () => {
    fetchData()
  }

  const handleCategoryUpdated = () => {
    fetchData()
  }

  const handleEditCategory = (category) => {
    setSelectedCategory(category)
    onEditCategoryOpen()
  }

  const handleDeleteCategory = (e, category) => {
    e.stopPropagation()
    console.log('🗑️ Delete category requested:', { id: category._id, name: category.name })
    setCategoryToDelete(category)
    onDeleteCategoryAlertOpen()
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return

    setIsDeletingCategory(true)
    console.log('🗑️ Deleting category:', categoryToDelete._id)

    try {
      await api.delete(`/categories/${categoryToDelete._id}`)

      console.log('✅ Category deleted successfully')

      toast({
        title: 'Category deleted successfully',
        description: `${categoryToDelete.name} has been removed.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      fetchData()
      onDeleteCategoryAlertClose()
      setCategoryToDelete(null)
    } catch (error) {
      console.error('❌ Failed to delete category:', error.response?.data || error.message)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete category',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsDeletingCategory(false)
    }
  }

  const handleCancelDeleteCategory = () => {
    console.log('❌ Delete category cancelled')
    setCategoryToDelete(null)
    onDeleteCategoryAlertClose()
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading size="lg">Lecturer Dashboard</Heading>

          <Tabs colorScheme="brand" variant="enclosed">
            <TabList>
              <Tab>Groups</Tab>
              <Tab>Categories</Tab>
              <Tab>Discussions</Tab>
            </TabList>

            <TabPanels>
              {/* Groups Tab Panel */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  <Flex justify="flex-end">
                    <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={onGroupOpen}>
                      Create Group
                    </Button>
                  </Flex>

                  {/* Active Groups */}
                  <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Active Groups</Heading>
              <Text fontSize="sm" color="gray.600">
                {groups.filter(group => group.isActive).length} groups
              </Text>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={4}>
              {groups
                .filter(group => group.isActive)
                .slice((currentActiveGroupPage - 1) * groupsPerPage, currentActiveGroupPage * groupsPerPage)
                .map((group) => (
                  <Card key={group._id} _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s">
                    <CardBody>
                      <Flex justify="space-between" align="start" mb={2}>
                        <Box flex={1}>
                          <Heading size="sm" mb={1}>{group.name}</Heading>
                          <Badge colorScheme="green" fontSize="xs">Active</Badge>
                        </Box>
                        <HStack spacing={0}>
                          <IconButton
                            icon={<EditIcon />}
                            size="xs"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleEditGroup(group)}
                            aria-label="Edit group"
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={(e) => handleDeleteGroup(e, group)}
                            aria-label="Delete group"
                          />
                        </HStack>
                      </Flex>
                      <Text fontSize="xs" color="gray.600" noOfLines={2} mb={2}>
                        {group.description || 'No description'}
                      </Text>
                      <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                        {group.members?.length || 0} Students
                      </Text>
                    </CardBody>
                  </Card>
                ))}
            </SimpleGrid>

            {groups.filter(group => group.isActive).length === 0 && (
              <Text color="gray.500" textAlign="center" py={8}>No active groups</Text>
            )}

            {/* Pagination for Active Groups */}
            {groups.filter(group => group.isActive).length > groupsPerPage && (
              <Flex justify="center" align="center" gap={2} mt={4}>
                <Button
                  size="sm"
                  onClick={() => setCurrentActiveGroupPage(prev => Math.max(prev - 1, 1))}
                  isDisabled={currentActiveGroupPage === 1}
                >
                  Previous
                </Button>
                <Text fontSize="sm">
                  Page {currentActiveGroupPage} of {Math.ceil(groups.filter(group => group.isActive).length / groupsPerPage)}
                </Text>
                <Button
                  size="sm"
                  onClick={() => setCurrentActiveGroupPage(prev => prev + 1)}
                  isDisabled={currentActiveGroupPage >= Math.ceil(groups.filter(group => group.isActive).length / groupsPerPage)}
                >
                  Next
                </Button>
              </Flex>
            )}
          </Box>

          {/* Inactive Groups */}
          <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Inactive Groups</Heading>
              <Text fontSize="sm" color="gray.600">
                {groups.filter(group => !group.isActive).length} groups
              </Text>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={4}>
              {groups
                .filter(group => !group.isActive)
                .slice((currentInactiveGroupPage - 1) * groupsPerPage, currentInactiveGroupPage * groupsPerPage)
                .map((group) => (
                  <Card key={group._id} _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s" opacity={0.7}>
                    <CardBody>
                      <Flex justify="space-between" align="start" mb={2}>
                        <Box flex={1}>
                          <Heading size="sm" mb={1}>{group.name}</Heading>
                          <Badge colorScheme="red" fontSize="xs">Inactive</Badge>
                        </Box>
                        <HStack spacing={0}>
                          <IconButton
                            icon={<EditIcon />}
                            size="xs"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleEditGroup(group)}
                            aria-label="Edit group"
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={(e) => handleDeleteGroup(e, group)}
                            aria-label="Delete group"
                          />
                        </HStack>
                      </Flex>
                      <Text fontSize="xs" color="gray.600" noOfLines={2} mb={2}>
                        {group.description || 'No description'}
                      </Text>
                      <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                        {group.members?.length || 0} Students
                      </Text>
                    </CardBody>
                  </Card>
                ))}
            </SimpleGrid>

            {groups.filter(group => !group.isActive).length === 0 && (
              <Text color="gray.500" textAlign="center" py={8}>No inactive groups</Text>
            )}

            {/* Pagination for Inactive Groups */}
            {groups.filter(group => !group.isActive).length > groupsPerPage && (
              <Flex justify="center" align="center" gap={2} mt={4}>
                <Button
                  size="sm"
                  onClick={() => setCurrentInactiveGroupPage(prev => Math.max(prev - 1, 1))}
                  isDisabled={currentInactiveGroupPage === 1}
                >
                  Previous
                </Button>
                <Text fontSize="sm">
                  Page {currentInactiveGroupPage} of {Math.ceil(groups.filter(group => !group.isActive).length / groupsPerPage)}
                </Text>
                <Button
                  size="sm"
                  onClick={() => setCurrentInactiveGroupPage(prev => prev + 1)}
                  isDisabled={currentInactiveGroupPage >= Math.ceil(groups.filter(group => !group.isActive).length / groupsPerPage)}
                >
                  Next
                </Button>
              </Flex>
            )}
          </Box>
                </VStack>
              </TabPanel>

              {/* Categories Tab Panel */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  <Flex justify="flex-end">
                    <Button leftIcon={<AddIcon />} colorScheme="purple" onClick={onCategoryOpen}>
                      Create Category
                    </Button>
                  </Flex>

                  {/* Active Categories */}
                  <Box>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading size="md">Active Categories</Heading>
                      <Text fontSize="sm" color="gray.600">
                        {categories.filter(category => category.isActive).length} categories
                      </Text>
                    </Flex>

                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={4}>
                      {categories
                        .filter(category => category.isActive)
                        .slice((currentActiveCategoryPage - 1) * categoriesPerPage, currentActiveCategoryPage * categoriesPerPage)
                        .map((category) => (
                          <Card key={category._id} _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s">
                            <CardBody>
                              <Flex justify="space-between" align="start" mb={2}>
                                <Box flex={1}>
                                  <Heading size="sm" mb={1}>{category.name}</Heading>
                                  <Badge colorScheme="purple" fontSize="xs">Active</Badge>
                                </Box>
                                <HStack spacing={0}>
                                  <IconButton
                                    icon={<EditIcon />}
                                    size="xs"
                                    colorScheme="blue"
                                    variant="ghost"
                                    onClick={() => handleEditCategory(category)}
                                    aria-label="Edit category"
                                  />
                                  <IconButton
                                    icon={<DeleteIcon />}
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={(e) => handleDeleteCategory(e, category)}
                                    aria-label="Delete category"
                                  />
                                </HStack>
                              </Flex>
                              <Text fontSize="xs" color="gray.600" noOfLines={2}>
                                {category.description || 'No description'}
                              </Text>
                            </CardBody>
                          </Card>
                        ))}
                    </SimpleGrid>

                    {categories.filter(category => category.isActive).length === 0 && (
                      <Text color="gray.500" textAlign="center" py={8}>No active categories</Text>
                    )}

                    {/* Pagination for Active Categories */}
                    {categories.filter(category => category.isActive).length > categoriesPerPage && (
                      <Flex justify="center" align="center" gap={2} mt={4}>
                        <Button
                          size="sm"
                          onClick={() => setCurrentActiveCategoryPage(prev => Math.max(prev - 1, 1))}
                          isDisabled={currentActiveCategoryPage === 1}
                        >
                          Previous
                        </Button>
                        <Text fontSize="sm">
                          Page {currentActiveCategoryPage} of {Math.ceil(categories.filter(category => category.isActive).length / categoriesPerPage)}
                        </Text>
                        <Button
                          size="sm"
                          onClick={() => setCurrentActiveCategoryPage(prev => prev + 1)}
                          isDisabled={currentActiveCategoryPage >= Math.ceil(categories.filter(category => category.isActive).length / categoriesPerPage)}
                        >
                          Next
                        </Button>
                      </Flex>
                    )}
                  </Box>

                  {/* Inactive Categories */}
                  <Box>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading size="md">Inactive Categories</Heading>
                      <Text fontSize="sm" color="gray.600">
                        {categories.filter(category => !category.isActive).length} categories
                      </Text>
                    </Flex>

                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={4}>
                      {categories
                        .filter(category => !category.isActive)
                        .slice((currentInactiveCategoryPage - 1) * categoriesPerPage, currentInactiveCategoryPage * categoriesPerPage)
                        .map((category) => (
                          <Card key={category._id} _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s" opacity={0.7}>
                            <CardBody>
                              <Flex justify="space-between" align="start" mb={2}>
                                <Box flex={1}>
                                  <Heading size="sm" mb={1}>{category.name}</Heading>
                                  <Badge colorScheme="red" fontSize="xs">Inactive</Badge>
                                </Box>
                                <HStack spacing={0}>
                                  <IconButton
                                    icon={<EditIcon />}
                                    size="xs"
                                    colorScheme="blue"
                                    variant="ghost"
                                    onClick={() => handleEditCategory(category)}
                                    aria-label="Edit category"
                                  />
                                  <IconButton
                                    icon={<DeleteIcon />}
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={(e) => handleDeleteCategory(e, category)}
                                    aria-label="Delete category"
                                  />
                                </HStack>
                              </Flex>
                              <Text fontSize="xs" color="gray.600" noOfLines={2}>
                                {category.description || 'No description'}
                              </Text>
                            </CardBody>
                          </Card>
                        ))}
                    </SimpleGrid>

                    {categories.filter(category => !category.isActive).length === 0 && (
                      <Text color="gray.500" textAlign="center" py={8}>No inactive categories</Text>
                    )}

                    {/* Pagination for Inactive Categories */}
                    {categories.filter(category => !category.isActive).length > categoriesPerPage && (
                      <Flex justify="center" align="center" gap={2} mt={4}>
                        <Button
                          size="sm"
                          onClick={() => setCurrentInactiveCategoryPage(prev => Math.max(prev - 1, 1))}
                          isDisabled={currentInactiveCategoryPage === 1}
                        >
                          Previous
                        </Button>
                        <Text fontSize="sm">
                          Page {currentInactiveCategoryPage} of {Math.ceil(categories.filter(category => !category.isActive).length / categoriesPerPage)}
                        </Text>
                        <Button
                          size="sm"
                          onClick={() => setCurrentInactiveCategoryPage(prev => prev + 1)}
                          isDisabled={currentInactiveCategoryPage >= Math.ceil(categories.filter(category => !category.isActive).length / categoriesPerPage)}
                        >
                          Next
                        </Button>
                      </Flex>
                    )}
                  </Box>
                </VStack>
              </TabPanel>

              {/* Discussions Tab Panel */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  <Flex justify="flex-end">
                    <Button leftIcon={<AddIcon />} colorScheme="green" onClick={onDiscussionOpen}>
                      Create Discussion
                    </Button>
                  </Flex>

                  {/* Active Discussions */}
                  <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Active Discussions</Heading>
              <Text fontSize="sm" color="gray.600">
                {discussions.filter(discussion => discussion.isActive).length} discussions
              </Text>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={4}>
              {discussions
                .filter(discussion => discussion.isActive)
                .sort((a, b) => a.title.localeCompare(b.title))
                .slice((currentActiveDiscussionPage - 1) * discussionsPerPage, currentActiveDiscussionPage * discussionsPerPage)
                .map((discussion) => (
                  <Card
                    key={discussion._id}
                    cursor="pointer"
                    _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                    onClick={() => navigate(`/discussion/${discussion._id}`)}
                  >
                    <CardBody>
                      <Flex justify="space-between" align="start" mb={2}>
                        <Box flex={1}>
                          <Heading size="sm" mb={1} noOfLines={1}>{discussion.title}</Heading>
                          <Badge colorScheme="green" fontSize="xs">Active</Badge>
                        </Box>
                        <HStack spacing={0}>
                          <IconButton
                            icon={<DownloadIcon />}
                            size="xs"
                            colorScheme="green"
                            variant="ghost"
                            onClick={(e) => handleDownloadPDF(e, discussion)}
                            aria-label="Download PDF"
                            title="Download PDF"
                          />
                          <IconButton
                            icon={<EditIcon />}
                            size="xs"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={(e) => handleEditDiscussion(e, discussion)}
                            aria-label="Edit discussion"
                            title="Edit Discussion"
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={(e) => handleDeleteDiscussion(e, discussion)}
                            aria-label="Delete discussion"
                            title="Delete Discussion"
                          />
                        </HStack>
                      </Flex>
                      <Text fontSize="xs" color="gray.600" noOfLines={2} mb={2}>
                        {discussion.content}
                      </Text>
                      {discussion.category && (
                        <Badge colorScheme="purple" fontSize="xs" mb={1}>
                          {discussion.category.name}
                        </Badge>
                      )}
                      <Text fontSize="xs" color="gray.500" mb={1} noOfLines={1}>
                        {discussion.groups && discussion.groups.length > 0 ? (
                          <>Groups: {discussion.groups.map(g => g.name).join(', ')}</>
                        ) : (
                          <>Group: {discussion.group?.name}</>
                        )}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(discussion.createdAt).toLocaleDateString('en-US')}
                      </Text>
                    </CardBody>
                  </Card>
                ))}
            </SimpleGrid>

            {discussions.filter(discussion => discussion.isActive).length === 0 && (
              <Text color="gray.500" textAlign="center" py={8}>No active discussions</Text>
            )}

            {/* Pagination for Active Discussions */}
            {discussions.filter(discussion => discussion.isActive).length > discussionsPerPage && (
              <Flex justify="center" align="center" gap={2} mt={4}>
                <Button
                  size="sm"
                  onClick={() => setCurrentActiveDiscussionPage(prev => Math.max(prev - 1, 1))}
                  isDisabled={currentActiveDiscussionPage === 1}
                >
                  Previous
                </Button>
                <Text fontSize="sm">
                  Page {currentActiveDiscussionPage} of {Math.ceil(discussions.filter(discussion => discussion.isActive).length / discussionsPerPage)}
                </Text>
                <Button
                  size="sm"
                  onClick={() => setCurrentActiveDiscussionPage(prev => prev + 1)}
                  isDisabled={currentActiveDiscussionPage >= Math.ceil(discussions.filter(discussion => discussion.isActive).length / discussionsPerPage)}
                >
                  Next
                </Button>
              </Flex>
            )}
          </Box>

          {/* Inactive Discussions */}
          <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Inactive Discussions</Heading>
              <Text fontSize="sm" color="gray.600">
                {discussions.filter(discussion => !discussion.isActive).length} discussions
              </Text>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={4}>
              {discussions
                .filter(discussion => !discussion.isActive)
                .slice((currentInactiveDiscussionPage - 1) * discussionsPerPage, currentInactiveDiscussionPage * discussionsPerPage)
                .map((discussion) => (
                  <Card
                    key={discussion._id}
                    cursor="pointer"
                    _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                    onClick={() => navigate(`/discussion/${discussion._id}`)}
                    opacity={0.7}
                  >
                    <CardBody>
                      <Flex justify="space-between" align="start" mb={2}>
                        <Box flex={1}>
                          <Heading size="sm" mb={1} noOfLines={1}>{discussion.title}</Heading>
                          <Badge colorScheme="red" fontSize="xs">Inactive</Badge>
                        </Box>
                        <HStack spacing={0}>
                          <IconButton
                            icon={<DownloadIcon />}
                            size="xs"
                            colorScheme="green"
                            variant="ghost"
                            onClick={(e) => handleDownloadPDF(e, discussion)}
                            aria-label="Download PDF"
                            title="Download PDF"
                          />
                          <IconButton
                            icon={<EditIcon />}
                            size="xs"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={(e) => handleEditDiscussion(e, discussion)}
                            aria-label="Edit discussion"
                            title="Edit Discussion"
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={(e) => handleDeleteDiscussion(e, discussion)}
                            aria-label="Delete discussion"
                            title="Delete Discussion"
                          />
                        </HStack>
                      </Flex>
                      <Text fontSize="xs" color="gray.600" noOfLines={2} mb={2}>
                        {discussion.content}
                      </Text>
                      {discussion.category && (
                        <Badge colorScheme="purple" fontSize="xs" mb={1}>
                          {discussion.category.name}
                        </Badge>
                      )}
                      <Text fontSize="xs" color="gray.500" mb={1} noOfLines={1}>
                        {discussion.groups && discussion.groups.length > 0 ? (
                          <>Groups: {discussion.groups.map(g => g.name).join(', ')}</>
                        ) : (
                          <>Group: {discussion.group?.name}</>
                        )}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(discussion.createdAt).toLocaleDateString('en-US')}
                      </Text>
                    </CardBody>
                  </Card>
                ))}
            </SimpleGrid>

            {discussions.filter(discussion => !discussion.isActive).length === 0 && (
              <Text color="gray.500" textAlign="center" py={8}>No inactive discussions</Text>
            )}

            {/* Pagination for Inactive Discussions */}
            {discussions.filter(discussion => !discussion.isActive).length > discussionsPerPage && (
              <Flex justify="center" align="center" gap={2} mt={4}>
                <Button
                  size="sm"
                  onClick={() => setCurrentInactiveDiscussionPage(prev => Math.max(prev - 1, 1))}
                  isDisabled={currentInactiveDiscussionPage === 1}
                >
                  Previous
                </Button>
                <Text fontSize="sm">
                  Page {currentInactiveDiscussionPage} of {Math.ceil(discussions.filter(discussion => !discussion.isActive).length / discussionsPerPage)}
                </Text>
                <Button
                  size="sm"
                  onClick={() => setCurrentInactiveDiscussionPage(prev => prev + 1)}
                  isDisabled={currentInactiveDiscussionPage >= Math.ceil(discussions.filter(discussion => !discussion.isActive).length / discussionsPerPage)}
                >
                  Next
                </Button>
              </Flex>
            )}
          </Box>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
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
        categories={categories}
      />

      <EditGroupModal
        isOpen={isEditGroupOpen}
        onClose={onEditGroupClose}
        onSuccess={handleGroupUpdated}
        group={selectedGroup}
      />

      <EditDiscussionModal
        isOpen={isEditDiscussionOpen}
        onClose={onEditDiscussionClose}
        onSuccess={handleDiscussionUpdated}
        discussion={selectedDiscussion}
        groups={groups}
        categories={categories}
      />

      <ExportPDFModal
        isOpen={isExportPDFOpen}
        onClose={onExportPDFClose}
        discussion={selectedDiscussionForPDF}
      />

      <CreateCategoryModal
        isOpen={isCategoryOpen}
        onClose={onCategoryClose}
        onCategoryCreated={handleCategoryCreated}
      />

      <EditCategoryModal
        isOpen={isEditCategoryOpen}
        onClose={onEditCategoryClose}
        category={selectedCategory}
        onCategoryUpdated={handleCategoryUpdated}
      />

      {/* Delete Group Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleCancelDelete}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Group
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete <strong>{groupToDelete?.name}</strong>?
              <Text mt={2} fontSize="sm" color="gray.600">
                This action cannot be undone. However, students in this group will not be affected.
                They will remain in the system.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDeleteGroup}
                ml={3}
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Delete Discussion Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDiscussionAlertOpen}
        leastDestructiveRef={cancelDiscussionRef}
        onClose={handleCancelDeleteDiscussion}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Discussion
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete <strong>{discussionToDelete?.title}</strong>?
              <Text mt={2} fontSize="sm" color="gray.600">
                This action cannot be undone. All messages in this discussion will also be removed.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelDiscussionRef} onClick={handleCancelDeleteDiscussion}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDeleteDiscussion}
                ml={3}
                isLoading={isDeletingDiscussion}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Delete Category Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteCategoryAlertOpen}
        leastDestructiveRef={cancelCategoryRef}
        onClose={handleCancelDeleteCategory}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Category
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete <strong>{categoryToDelete?.name}</strong>?
              <Text mt={2} fontSize="sm" color="gray.600">
                This action cannot be undone. Categories that are being used by discussions cannot be deleted.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelCategoryRef} onClick={handleCancelDeleteCategory}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDeleteCategory}
                ml={3}
                isLoading={isDeletingCategory}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

export default DosenDashboard
