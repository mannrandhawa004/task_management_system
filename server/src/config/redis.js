import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config({ quiet: true });

const isRedisEnabled = process.env.REDIS_ENABLED === "true";
let redisClient = null;
let initializationPromise = null;

const createRedisClient = () => {
  const client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    socket: {
      connectTimeout: 2000,
      reconnectStrategy: (retries) => {
        if (retries >= 5) return new Error("Redis reconnect limit reached");
        return Math.min(200 * 2 ** retries, 2000);
      },
    },
  });

  client.on("error", (error) => {
    console.warn(`[Redis] ${error.message}`);
  });

  client.on("ready", () => {
    console.log("Redis connected successfully");
  });

  return client;
};

export const initializeRedis = async () => {
  if (!isRedisEnabled) {
    console.log("Redis caching is disabled");
    return null;
  }

  if (redisClient?.isReady) return redisClient;
  if (initializationPromise) return initializationPromise;

  redisClient ||= createRedisClient();
  initializationPromise = redisClient
    .connect()
    .then(() => redisClient)
    .catch((error) => {
      console.warn(`[Redis] Cache unavailable; continuing with MySQL: ${error.message}`);
      return null;
    })
    .finally(() => {
      initializationPromise = null;
    });

  return initializationPromise;
};

export const getRedisClient = () =>
  isRedisEnabled && redisClient?.isReady ? redisClient : null;

export const isRedisCachingEnabled = () => isRedisEnabled;

export const closeRedis = async () => {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }
};

