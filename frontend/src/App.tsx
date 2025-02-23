import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  Grid,
  theme,
  Container,
  Input,
  Button,
  Text,
  HStack,
  useToast,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  Editable,
  EditableInput,
  EditablePreview,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import axios from 'axios';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
  tags?: string[];
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newTag, setNewTag] = useState('');
  const toast = useToast();

  const fetchTasks = async () => {
    const { data } = await axios.get('/api/tasks');
    setTasks(data);
  };

  const fetchCategories = async () => {
    const { data } = await axios.get('/api/categories');
    setCategories(data);
  };

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, []);

  const addTask = async () => {
    if (!newTask.trim()) return;
    await axios.post('/api/tasks', { title: newTask, completed: false });
    setNewTask('');
    fetchTasks();
    toast({
      title: 'Task added',
      status: 'success',
      duration: 2000,
    });
  };

  const deleteTask = async (id: string) => {
    await axios.delete(`/api/tasks/${id}`);
    fetchTasks();
    toast({
      title: 'Task deleted',
      status: 'info',
      duration: 2000,
    });
  };

  const addCategory = async () => {
    const name = window.prompt('Enter new category name:');
    if (name) {
      await axios.post('/api/categories', { name });
      fetchCategories();
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    await axios.put(`/api/tasks/${id}`, updates);
    fetchTasks();
    toast({
      title: 'Task updated',
      status: 'success',
      duration: 2000,
    });
  };

  const addTagToTask = async (taskId: string, tag: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newTags = [...(task.tags || []), tag];
      await updateTask(taskId, { tags: newTags });
    }
  };

  const removeTagFromTask = async (taskId: string, tagToRemove: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newTags = (task.tags || []).filter(tag => tag !== tagToRemove);
      await updateTask(taskId, { tags: newTags });
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <VStack spacing={8}>
            <Container maxW="container.md">
              <VStack spacing={4}>
                <Text fontSize="2xl" fontWeight="bold">Task Manager</Text>
                <HStack width="100%">
                  <Input
                    flex={1}
                    placeholder="New task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  />
                  <Select
                    width="200px"
                    placeholder="Category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                  <Button onClick={addCategory}>New Category</Button>
                  <Button colorScheme="blue" onClick={addTask}>Add</Button>
                </HStack>
                <VStack spacing={2} align="stretch" width="100%">
                  {tasks.map((task) => (
                    <Box key={task.id} p={2} bg="gray.50" borderRadius="md">
                      <HStack justify="space-between">
                        <Editable defaultValue={task.title} onSubmit={(newTitle) => updateTask(task.id, { title: newTitle })}>
                          <EditablePreview />
                          <EditableInput />
                        </Editable>
                        <HStack>
                          <Select
                            size="sm"
                            width="150px"
                            value={task.category || ''}
                            onChange={(e) => updateTask(task.id, { category: e.target.value })}
                          >
                            <option value="">No Category</option>
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </Select>
                          <Button size="sm" onClick={() => deleteTask(task.id)}>Delete</Button>
                        </HStack>
                      </HStack>
                      <Wrap mt={2}>
                        {task.tags?.map(tag => (
                          <WrapItem key={tag}>
                            <Tag size="sm">
                              <TagLabel>{tag}</TagLabel>
                              <TagCloseButton onClick={() => removeTagFromTask(task.id, tag)} />
                            </Tag>
                          </WrapItem>
                        ))}
                        <WrapItem>
                          <Input
                            size="sm"
                            width="100px"
                            placeholder="Add tag"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newTag) {
                                addTagToTask(task.id, newTag);
                                setNewTag('');
                              }
                            }}
                          />
                        </WrapItem>
                      </Wrap>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </Container>
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
