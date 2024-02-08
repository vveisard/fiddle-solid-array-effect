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
function onIndexedMount<TElement>(
  getElement: Accessor<Array<TElement>>,
  fn: (getElement: Accessor<TElement>, index: number) => void
) {
  createEffect(
    indexArray(getElement, (getElement, index) => {
      onMount(() => fn(getElement, index));
    })
  );
}

/**
 * Create effect for cleanup of inde from {@link indexArray}.
 */
function onIndexedCleanup<TElement>(
  getElements: Accessor<Array<TElement>>,
  fn: (getElement: Accessor<TElement>, index: number) => void
) {
  createEffect(
    indexArray(getElements, (getElement, index) => {
      onCleanup(() => fn(getElement, index));
    })
  );
}

/**
 * Create effect for changed value of index from {@link indexArray}.
 * @remarks
 * Deferred.
 */
function onIndexedValueChanged<TElement>(
  getElements: Accessor<Array<TElement>>,
  fn: (element: TElement, prevElement: TElement, index: number) => void
) {
  createEffect(
    indexArray(getElements, (getElement, index) => {
      const initialValue = getElement(); // fixes https://github.com/solidjs/solid/issues/2065

      createEffect(
        on(
          getElement,
          (inputElement, prevInputElement) => {
            fn(inputElement, prevInputElement ?? initialValue, index);
          },
          {
            defer: true,
          }
        )
      );
    })
  );
}

export { onIndexedMount, onIndexedCleanup, onIndexedValueChanged };

// @region-end

// @region-begin

/**
 * Create effect for mount of element from {@link mapArray}.
 */
function onMappedMount<TElement>(
  getElements: Accessor<Array<TElement>>,
  fn: (element: TElement, getIndex: Accessor<number>) => void
) {
  createEffect(
    mapArray(getElements, (element, getIndex) => {
      onMount(() => fn(element, getIndex));
    })
  );
}

/**
 * Create effect for cleanup of element from {@link mapArray}.
 */
function onMappedCleanup<TElement>(
  getElements: Accessor<Array<TElement>>,
  fn: (element: TElement, getIndex: Accessor<number>) => void
) {
  createEffect(
    mapArray(getElements, (element, getIndex) => {
      onCleanup(() => fn(element, getIndex));
    })
  );
}

/**
 * Create effect for changed index of element from {@link mapArray}.
 * @remarks
 * Deferred.
 */
function onMappedIndexChange<T>(
  getElements: Accessor<Array<T>>,
  fn: (element: T, index: number, prevIndex: number) => void
) {
  createEffect(
    mapArray(getElements, (element, getIndex) => {
      const initialIndex = getIndex(); // fixes https://github.com/solidjs/solid/issues/2065

      createEffect(
        on(
          getIndex,
          (inputIndex, prevInputIndex) => {
            fn(element, inputIndex, prevInputIndex ?? initialIndex);
          },
          {
            defer: true,
          }
        )
      );
    })
  );
}

export { onMappedCleanup, onMappedMount, onMappedIndexChange };

// @region-end

// @region-begin MapResult

/**
 * Result of {@link mapArray}, where the result is reactive.
 */
type MapResult<TElement, TResult> = [TElement, Accessor<TResult>];

/**
 * Create a memo of {@link MapResult}.
 * @param list used to map.
 * @param mapFn function used to create {@link MapResult}.
 */
function createMapResults<TElement, TResult>(
  list: Accessor<Array<TElement>>,
  mapFn: (element: TElement, getIndex: Accessor<number>) => TResult
): Accessor<Array<MapResult<TElement, TResult>>> {
  return mapArray(list, (element, getIndex) => [
    element,
    createMemo(() => mapFn(element, getIndex)),
  ]);
}

// @region-end

// @region-begin MappedMapResult

/**
 * Create effect for mount of {@link MapResult} from {@link mapArray}.
 * @remarks
 * Useful to create objects in other systems.
 */
function onMappedMapResultMount<TElement, TResult>(
  getMapResults: Accessor<Array<MapResult<TElement, TResult>>>,
  fn: (element: TElement, result: TResult, getIndex: Accessor<number>) => void
): void {
  createEffect(
    mapArray(getMapResults, ([element, getResult], getIndex) =>
      onMount(() => fn(element, getResult(), getIndex))
    )
  );
}

/**
 * Create effect for cleanup of {@link MapResult} from {@link mapArray}.
 * @remarks
 * Useful to delete objects in other systems.
 */
function onMappedMapResultCleanup<TElement, TResult>(
  getMapResults: Accessor<Array<MapResult<TElement, TResult>>>,
  fn: (element: TElement, result: TResult) => void
): void {
  createEffect(
    mapArray(getMapResults, ([element, getResult]) =>
      onCleanup(() => fn(element, getResult()))
    )
  );
}

/**
 * Create effect for changed value of {@link MapResult} from {@link mapArray}.
 * @see {@link onMappedMapResultMount} for mount effects.
 * @see {@link onMappedMapResultCleanup} for cleanup effects.
 * @param getMapResult get mapped results.
 * @param fn function to run when a result changes.
 * @remarks
 * Deferred.
 * Useful to update objects in other system. eg, writing transform position to a graphics or physics engine.
 */
function onMappedMapResultValueChange<TElement, TResult>(
  getMapResult: Accessor<Array<MapResult<TElement, TResult>>>,
  fn: (
    element: TElement,
    getIndex: Accessor<number>,
    result: TResult,
    prevResult: TResult
  ) => TResult
): void {
  createEffect(
    mapArray(getMapResult, ([element, getResult], getIndex) => {
      const initialResult = getResult(); // fixes https://github.com/solidjs/solid/issues/2065
      createEffect(
        on(
          getResult,
          (inputResult, prevInputResult) => {
            fn(
              element,
              getIndex,
              inputResult,
              prevInputResult ?? initialResult
            );
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
function onMappedMapResultIndexChange<TElement, TResult>(
  getMapResults: Accessor<Array<MapResult<TElement, TResult>>>,
  fn: (
    element: TElement,
    getResult: Accessor<TResult>,
    index: number,
    prevIndex: number
  ) => void
) {
  createEffect(
    mapArray(getMapResults, ([element, getResult], getIndex) => {
      const initialIndex = getIndex(); // fixes https://github.com/solidjs/solid/issues/2065
      createEffect(
        on(
          getIndex,
          (inputIndex, prevInputIndex) => {
            fn(element, getResult, inputIndex, prevInputIndex ?? initialIndex);
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
  createMapResults,
  onMappedMapResultValueChange,
  onMappedMapResultMount,
  onMappedMapResultCleanup,
  onMappedMapResultIndexChange,
};
