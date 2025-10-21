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
} from '@chakra-ui/react';
import api from '../utils/api';

const EditUserModal = ({ isOpen, onClose, user, onUserUpdated }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nim: '',
    nip: '',
    status: 'pending',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        nim: user.nim || '',
        nip: user.nip || '',
        status: user.status || 'pending',
      });
    }
  }, [user]);

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
      };

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
