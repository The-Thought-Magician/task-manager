import express from 'express';
import cors from 'cors';
import { createClient } from 'redis';
import path from 'path';
import { fileURLToPath } from 'url';

interface Task {
    id: string;
    title: string;
    completed: boolean;
    category?: string;
    tags: string[];
    updatedAt: number;
}

// ES Module dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Enhanced error handling for Redis connection
const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error:', err));
client.on('connect', () => console.log('Connected to Redis'));

await client.connect();

// Middleware setup
app.use(cors());
app.use(express.json());

// API routes
// Categories routes
app.get('/api/categories', async (req, res) => {
    const categories = await client.sMembers('categories');
    res.json(categories);
});

app.post('/api/categories', async (req, res) => {
    const { name } = req.body;
    await client.sAdd('categories', name);
    res.json({ name });
});

// Modified task routes
app.get('/api/tasks', async (req, res) => {
    const tasks = await client.hGetAll('tasks');
    res.json(Object.entries(tasks).map(([id, task]) => ({ id, ...JSON.parse(task) })));
});

app.post('/api/tasks', async (req, res) => {
    const id = Date.now().toString();
    const task: Task = {
        ...req.body,
        tags: req.body.tags || [],
        updatedAt: Date.now(),
        id
    };
    await client.hSet('tasks', id, JSON.stringify(task));
    if (task.category) {
        await client.sAdd('categories', task.category);
    }
    res.json(task);
});

app.put('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const existingTask = await client.hGet('tasks', id);
    if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
    }
    const updatedTask: Task = {
        ...JSON.parse(existingTask),
        ...req.body,
        updatedAt: Date.now(),
        id
    };
    await client.hSet('tasks', id, JSON.stringify(updatedTask));
    if (updatedTask.category) {
        await client.sAdd('categories', updatedTask.category);
    }
    res.json(updatedTask);
});

app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const deleted = await client.hDel('tasks', id);
    if (!deleted) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
});

// Static file serving - make sure this comes after API routes
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Redis URL:', process.env.REDIS_URL);
});