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
  Select,
  Tag
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, SearchIcon, AddIcon } from '@chakra-ui/icons';
import axios from 'axios';
import ProgramModal from './ProgramModal';

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUniversity, setFilterUniversity] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchUniversities();
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (filterUniversity) {
      fetchFaculties(filterUniversity);
    } else {
      setFaculties([]);
      setFilterFaculty('');
    }
    fetchPrograms();
  }, [filterUniversity]);

  useEffect(() => {
    fetchPrograms();
  }, [filterFaculty]);

  const fetchUniversities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/universities/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUniversities(response.data);
    } catch (error) {
      console.error('Failed to fetch universities:', error);
    }
  };

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

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = {};
      if (filterUniversity) params.universityId = filterUniversity;
      if (filterFaculty) params.facultyId = filterFaculty;

      const response = await axios.get(`${API_URL}/programs`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setPrograms(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch programs',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedProgram(null);
    onOpen();
  };

  const handleEdit = (program) => {
    setSelectedProgram(program);
    onOpen();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this program?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/programs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Success',
        description: 'Program deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      fetchPrograms();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete program',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleModalClose = () => {
    onClose();
    setSelectedProgram(null);
    fetchPrograms();
  };

  const filteredPrograms = programs.filter(
    (program) =>
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.faculty?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.university?.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <HStack spacing={4} flex="1" minW="300px" flexWrap="wrap">
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Select
            placeholder="All Universities"
            maxW="200px"
            value={filterUniversity}
            onChange={(e) => setFilterUniversity(e.target.value)}
          >
            {universities.map((university) => (
              <option key={university._id} value={university._id}>
                {university.name}
              </option>
            ))}
          </Select>
          <Select
            placeholder="All Faculties"
            maxW="200px"
            value={filterFaculty}
            onChange={(e) => setFilterFaculty(e.target.value)}
            isDisabled={!filterUniversity}
          >
            {faculties.map((faculty) => (
              <option key={faculty._id} value={faculty._id}>
                {faculty.name}
              </option>
            ))}
          </Select>
        </HStack>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAdd}>
          Add Program
        </Button>
      </HStack>

      {filteredPrograms.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text color="gray.500">No programs found</Text>
        </Box>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Code</Th>
                <Th>Name</Th>
                <Th>Level</Th>
                <Th>Faculty</Th>
                <Th>University</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredPrograms.map((program) => (
                <Tr key={program._id}>
                  <Td fontWeight="bold">{program.code}</Td>
                  <Td>{program.name}</Td>
                  <Td>
                    <Tag colorScheme="purple">{program.level}</Tag>
                  </Td>
                  <Td>{program.faculty?.name}</Td>
                  <Td>{program.university?.name}</Td>
                  <Td>
                    <Badge colorScheme={program.isActive ? 'green' : 'red'}>
                      {program.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<EditIcon />}
                        colorScheme="blue"
                        size="sm"
                        onClick={() => handleEdit(program)}
                        aria-label="Edit program"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDelete(program._id)}
                        aria-label="Delete program"
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <ProgramModal
        isOpen={isOpen}
        onClose={handleModalClose}
        program={selectedProgram}
        universities={universities}
      />
    </Box>
  );
};

export default ProgramManagement;
