import { createRoot, mapArray, createEffect, createMemo, onCleanup, onMount } from "solid-js";
import { createStore, produce, reconcile } from "solid-js/store";

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

  const getAllEntityIds = createMemo(
    () => entityChunkState.ids
  );

  const getAllEntityIdAndState = createMemo(
    mapArray(
      getAllEntityIds,
      (id, index) => () => [id, entityChunkState.entities[id]],
    ),
  );

  const getAllEntityIdAndCounter = createMemo(
    mapArray(
      getAllEntityIds,
      (id, index) => () => [id, entityChunkState.entities[id].counter],
    ),
  );

  const getAllEntityIdAndColor = createMemo(
    mapArray(
      getAllEntityIds,
      (id, index) => () => [id, entityChunkState.entities[id].color],
    ),
  );

  createEffect(() => {
    console.log(`getAllEntityId`, entityChunkState.ids);
  });

  createEffect(() => {
    console.log(
      `getAllEntityIdAndState`,
      getAllEntityIdAndState().map((i) => i()),
    );
  });

  createEffect(() => {
    console.log(
      `getAllEntityIdAndColor`,
      getAllEntityIdAndColor().map((i) => i()),
    );
  });

  createEffect(() => {
    console.log(
      `getAllEntityIdAndCounter`,
      getAllEntityIdAndCounter().map((i) => i()),
    );
  });

  createEffect(
    mapArray(getAllEntityIds, (getEntityId) =>
      createEffect(() => {
        console.log(`getEntityId`, getEntityId);
        onMount(() => console.log(`getEntityId`, getEntityId, `onMount`));
        onCleanup(() => console.log(`getEntityId`, getEntityId, `onCleanup`));
      }),
    ),
  );

  createEffect(
    mapArray(getAllEntityIdAndCounter, (getEntityAndCounter) =>
      createEffect(() => {
        console.log(`getEntityIdAndCounter`, getEntityAndCounter());
      }),
    ),
  );

  createEffect(
    mapArray(getAllEntityIdAndColor, (getEntityAndColor) =>
      createEffect(() => {
        console.log(`getEntityIdAndColor`, getEntityAndColor());
      }
      ),
    ),
  );

  return { setState: setEntityChunkState };
});

console.group(`add`, `a`, `start`);
setState(
  reconcile({
    ids: [`a`],
    entities: {
      [`a`]: {
        id: `a`,
        counter: 1,
        color: `red`,
      },
    },
  }),
);
console.groupEnd();

console.group(`add`, `b`, `start`);
setState((prev) =>
  reconcile({
    ids: [...prev.ids, `b`],
    entities: {
      ...prev.entities,
      [`b`]: {
        id: `b`,
        counter: 2,
        color: `blue`,
      },
    },
  })(prev),
);
console.groupEnd();

console.group(`set`, `counter`, `start`);
setState(`entities`, `b`, `counter`, 3);
console.groupEnd();

console.group(`set`, `color`, `start`);
setState(`entities`, `a`, `color`, `green`);
console.groupEnd();


console.group(`remove`, `a`, `start`);
setState(produce(prev => {
  prev.ids.splice(prev.ids.indexOf('a'), 1)
  delete prev.entities['a']
}));
console.groupEnd();