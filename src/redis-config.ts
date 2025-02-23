import { createClient } from 'redis';

export const initRedisClient = async () => {
    const client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
            reconnectStrategy: (retries) => {
                if (retries > 10) {
                    return new Error('Redis connection failed');
                }
                return Math.min(retries * 100, 3000);
            }
        }
    });

    client.on('error', (err) => console.error('Redis Client Error:', err));
    client.on('connect', () => console.log('Connected to Redis'));
    client.on('reconnecting', () => console.log('Reconnecting to Redis...'));

    await client.connect();
    return client;
};
