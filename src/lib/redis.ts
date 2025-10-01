// lib/redis.ts
import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isConnecting = false;

const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379'
};

export async function getRedisClient() {
  // 如果客户端已经存在且可连接，则直接返回
  if (redisClient) {
    // 检查客户端是否处于可连接状态
    if (redisClient.isOpen) {
      return redisClient;
    }
    
    // 如果客户端关闭，则重置客户端
    if (redisClient.isReady || !redisClient.isOpen) {
      redisClient = null;
    }
  }

  // 防止重复连接
  if (isConnecting) {
    // 等待直到连接完成
    while (isConnecting && !redisClient) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    if (redisClient && redisClient.isOpen) {
      return redisClient;
    }
  }

  isConnecting = true;
  
  try {
    redisClient = createClient(redisConfig);
    
    redisClient.on('error', (err) => {
      console.log('Redis Client Error', err);
      // 发生错误时重置连接状态
      isConnecting = false;
    });
    
    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });
    
    redisClient.on('ready', () => {
      console.log('Redis Client Ready');
    });
    
    redisClient.on('end', () => {
      console.log('Redis Client Connection Ended');
      redisClient = null;
      isConnecting = false;
    });

    await redisClient.connect();
    isConnecting = false;
    return redisClient;
  } catch (error) {
    isConnecting = false;
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
}

export async function closeRedisClient() {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
}