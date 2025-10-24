import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Avatar,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Divider,
  IconButton,
  InputGroup,
  InputRightElement,
  Checkbox,
  Stack,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { getAvatarUrl } from '../utils/avatar';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturers, setSelectedLecturers] = useState([]);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    nim: '',
    nip: '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Show password states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        nim: user.nim || '',
        nip: user.nip || '',
      });

      // Load lecturers if user is mahasiswa
      if (user.role === 'mahasiswa') {
        fetchLecturers();
        fetchUserLecturers();
      }
    }
  }, [user]);

  const fetchLecturers = async () => {
    try {
      const response = await api.get('/users/lecturers');
      setLecturers(response.data);
    } catch (error) {
      console.error('Failed to fetch lecturers:', error);
    }
  };

  const fetchUserLecturers = async () => {
    try {
      const response = await api.get('/users/me');
      if (response.data.lecturers && response.data.lecturers.length > 0) {
        setSelectedLecturers(response.data.lecturers);
      } else if (response.data.lecturer) {
        setSelectedLecturers([response.data.lecturer]);
      }
    } catch (error) {
      console.error('Failed to fetch user lecturers:', error);
    }
  };

  const handleLecturerToggle = (lecturerId) => {
    setSelectedLecturers(prev => {
      if (prev.includes(lecturerId)) {
        return prev.filter(id => id !== lecturerId);
      } else {
        return [...prev, lecturerId];
      }
    });
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (user.role === 'mahasiswa' && selectedLecturers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one lecturer',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = {
        ...profileData,
        lecturers: user.role === 'mahasiswa' ? selectedLecturers : undefined
      };
      const { data } = await api.put('/users/profile', dataToSubmit);

      // Update user in context and localStorage
      updateUser(data);

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New password and confirmation password do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast({
        title: 'Success',
        description: 'Password changed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to change password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Only image files are allowed (JPG, PNG, GIF)',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Maximum file size is 5MB',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setAvatarLoading(true);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update user in context and localStorage
      updateUser({ avatar: data.avatar });

      toast({
        title: 'Success',
        description: 'Avatar uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload avatar',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading size="lg">Profile</Heading>

        {/* Avatar Section */}
        <Box bg="white" p={6} borderRadius="lg" shadow="md">
          <VStack spacing={4}>
            <Avatar
              size="2xl"
              name={user?.name}
              src={getAvatarUrl(user?.avatar)}
            />
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              display="none"
              id="avatar-upload"
            />
            <Button
              as="label"
              htmlFor="avatar-upload"
              colorScheme="blue"
              size="sm"
              isLoading={avatarLoading}
              cursor="pointer"
            >
              Change Avatar
            </Button>
            <Text fontSize="sm" color="gray.500">
              JPG, PNG or GIF. Maximum 5MB
            </Text>
          </VStack>
        </Box>

        {/* Tabs for Profile and Password */}
        <Tabs colorScheme="blue">
          <TabList>
            <Tab>Profile Information</Tab>
            <Tab>Change Password</Tab>
          </TabList>

          <TabPanels>
            {/* Profile Tab */}
            <TabPanel>
              <Box bg="white" p={6} borderRadius="lg" shadow="md">
                <form onSubmit={handleProfileSubmit}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Name</FormLabel>
                      <Input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                      />
                    </FormControl>

                    {user?.role === 'mahasiswa' && (
                      <>
                        <FormControl>
                          <FormLabel>NIM</FormLabel>
                          <Input
                            type="text"
                            name="nim"
                            value={profileData.nim}
                            onChange={handleProfileChange}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>
                            Your Lecturers ({selectedLecturers.length} selected)
                          </FormLabel>
                          <Box
                            maxH="200px"
                            overflowY="auto"
                            border="1px"
                            borderColor="gray.200"
                            borderRadius="md"
                            p={3}
                          >
                            {lecturers.length === 0 ? (
                              <Text color="gray.500" fontSize="sm">No lecturers available</Text>
                            ) : (
                              <Stack spacing={2}>
                                {lecturers.map((lecturer) => (
                                  <Checkbox
                                    key={lecturer._id}
                                    isChecked={selectedLecturers.includes(lecturer._id)}
                                    onChange={() => handleLecturerToggle(lecturer._id)}
                                  >
                                    {lecturer.name} {lecturer.nip ? `(${lecturer.nip})` : ''}
                                  </Checkbox>
                                ))}
                              </Stack>
                            )}
                          </Box>
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            You will appear in groups created by selected lecturers
                          </Text>
                        </FormControl>
                      </>
                    )}

                    {user?.role === 'dosen' && (
                      <FormControl>
                        <FormLabel>NIP</FormLabel>
                        <Input
                          type="text"
                          name="nip"
                          value={profileData.nip}
                          onChange={handleProfileChange}
                        />
                      </FormControl>
                    )}

                    <Divider />

                    <FormControl>
                      <FormLabel>Role</FormLabel>
                      <Input
                        type="text"
                        value={user?.role || ''}
                        isReadOnly
                        bg="gray.100"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Status</FormLabel>
                      <Input
                        type="text"
                        value={user?.status || ''}
                        isReadOnly
                        bg="gray.100"
                      />
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="blue"
                      width="full"
                      isLoading={loading}
                    >
                      Save Changes
                    </Button>
                  </VStack>
                </form>
              </Box>
            </TabPanel>

            {/* Password Tab */}
            <TabPanel>
              <Box bg="white" p={6} borderRadius="lg" shadow="md">
                <form onSubmit={handlePasswordSubmit}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Current Password</FormLabel>
                      <InputGroup>
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                        />
                        <InputRightElement>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            icon={showCurrentPassword ? <ViewOffIcon /> : <ViewIcon />}
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>New Password</FormLabel>
                      <InputGroup>
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          minLength={6}
                        />
                        <InputRightElement>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            icon={showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          />
                        </InputRightElement>
                      </InputGroup>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Minimum 6 characters
                      </Text>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Confirm New Password</FormLabel>
                      <InputGroup>
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          minLength={6}
                        />
                        <InputRightElement>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="blue"
                      width="full"
                      isLoading={loading}
                    >
                      Change Password
                    </Button>
                  </VStack>
                </form>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
    </>
  );
};

export default Profile;
