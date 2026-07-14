import { AsyncLocalStorage } from "async_hooks";

/**
 * Node.js AsyncLocalStorage instance for Multi-Tenant context.
 * Stores tenant execution context ({ tenantPool, tenantDbName, tenantSlug, tenantId })
 * during the lifecycle of an HTTP request or asynchronous task.
 */
export const tenantContext = new AsyncLocalStorage();

/**
 * Get the current active tenant connection pool from context.
 * Returns null if running in global/platform context.
 */
export const getTenantPool = () => {
  const store = tenantContext.getStore();
  return store?.tenantPool || null;
};

/**
 * Get the current active tenant metadata from context.
 */
export const getTenantMetadata = () => {
  const store = tenantContext.getStore();
  return store ? {
    tenantDbName: store.tenantDbName,
    tenantSlug: store.tenantSlug,
    tenantId: store.tenantId
  } : null;
};
