import {
  type Accessor,
  createMemo,
  createRoot,
  createEffect,
  mapArray,
  indexArray,
  onMount,
  onCleanup,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
//
import {
  createMappedEntityValueEffect,
  createMappedEntityValueMemo,
  onMappedEntityValueCleanup,
  onMappedEntityValueMount,
  type EntityCollectionState,
  type EntityId,
} from "./base.ts";

// @region-base

export type WritableDeep<T> = { -readonly [P in keyof T]: WritableDeep<T[P]> };

// @region-end

interface BorbEntityState {
  readonly donkContentId: string;
  readonly color: string;
}

interface DonkResourceData {}

interface WorldResources {
  readonly donkResources: Record<string, DonkResourceData>;
}

interface WorldState {
  readonly borbEntityCollectionState: EntityCollectionState<BorbEntityState>;
}

const root = createRoot(() => {
  const [worldState, setWorldState] = createStore<WorldState>({
    borbEntityCollectionState: {
      ids: [],
      states: {},
    },
  });

  const [worldResources, setWorldResources] = createStore<WorldResources>({
    donkResources: {},
  });

  // @region-begin Basic

  const getAllBorbEntityIds: Accessor<Array<EntityId>> = createMemo(
    () => worldState.borbEntityCollectionState.ids
  );

  createEffect(
    mapArray(getAllBorbEntityIds, (borbEntityId, getIndex) => {
      onMount(() => {
        console.log(
          `getAllBorbEntityIds`,
          `mapArray/onMount`,
          `track value ${borbEntityId} at index ${getIndex()}`
        );
      });

      onCleanup(() => {
        console.log(
          `getAllBorbEntityIds`,
          `mapArray/onCleanup`,
          `untrack value ${borbEntityId} at index ${getIndex()}`
        );
      });

      createEffect((prevIndexOfValue: number | undefined) => {
        const currentIndexOfValue = getIndex();
        console.log(
          `getAllBorbEntityIds`,
          `mapArray/createEffect`,
          `value ${borbEntityId} changed index from ${prevIndexOfValue} to ${currentIndexOfValue}`
        );

        return currentIndexOfValue;
      });
    })
  );

  createEffect(
    indexArray(getAllBorbEntityIds, (getBorbEntityId, index) => {
      onMount(() => {
        console.log(
          `getAllBorbEntityIds`,
          `indexArray/onMount`,
          `track index ${index} with value ${getBorbEntityId()}`
        );
      });

      onCleanup(() => {
        console.log(
          `getAllBorbEntityIds`,
          `indexArray/onCleanup`,
          `untrack index ${index} with value ${getBorbEntityId()}`
        );
      });

      createEffect((prevValueAtIndex: string | undefined) => {
        const currentValueAtIndex = getBorbEntityId();
        console.log(
          `getAllBorbEntityIds`,
          `indexArray/createEffect`,
          `index ${index} changed value from ${prevValueAtIndex} to ${currentValueAtIndex}`
        );

        return currentValueAtIndex;
      });
    })
  );

  // @region-end

  const getEntityIdAndGetColor = createMappedEntityValueMemo<
    BorbEntityState,
    string
  >(
    () => worldState.borbEntityCollectionState,
    getAllBorbEntityIds,
    (entityCollectionState, entityId) =>
      entityCollectionState.states[entityId].color
  );

  createMappedEntityValueEffect(
    getEntityIdAndGetColor,
    (entityId, prevEntityValue, entityValue) => {
      console.log(
        `entity ${entityId} color changed from ${prevEntityValue} to ${entityValue}`
      );

      return entityValue;
    }
  );

  onMappedEntityValueMount(getEntityIdAndGetColor, (entityId, entityValue) => {
    console.log(`entity ${entityId} created with color ${entityValue}`);
  });

  onMappedEntityValueCleanup(
    getEntityIdAndGetColor,
    (entityId, entityValue) => {
      console.log(`entity ${entityId} deleted with color ${entityValue}`);
    }
  );

  return {
    setWorldState,
    setWorldResources,
  };
});

console.group(`create "a:cool"`);
root.setWorldState(
  produce((state) => {
    state.borbEntityCollectionState.ids.push("a:cool");
    state.borbEntityCollectionState.states["a:cool"] = {
      color: "red",
      donkContentId: "sunglasses",
    };
  })
);
console.groupEnd();

console.group(`create "b:rude"`);
root.setWorldState(
  produce((state) => {
    state.borbEntityCollectionState.ids.push("b:rude");
    state.borbEntityCollectionState.states["b:rude"] = {
      color: "yellow",
      donkContentId: "cigarette",
    };
  })
);
console.groupEnd();

console.group(`create "c:fun"`);
root.setWorldState(
  produce((state) => {
    state.borbEntityCollectionState.ids.push("c:fun");
    state.borbEntityCollectionState.states["c:fun"] = {
      color: "purple",
      donkContentId: "party-hat",
    };
  })
);
console.groupEnd();

console.group(`delete "b:rude"`);
root.setWorldState(
  produce((state) => {
    state.borbEntityCollectionState.ids.splice(
      state.borbEntityCollectionState.ids.indexOf("b:rude"),
      1
    );
    delete state.borbEntityCollectionState.states["b:rude"];
  })
);
console.groupEnd();

console.group("create d:smart");
root.setWorldState(
  produce((state) => {
    state.borbEntityCollectionState.ids.push("d:smart");
    state.borbEntityCollectionState.states["d:smart"] = {
      color: "green",
      donkContentId: "glasses",
    };
  })
);
console.groupEnd();

console.group("change a:cool color");
root.setWorldState(
  produce((state) => {
    (
      state.borbEntityCollectionState.states[
        "a:cool"
      ] as WritableDeep<BorbEntityState>
    ).color = "orange";
  })
);
console.groupEnd();

console.group(`delete "a:cool"`);
root.setWorldState(
  produce((state) => {
    state.borbEntityCollectionState.ids.splice(
      state.borbEntityCollectionState.ids.indexOf("a:cool"),
      1
    );
    delete state.borbEntityCollectionState.states["a:cool"];
  })
);
console.groupEnd();
