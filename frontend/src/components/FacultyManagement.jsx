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
  useDisclosure,
  Select
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, SearchIcon, AddIcon } from '@chakra-ui/icons';
import api from '../utils/api';
import FacultyModal from './FacultyModal';

const FacultyManagement = () => {
  const [faculties, setFaculties] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUniversity, setFilterUniversity] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchUniversities();
    fetchFaculties();
  }, []);

  useEffect(() => {
    fetchFaculties();
  }, [filterUniversity]);

  const fetchUniversities = async () => {
    try {
      const response = await api.get('/universities/active');
      setUniversities(response.data);
    } catch (error) {
      console.error('Failed to fetch universities:', error);
    }
  };

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const params = filterUniversity ? { universityId: filterUniversity } : {};
      const response = await api.get('/faculties', { params });
      setFaculties(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch faculties',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedFaculty(null);
    onOpen();
  };

  const handleEdit = (faculty) => {
    setSelectedFaculty(faculty);
    onOpen();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty?')) {
      return;
    }

    try {
      await api.delete(`/faculties/${id}`);

      toast({
        title: 'Success',
        description: 'Faculty deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      fetchFaculties();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete faculty',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleModalClose = () => {
    onClose();
    setSelectedFaculty(null);
    fetchFaculties();
  };

  const filteredFaculties = faculties.filter(
    (faculty) =>
      faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.university?.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      <HStack mb={4} justify="space-between" flexWrap="wrap" spacing={4}>
        <HStack spacing={4} flex="1" minW="300px">
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
          <Select
            placeholder="All Universities"
            maxW="250px"
            value={filterUniversity}
            onChange={(e) => setFilterUniversity(e.target.value)}
          >
            {universities.map((university) => (
              <option key={university._id} value={university._id}>
                {university.name}
              </option>
            ))}
          </Select>
        </HStack>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAdd}>
          Add Faculty
        </Button>
      </HStack>

      {filteredFaculties.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text color="gray.500">No faculties found</Text>
        </Box>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Code</Th>
                <Th>Name</Th>
                <Th>University</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredFaculties.map((faculty) => (
                <Tr key={faculty._id}>
                  <Td fontWeight="bold">{faculty.code}</Td>
                  <Td>{faculty.name}</Td>
                  <Td>{faculty.university?.name}</Td>
                  <Td>
                    <Badge colorScheme={faculty.isActive ? 'green' : 'red'}>
                      {faculty.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<EditIcon />}
                        colorScheme="blue"
                        size="sm"
                        onClick={() => handleEdit(faculty)}
                        aria-label="Edit faculty"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDelete(faculty._id)}
                        aria-label="Delete faculty"
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <FacultyModal
        isOpen={isOpen}
        onClose={handleModalClose}
        faculty={selectedFaculty}
        universities={universities}
      />
    </Box>
  );
};

export default FacultyManagement;
