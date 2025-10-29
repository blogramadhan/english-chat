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

const ProgramModal = ({ isOpen, onClose, program, universities }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    level: '',
    university: '',
    faculty: '',
    isActive: true
  });
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (program) {
      setFormData({
        name: program.name || '',
        code: program.code || '',
        description: program.description || '',
        level: program.level || '',
        university: program.university?._id || '',
        faculty: program.faculty?._id || '',
        isActive: program.isActive !== undefined ? program.isActive : true
      });

      if (program.university?._id) {
        fetchFaculties(program.university._id);
      }
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        level: '',
        university: '',
        faculty: '',
        isActive: true
      });
      setFaculties([]);
    }
  }, [program]);

  const fetchFaculties = async (universityId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/faculties/active`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { universityId }
      });
      setFaculties(response.data);
    } catch (error) {
      console.error('Failed to fetch faculties:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'university') {
      setFormData((prev) => ({ ...prev, faculty: '' }));
      if (value) {
        fetchFaculties(value);
      } else {
        setFaculties([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.level || !formData.university || !formData.faculty) {
      toast({
        title: 'Error',
        description: 'All fields are required',
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

      if (program) {
        await axios.put(`${API_URL}/programs/${program._id}`, formData, config);
        toast({
          title: 'Success',
          description: 'Program updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        await axios.post(`${API_URL}/programs`, formData, config);
        toast({
          title: 'Success',
          description: 'Program created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save program',
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
        <ModalHeader>{program ? 'Edit Program' : 'Add Program'}</ModalHeader>
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
                <FormLabel>Faculty</FormLabel>
                <Select
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  placeholder="Select faculty"
                  isDisabled={!formData.university}
                >
                  {faculties.map((faculty) => (
                    <option key={faculty._id} value={faculty._id}>
                      {faculty.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Program Code</FormLabel>
                <Input
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., IF001"
                  textTransform="uppercase"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Program Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Teknik Informatika"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Level</FormLabel>
                <Select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  placeholder="Select level"
                >
                  <option value="D3">D3</option>
                  <option value="D4">D4</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                </Select>
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
              {program ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ProgramModal;
