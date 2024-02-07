STORY as a developer, I want 
- createMappedEntityIdEffect
- createMappedEntityEffect

STORY as a developer, I want Indexed Entity functions
Like mapped entity functions, but uses indexArray

- createIndexedEntityEffect<TEntityState, TResult>(getEntityCollection: Accessor<EntityCollection>, mapFn: (entityId: EntityId, entityState: TEntityState) => TResult, (getEntityId: Acessor<EntityId>, entityIndex: number, value: TResult) => void);
