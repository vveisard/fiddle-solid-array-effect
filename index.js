// node_modules/solid-js/dist/solid.js
var setHydrateContext = function(context) {
  sharedConfig.context = context;
};
var createRoot = function(fn, detachedOwner) {
  const listener = Listener, owner = Owner, unowned = fn.length === 0, current = detachedOwner === undefined ? owner : detachedOwner, root = unowned ? UNOWNED : {
    owned: null,
    cleanups: null,
    context: current ? current.context : null,
    owner: current
  }, updateFn = unowned ? fn : () => fn(() => untrack(() => cleanNode(root)));
  Owner = root;
  Listener = null;
  try {
    return runUpdates(updateFn, true);
  } finally {
    Listener = listener;
    Owner = owner;
  }
};
var createSignal = function(value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const s = {
    value,
    observers: null,
    observerSlots: null,
    comparator: options.equals || undefined
  };
  const setter = (value2) => {
    if (typeof value2 === "function") {
      if (Transition && Transition.running && Transition.sources.has(s))
        value2 = value2(s.tValue);
      else
        value2 = value2(s.value);
    }
    return writeSignal(s, value2);
  };
  return [readSignal.bind(s), setter];
};
var createRenderEffect = function(fn, value, options) {
  const c = createComputation(fn, value, false, STALE);
  if (Scheduler && Transition && Transition.running)
    Updates.push(c);
  else
    updateComputation(c);
};
var createEffect = function(fn, value, options) {
  runEffects = runUserEffects;
  const c = createComputation(fn, value, false, STALE), s = SuspenseContext && useContext(SuspenseContext);
  if (s)
    c.suspense = s;
  if (!options || !options.render)
    c.user = true;
  Effects ? Effects.push(c) : updateComputation(c);
};
var createMemo = function(fn, value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const c = createComputation(fn, value, true, 0);
  c.observers = null;
  c.observerSlots = null;
  c.comparator = options.equals || undefined;
  if (Scheduler && Transition && Transition.running) {
    c.tState = STALE;
    Updates.push(c);
  } else
    updateComputation(c);
  return readSignal.bind(c);
};
var batch = function(fn) {
  return runUpdates(fn, false);
};
var untrack = function(fn) {
  if (Listener === null)
    return fn();
  const listener = Listener;
  Listener = null;
  try {
    return fn();
  } finally {
    Listener = listener;
  }
};
var on = function(deps, fn, options) {
  const isArray = Array.isArray(deps);
  let prevInput;
  let defer = options && options.defer;
  return (prevValue) => {
    let input;
    if (isArray) {
      input = Array(deps.length);
      for (let i = 0;i < deps.length; i++)
        input[i] = deps[i]();
    } else
      input = deps();
    if (defer) {
      defer = false;
      return;
    }
    const result = untrack(() => fn(input, prevInput, prevValue));
    prevInput = input;
    return result;
  };
};
var onMount = function(fn) {
  createEffect(() => untrack(fn));
};
var onCleanup = function(fn) {
  if (Owner === null)
    ;
  else if (Owner.cleanups === null)
    Owner.cleanups = [fn];
  else
    Owner.cleanups.push(fn);
  return fn;
};
var getListener = function() {
  return Listener;
};
var startTransition = function(fn) {
  if (Transition && Transition.running) {
    fn();
    return Transition.done;
  }
  const l = Listener;
  const o = Owner;
  return Promise.resolve().then(() => {
    Listener = l;
    Owner = o;
    let t;
    if (Scheduler || SuspenseContext) {
      t = Transition || (Transition = {
        sources: new Set,
        effects: [],
        promises: new Set,
        disposed: new Set,
        queue: new Set,
        running: true
      });
      t.done || (t.done = new Promise((res) => t.resolve = res));
      t.running = true;
    }
    runUpdates(fn, false);
    Listener = Owner = null;
    return t ? t.done : undefined;
  });
};
var createContext = function(defaultValue, options) {
  const id = Symbol("context");
  return {
    id,
    Provider: createProvider(id),
    defaultValue
  };
};
var useContext = function(context) {
  return Owner && Owner.context && Owner.context[context.id] !== undefined ? Owner.context[context.id] : context.defaultValue;
};
var children = function(fn) {
  const children2 = createMemo(fn);
  const memo = createMemo(() => resolveChildren(children2()));
  memo.toArray = () => {
    const c = memo();
    return Array.isArray(c) ? c : c != null ? [c] : [];
  };
  return memo;
};
var readSignal = function() {
  const runningTransition = Transition && Transition.running;
  if (this.sources && (runningTransition ? this.tState : this.state)) {
    if ((runningTransition ? this.tState : this.state) === STALE)
      updateComputation(this);
    else {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(this), false);
      Updates = updates;
    }
  }
  if (Listener) {
    const sSlot = this.observers ? this.observers.length : 0;
    if (!Listener.sources) {
      Listener.sources = [this];
      Listener.sourceSlots = [sSlot];
    } else {
      Listener.sources.push(this);
      Listener.sourceSlots.push(sSlot);
    }
    if (!this.observers) {
      this.observers = [Listener];
      this.observerSlots = [Listener.sources.length - 1];
    } else {
      this.observers.push(Listener);
      this.observerSlots.push(Listener.sources.length - 1);
    }
  }
  if (runningTransition && Transition.sources.has(this))
    return this.tValue;
  return this.value;
};
var writeSignal = function(node, value, isComp) {
  let current = Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value;
  if (!node.comparator || !node.comparator(current, value)) {
    if (Transition) {
      const TransitionRunning = Transition.running;
      if (TransitionRunning || !isComp && Transition.sources.has(node)) {
        Transition.sources.add(node);
        node.tValue = value;
      }
      if (!TransitionRunning)
        node.value = value;
    } else
      node.value = value;
    if (node.observers && node.observers.length) {
      runUpdates(() => {
        for (let i = 0;i < node.observers.length; i += 1) {
          const o = node.observers[i];
          const TransitionRunning = Transition && Transition.running;
          if (TransitionRunning && Transition.disposed.has(o))
            continue;
          if (TransitionRunning ? !o.tState : !o.state) {
            if (o.pure)
              Updates.push(o);
            else
              Effects.push(o);
            if (o.observers)
              markDownstream(o);
          }
          if (!TransitionRunning)
            o.state = STALE;
          else
            o.tState = STALE;
        }
        if (Updates.length > 1e6) {
          Updates = [];
          if (false)
            ;
          throw new Error;
        }
      }, false);
    }
  }
  return value;
};
var updateComputation = function(node) {
  if (!node.fn)
    return;
  cleanNode(node);
  const time = ExecCount;
  runComputation(node, Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value, time);
  if (Transition && !Transition.running && Transition.sources.has(node)) {
    queueMicrotask(() => {
      runUpdates(() => {
        Transition && (Transition.running = true);
        Listener = Owner = node;
        runComputation(node, node.tValue, time);
        Listener = Owner = null;
      }, false);
    });
  }
};
var runComputation = function(node, value, time) {
  let nextValue;
  const owner = Owner, listener = Listener;
  Listener = Owner = node;
  try {
    nextValue = node.fn(value);
  } catch (err) {
    if (node.pure) {
      if (Transition && Transition.running) {
        node.tState = STALE;
        node.tOwned && node.tOwned.forEach(cleanNode);
        node.tOwned = undefined;
      } else {
        node.state = STALE;
        node.owned && node.owned.forEach(cleanNode);
        node.owned = null;
      }
    }
    node.updatedAt = time + 1;
    return handleError(err);
  } finally {
    Listener = listener;
    Owner = owner;
  }
  if (!node.updatedAt || node.updatedAt <= time) {
    if (node.updatedAt != null && "observers" in node) {
      writeSignal(node, nextValue, true);
    } else if (Transition && Transition.running && node.pure) {
      Transition.sources.add(node);
      node.tValue = nextValue;
    } else
      node.value = nextValue;
    node.updatedAt = time;
  }
};
var createComputation = function(fn, init, pure, state = STALE, options) {
  const c = {
    fn,
    state,
    updatedAt: null,
    owned: null,
    sources: null,
    sourceSlots: null,
    cleanups: null,
    value: init,
    owner: Owner,
    context: Owner ? Owner.context : null,
    pure
  };
  if (Transition && Transition.running) {
    c.state = 0;
    c.tState = state;
  }
  if (Owner === null)
    ;
  else if (Owner !== UNOWNED) {
    if (Transition && Transition.running && Owner.pure) {
      if (!Owner.tOwned)
        Owner.tOwned = [c];
      else
        Owner.tOwned.push(c);
    } else {
      if (!Owner.owned)
        Owner.owned = [c];
      else
        Owner.owned.push(c);
    }
  }
  if (ExternalSourceFactory) {
    const [track, trigger] = createSignal(undefined, {
      equals: false
    });
    const ordinary = ExternalSourceFactory(c.fn, trigger);
    onCleanup(() => ordinary.dispose());
    const triggerInTransition = () => startTransition(trigger).then(() => inTransition.dispose());
    const inTransition = ExternalSourceFactory(c.fn, triggerInTransition);
    c.fn = (x) => {
      track();
      return Transition && Transition.running ? inTransition.track(x) : ordinary.track(x);
    };
  }
  return c;
};
var runTop = function(node) {
  const runningTransition = Transition && Transition.running;
  if ((runningTransition ? node.tState : node.state) === 0)
    return;
  if ((runningTransition ? node.tState : node.state) === PENDING)
    return lookUpstream(node);
  if (node.suspense && untrack(node.suspense.inFallback))
    return node.suspense.effects.push(node);
  const ancestors = [node];
  while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
    if (runningTransition && Transition.disposed.has(node))
      return;
    if (runningTransition ? node.tState : node.state)
      ancestors.push(node);
  }
  for (let i = ancestors.length - 1;i >= 0; i--) {
    node = ancestors[i];
    if (runningTransition) {
      let top = node, prev = ancestors[i + 1];
      while ((top = top.owner) && top !== prev) {
        if (Transition.disposed.has(top))
          return;
      }
    }
    if ((runningTransition ? node.tState : node.state) === STALE) {
      updateComputation(node);
    } else if ((runningTransition ? node.tState : node.state) === PENDING) {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(node, ancestors[0]), false);
      Updates = updates;
    }
  }
};
var runUpdates = function(fn, init) {
  if (Updates)
    return fn();
  let wait = false;
  if (!init)
    Updates = [];
  if (Effects)
    wait = true;
  else
    Effects = [];
  ExecCount++;
  try {
    const res = fn();
    completeUpdates(wait);
    return res;
  } catch (err) {
    if (!wait)
      Effects = null;
    Updates = null;
    handleError(err);
  }
};
var completeUpdates = function(wait) {
  if (Updates) {
    if (Scheduler && Transition && Transition.running)
      scheduleQueue(Updates);
    else
      runQueue(Updates);
    Updates = null;
  }
  if (wait)
    return;
  let res;
  if (Transition) {
    if (!Transition.promises.size && !Transition.queue.size) {
      const sources = Transition.sources;
      const disposed = Transition.disposed;
      Effects.push.apply(Effects, Transition.effects);
      res = Transition.resolve;
      for (const e2 of Effects) {
        "tState" in e2 && (e2.state = e2.tState);
        delete e2.tState;
      }
      Transition = null;
      runUpdates(() => {
        for (const d of disposed)
          cleanNode(d);
        for (const v of sources) {
          v.value = v.tValue;
          if (v.owned) {
            for (let i = 0, len = v.owned.length;i < len; i++)
              cleanNode(v.owned[i]);
          }
          if (v.tOwned)
            v.owned = v.tOwned;
          delete v.tValue;
          delete v.tOwned;
          v.tState = 0;
        }
        setTransPending(false);
      }, false);
    } else if (Transition.running) {
      Transition.running = false;
      Transition.effects.push.apply(Transition.effects, Effects);
      Effects = null;
      setTransPending(true);
      return;
    }
  }
  const e = Effects;
  Effects = null;
  if (e.length)
    runUpdates(() => runEffects(e), false);
  if (res)
    res();
};
var runQueue = function(queue) {
  for (let i = 0;i < queue.length; i++)
    runTop(queue[i]);
};
var scheduleQueue = function(queue) {
  for (let i = 0;i < queue.length; i++) {
    const item = queue[i];
    const tasks = Transition.queue;
    if (!tasks.has(item)) {
      tasks.add(item);
      Scheduler(() => {
        tasks.delete(item);
        runUpdates(() => {
          Transition.running = true;
          runTop(item);
        }, false);
        Transition && (Transition.running = false);
      });
    }
  }
};
var runUserEffects = function(queue) {
  let i, userLength = 0;
  for (i = 0;i < queue.length; i++) {
    const e = queue[i];
    if (!e.user)
      runTop(e);
    else
      queue[userLength++] = e;
  }
  if (sharedConfig.context) {
    if (sharedConfig.count) {
      sharedConfig.effects || (sharedConfig.effects = []);
      sharedConfig.effects.push(...queue.slice(0, userLength));
      return;
    } else if (sharedConfig.effects) {
      queue = [...sharedConfig.effects, ...queue];
      userLength += sharedConfig.effects.length;
      delete sharedConfig.effects;
    }
    setHydrateContext();
  }
  for (i = 0;i < userLength; i++)
    runTop(queue[i]);
};
var lookUpstream = function(node, ignore) {
  const runningTransition = Transition && Transition.running;
  if (runningTransition)
    node.tState = 0;
  else
    node.state = 0;
  for (let i = 0;i < node.sources.length; i += 1) {
    const source = node.sources[i];
    if (source.sources) {
      const state = runningTransition ? source.tState : source.state;
      if (state === STALE) {
        if (source !== ignore && (!source.updatedAt || source.updatedAt < ExecCount))
          runTop(source);
      } else if (state === PENDING)
        lookUpstream(source, ignore);
    }
  }
};
var markDownstream = function(node) {
  const runningTransition = Transition && Transition.running;
  for (let i = 0;i < node.observers.length; i += 1) {
    const o = node.observers[i];
    if (runningTransition ? !o.tState : !o.state) {
      if (runningTransition)
        o.tState = PENDING;
      else
        o.state = PENDING;
      if (o.pure)
        Updates.push(o);
      else
        Effects.push(o);
      o.observers && markDownstream(o);
    }
  }
};
var cleanNode = function(node) {
  let i;
  if (node.sources) {
    while (node.sources.length) {
      const source = node.sources.pop(), index = node.sourceSlots.pop(), obs = source.observers;
      if (obs && obs.length) {
        const n = obs.pop(), s = source.observerSlots.pop();
        if (index < obs.length) {
          n.sourceSlots[s] = index;
          obs[index] = n;
          source.observerSlots[index] = s;
        }
      }
    }
  }
  if (Transition && Transition.running && node.pure) {
    if (node.tOwned) {
      for (i = node.tOwned.length - 1;i >= 0; i--)
        cleanNode(node.tOwned[i]);
      delete node.tOwned;
    }
    reset(node, true);
  } else if (node.owned) {
    for (i = node.owned.length - 1;i >= 0; i--)
      cleanNode(node.owned[i]);
    node.owned = null;
  }
  if (node.cleanups) {
    for (i = node.cleanups.length - 1;i >= 0; i--)
      node.cleanups[i]();
    node.cleanups = null;
  }
  if (Transition && Transition.running)
    node.tState = 0;
  else
    node.state = 0;
};
var reset = function(node, top) {
  if (!top) {
    node.tState = 0;
    Transition.disposed.add(node);
  }
  if (node.owned) {
    for (let i = 0;i < node.owned.length; i++)
      reset(node.owned[i]);
  }
};
var castError = function(err) {
  if (err instanceof Error)
    return err;
  return new Error(typeof err === "string" ? err : "Unknown error", {
    cause: err
  });
};
var runErrors = function(err, fns, owner) {
  try {
    for (const f of fns)
      f(err);
  } catch (e) {
    handleError(e, owner && owner.owner || null);
  }
};
var handleError = function(err, owner = Owner) {
  const fns = ERROR && owner && owner.context && owner.context[ERROR];
  const error = castError(err);
  if (!fns)
    throw error;
  if (Effects)
    Effects.push({
      fn() {
        runErrors(error, fns, owner);
      },
      state: STALE
    });
  else
    runErrors(error, fns, owner);
};
var resolveChildren = function(children2) {
  if (typeof children2 === "function" && !children2.length)
    return resolveChildren(children2());
  if (Array.isArray(children2)) {
    const results = [];
    for (let i = 0;i < children2.length; i++) {
      const result = resolveChildren(children2[i]);
      Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
    }
    return results;
  }
  return children2;
};
var createProvider = function(id, options) {
  return function provider(props) {
    let res;
    createRenderEffect(() => res = untrack(() => {
      Owner.context = {
        ...Owner.context,
        [id]: props.value
      };
      return children(() => props.children);
    }), undefined);
    return res;
  };
};
var dispose = function(d) {
  for (let i = 0;i < d.length; i++)
    d[i]();
};
var mapArray = function(list, mapFn, options = {}) {
  let items = [], mapped = [], disposers = [], len = 0, indexes = mapFn.length > 1 ? [] : null;
  onCleanup(() => dispose(disposers));
  return () => {
    let newItems = list() || [], i, j;
    newItems[$TRACK];
    return untrack(() => {
      let newLen = newItems.length, newIndices, newIndicesNext, temp, tempdisposers, tempIndexes, start, end, newEnd, item;
      if (newLen === 0) {
        if (len !== 0) {
          dispose(disposers);
          disposers = [];
          items = [];
          mapped = [];
          len = 0;
          indexes && (indexes = []);
        }
        if (options.fallback) {
          items = [FALLBACK];
          mapped[0] = createRoot((disposer) => {
            disposers[0] = disposer;
            return options.fallback();
          });
          len = 1;
        }
      } else if (len === 0) {
        mapped = new Array(newLen);
        for (j = 0;j < newLen; j++) {
          items[j] = newItems[j];
          mapped[j] = createRoot(mapper);
        }
        len = newLen;
      } else {
        temp = new Array(newLen);
        tempdisposers = new Array(newLen);
        indexes && (tempIndexes = new Array(newLen));
        for (start = 0, end = Math.min(len, newLen);start < end && items[start] === newItems[start]; start++)
          ;
        for (end = len - 1, newEnd = newLen - 1;end >= start && newEnd >= start && items[end] === newItems[newEnd]; end--, newEnd--) {
          temp[newEnd] = mapped[end];
          tempdisposers[newEnd] = disposers[end];
          indexes && (tempIndexes[newEnd] = indexes[end]);
        }
        newIndices = new Map;
        newIndicesNext = new Array(newEnd + 1);
        for (j = newEnd;j >= start; j--) {
          item = newItems[j];
          i = newIndices.get(item);
          newIndicesNext[j] = i === undefined ? -1 : i;
          newIndices.set(item, j);
        }
        for (i = start;i <= end; i++) {
          item = items[i];
          j = newIndices.get(item);
          if (j !== undefined && j !== -1) {
            temp[j] = mapped[i];
            tempdisposers[j] = disposers[i];
            indexes && (tempIndexes[j] = indexes[i]);
            j = newIndicesNext[j];
            newIndices.set(item, j);
          } else
            disposers[i]();
        }
        for (j = start;j < newLen; j++) {
          if (j in temp) {
            mapped[j] = temp[j];
            disposers[j] = tempdisposers[j];
            if (indexes) {
              indexes[j] = tempIndexes[j];
              indexes[j](j);
            }
          } else
            mapped[j] = createRoot(mapper);
        }
        mapped = mapped.slice(0, len = newLen);
        items = newItems.slice(0);
      }
      return mapped;
    });
    function mapper(disposer) {
      disposers[j] = disposer;
      if (indexes) {
        const [s, set] = createSignal(j);
        indexes[j] = set;
        return mapFn(newItems[j], s);
      }
      return mapFn(newItems[j]);
    }
  };
};
var indexArray = function(list, mapFn, options = {}) {
  let items = [], mapped = [], disposers = [], signals = [], len = 0, i;
  onCleanup(() => dispose(disposers));
  return () => {
    const newItems = list() || [];
    newItems[$TRACK];
    return untrack(() => {
      if (newItems.length === 0) {
        if (len !== 0) {
          dispose(disposers);
          disposers = [];
          items = [];
          mapped = [];
          len = 0;
          signals = [];
        }
        if (options.fallback) {
          items = [FALLBACK];
          mapped[0] = createRoot((disposer) => {
            disposers[0] = disposer;
            return options.fallback();
          });
          len = 1;
        }
        return mapped;
      }
      if (items[0] === FALLBACK) {
        disposers[0]();
        disposers = [];
        items = [];
        mapped = [];
        len = 0;
      }
      for (i = 0;i < newItems.length; i++) {
        if (i < items.length && items[i] !== newItems[i]) {
          signals[i](() => newItems[i]);
        } else if (i >= items.length) {
          mapped[i] = createRoot(mapper);
        }
      }
      for (;i < items.length; i++) {
        disposers[i]();
      }
      len = signals.length = disposers.length = newItems.length;
      items = newItems.slice(0);
      return mapped = mapped.slice(0, len);
    });
    function mapper(disposer) {
      disposers[i] = disposer;
      const [s, set] = createSignal(newItems[i]);
      signals[i] = set;
      return mapFn(s, i);
    }
  };
};
var sharedConfig = {
  context: undefined,
  registry: undefined
};
var equalFn = (a, b) => a === b;
var $PROXY = Symbol("solid-proxy");
var $TRACK = Symbol("solid-track");
var $DEVCOMP = Symbol("solid-dev-component");
var signalOptions = {
  equals: equalFn
};
var ERROR = null;
var runEffects = runQueue;
var STALE = 1;
var PENDING = 2;
var UNOWNED = {
  owned: null,
  cleanups: null,
  context: null,
  owner: null
};
var Owner = null;
var Transition = null;
var Scheduler = null;
var ExternalSourceFactory = null;
var Listener = null;
var Updates = null;
var Effects = null;
var ExecCount = 0;
var [transPending, setTransPending] = createSignal(false);
var SuspenseContext;
var FALLBACK = Symbol("fallback");
var SuspenseListContext = createContext();

// node_modules/solid-js/store/dist/store.js
var wrap$1 = function(value) {
  let p = value[$PROXY];
  if (!p) {
    Object.defineProperty(value, $PROXY, {
      value: p = new Proxy(value, proxyTraps$1)
    });
    if (!Array.isArray(value)) {
      const keys = Object.keys(value), desc = Object.getOwnPropertyDescriptors(value);
      for (let i = 0, l = keys.length;i < l; i++) {
        const prop = keys[i];
        if (desc[prop].get) {
          Object.defineProperty(value, prop, {
            enumerable: desc[prop].enumerable,
            get: desc[prop].get.bind(p)
          });
        }
      }
    }
  }
  return p;
};
var isWrappable = function(obj) {
  let proto;
  return obj != null && typeof obj === "object" && (obj[$PROXY] || !(proto = Object.getPrototypeOf(obj)) || proto === Object.prototype || Array.isArray(obj));
};
var unwrap = function(item, set = new Set) {
  let result, unwrapped, v, prop;
  if (result = item != null && item[$RAW])
    return result;
  if (!isWrappable(item) || set.has(item))
    return item;
  if (Array.isArray(item)) {
    if (Object.isFrozen(item))
      item = item.slice(0);
    else
      set.add(item);
    for (let i = 0, l = item.length;i < l; i++) {
      v = item[i];
      if ((unwrapped = unwrap(v, set)) !== v)
        item[i] = unwrapped;
    }
  } else {
    if (Object.isFrozen(item))
      item = Object.assign({}, item);
    else
      set.add(item);
    const keys = Object.keys(item), desc = Object.getOwnPropertyDescriptors(item);
    for (let i = 0, l = keys.length;i < l; i++) {
      prop = keys[i];
      if (desc[prop].get)
        continue;
      v = item[prop];
      if ((unwrapped = unwrap(v, set)) !== v)
        item[prop] = unwrapped;
    }
  }
  return item;
};
var getNodes = function(target, symbol) {
  let nodes = target[symbol];
  if (!nodes)
    Object.defineProperty(target, symbol, {
      value: nodes = Object.create(null)
    });
  return nodes;
};
var getNode = function(nodes, property, value) {
  if (nodes[property])
    return nodes[property];
  const [s, set] = createSignal(value, {
    equals: false,
    internal: true
  });
  s.$ = set;
  return nodes[property] = s;
};
var proxyDescriptor$1 = function(target, property) {
  const desc = Reflect.getOwnPropertyDescriptor(target, property);
  if (!desc || desc.get || !desc.configurable || property === $PROXY || property === $NODE)
    return desc;
  delete desc.value;
  delete desc.writable;
  desc.get = () => target[$PROXY][property];
  return desc;
};
var trackSelf = function(target) {
  getListener() && getNode(getNodes(target, $NODE), $SELF)();
};
var ownKeys = function(target) {
  trackSelf(target);
  return Reflect.ownKeys(target);
};
var setProperty = function(state, property, value, deleting = false) {
  if (!deleting && state[property] === value)
    return;
  const prev = state[property], len = state.length;
  if (value === undefined) {
    delete state[property];
    if (state[$HAS] && state[$HAS][property] && prev !== undefined)
      state[$HAS][property].$();
  } else {
    state[property] = value;
    if (state[$HAS] && state[$HAS][property] && prev === undefined)
      state[$HAS][property].$();
  }
  let nodes = getNodes(state, $NODE), node;
  if (node = getNode(nodes, property, prev))
    node.$(() => value);
  if (Array.isArray(state) && state.length !== len) {
    for (let i = state.length;i < len; i++)
      (node = nodes[i]) && node.$();
    (node = getNode(nodes, "length", len)) && node.$(state.length);
  }
  (node = nodes[$SELF]) && node.$();
};
var mergeStoreNode = function(state, value) {
  const keys = Object.keys(value);
  for (let i = 0;i < keys.length; i += 1) {
    const key = keys[i];
    setProperty(state, key, value[key]);
  }
};
var updateArray = function(current, next) {
  if (typeof next === "function")
    next = next(current);
  next = unwrap(next);
  if (Array.isArray(next)) {
    if (current === next)
      return;
    let i = 0, len = next.length;
    for (;i < len; i++) {
      const value = next[i];
      if (current[i] !== value)
        setProperty(current, i, value);
    }
    setProperty(current, "length", len);
  } else
    mergeStoreNode(current, next);
};
var updatePath = function(current, path, traversed = []) {
  let part, prev = current;
  if (path.length > 1) {
    part = path.shift();
    const partType = typeof part, isArray = Array.isArray(current);
    if (Array.isArray(part)) {
      for (let i = 0;i < part.length; i++) {
        updatePath(current, [part[i]].concat(path), traversed);
      }
      return;
    } else if (isArray && partType === "function") {
      for (let i = 0;i < current.length; i++) {
        if (part(current[i], i))
          updatePath(current, [i].concat(path), traversed);
      }
      return;
    } else if (isArray && partType === "object") {
      const { from = 0, to = current.length - 1, by = 1 } = part;
      for (let i = from;i <= to; i += by) {
        updatePath(current, [i].concat(path), traversed);
      }
      return;
    } else if (path.length > 1) {
      updatePath(current[part], path, [part].concat(traversed));
      return;
    }
    prev = current[part];
    traversed = [part].concat(traversed);
  }
  let value = path[0];
  if (typeof value === "function") {
    value = value(prev, traversed);
    if (value === prev)
      return;
  }
  if (part === undefined && value == undefined)
    return;
  value = unwrap(value);
  if (part === undefined || isWrappable(prev) && isWrappable(value) && !Array.isArray(value)) {
    mergeStoreNode(prev, value);
  } else
    setProperty(current, part, value);
};
var createStore = function(...[store, options]) {
  const unwrappedStore = unwrap(store || {});
  const isArray = Array.isArray(unwrappedStore);
  const wrappedStore = wrap$1(unwrappedStore);
  function setStore(...args) {
    batch(() => {
      isArray && args.length === 1 ? updateArray(unwrappedStore, args[0]) : updatePath(unwrappedStore, args);
    });
  }
  return [wrappedStore, setStore];
};
var produce = function(fn) {
  return (state) => {
    if (isWrappable(state)) {
      let proxy;
      if (!(proxy = producers.get(state))) {
        producers.set(state, proxy = new Proxy(state, setterTraps));
      }
      fn(proxy);
    }
    return state;
  };
};
var $RAW = Symbol("store-raw");
var $NODE = Symbol("store-node");
var $HAS = Symbol("store-has");
var $SELF = Symbol("store-self");
var proxyTraps$1 = {
  get(target, property, receiver) {
    if (property === $RAW)
      return target;
    if (property === $PROXY)
      return receiver;
    if (property === $TRACK) {
      trackSelf(target);
      return receiver;
    }
    const nodes = getNodes(target, $NODE);
    const tracked = nodes[property];
    let value = tracked ? tracked() : target[property];
    if (property === $NODE || property === $HAS || property === "__proto__")
      return value;
    if (!tracked) {
      const desc = Object.getOwnPropertyDescriptor(target, property);
      if (getListener() && (typeof value !== "function" || target.hasOwnProperty(property)) && !(desc && desc.get))
        value = getNode(nodes, property, value)();
    }
    return isWrappable(value) ? wrap$1(value) : value;
  },
  has(target, property) {
    if (property === $RAW || property === $PROXY || property === $TRACK || property === $NODE || property === $HAS || property === "__proto__")
      return true;
    getListener() && getNode(getNodes(target, $HAS), property)();
    return property in target;
  },
  set() {
    return true;
  },
  deleteProperty() {
    return true;
  },
  ownKeys,
  getOwnPropertyDescriptor: proxyDescriptor$1
};
var $ROOT = Symbol("store-root");
var producers = new WeakMap;
var setterTraps = {
  get(target, property) {
    if (property === $RAW)
      return target;
    const value = target[property];
    let proxy;
    return isWrappable(value) ? producers.get(value) || (producers.set(value, proxy = new Proxy(value, setterTraps)), proxy) : value;
  },
  set(target, property, value) {
    setProperty(target, property, unwrap(value));
    return true;
  },
  deleteProperty(target, property) {
    setProperty(target, property, undefined, true);
    return true;
  }
};

// src/index.ts
var onIndexArrayMount = function(getValue, fn) {
  createEffect(indexArray(getValue, (getValue2, index) => {
    onMount(() => fn(getValue2, index));
  }));
};
var onIndexArrayCleanup = function(getValues, fn) {
  createEffect(indexArray(getValues, (getValue, index) => {
    onCleanup(() => fn(getValue, index));
  }));
};
var createIndexArrayOnValueChangeEffect = function(getValues, fn) {
  createEffect(indexArray(getValues, (getValue, index) => {
    const initialValue = getValue();
    createEffect(on(getValue, (inputValue, prevInputValue) => {
      fn(inputValue, prevInputValue ?? initialValue, index);
    }, {
      defer: true
    }));
  }));
};
var onMapArrayMount = function(getValues, fn) {
  createEffect(mapArray(getValues, (value, getIndex) => {
    onMount(() => fn(value, getIndex));
  }));
};
var onMapArrayCleanup = function(getValues, fn) {
  createEffect(mapArray(getValues, (value, getIndex) => {
    onCleanup(() => fn(value, getIndex));
  }));
};
var createMapArrayOnIndexChangeEffect = function(getValues, fn) {
  createEffect(mapArray(getValues, (value, getIndex) => {
    const initialIndex = getIndex();
    createEffect(on(getIndex, (inputIndex, prevInputIndex) => {
      fn(value, inputIndex, prevInputIndex ?? initialIndex);
    }, {
      defer: true
    }));
  }));
};
var onMapArrayResultMount = function(list, mapFn, fn) {
  createEffect(mapArray(list, (value, getIndex) => {
    const getMapResult = createMemo(() => mapFn(value, getIndex));
    onMount(() => fn(value, getIndex, getMapResult));
  }));
};
var onMapArrayResultCleanup = function(list, mapFn, fn) {
  createEffect(mapArray(list, (value, getIndex) => {
    const getMapResult = createMemo(() => mapFn(value, getIndex));
    onCleanup(() => fn(value, getIndex, getMapResult));
  }));
};
var createMapArrayResultEffect = function(list, mapFn, fn) {
  createEffect(mapArray(list, (value, getIndex) => {
    const getMapResult = createMemo(() => mapFn(value, getIndex));
    createEffect(() => fn(value, getIndex, getMapResult));
  }));
};
var createMapArrayOnResultValueChangeEffect = function(list, mapFn, fn) {
  createEffect(mapArray(list, (value, getIndex) => {
    const getMapResult = createMemo(() => mapFn(value, getIndex));
    const initialResult = getMapResult();
    createEffect(on(getMapResult, (inputResult, prevInputResult) => {
      fn(value, getIndex, inputResult, prevInputResult ?? initialResult);
    }, {
      defer: true
    }));
  }));
};
var createMapArrayOnResultIndexChangeEffect = function(list, mapFn, fn) {
  createEffect(mapArray(list, (value, getIndex) => {
    const getMapResult = createMemo(() => mapFn(value, getIndex));
    const initialIndex = getIndex();
    createEffect(on(getIndex, (inputIndex, prevInputIndex) => {
      fn(value, inputIndex, prevInputIndex ?? initialIndex, getMapResult);
    }, {
      defer: true
    }));
  }));
};

// examples/index.ts
console = new console.Console({
  stdout: process.stdout,
  stderr: process.stderr,
  groupIndentation: 2
});
var root = createRoot(() => {
  const [worldState, setWorldState] = createStore({
    borbEntityCollectionState: {
      ids: [],
      states: {}
    }
  });
  const [worldResources, setWorldResources] = createStore({
    donkResources: {}
  });
  const getAllBorbEntityIds = createMemo(() => worldState.borbEntityCollectionState.ids);
  onMapArrayMount(getAllBorbEntityIds, (element, getIndex) => {
    console.log(onMapArrayMount.name, `${element} created at index ${getIndex()}`);
  });
  onMapArrayCleanup(getAllBorbEntityIds, (element, getIndex) => {
    console.log(onMapArrayCleanup.name, `${String(element)} disposed at index ${getIndex()}`);
  });
  createMapArrayOnIndexChangeEffect(getAllBorbEntityIds, (element, index, prevIndex) => {
    console.log(createMapArrayOnIndexChangeEffect.name, `${String(element)} changed index from ${prevIndex} to ${index}`);
  });
  createMapArrayOnResultValueChangeEffect(getAllBorbEntityIds, (entityId) => worldState.borbEntityCollectionState.states[entityId].color, (entityId, getIndex, color, prevColor) => {
    console.log(createMapArrayResultEffect.name, `${entityId} color changed from ${prevColor} to ${color}`);
    return color;
  });
  onIndexArrayMount(getAllBorbEntityIds, (getElement, index) => {
    console.log(onIndexArrayMount.name, `${index} created with value ${getElement()}`);
  });
  onIndexArrayCleanup(getAllBorbEntityIds, (getElement, index) => {
    console.log(onIndexArrayCleanup.name, `index ${index} with value ${getElement()}`);
  });
  createIndexArrayOnValueChangeEffect(getAllBorbEntityIds, (element, prevElement, index) => {
    console.log(createIndexArrayOnValueChangeEffect.name, `${index} changed value from ${prevElement} to ${element}`);
  });
  onMapArrayResultMount(getAllBorbEntityIds, (entityId) => worldState.borbEntityCollectionState.states[entityId].color, (entityId, getIndex, getColor) => {
    console.log(onMapArrayResultMount.name, `${entityId} created at index ${getIndex()} with color ${getColor()}`);
  });
  onMapArrayResultCleanup(getAllBorbEntityIds, (entityId) => worldState.borbEntityCollectionState.states[entityId].color, (entityId, getIndex, getColor) => {
    console.log(onMapArrayResultCleanup.name, `${entityId} disposed at index ${getIndex()} with color ${getColor()}`);
  });
  createMapArrayOnResultValueChangeEffect(getAllBorbEntityIds, (entityId) => worldState.borbEntityCollectionState.states[entityId].color, (entityId, _getIndex, color, prevColor) => {
    console.log(createMapArrayOnResultValueChangeEffect.name, `${entityId} color changed from ${prevColor} to ${color}`);
  });
  createMapArrayOnResultIndexChangeEffect(getAllBorbEntityIds, (entityId) => worldState.borbEntityCollectionState.states[entityId].color, (entityId, index, prevIndex, getColor) => {
    console.log(createMapArrayOnResultIndexChangeEffect.name, `${entityId} index changed from ${prevIndex} to ${index} with color ${getColor()}`);
  });
  return {
    setWorldState,
    setWorldResources
  };
});
console.group(`create "a:cool"`);
root.setWorldState(produce((state) => {
  state.borbEntityCollectionState.ids.push("a:cool");
  state.borbEntityCollectionState.states["a:cool"] = {
    color: "red",
    donkContentId: "sunglasses"
  };
}));
console.groupEnd();
console.group(`create "b:rude"`);
root.setWorldState(produce((state) => {
  state.borbEntityCollectionState.ids.push("b:rude");
  state.borbEntityCollectionState.states["b:rude"] = {
    color: "yellow",
    donkContentId: "cigarette"
  };
}));
console.groupEnd();
console.group(`create "c:fun"`);
root.setWorldState(produce((state) => {
  state.borbEntityCollectionState.ids.push("c:fun");
  state.borbEntityCollectionState.states["c:fun"] = {
    color: "purple",
    donkContentId: "party-hat"
  };
}));
console.groupEnd();
console.group(`delete "b:rude"`);
root.setWorldState(produce((state) => {
  state.borbEntityCollectionState.ids.splice(state.borbEntityCollectionState.ids.indexOf("b:rude"), 1);
  delete state.borbEntityCollectionState.states["b:rude"];
}));
console.groupEnd();
console.group("create d:smart");
root.setWorldState(produce((state) => {
  state.borbEntityCollectionState.ids.push("d:smart");
  state.borbEntityCollectionState.states["d:smart"] = {
    color: "green",
    donkContentId: "glasses"
  };
}));
console.groupEnd();
console.group("change a:cool color");
root.setWorldState(produce((state) => {
  state.borbEntityCollectionState.states["a:cool"].color = "orange";
}));
console.groupEnd();
console.group("change a:cool color");
root.setWorldState(produce((state) => {
  state.borbEntityCollectionState.states["a:cool"].color = "black";
}));
console.groupEnd();
console.group(`delete "a:cool"`);
root.setWorldState(produce((state) => {
  state.borbEntityCollectionState.ids.splice(state.borbEntityCollectionState.ids.indexOf("a:cool"), 1);
  delete state.borbEntityCollectionState.states["a:cool"];
}));
console.groupEnd();
