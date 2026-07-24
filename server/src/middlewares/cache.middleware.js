import CacheService from "../services/cache.service.js";
import { buildCacheKey, getTenantCacheIdentity } from "../utils/cacheKey.js";

export const cacheResponse = ({
  resource,
  ttl,
  scope = "user",
  versionResources = [],
  includeQuery = true,
}) => async (req, res, next) => {
  if (!getTenantCacheIdentity(req) || !CacheService.client) {
    res.setHeader("X-Cache", "BYPASS");
    return next();
  }

  const versions = await CacheService.getVersions(req, versionResources);
  const key = buildCacheKey({ req, resource, scope, versions, includeQuery });
  const cachedResponse = await CacheService.get(key);

  if (cachedResponse !== null) {
    res.setHeader("X-Cache", "HIT");
    return res.status(200).json(cachedResponse);
  }

  res.setHeader("X-Cache", "MISS");
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      void CacheService.set(key, body, ttl);
    }
    return originalJson(body);
  };

  return next();
};

export const invalidateCacheAfter = (resources) => (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      void CacheService.incrementVersions(req, resources);
    }
    return originalJson(body);
  };
  next();
};
