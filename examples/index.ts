import { type Accessor, createMemo, createRoot } from "solid-js";
import { createStore, produce } from "solid-js/store";
//
import {
  createMapResults,
  onMappedMount,
  onMappedCleanup,
  onMappedIndexChange,
  onIndexedValueChanged,
  onIndexedCleanup,
  onIndexedMount,
  onMappedMapResultValueChange,
  onMappedMapResultMount,
  onMappedMapResultCleanup,
  onMappedMapResultIndexChange,
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

  onMappedMount(getAllBorbEntityIds, (element, getIndex) => {
    console.log(
      onMappedMount.name,
      `${element} created at index ${getIndex()}`
    );
  });

  onMappedCleanup(getAllBorbEntityIds, (element, getIndex) => {
    console.log(
      onMappedCleanup.name,
      `${String(element)} disposed at index ${getIndex()}`
    );
  });

  onMappedIndexChange(getAllBorbEntityIds, (element, index, prevIndex) => {
    console.log(
      onMappedIndexChange.name,
      `${String(element)} changed index from ${prevIndex} to ${index}`
    );
  });

  onIndexedMount(getAllBorbEntityIds, (getElement, index) => {
    console.log(
      onIndexedMount.name,
      `${index} created with value ${getElement()}`
    );
  });

  onIndexedCleanup(getAllBorbEntityIds, (getElement, index) => {
    console.log(
      onIndexedCleanup.name,
      `index ${index} with value ${getElement()}`
    );
  });

  onIndexedValueChanged(getAllBorbEntityIds, (element, prevElement, index) => {
    console.log(
      onIndexedValueChanged.name,
      `${index} changed value from ${prevElement} to ${element}`
    );
  });

  // @region-end

  const getMappedEntityColor = createMapResults(
    getAllBorbEntityIds,
    (entityId) => worldState.borbEntityCollectionState.states[entityId].color
  );

  onMappedMapResultMount(getMappedEntityColor, (entityId, result) => {
    console.log(
      onMappedMapResultMount.name,
      `${entityId} created with color ${result}`
    );
  });

  onMappedMapResultCleanup(getMappedEntityColor, (entityId, result) => {
    console.log(
      onMappedMapResultCleanup.name,
      `${entityId} disposed with color ${result}`
    );
  });

  onMappedMapResultValueChange(
    getMappedEntityColor,
    (entityId, _getIndex, result, prevResult) => {
      console.log(
        onMappedMapResultValueChange.name,
        `${entityId} color changed from ${prevResult} to ${result}`
      );

      return result;
    }
  );

  onMappedMapResultIndexChange(
    getMappedEntityColor,
    (entityId, getResult, index, prevIndex) => {
      console.log(
        onMappedMapResultIndexChange.name,
        `${entityId} index changed from ${prevIndex} to ${index} with color ${getResult()}`
      );

      return index;
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
