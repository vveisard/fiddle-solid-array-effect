import { type Accessor, createMemo, createRoot, on } from "solid-js";
import { createStore, produce } from "solid-js/store";
//
import {
  onMapArrayMount,
  onMapArrayCleanup,
  createMapArrayOnIndexChangeEffect,
  createIndexArrayOnValueChangeEffect,
  onIndexArrayCleanup,
  onIndexArrayMount,
  createMapArrayResultEffect,
  createMapArrayOnResultValueChangeEffect,
  createMapArrayOnResultIndexChangeEffect,
  onMapArrayResultMount,
  onMapArrayResultCleanup,
} from "../src/index.ts";

// @region-begin base

export type WritableDeep<T> = { -readonly [P in keyof T]: WritableDeep<T[P]> };

// @region-end

// @region-begin Entity

type EntityId = PropertyKey;

interface EntityCollectionState<TEntityKey extends EntityId, TEntityState> {
  readonly ids: Array<TEntityKey>;
  readonly states: Record<TEntityKey, TEntityState>;
}

// @region-end

console = new console.Console({
  stdout: process.stdout,
  stderr: process.stderr,
  groupIndentation: 2,
}) as typeof console;

interface BorbEntityState {
  readonly donkContentId: string;
  readonly color: string;
}

interface DonkResourceData {}

interface WorldResources {
  readonly donkResources: Record<string, DonkResourceData>;
}

interface WorldState {
  readonly borbEntityCollectionState: EntityCollectionState<
    string,
    BorbEntityState
  >;
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

  const getAllBorbEntityIds: Accessor<Array<string>> = createMemo(
    () => worldState.borbEntityCollectionState.ids
  );

  onMapArrayMount(getAllBorbEntityIds, (element, getIndex) => {
    console.log(
      onMapArrayMount.name,
      `${element} created at index ${getIndex()}`
    );
  });

  onMapArrayCleanup(getAllBorbEntityIds, (element, getIndex) => {
    console.log(
      onMapArrayCleanup.name,
      `${String(element)} disposed at index ${getIndex()}`
    );
  });

  createMapArrayOnIndexChangeEffect(
    getAllBorbEntityIds,
    (element, index, prevIndex) => {
      console.log(
        createMapArrayOnIndexChangeEffect.name,
        `${String(element)} changed index from ${prevIndex} to ${index}`
      );
    }
  );

  createMapArrayOnResultValueChangeEffect(
    getAllBorbEntityIds,
    (entityId) => worldState.borbEntityCollectionState.states[entityId].color,
    (entityId, getIndex, color, prevColor) => {
      console.log(
        createMapArrayResultEffect.name,
        `${entityId} color changed from ${prevColor} to ${color}`
      );

      return color;
    }
  );

  onIndexArrayMount(getAllBorbEntityIds, (getElement, index) => {
    console.log(
      onIndexArrayMount.name,
      `${index} created with value ${getElement()}`
    );
  });

  onIndexArrayCleanup(getAllBorbEntityIds, (getElement, index) => {
    console.log(
      onIndexArrayCleanup.name,
      `index ${index} with value ${getElement()}`
    );
  });

  createIndexArrayOnValueChangeEffect(
    getAllBorbEntityIds,
    (element, prevElement, index) => {
      console.log(
        createIndexArrayOnValueChangeEffect.name,
        `${index} changed value from ${prevElement} to ${element}`
      );
    }
  );

  // @region-end

  onMapArrayResultMount(
    getAllBorbEntityIds,
    (entityId) => worldState.borbEntityCollectionState.states[entityId].color,
    (entityId, getIndex, getColor) => {
      console.log(
        onMapArrayResultMount.name,
        `${entityId} created at index ${getIndex()} with color ${getColor()}`
      );
    }
  );

  onMapArrayResultCleanup(
    getAllBorbEntityIds,
    (entityId) => worldState.borbEntityCollectionState.states[entityId].color,
    (entityId, getIndex, getColor) => {
      console.log(
        onMapArrayResultCleanup.name,
        `${entityId} disposed at index ${getIndex()} with color ${getColor()}`
      );
    }
  );

  createMapArrayOnResultValueChangeEffect(
    getAllBorbEntityIds,
    (entityId) => worldState.borbEntityCollectionState.states[entityId].color,
    (entityId, _getIndex, color, prevColor) => {
      console.log(
        createMapArrayOnResultValueChangeEffect.name,
        `${entityId} color changed from ${prevColor} to ${color}`
      );
    }
  );

  createMapArrayOnResultIndexChangeEffect(
    getAllBorbEntityIds,
    (entityId) => worldState.borbEntityCollectionState.states[entityId].color,
    (entityId, index, prevIndex, getColor) => {
      console.log(
        createMapArrayOnResultIndexChangeEffect.name,
        `${entityId} index changed from ${prevIndex} to ${index} with color ${getColor()}`
      );
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

console.group("change a:cool color");
root.setWorldState(
  produce((state) => {
    (
      state.borbEntityCollectionState.states[
        "a:cool"
      ] as WritableDeep<BorbEntityState>
    ).color = "black";
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
