// @flow

import emitter from './emitter';
import type { Emitter, SubscribeFn } from './emitter';
import type { Saga, EffectRunner, TaskId, TaskTable } from './types';
import createRunner from './runner';
import type { Runner } from './runner';

type NewState<Action, State> = (next: (action: Action) => State) => (action: Action) => State;
export type SagaMiddleware<State, Action> = {
  (options: {
    getState: () => State,
    dispatch: (action: Action) => void },
  ): NewState<Action, State>;
  run: <Effect>(runEffect: EffectRunner<Effect>, saga: Saga<Effect, Action, State, any>) => TaskId;
};

let _counter = 0;
const genId = () => _counter++;

export default function createSagaMiddleware<State, Action>(): SagaMiddleware<State, Action> {
  let runSagaDynamically;

  const taskTable: TaskTable = {};

  function sagaMiddleware({ getState, dispatch }) {
    const sagaEmitter: Emitter<Action> = emitter();

    runSagaDynamically = createRunner(getState, dispatch, sagaEmitter.subscribe);
    return next => action => {
      sagaEmitter.emit(action);
      return next(action);
    };
  }
  sagaMiddleware.run = <Effect>(runEffect: EffectRunner<Effect>, saga: Saga<Effect, Action, State, any>): TaskId => {
    const id = genId();
    const onKill = runSagaDynamically(runEffect, saga, sagaMiddleware.run);
    taskTable[id] = { onKill };
    return id;
  };

  return sagaMiddleware;
}
