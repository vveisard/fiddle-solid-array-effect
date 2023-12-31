import { createRoot, createMemo, mapArray, type Accessor, createEffect, onCleanup } from 'solid-js'
import { createStore, produce, reconcile } from 'solid-js/store'

interface EntityState {
  id: string;
  counter: number
}

interface EntityChunkState {
  ids: Array<string>
  entities: Record<string, EntityState>
}

const { setState } = createRoot(() => {
  const [entityChunkState, setEntityChunkState] = createStore<EntityChunkState>({
    ids: [],
    entities: {

    }
  })

  createEffect(
    mapArray(
      mapArray(
        () => entityChunkState.ids,
        (id) => () => entityChunkState.entities[id]
      ),
      (item, index) => {
        console.log(`entity`, item())
      }
    )
  );

  createEffect(
    mapArray(
      mapArray(
        () => entityChunkState.ids,
        (id) => () => entityChunkState.entities[id].counter
      ),
      (item, index) => {
        console.log(`counter`, item())
      }
    )
  );


  return { setState: setEntityChunkState };
})

setState(
  reconcile(
    {
      ids: [
        "a"
      ],
      entities: {
        ["a"]: {
          id: "a",
          counter: 1
        }
      }
    },
    { key: null, merge: true }
  )
);

setState((prev) =>
  reconcile(
    {
      ids: prev.ids,
      entities: {
        ['a']: {
          id: "a",
          counter: 2
        }
      }
    },
    { key: "id", merge: false }
  )(prev)
);