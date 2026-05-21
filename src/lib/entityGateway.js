export async function safeListEntity(base44, entityName, sort = '-created_date', limit = 100) {
  try {
    const entity = base44?.entities?.[entityName];
    if (!entity?.list) return [];
    return await entity.list(sort, limit);
  } catch (error) {
    console.warn(`${entityName}.list skipped`, error?.message || error);
    return [];
  }
}

export async function safeFilterEntity(base44, entityName, query, sort = '-created_date', limit = 20) {
  try {
    const entity = base44?.entities?.[entityName];
    if (!entity?.filter) return [];
    return await entity.filter(query, sort, limit);
  } catch (error) {
    console.warn(`${entityName}.filter skipped`, error?.message || error);
    return [];
  }
}

export async function createEntity(base44, entityName, payload) {
  const entity = base44?.entities?.[entityName];
  if (!entity?.create) throw new Error(`Base44 entity ${entityName} is not available`);
  return entity.create(payload);
}

export async function updateEntity(base44, entityName, id, payload) {
  const entity = base44?.entities?.[entityName];
  if (!entity?.update) throw new Error(`Base44 entity ${entityName} is not available`);
  return entity.update(id, payload);
}
