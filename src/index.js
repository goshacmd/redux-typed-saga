// @flow

import type { Saga, TaskId } from './types';
import type { SagaMiddleware } from './middleware';
import _createSagaMiddleware from './middleware';

export type { Saga, SagaMiddleware };
export const createSagaMiddleware = _createSagaMiddleware;

export function* put<Effect, Action, State>(action: Action): Saga<Effect, Action, State, void> {
  yield { type: 'command', command: { type: 'put', action } };
}

export function* select<Effect, Action, State, A>(selector: (state: State) => A): Saga<Effect, Action, State, A> {
  return yield { type: 'command', command: { type: 'select', selector } };
}

export function* take<Effect, Action, State, A>(actionMatcher: (action: Action) => ?A): Saga<Effect, Action, State, A> {
  return yield { type: 'command', command: { type: 'take', actionMatcher } };
}

export function* call<Effect, Action, State>(effect: Effect): Saga<Effect, Action, State, any> {
  return yield { type: 'command', command: { type: 'call', effect } };
}

export function* spawn<Effect, Action, State>(saga: Saga<Effect, Action, State, any>): Saga<Effect, Action, State, void> {
  return yield { type: 'command', command: { type: 'spawn', saga } };
}

export function* kill<Effect, Action, State>(taskId: TaskId): Saga<Effect, Action, State, TaskId> {
  return yield { type: 'command', command: { type: 'kill', taskId } };
}
