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
  Select,
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
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    nim: '',
    nip: '',
    university: '',
    faculty: '',
    program: ''
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

  // Fetch current user data with populated fields
  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/users/me');
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      // Fallback to user from context
      return user;
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        // Fetch latest user data with populated fields
        const userData = await fetchCurrentUser();

        const universityId = userData.university?._id || userData.university || '';
        const facultyId = userData.faculty?._id || userData.faculty || '';
        const programId = userData.program?._id || userData.program || '';

        console.log('Loading user data:', {
          universityId,
          facultyId,
          programId,
          university: userData.university,
          faculty: userData.faculty,
          program: userData.program
        });

        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          nim: userData.nim || '',
          nip: userData.nip || '',
          university: universityId,
          faculty: facultyId,
          program: programId
        });

        // Load lecturers if user is mahasiswa
        if (userData.role === 'mahasiswa') {
          fetchLecturers();
          // Fetch lecturers separately to get the populated list
          if (userData.lecturers && userData.lecturers.length > 0) {
            setSelectedLecturers(userData.lecturers.map(l => l._id || l));
          } else if (userData.lecturer) {
            setSelectedLecturers([userData.lecturer._id || userData.lecturer]);
          }
        }

        // Load universities first
        await fetchUniversities();

        // Load faculties if university exists
        if (universityId) {
          await fetchFaculties(universityId);
        }

        // Load programs if faculty exists
        if (facultyId) {
          await fetchPrograms(facultyId);
        }

        // Mark initial load as complete
        setIsInitialLoad(false);
      }
    };

    loadUserData();
  }, [user]);

  useEffect(() => {
    // Skip if this is initial load
    if (isInitialLoad) return;

    if (profileData.university) {
      fetchFaculties(profileData.university);
    } else {
      setFaculties([]);
      setProfileData(prev => ({ ...prev, faculty: '', program: '' }));
    }
  }, [profileData.university, isInitialLoad]);

  useEffect(() => {
    // Skip if this is initial load
    if (isInitialLoad) return;

    if (profileData.faculty) {
      fetchPrograms(profileData.faculty);
    } else {
      setPrograms([]);
      setProfileData(prev => ({ ...prev, program: '' }));
    }
  }, [profileData.faculty, isInitialLoad]);

  const fetchLecturers = async () => {
    try {
      const response = await api.get('/users/lecturers');
      setLecturers(response.data);
    } catch (error) {
      console.error('Failed to fetch lecturers:', error);
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await api.get('/universities/active');
      setUniversities(response.data);
    } catch (error) {
      console.error('Failed to fetch universities:', error);
    }
  };

  const fetchFaculties = async (universityId) => {
    try {
      const response = await api.get('/faculties/active', {
        params: { universityId }
      });
      setFaculties(response.data);
    } catch (error) {
      console.error('Failed to fetch faculties:', error);
    }
  };

  const fetchPrograms = async (facultyId) => {
    try {
      const response = await api.get('/programs/active', {
        params: { facultyId }
      });
      setPrograms(response.data);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
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

                    <Divider />
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">Academic Information</Text>

                    <FormControl isRequired>
                      <FormLabel>University</FormLabel>
                      <Select
                        name="university"
                        value={profileData.university}
                        onChange={handleProfileChange}
                        placeholder="Select university"
                      >
                        {/* Show current selection first if it exists but not in the list yet */}
                        {profileData.university && currentUser?.university &&
                         !universities.find(u => u._id === profileData.university) && (
                          <option value={profileData.university}>
                            {currentUser.university.name || 'Loading...'}
                          </option>
                        )}
                        {universities.map((university) => (
                          <option key={university._id} value={university._id}>
                            {university.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Faculty</FormLabel>
                      <Select
                        name="faculty"
                        value={profileData.faculty}
                        onChange={handleProfileChange}
                        placeholder="Select faculty"
                        isDisabled={!profileData.university}
                      >
                        {/* Show current selection first if it exists but not in the list yet */}
                        {profileData.faculty && currentUser?.faculty &&
                         !faculties.find(f => f._id === profileData.faculty) && (
                          <option value={profileData.faculty}>
                            {currentUser.faculty.name || 'Loading...'}
                          </option>
                        )}
                        {faculties.map((faculty) => (
                          <option key={faculty._id} value={faculty._id}>
                            {faculty.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Program</FormLabel>
                      <Select
                        name="program"
                        value={profileData.program}
                        onChange={handleProfileChange}
                        placeholder="Select program"
                        isDisabled={!profileData.faculty}
                      >
                        {/* Show current selection first if it exists but not in the list yet */}
                        {profileData.program && currentUser?.program &&
                         !programs.find(p => p._id === profileData.program) && (
                          <option value={profileData.program}>
                            {currentUser.program.name ? `${currentUser.program.name} (${currentUser.program.level || ''})` : 'Loading...'}
                          </option>
                        )}
                        {programs.map((program) => (
                          <option key={program._id} value={program._id}>
                            {program.name} ({program.level})
                          </option>
                        ))}
                      </Select>
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
