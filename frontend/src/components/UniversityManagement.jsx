import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Spinner,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, SearchIcon, AddIcon } from '@chakra-ui/icons';
import axios from 'axios';
import UniversityModal from './UniversityModal';

const UniversityManagement = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/universities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUniversities(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch universities',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedUniversity(null);
    onOpen();
  };

  const handleEdit = (university) => {
    setSelectedUniversity(university);
    onOpen();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this university?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/universities/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Success',
        description: 'University deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      fetchUniversities();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete university',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleModalClose = () => {
    onClose();
    setSelectedUniversity(null);
    fetchUniversities();
  };

  const filteredUniversities = universities.filter(
    (university) =>
      university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      university.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box>
      <HStack mb={4} justify="space-between">
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAdd}>
          Add University
        </Button>
      </HStack>

      {filteredUniversities.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text color="gray.500">No universities found</Text>
        </Box>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Code</Th>
                <Th>Name</Th>
                <Th>Address</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUniversities.map((university) => (
                <Tr key={university._id}>
                  <Td fontWeight="bold">{university.code}</Td>
                  <Td>{university.name}</Td>
                  <Td>{university.address || '-'}</Td>
                  <Td>
                    <Badge colorScheme={university.isActive ? 'green' : 'red'}>
                      {university.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<EditIcon />}
                        colorScheme="blue"
                        size="sm"
                        onClick={() => handleEdit(university)}
                        aria-label="Edit university"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDelete(university._id)}
                        aria-label="Delete university"
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <UniversityModal
        isOpen={isOpen}
        onClose={handleModalClose}
        university={selectedUniversity}
      />
    </Box>
  );
};

export default UniversityManagement;
