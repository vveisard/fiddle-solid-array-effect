# Concepts

Types and primitives for `mapArray` and `indexArray`.

## Mapped

### `onMappedMount`

Invokes mount function for a value of a list.

### `onMappedCleanup`

Invokes cleanup function for a value of a list.

### `onMappedIndexChange`

Invokes change function for a value of a list when the index changes with the previous index and current index.

## Indexed

### `onIndexedMount`

Invokes mount function for an index of a list.

### `onIndexedCleanup`

Invokes cleanup function for an index of a list.

### `onIndexedValueChange`

Invokes change function for an index of a list when the value changes with the previous value and current value.

## MapResult

Result of `mapArray`, where the result of `mapFn` is an `Acessor`. Used for higher-order reactivity.

`type MapResult<TElement, TResult> = [TElement, Accessor<TResult>]` tuple of source element and accessor for the result of the `mapFn`.

Ideal for keyed data structures; ie, the source element is a key, and the result is derived from the value.

### Primitives

Primitives are included.

#### `createMapResults`

Create `Accessor` for an `Array` of `MapResult` using `mapArray`. ie, creates `Acessor<Array<MapResult>>`.

#### `onMappedMapResultMount`

Invokes mount function for a `MapResult` with the initial value of the reuslt.

#### `onMappedMapResultCleanup`

Invokes cleanup function for a `MapResult` with the last value of the result.

#### `onMappedMapResultValueChange`

Invokes change function for a `MapResult` with previous value of the result, and the current value of the result.

#### `onMappedMapResultIndexChange`

Invokes change function for a `MapResult`, with previous index of that `MapResult`, and current index of that `MapResult`.

# Future

Hypothetically there could be:

- `IndexedMapResult...` primtives
- `IndexResult` type with `MappedIndexResult...` and `IndexedIndexResult..` primitives

The use of these is unclear to me.
