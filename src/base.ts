import {
  createEffect,
  createMemo,
  mapArray,
  type Accessor,
  onMount,
  onCleanup,
} from "solid-js";

type EntityId = string;

interface EntityCollectionState<T> {
  readonly ids: Array<EntityId>;
  readonly states: Record<EntityId, T>;
}

function createMappedEntityValueMemo<TEntityState, TEntityValue>(
  getEntityCollectionState: Accessor<EntityCollectionState<TEntityState>>,
  getEntityIds: Accessor<Array<EntityId>>,
  getEntityValueMapFn: (
    entityCollectionState: EntityCollectionState<TEntityState>,
    entityId: EntityId
  ) => TEntityValue
): Accessor<Array<[EntityId, Accessor<TEntityValue>]>> {
  return mapArray(getEntityIds, (entityId) => [
    entityId,
    createMemo(() => getEntityValueMapFn(getEntityCollectionState(), entityId)),
  ]) as Accessor<Array<[EntityId, Accessor<TEntityValue>]>>;
}

function createMappedEntityValueEffect<TEntityValue>(
  getMappedEntityValues: Accessor<Array<[EntityId, Accessor<TEntityValue>]>>,
  effectFn: (
    entityId: EntityId,
    prevEntityValue: TEntityValue,
    entityValue: TEntityValue
  ) => TEntityValue
) {
  createEffect(
    mapArray(getMappedEntityValues, ([entityId, getEntityValue]) => {
      createEffect((prevEntityValue) => {
        const entityValue: TEntityValue = getEntityValue();

        effectFn(entityId, prevEntityValue, entityValue);

        return entityValue;
      });
    })
  );
}

function onMappedEntityValueMount<TEntityValue>(
  getMappedEntityValues: Accessor<Array<[EntityId, Accessor<TEntityValue>]>>,
  mountFn: (entityId: EntityId, entityValue: TEntityValue) => void
) {
  createEffect(
    mapArray(getMappedEntityValues, ([entityId, getEntityValue]) =>
      onMount(() => mountFn(entityId, getEntityValue()))
    )
  );
}

function onMappedEntityValueCleanup<TEntityValue>(
  getMappedEntityValues: Accessor<Array<[EntityId, Accessor<TEntityValue>]>>,
  cleanupFn: (entityId: EntityId, entityValue: TEntityValue) => void
) {
  createEffect(
    mapArray(getMappedEntityValues, ([entityId, getEntityValue]) =>
      onCleanup(() => cleanupFn(entityId, getEntityValue()))
    )
  );
}

export {
  type EntityId,
  type EntityCollectionState,
  createMappedEntityValueMemo,
  createMappedEntityValueEffect,
  onMappedEntityValueMount,
  onMappedEntityValueCleanup,
};
