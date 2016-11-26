// @flow

import emitter from './emitter';
import type { Emitter, SubscribeFn } from './emitter';
import type { Saga, EffectRunner } from './types';
import createRunner from './runner';
import type { Runner } from './runner';

type NewState<Action, State> = (next: (action: Action) => State) => (action: Action) => State;
export type SagaMiddleware<State, Action> = {
  (options: {
    getState: () => State,
    dispatch: (action: Action) => void },
  ): NewState<Action, State>;
  run: <Effect>(runEffect: EffectRunner<Effect>, saga: Saga<Effect, Action, State, any>) => void;
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
  sagaMiddleware.run = <Effect>(runEffect: EffectRunner<Effect>, saga: Saga<Effect, Action, State, any>) => {
    runSagaDynamically(runEffect, saga);
  };

  return sagaMiddleware;
}
