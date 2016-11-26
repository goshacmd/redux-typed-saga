// @flow

import type { Saga } from './types';
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
