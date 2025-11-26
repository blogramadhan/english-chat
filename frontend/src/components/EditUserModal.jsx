import { useState, useEffect } from 'react';
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
  Input,
  VStack,
  Select,
  useToast,
  Divider,
  Text,
} from '@chakra-ui/react';
import api from '../utils/api';

const EditUserModal = ({ isOpen, onClose, user, onUserUpdated }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nim: '',
    nip: '',
    status: 'pending',
    university: '',
    faculty: '',
    program: '',
    password: '',
  });

  // Fetch user with populated fields
  const fetchUserData = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return user;
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setIsInitialLoad(true);

        // Fetch user data with populated fields
        const userData = await fetchUserData(user._id);

        const universityId = userData.university?._id || userData.university || '';
        const facultyId = userData.faculty?._id || userData.faculty || '';
        const programId = userData.program?._id || userData.program || '';

        console.log('Loading user data for edit:', {
          universityId,
          facultyId,
          programId,
          university: userData.university,
          faculty: userData.faculty,
          program: userData.program
        });

        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          nim: userData.nim || '',
          nip: userData.nip || '',
          status: userData.status || 'pending',
          university: universityId,
          faculty: facultyId,
          program: programId,
          password: '',
        });

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

        setIsInitialLoad(false);
      }
    };

    if (isOpen) {
      loadUserData();
    }
  }, [user, isOpen]);

  // Cascading dropdowns
  useEffect(() => {
    if (isInitialLoad) return;

    if (formData.university) {
      fetchFaculties(formData.university);
    } else {
      setFaculties([]);
      setFormData(prev => ({ ...prev, faculty: '', program: '' }));
    }
  }, [formData.university, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return;

    if (formData.faculty) {
      fetchPrograms(formData.faculty);
    } else {
      setPrograms([]);
      setFormData(prev => ({ ...prev, program: '' }));
    }
  }, [formData.faculty, isInitialLoad]);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        status: formData.status,
        university: formData.university,
        faculty: formData.faculty,
        program: formData.program,
      };

      // Add password if provided
      if (formData.password && formData.password.trim() !== '') {
        if (formData.password.length < 6) {
          toast({
            title: 'Error',
            description: 'Password minimal 6 karakter',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          setLoading(false);
          return;
        }
        updateData.password = formData.password;
      }

      // Add NIM/NIP based on role
      if (user.role === 'mahasiswa') {
        updateData.nim = formData.nim;
      } else if (user.role === 'dosen') {
        updateData.nip = formData.nip;
      }

      const { data } = await api.put(`/admin/users/${user._id}`, updateData);

      toast({
        title: 'Berhasil',
        description: data.message || 'User berhasil diperbarui',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onUserUpdated) {
        onUserUpdated(data.user);
      }

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal memperbarui user',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit User</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nama</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama lengkap"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Password Baru</FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Minimal 6 karakter. Biarkan kosong jika tidak ingin mengubah password.
                </Text>
              </FormControl>

              {user.role === 'mahasiswa' && (
                <FormControl>
                  <FormLabel>NIM</FormLabel>
                  <Input
                    name="nim"
                    value={formData.nim}
                    onChange={handleChange}
                    placeholder="Nomor Induk Mahasiswa"
                  />
                </FormControl>
              )}

              {user.role === 'dosen' && (
                <FormControl>
                  <FormLabel>NIP</FormLabel>
                  <Input
                    name="nip"
                    value={formData.nip}
                    onChange={handleChange}
                    placeholder="Nomor Induk Pegawai"
                  />
                </FormControl>
              )}

              <Divider my={2} />
              <Text fontWeight="bold" fontSize="sm" color="gray.600">Academic Information</Text>

              <FormControl>
                <FormLabel>University</FormLabel>
                <Select
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="Select university"
                >
                  {/* Show current selection first if it exists but not in the list yet */}
                  {formData.university && currentUser?.university &&
                   !universities.find(u => u._id === formData.university) && (
                    <option value={formData.university}>
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

              <FormControl>
                <FormLabel>Faculty</FormLabel>
                <Select
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  placeholder="Select faculty"
                  isDisabled={!formData.university}
                >
                  {/* Show current selection first if it exists but not in the list yet */}
                  {formData.faculty && currentUser?.faculty &&
                   !faculties.find(f => f._id === formData.faculty) && (
                    <option value={formData.faculty}>
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

              <FormControl>
                <FormLabel>Program</FormLabel>
                <Select
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  placeholder="Select program"
                  isDisabled={!formData.faculty}
                >
                  {/* Show current selection first if it exists but not in the list yet */}
                  {formData.program && currentUser?.program &&
                   !programs.find(p => p._id === formData.program) && (
                    <option value={formData.program}>
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

              <Divider my={2} />

              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Role</FormLabel>
                <Input
                  value={user.role === 'dosen' ? 'Dosen' : 'Mahasiswa'}
                  isReadOnly
                  bg="gray.100"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Batal
            </Button>
            <Button colorScheme="blue" type="submit" isLoading={loading}>
              Simpan
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditUserModal;
