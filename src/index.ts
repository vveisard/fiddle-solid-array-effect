import { createRoot, mapArray, createEffect, createMemo } from "solid-js";
import { createStore, reconcile } from "solid-js/store";

interface EntityState {
  id: string;
  counter: number;
  color: string;
}

interface EntityChunkState {
  ids: Array<string>;
  entities: Record<string, EntityState>;
}

const { setState } = createRoot(() => {
  const [entityChunkState, setEntityChunkState] = createStore<EntityChunkState>(
    {
      ids: [],
      entities: {},
    },
  );


  createEffect(() => {
    console.log(`getIds`, entityChunkState.ids)
  })

  const getEntities = createMemo(mapArray(
    () => entityChunkState.ids,
    (id, index) => () => entityChunkState.entities[id]
  ))

  createEffect(() => {
    console.log(`getEntities`, getEntities().map(i => JSON.stringify(i())))
  })

  const getCounters = createMemo(mapArray(
    () => entityChunkState.ids,
    (id, index) => () => entityChunkState.entities[id].counter
  ))

  createEffect(() => {
    console.log(`getCounters`, getCounters().map(i => i()))
  })

  createEffect(() => {
    mapArray(getCounters, (getCounter) => console.log(`getCounter`, getCounter()))
  })

  const getColors = createMemo(mapArray(
    () => entityChunkState.ids,
    (id, index) => () => entityChunkState.entities[id].color
  ))

  createEffect(() => {
    console.log(`getColors`, getColors().map(i => i()))
  })

  createEffect(() => {
    mapArray(getColors, (getColor) => console.log(`getColor`, getColor()))
  })

  return { setState: setEntityChunkState };
});

console.group('add', 'a', 'start')
setState(
  reconcile(
    {
      ids: ["a"],
      entities: {
        ["a"]: {
          id: "a",
          counter: 1,
          color: "red",
        },
      },
    },
    { key: null, merge: true },
  ),
);
console.groupEnd()

console.group('add', 'b', 'start')
setState(
  (prev) =>
    reconcile(
      {
        ids: [...prev.ids, "b"],
        entities: {
          ...prev.entities,
          ["b"]: {
            id: "b",
            counter: 2,
            color: "blue"
          },
        },
      },
      { key: "id", merge: true },
    )(prev),
);
console.groupEnd()

console.group('counter', 'start')
setState("entities", "b", "counter", 3)
console.groupEnd()

console.group('color', 'start')
setState("entities", "a", "color", "green")
console.groupEnd()