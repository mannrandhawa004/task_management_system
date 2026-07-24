import { getRedisClient } from "../config/redis.js";
import { buildVersionKey, getTenantCacheIdentity } from "../utils/cacheKey.js";

const DEFAULT_TTL = Number(process.env.REDIS_DEFAULT_TTL) || 60;
const TTL_JITTER_SECONDS = Number(process.env.REDIS_TTL_JITTER_SECONDS) || 10;

class CacheService {
  get client() {
    return getRedisClient();
  }

  async get(key) {
    if (!this.client || !key) return null;

    try {
      const value = await this.client.get(key);
      return value === null ? null : JSON.parse(value);
    } catch (error) {
      console.warn(`[Redis] Cache read failed: ${error.message}`);
      return null;
    }
  }

  async set(key, value, ttl = DEFAULT_TTL) {
    if (!this.client || !key || value === undefined) return false;

    const jitter = TTL_JITTER_SECONDS > 0
      ? Math.floor(Math.random() * (TTL_JITTER_SECONDS + 1))
      : 0;

    try {
      await this.client.set(key, JSON.stringify(value), { EX: Math.max(1, Number(ttl) + jitter) });
      return true;
    } catch (error) {
      console.warn(`[Redis] Cache write failed: ${error.message}`);
      return false;
    }
  }

  async getVersions(req, resources = []) {
    const tenant = getTenantCacheIdentity(req);
    if (!this.client || !tenant || resources.length === 0) return {};

    try {
      const keys = resources.map((resource) => buildVersionKey(tenant, resource));
      const values = await this.client.mGet(keys);
      return resources.reduce((versions, resource, index) => {
        versions[resource] = Number(values[index]) || 1;
        return versions;
      }, {});
    } catch (error) {
      console.warn(`[Redis] Cache version read failed: ${error.message}`);
      return {};
    }
  }

  async incrementVersions(req, resources = []) {
    const tenant = getTenantCacheIdentity(req);
    if (!this.client || !tenant || resources.length === 0) return false;

    try {
      const transaction = this.client.multi();
      [...new Set(resources)].forEach((resource) => {
        transaction.incr(buildVersionKey(tenant, resource));
      });
      await transaction.exec();
      return true;
    } catch (error) {
      console.warn(`[Redis] Cache invalidation failed: ${error.message}`);
      return false;
    }
  }
}

export default new CacheService();

