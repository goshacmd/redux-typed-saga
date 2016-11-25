// @flow

import type { Saga } from './types';
import type { SagaMiddleware } from './middleware';
import _createSagaMiddleware from './middleware';

export type { Saga, SagaMiddleware };
export const createSagaMiddleware = _createSagaMiddleware;

export function* put<Action, State>(action: Action): Saga<Action, State, void> {
  yield { type: 'command', command: { type: 'put', action } };
}

export function* select<Action, State, A>(selector: (state: State) => A): Saga<Action, State, A> {
  return yield { type: 'command', command: { type: 'select', selector } };
}

export function* take<Action, State, A>(actionMatcher: (action: Action) => ?A): Saga<Action, State, A> {
  return yield { type: 'command', command: { type: 'take', actionMatcher } };
}
