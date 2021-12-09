import { createClient } from 'redis';

// Servers 8080 and 5300

// Redis
const redisClient = createClient();

redisClient.on('error', (err) => console.log('Redis Client Error', err));

await redisClient.connect();

export default { redisClient };
