# :construction: redux-typed-saga

Redux-typed-saga is an alternative, well-typed take on the awesome [redux-saga](https://github.com/yelouafi/redux-saga).
The inspiration for typing side effects came from [Redux Ship](https://github.com/clarus/redux-ship).
However, Redux Ship has a totally different paradigm.

This :construction: experimental project aims to rethink redux-saga with types as first-class citizens.


## Installation and usage

```
npm install --save redux-typed-saga@https://github.com/goshakkk/redux-typed-saga.git
```

```javascript
import { createSagaMiddleware, select, put, take } from 'redux-typed-saga';
import type { Saga, SagaMiddleware } from 'redux-typed-saga';

function* saga(): Saga<Action, State, void> {
  ...
}

const sagaMiddleware: SagaMiddleware<State, Action> = createSagaMiddleware();
const store = createStore(reducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(saga());
```

## The type

The sagas will generally have a return type of `Saga<Action, State, any>` where:

* `Action` is the type of Redux actions;
* `State` is the type of Redux state;
* `any` is the return type of the saga. Top-level sagas don't usually have a return type, so `any` or `void` it is.

The type of middleware is pretty self-explanatory: `SagaMiddleware<State, Action>`.

## Commands

Commands are called using `yield*`, as opposed to `yield` in redux-saga.
The reason for this is: typing.

`yield`s are painful to type, therefore there are properly typed wrappers for commands.

* `put<Action, State>(action: Action): Saga<Action, State, void>`

  Works exactly as in redux-saga.

* `select<Action, State, A>(selector: (state: State) => A): Saga<Action, State, A>`

  Again, just like in redux-saga, it accepts a selector or type `State => A`, and returns `A`.

* `take<Action, State, A>(actionMatcher: (action: Action) => ?A): Saga<Action, State, A>`

  This one is different, however.
  The `take('ACTION_TYPE')` syntax is impossible to type correctly, and returning `Action` isn't nice.

  To work around that, `take` instead accepts a matcher function, that takes in an `Action`, and maybe returns some type `A`, which is usually:

  1. a type of single action, or
  2. a disjoint union type, if you're matching several actions

  If `null` is returned, the action is not matched, and we're waiting for other actions.

  There actually are two common uses for `take` in redux-saga:

  * `take('SOME_ACTION_TYPE')`. Its counterpart in redux-typed-saga is `take(x => x.type === 'SOME_ACTION_TYPE' ? x : null)`, and the return type will be an object type for that action.
  * `take(['ACTION1', 'ACTION2'])`. Its counterpart in redux-typed-saga is `take(x => x.type === 'ACTION1' || x.type === 'ACTION2' ? x : null)`, and the return type will be a disjoint union of these two action types.

  It is a bit more verbose, but in return, it makes your project easier to type correctly.

## Pending

The alternative for `call` is still pending implementation. It doesn't look like there is a way to make it well-typed without sacrificing its testability.

I was also inspired by arbitrary side-effect handling in Redux Ship and might end up implementing similar.

Note this is an early :construction: prototype.
It doesn't really support Redux-saga's process paradigm yet, for one.

## Example

```javascript
import { createSagaMiddleware, select, put, take } from 'redux-typed-saga';
import type { Saga, SagaMiddleware } from 'redux-typed-saga';

type State = number;
type Action = { type: 'INC' } | { type: 'DEC' } | { type: 'SET', value: number };

function reducer(state: State =  0, action: Action) {
  switch (action.type) {
    case 'INC':
      return state + 1;
    case 'DEC':
      return state - 1;
    case 'SET':
      return action.value;
    default:
      return state;
  }
}

const inc = () => ({ type: 'INC' });
const dec = () => ({ type: 'DEC' });
const set = (value: number) => ({ type: 'SET', value });

function* saga(): Saga<Action, State, void> {
  const num = yield* select(x => x + 10);
  console.log('+10=', num);
  yield* put(set(50));
  const action = yield* take(x => x.type === 'SET' ? x : null);
  console.log('set', action.value);
}

const sagaMiddleware: SagaMiddleware<State, Action> = createSagaMiddleware();
const store = createStore(reducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(saga());
```

## License

MIT.
