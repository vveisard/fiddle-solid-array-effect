import {
  type Accessor,
  createEffect,
  createMemo,
  mapArray,
  onMount,
  onCleanup,
  on,
  indexArray,
} from "solid-js";

// @region-begin

/**
 * Create effect for mount of index from {@link indexArray}.
 */
function onIndexArrayMount<TValue>(
  getValue: Accessor<Array<TValue>>,
  fn: (getValue: Accessor<TValue>, index: number) => void
) {
  createEffect(
    indexArray(getValue, (getValue, index) => {
      onMount(() => fn(getValue, index));
    })
  );
}

/**
 * Create effect for cleanup of inde from {@link indexArray}.
 */
function onIndexArrayCleanup<TValue>(
  getValues: Accessor<Array<TValue>>,
  fn: (getValue: Accessor<TValue>, index: number) => void
) {
  createEffect(
    indexArray(getValues, (getValue, index) => {
      onCleanup(() => fn(getValue, index));
    })
  );
}

/**
 * Create effect for index from {@link mapArray}.
 */
function createIndexArrayEffect<T>(
  getValues: Accessor<Array<T>>,
  fn: (getValue: Accessor<T>, index: number) => T // TOOD effect function
) {
  createEffect(
    indexArray(getValues, (getValue, index) => {
      createEffect(() => fn(getValue, index));
    })
  );
}

/**
 * Create effect for changed value of index from {@link indexArray}.
 * @remarks
 * Deferred.
 */
function createIndexArrayOnValueChangeEffect<TValue>(
  getValues: Accessor<Array<TValue>>,
  fn: (value: TValue, prevValue: TValue, index: number) => void
) {
  createEffect(
    indexArray(getValues, (getValue, index) => {
      const initialValue = getValue(); // fixes https://github.com/solidjs/solid/issues/2065

      createEffect(
        on(
          getValue,
          (inputValue, prevInputValue) => {
            fn(inputValue, prevInputValue ?? initialValue, index);
          },
          {
            defer: true,
          }
        )
      );
    })
  );
}

export {
  onIndexArrayMount,
  onIndexArrayCleanup,
  createIndexArrayEffect,
  createIndexArrayOnValueChangeEffect,
};

// @region-end

// @region-begin

/**
 * Create effect for mount of value from {@link mapArray}.
 */
function onMapArrayMount<TVAlue>(
  getValues: Accessor<Array<TVAlue>>,
  fn: (value: TVAlue, getIndex: Accessor<number>) => void
) {
  createEffect(
    mapArray(getValues, (value, getIndex) => {
      onMount(() => fn(value, getIndex));
    })
  );
}

/**
 * Create effect for cleanup of value from {@link mapArray}.
 */
function onMapArrayCleanup<TValue>(
  getValues: Accessor<Array<TValue>>,
  fn: (value: TValue, getIndex: Accessor<number>) => void
) {
  createEffect(
    mapArray(getValues, (value, getIndex) => {
      onCleanup(() => fn(value, getIndex));
    })
  );
}

/**
 * Create effect for value from {@link mapArray}.
 */
function createMapArrayEffect<T>(
  getValues: Accessor<Array<T>>,
  fn: (value: T, getIndex: Accessor<number>) => T // TOOD effect function
) {
  createEffect(
    mapArray(getValues, (value, getIndex) => {
      createEffect(() => fn(value, getIndex));
    })
  );
}

/**
 * Create effect for changed index of value from {@link mapArray}.
 * @remarks
 * Deferred.
 */
function createMapArrayOnIndexChangeEffect<T>(
  getValues: Accessor<Array<T>>,
  fn: (value: T, index: number, prevIndex: number) => void
) {
  createEffect(
    mapArray(getValues, (value, getIndex) => {
      const initialIndex = getIndex(); // fixes https://github.com/solidjs/solid/issues/2065

      createEffect(
        on(
          getIndex,
          (inputIndex, prevInputIndex) => {
            fn(value, inputIndex, prevInputIndex ?? initialIndex);
          },
          {
            defer: true,
          }
        )
      );
    })
  );
}

export {
  onMapArrayCleanup,
  onMapArrayMount,
  createMapArrayEffect,
  createMapArrayOnIndexChangeEffect,
};

// @region-end

/**
 * Create effect for changed value of {@link MapResult} from {@link mapArray}.
 * @param mapFn get mapped results.
 * @param fn function to run when a result changes.
 * @remarks
 * Deferred.
 * Useful to update objects in other system. eg, writing transform position to a graphics or physics engine.
 */
function onMapArrayResultMount<TValue, TResult>(
  list: Accessor<Array<TValue>>,
  mapFn: (value: TValue, getIndex: Accessor<number>) => TResult,
  fn: (
    value: TValue,
    getIndex: Accessor<number>,
    getResult: Accessor<TResult>
  ) => void
): void {
  createEffect(
    mapArray(list, (value, getIndex) => {
      const getMapResult = createMemo(() => mapFn(value, getIndex));
      onMount(() => fn(value, getIndex, getMapResult));
    })
  );
}

/**
 * Create effect for changed value of {@link MapResult} from {@link mapArray}.
 * @param getMapResult get mapped results.
 * @param fn function to run when a result changes.
 * @remarks
 * Deferred.
 * Useful to update objects in other system. eg, writing transform position to a graphics or physics engine.
 */
function onMapArrayResultCleanup<TValue, TResult>(
  list: Accessor<Array<TValue>>,
  mapFn: (value: TValue, getIndex: Accessor<number>) => TResult,
  fn: (
    value: TValue,
    getIndex: Accessor<number>,
    getMapResult: Accessor<TResult>
  ) => void
): void {
  createEffect(
    mapArray(list, (value, getIndex) => {
      const getMapResult = createMemo(() => mapFn(value, getIndex));
      onCleanup(() => fn(value, getIndex, getMapResult));
    })
  );
}

/**
 * Create effect for value from {@link mapArray}.
 */
function createMapArrayResultEffect<TValue, TResult>(
  list: Accessor<Array<TValue>>,
  mapFn: (value: TValue, getIndex: Accessor<number>) => TResult,
  fn: (
    value: TValue,
    getIndex: Accessor<number>,
    getResult: Accessor<TResult>
  ) => void // TOOD effect function
) {
  createEffect(
    mapArray(list, (value, getIndex) => {
      const getMapResult = createMemo(() => mapFn(value, getIndex));
      createEffect(() => fn(value, getIndex, getMapResult));
    })
  );
}

/**
 * Create effect for changed result of {@link mapFn} from {@link mapArray}.
 * @param mapFn get mapped results.
 * @param fn function to run when a result changes.
 * @remarks
 * Deferred.
 * Useful to update objects in other system. eg, writing transform position to a graphics or physics engine.
 */
function createMapArrayOnResultValueChangeEffect<TValue, TResult>(
  list: Accessor<Array<TValue>>,
  mapFn: (value: TValue, getIndex: Accessor<number>) => TResult,
  fn: (
    value: TValue,
    getIndex: Accessor<number>,
    result: TResult,
    prevResult: TResult
  ) => void
): void {
  createEffect(
    mapArray(list, (value, getIndex) => {
      const getMapResult = createMemo(() => mapFn(value, getIndex));

      const initialResult = getMapResult(); // fixes https://github.com/solidjs/solid/issues/2065
      createEffect(
        on(
          getMapResult,
          (inputResult, prevInputResult) => {
            fn(value, getIndex, inputResult, prevInputResult ?? initialResult);
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
 * Create effect for changed index of {@link MapResult} from {@link mapArray}.
 * @remarks deferred.
 */
function createMapArrayOnResultIndexChangeEffect<TValue, TResult>(
  list: Accessor<Array<TValue>>,
  mapFn: (value: TValue, getIndex: Accessor<number>) => TResult,
  fn: (
    value: TValue,
    index: number,
    prevIndex: number,
    getResult: Accessor<TResult>
  ) => void
) {
  createEffect(
    mapArray(list, (value, getIndex) => {
      const getMapResult = createMemo(() => mapFn(value, getIndex));

      const initialIndex = getIndex(); // fixes https://github.com/solidjs/solid/issues/2065
      createEffect(
        on(
          getIndex,
          (inputIndex, prevInputIndex) => {
            fn(value, inputIndex, prevInputIndex ?? initialIndex, getMapResult);
          },
          {
            defer: true,
          }
        )
      );
    })
  );
}

export {
  onMapArrayResultMount,
  onMapArrayResultCleanup,
  createMapArrayResultEffect,
  createMapArrayOnResultValueChangeEffect,
  createMapArrayOnResultIndexChangeEffect,
};

// @region-end
