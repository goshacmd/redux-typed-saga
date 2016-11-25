// @flow

import type { Saga } from './types';
import type { SubscribeFn } from './emitter';

export type Runner<Action, State> = (saga: Saga<Action, State, any>) => void;

export default function createRunner<Action, State>(getState: () => State, dispatch: (action: Action) => void, subscribe: SubscribeFn<Action>): Runner<Action, State> {
  return function(saga: Saga<Action, State, any>) {
    function nxt(next) {
      if (next.done) return;

      const command = next.value.command;

      if (command.type === 'select') {
        const state = getState();
        const selected = command.selector(state);
        nxt(saga.next(selected));
      } else if (command.type === 'put') {
        dispatch(command.action);
        nxt(saga.next());
      } else {
        const unsub = subscribe((action: Action) => {
          const match = command.actionMatcher(action);
          if (match) {
            unsub();
            nxt(saga.next(match));
          }
        });
      }
    }

    nxt(saga.next());
  }
}
