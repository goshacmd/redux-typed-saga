// @flow

import emitter from './emitter';
import type { Emitter, SubscribeFn } from './emitter';
import type { Saga } from './types';
import createRunner from './runner';
import type { Runner } from './runner';

export type SagaMiddleware<State, Action> = {
  (options: { getState: () => State, dispatch: (action: Action) => void }): (next: (action: Action) => State) => (action: Action) => State;
  run: (saga: Saga<Action, State, any>) => void;
};

export default function createSagaMiddleware<State, Action>(): SagaMiddleware<State, Action> {
  let runSagaDynamically;

  function sagaMiddleware({ getState, dispatch }) {
    const sagaEmitter: Emitter<Action> = emitter();

    runSagaDynamically = createRunner(getState, dispatch, sagaEmitter.subscribe);
    return next => action => {
      sagaEmitter.emit(action);
      return next(action);
    };
  }
  sagaMiddleware.run = (saga: Saga<Action, State, any>) => {
    runSagaDynamically(saga);
  };

  return sagaMiddleware;
}
