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
import api from '../utils/api';

const ProgramModal = ({ isOpen, onClose, program, universities }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: '',
    university: '',
    faculty: '',
    isActive: true
  });
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (program) {
      setFormData({
        name: program.name || '',
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
      const response = await api.get('/faculties/active', {
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

    if (!formData.name || !formData.level || !formData.university || !formData.faculty) {
      toast({
        title: 'Error',
        description: 'Name, level, university, and faculty are required',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      setLoading(true);

      if (program) {
        await api.put(`/programs/${program._id}`, formData);
        toast({
          title: 'Success',
          description: 'Program updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        await api.post('/programs', formData);
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
