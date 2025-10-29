import React, { useState, useEffect } from 'react';
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
  Textarea,
  Switch,
  Select,
  VStack,
  useToast
} from '@chakra-ui/react';
import axios from 'axios';

const FacultyModal = ({ isOpen, onClose, faculty, universities }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    university: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (faculty) {
      setFormData({
        name: faculty.name || '',
        code: faculty.code || '',
        description: faculty.description || '',
        university: faculty.university?._id || '',
        isActive: faculty.isActive !== undefined ? faculty.isActive : true
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        university: '',
        isActive: true
      });
    }
  }, [faculty]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.university) {
      toast({
        title: 'Error',
        description: 'Name, code, and university are required',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (faculty) {
        await axios.put(`${API_URL}/faculties/${faculty._id}`, formData, config);
        toast({
          title: 'Success',
          description: 'Faculty updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        await axios.post(`${API_URL}/faculties`, formData, config);
        toast({
          title: 'Success',
          description: 'Faculty created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save faculty',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{faculty ? 'Edit Faculty' : 'Add Faculty'}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>University</FormLabel>
                <Select
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="Select university"
                >
                  {universities.map((university) => (
                    <option key={university._id} value={university._id}>
                      {university.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Faculty Code</FormLabel>
                <Input
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., FT001"
                  textTransform="uppercase"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Faculty Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Fakultas Teknik"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description..."
                  rows={3}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Active Status</FormLabel>
                <Switch
                  isChecked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit" isLoading={loading}>
              {faculty ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default FacultyModal;
