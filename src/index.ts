import { createRoot, createMemo, mapArray } from 'solid-js'
import { createStore, produce } from 'solid-js/store'

interface EntityState {
  id: string;
  counter: number
}

interface EntityChunkState {
  ids: Array<string>
  entities: Record<string, EntityState>
}

createRoot(() => {
  const [entityChunkState, setEntityChunkState] = createStore<EntityChunkState>({
    ids: [],
    entities: {

    }
  })

  const getIds = createMemo(() => entityChunkState.ids);
  const getEntries = createMemo(() => mapArray(getIds, (id) => [id, entityChunkState.entities[id]]));
  const getCounters = createMemo(() => mapArray(getIds, (id) => [id, entityChunkState.entities[id].counter]));

  createArrayElementEffect(getIds, (id) => {
    console.log(id);
  })

  createArrayElementEffect(getEntries, ([id, entity]) => {
    console.log(id, entity);
  })

  createArrayElementEffect(getCounters, ([id, counter]) => {
    console.log(id, counter);
  })

  // should output 
  // - a
  // - a, { "id": "a", counter: 0 }
  // - a, 0
  setTimeout(() => {
    setEntityChunkState(produce(
      (prevEntityChunkState) => {
        prevEntityChunkState.entities["a"] = { id: "a", counter: 0 }
        prevEntityChunkState.ids.push("a")
      }
    ))
  }, 1)

  // should output:
  // - b
  // - b, { "id": "b", counter: 1 }
  // - b, 1
  setTimeout(() => {
    setEntityChunkState(produce(
      (prevEntityChunkState) => {
        prevEntityChunkState.entities["b"] = { id: "b", counter: 1 }
        prevEntityChunkState.ids.push("b")
      }
    ))
  }, 2)

  // should output 
  // - b, { "id": "b", counter: 2 }
  // - b, 2
  setTimeout(() => {
    setEntityChunkState(produce(
      (prevEntityChunkState) => {
        prevEntityChunkState.entities["a"].counter = 2
      }
    ))
  }, 3)
})