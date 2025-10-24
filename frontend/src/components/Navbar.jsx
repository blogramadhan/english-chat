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
import LoomaLogo from './LoomaLogo'
import { getAvatarUrl } from '../utils/avatar'

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
        <HStack
          spacing={3}
          cursor="pointer"
          onClick={() => navigate(`/${user?.role}/dashboard`)}
        >
          <LoomaLogo size={50} />
          <VStack align="start" spacing={0}>
            <Heading size="md" color="brand.600" lineHeight="1.2">
              LOOMA
            </Heading>
            <Text fontSize="xs" color="gray.500" fontWeight="medium">
              Learning Online Platform
            </Text>
          </VStack>
        </HStack>

        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="ghost">
            <HStack spacing={2}>
              <Avatar size="sm" name={user?.name} src={getAvatarUrl(user?.avatar)} />
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
            <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  )
}

export default Navbar
