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
  VStack,
  useToast
} from '@chakra-ui/react';
import axios from 'axios';

const UniversityModal = ({ isOpen, onClose, university }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    address: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (university) {
      setFormData({
        name: university.name || '',
        code: university.code || '',
        description: university.description || '',
        address: university.address || '',
        isActive: university.isActive !== undefined ? university.isActive : true
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        address: '',
        isActive: true
      });
    }
  }, [university]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.code) {
      toast({
        title: 'Error',
        description: 'Name and code are required',
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

      if (university) {
        await axios.put(`${API_URL}/universities/${university._id}`, formData, config);
        toast({
          title: 'Success',
          description: 'University updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        await axios.post(`${API_URL}/universities`, formData, config);
        toast({
          title: 'Success',
          description: 'University created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save university',
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
        <ModalHeader>{university ? 'Edit University' : 'Add University'}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>University Code</FormLabel>
                <Input
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., UNIV001"
                  textTransform="uppercase"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>University Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Universitas Indonesia"
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

              <FormControl>
                <FormLabel>Address</FormLabel>
                <Textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address..."
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
              {university ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default UniversityModal;
