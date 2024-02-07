In seperate package:

STORY as a developer, I want primitives for entities

- the goal are re-usable primitives which createMappedEntityEffect, onMappedEntityMount, onMappedEntityCleanup: effects which use a value which is mapped from an entity

- createMappedEntityEffect<TEntityState, TResult>(getEntityCollection: Accessor<EntityCollection>, mapFn: (entityId: EntityId, entityState: TEntityState) => TResult, (entityId: EntityId, getEntityIndex: Acessor<number>, value: TResult) => void);

- createIndexedEntityEffect<TEntityState, TResult>(getEntityCollection: Accessor<EntityCollection>, mapFn: (entityId: EntityId, entityState: TEntityState) => TResult, (getEntityId: Acessor<EntityId>, entityIndex: number, value: TResult) => void);
