import {
  createMemo,
  createRoot,
  type Accessor,
  createEffect,
  createSignal,
  mapArray,
  indexArray,
  onMount,
  onCleanup,
} from "solid-js";
import { createStore, produce } from "solid-js/store";

// @region-base

type ContentId = string;
type EntityId = string;

interface EntityCollection<T> {
  readonly ids: Array<EntityId>;
  readonly states: Record<EntityId, T>;
}

// @region-end

interface BorbEntityState {
  readonly donkContentId: ContentId;
  readonly color: string;
}

interface DonkResourceData {}

interface WorldResources {
  readonly donkResources: Record<ContentId, DonkResourceData>;
}

interface WorldState {
  readonly borbEntityCollection: EntityCollection<BorbEntityState>;
}

const root = createRoot(() => {
  const [worldState, setWorldState] = createStore<WorldState>({
    borbEntityCollection: {
      ids: [],
      states: {},
    },
  });

  const [worldResources, setWorldResources] = createStore<WorldResources>({
    donkResources: {},
  });

  // @region-begin Basic

  const getAllBorbEntityIds: Accessor<Array<EntityId>> = createMemo(
    () => worldState.borbEntityCollection.ids
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

  // @region-begin

  const getAllBorbEntityIdAndGetColor: Accessor<
    Array<[EntityId, Accessor<string | undefined>]>
  > = mapArray(getAllBorbEntityIds, (borbContentId) => [
    borbContentId,
    () => worldState.borbEntityCollection.states[borbContentId]?.color,
  ]) as Accessor<Array<[EntityId, Accessor<string>]>>;

  createEffect(
    mapArray(getAllBorbEntityIdAndGetColor, ([borbEntityId, getColor]) => {
      onMount(() => {
        console.log(
          `getAllBorbEntityIdAndGetColor`,
          `mapArray/onMount`,
          `track value ${borbEntityId} with color ${getColor()}`
        );
      });

      onCleanup(() => {
        console.log(
          `getAllBorbEntityIdAndGetColor`,
          `mapArray/onCleanup`,
          `untrack value ${borbEntityId} with color ${getColor()}`
        );
      });

      createEffect((prevColor: string | undefined) => {
        const currentColor = getColor();
        console.log(
          `getAllBorbEntityIdAndGetColor`,
          `mapArray/createEffect`,
          `value ${borbEntityId} changed color from ${prevColor} to ${currentColor}`
        );

        return currentColor;
      });
    })
  );

  // @region-end

  return {
    setWorldState,
    setWorldResources,
  };
});

console.group(`create "a:cool"`);
root.setWorldState(
  produce((state) => {
    state.borbEntityCollection.ids.push("a:cool");
    state.borbEntityCollection.states["a:cool"] = {
      color: "red",
      donkContentId: "sunglasses",
    };
  })
);
console.groupEnd();

console.group(`create "b:rude"`);
root.setWorldState(
  produce((state) => {
    state.borbEntityCollection.ids.push("b:rude");
    state.borbEntityCollection.states["b:rude"] = {
      color: "yellow",
      donkContentId: "cigarette",
    };
  })
);
console.groupEnd();

console.group(`create "c:fun"`);
root.setWorldState(
  produce((state) => {
    state.borbEntityCollection.ids.push("c:fun");
    state.borbEntityCollection.states["c:fun"] = {
      color: "purple",
      donkContentId: "party-hat",
    };
  })
);
console.groupEnd();

console.group(`delete "b:rude"`);
root.setWorldState(
  produce((state) => {
    state.borbEntityCollection.ids.splice(
      state.borbEntityCollection.ids.indexOf("b:rude"),
      1
    );
    delete state.borbEntityCollection.states["b:rude"];
  })
);
console.groupEnd();

console.group("create d:smart");
root.setWorldState(
  produce((state) => {
    state.borbEntityCollection.ids.push("d:smart");
    state.borbEntityCollection.states["d:smart"] = {
      color: "green",
      donkContentId: "glasses",
    };
  })
);
console.groupEnd();

console.group("change a:cool color");
root.setWorldState(
  produce((state) => {
    state.borbEntityCollection.states["a:cool"] = {
      color: "orange",
    };
  })
);
console.groupEnd();
