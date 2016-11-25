// @flow

type Listener<T> = (data: T) => void;
export type SubscribeFn<T> = (fn: Listener<T>) => () => void;
export type Emitter<T> = {
  subscribe: SubscribeFn<T>;
  emit: (item: T) => void;
};

export default function emitter<T>(): Emitter<T> {
  const subscribers: Array<Listener<T>> = [];

  function subscribe(sub: Listener<T>): () => void {
    subscribers.push(sub)
    return () => { remove(subscribers, sub) };
  }

  function emit(item: T) {
    const arr = subscribers.slice()
    for (var i = 0, len =  arr.length; i < len; i++) {
      arr[i](item)
    }
  }

  return {
    subscribe,
    emit
  }
}

function remove<T>(array: Array<T>, item: T) {
  const index = array.indexOf(item)
  if(index >= 0) {
    array.splice(index, 1)
  }
}
