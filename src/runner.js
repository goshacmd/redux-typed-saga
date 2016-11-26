// @flow

import type { Saga, EffectRunner } from './types';
import type { SubscribeFn } from './emitter';

export type Runner<Action, State> = <Effect>(runEffect: EffectRunner<Effect>, saga: Saga<Effect, Action, State, any>) => void;

export default function createRunner<Action, State>(getState: () => State, dispatch: (action: Action) => void, subscribe: SubscribeFn<Action>): Runner<Action, State> {
  return function<Effect>(runEffect: EffectRunner<Effect>, saga: Saga<Effect, Action, State, any>): void {
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
      } else if (command.type === 'take') {
        const unsub = subscribe((action: Action) => {
          const match = command.actionMatcher(action);
          if (match) {
            unsub();
            nxt(saga.next(match));
          }
        });
      } else if (command.type === 'call') {
        runEffect(command.effect).then(value => {
          nxt(saga.next(value));
        }, error => {
          nxt(saga.throw(error));
        });
      }
    }

    nxt(saga.next());
  }
}
