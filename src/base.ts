import {
  type Accessor,
  createEffect,
  createMemo,
  mapArray,
  onMount,
  onCleanup,
  on,
} from "solid-js";

type EntityId = PropertyKey;

interface EntityCollectionState<TEntityKey extends EntityId, TEntityState> {
  readonly ids: Array<TEntityKey>;
  readonly states: Record<TEntityKey, TEntityState>;
}

/**
 * Create memos for all values mapped from given entity ids.
 * ie, a "query".
 * @param getEntityIds entity ids used to map.
 * @param getEntityValue map function used to get values.
 * @returns
 */
function createMappedEntityValueMemos<TEntityId extends EntityId, TEntityValue>(
  getEntityIds: Accessor<Array<TEntityId>>,
  getEntityValue: (entityId: TEntityId) => TEntityValue
): Accessor<Array<[TEntityId, Accessor<TEntityValue>]>> {
  return mapArray(getEntityIds, (entityId) => [
    entityId,
    createMemo(() => getEntityValue(entityId)), // @vveisard I don't understand why createMemo prevents `undefined` errors...
  ]) as Accessor<Array<[TEntityId, Accessor<TEntityValue>]>>;
}

/**
 * Create change effects for mapped entity values.
 * @see {@link onMappedEntityValueMount} for mount effects.
 * @see {@link onMappedEntityValueCleanup} for cleanup effects.
 * @remarks
 * Useful to update objects in other system. eg, writing transform position to a graphics or physics engine.
 * @param getMappedEntityValues get mapped entity values.
 * @param effectFn function to run when a mapped entity value changes.
 */
function onMappedEntityValueChange<TEntityId extends EntityId, TEntityValue>(
  getMappedEntityValues: Accessor<Array<[TEntityId, Accessor<TEntityValue>]>>,
  effectFn: (
    entityId: TEntityId,
    prevEntityValue: TEntityValue,
    entityValue: TEntityValue
  ) => TEntityValue
) {
  createEffect(
    mapArray(getMappedEntityValues, ([entityId, getEntityValue]) => {
      createEffect(
        on(
          getEntityValue,
          (inputEntityValue, prevInputEntityValue) => {
            effectFn(entityId, prevInputEntityValue, inputEntityValue);
          },
          {
            defer: true,
          }
        )
      );
    })
  );
}

/**
 * Create mount effects for mapped entity values.
 * @remarks
 * Useful to delete objects in other systems.
 */
function onMappedEntityValueMount<TEntityId extends EntityId, TEntityValue>(
  getMappedEntityValues: Accessor<Array<[TEntityId, Accessor<TEntityValue>]>>,
  mountFn: (entityId: TEntityId, entityValue: TEntityValue) => void
) {
  createEffect(
    mapArray(getMappedEntityValues, ([entityId, getEntityValue]) =>
      onMount(() => mountFn(entityId, getEntityValue()))
    )
  );
}

/**
 * Create cleanup effects for mapped entity values.
 * @remarks
 * Useful to delete objects in other systems.
 */
function onMappedEntityValueCleanup<TEntityId extends EntityId, TEntityValue>(
  getMappedEntityValues: Accessor<Array<[TEntityId, Accessor<TEntityValue>]>>,
  cleanupFn: (entityId: TEntityId, entityValue: TEntityValue) => void
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
  createMappedEntityValueMemos,
  onMappedEntityValueChange,
  onMappedEntityValueMount,
  onMappedEntityValueCleanup,
};
