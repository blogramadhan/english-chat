import {
  Box,
  Flex,
  Button,
  Heading,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
  HStack,
  VStack,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box bg="white" px={4} boxShadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Heading
          size="md"
          color="brand.600"
          cursor="pointer"
          onClick={() => navigate(`/${user?.role}/dashboard`)}
        >
          Online Discussion
        </Heading>

        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="ghost">
            <HStack spacing={2}>
              <Avatar size="sm" name={user?.name} />
              <Text>{user?.name}</Text>
            </HStack>
          </MenuButton>
          <MenuList>
            <MenuItem>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold">{user?.name}</Text>
                <Text fontSize="sm" color="gray.500">{user?.email}</Text>
                <Text fontSize="xs" color="gray.400">
                  {user?.role === 'dosen' ? 'Dosen' : 'Mahasiswa'}
                </Text>
              </VStack>
            </MenuItem>
            <MenuDivider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  )
}

export default Navbar
