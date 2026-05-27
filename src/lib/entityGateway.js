import {
  hydrateCustomerRecord,
  prepareCustomerPersistencePayload,
} from '@/lib/customerPersistenceCompat';

function normalizeEntityResult(entityName, result) {
  if (entityName !== 'Customer') return result;
  if (Array.isArray(result)) return result.map(item => hydrateCustomerRecord(item));
  return hydrateCustomerRecord(result);
}

function prepareEntityPayload(entityName, payload) {
  if (entityName !== 'Customer') return payload;
  return prepareCustomerPersistencePayload(payload);
}

export async function safeListEntity(base44, entityName, sort = '-created_date', limit = 100) {
  try {
    const entity = base44?.entities?.[entityName];
    if (!entity?.list) return [];
    return normalizeEntityResult(entityName, await entity.list(sort, limit));
  } catch (error) {
    console.warn(`${entityName}.list skipped`, error?.message || error);
    return [];
  }
}

export async function safeFilterEntity(base44, entityName, query, sort = '-created_date', limit = 20) {
  try {
    const entity = base44?.entities?.[entityName];
    if (!entity?.filter) return [];
    return normalizeEntityResult(entityName, await entity.filter(query, sort, limit));
  } catch (error) {
    console.warn(`${entityName}.filter skipped`, error?.message || error);
    return [];
  }
}

export async function createEntity(base44, entityName, payload) {
  const entity = base44?.entities?.[entityName];
  if (!entity?.create) throw new Error(`Base44 entity ${entityName} is not available`);
  return normalizeEntityResult(entityName, await entity.create(prepareEntityPayload(entityName, payload)));
}

export async function updateEntity(base44, entityName, id, payload) {
  const entity = base44?.entities?.[entityName];
  if (!entity?.update) throw new Error(`Base44 entity ${entityName} is not available`);
  return normalizeEntityResult(entityName, await entity.update(id, prepareEntityPayload(entityName, payload)));
}
