const cleanSegment = (value) =>
  encodeURIComponent(String(value).trim().toLowerCase());

export const getTenantCacheIdentity = (req) => {
  const identity =
    req.user?.tenantId ??
    req.tenantDbName ??
    req.user?.tenantDbName ??
    req.tenantSlug ??
    req.user?.tenantSlug;

  return identity === undefined || identity === null || identity === ""
    ? null
    : cleanSegment(identity);
};

export const normalizeQuery = (query = {}) =>
  Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${cleanSegment(key)}=${cleanSegment(Array.isArray(value) ? value.join(",") : value)}`)
    .join("&") || "default";

export const buildCacheKey = ({
  req,
  resource,
  scope = "user",
  versions = {},
  includeQuery = true,
}) => {
  const tenant = getTenantCacheIdentity(req);
  if (!tenant) return null;

  const prefix = cleanSegment(process.env.REDIS_KEY_PREFIX || "taskflow");
  const environment = cleanSegment(process.env.NODE_ENV || "development");
  const resolvedResource = typeof resource === "function" ? resource(req) : resource;
  const parts = [prefix, environment, "v1", "tenant", tenant, cleanSegment(resolvedResource)];

  if (scope === "user") {
    parts.push(
      "user",
      cleanSegment(req.user?.id ?? "anonymous"),
      "role",
      cleanSegment(req.user?.role ?? "unknown"),
    );
  } else if (scope === "role") {
    parts.push("role", cleanSegment(req.user?.role ?? "unknown"));
  }

  Object.entries(versions)
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([name, version]) => parts.push(cleanSegment(name), `v${version}`));

  if (includeQuery) parts.push("query", normalizeQuery(req.query));

  return parts.join(":");
};

export const buildVersionKey = (tenant, resource) => {
  const prefix = cleanSegment(process.env.REDIS_KEY_PREFIX || "taskflow");
  const environment = cleanSegment(process.env.NODE_ENV || "development");
  return `${prefix}:${environment}:v1:tenant:${cleanSegment(tenant)}:version:${cleanSegment(resource)}`;
};

