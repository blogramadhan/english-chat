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
import api from '../utils/api';

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

    console.log('=== University Form Submit Debug ===');
    console.log('1. Form Data:', formData);

    if (!formData.name || !formData.code) {
      console.error('Validation failed: name or code is missing');
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

      const url = university
        ? `/universities/${university._id}`
        : `/universities`;
      const method = university ? 'PUT' : 'POST';

      console.log('2. Request URL:', url);
      console.log('3. Request Method:', method);
      console.log('4. Request Body:', formData);

      let response;
      if (university) {
        response = await api.put(url, formData);
      } else {
        response = await api.post(url, formData);
      }

      console.log('5. Response Success:', response.data);

      toast({
        title: 'Success',
        description: university ? 'University updated successfully' : 'University created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      onClose();
    } catch (error) {
      console.error('=== Error Details ===');
      console.error('6. Error Object:', error);
      console.error('7. Error Response:', error.response);
      console.error('8. Error Response Data:', error.response?.data);
      console.error('9. Error Response Status:', error.response?.status);
      console.error('10. Error Message:', error.message);

      const errorMessage = error.response?.data?.message
        || error.response?.data?.error
        || error.message
        || 'Failed to save university';

      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
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
