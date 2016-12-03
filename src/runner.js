// @flow

import type { Saga, EffectRunner, TaskTable, TaskId, Task } from './types';
import type { SubscribeFn } from './emitter';

type ProcessCreator<Action, State> = <Effect>(runEffect: EffectRunner<Effect>, saga: Saga<Effect, Action, State, any>) => TaskId;
export type Runner<Action, State> = <Effect>(runEffect: EffectRunner<Effect>, saga: Saga<Effect, Action, State, any>, createProcess: ProcessCreator<Action, State>) => Task;

export default function createRunner<Action, State>(getState: () => State, dispatch: (action: Action) => void, subscribe: SubscribeFn<Action>, taskTable: TaskTable): Runner<Action, State> {
  return function<Effect>(runEffect: EffectRunner<Effect>, saga: Saga<Effect, Action, State, any>, createProcess: ProcessCreator<Action, State>): Task {
    function nxt(next) {
      if (next.done) {
        task.status = 'dead';
        task.kill = noop;
        return;
      }

      const command = next.value.command;

      switch (command.type) {
        case 'select': {
          const state = getState();
          const selected = command.selector(state);
          nxt(saga.next(selected));
          break;
        }
        case 'put': {
          dispatch(command.action);
          nxt(saga.next());
          break;
        }
        case 'take': {
          const unsub = subscribe((action: Action) => {
            const match = command.actionMatcher(action);
            if (match) {
              unsub();
              nxt(saga.next(match));
            }
          });
          break;
        }
        case 'call': {
          runEffect(command.effect).then(value => {
            nxt(saga.next(value));
          }, error => {
            nxt(saga.throw(error));
          });
          break;
        }
        case 'spawn': {
          const taskId = createProcess(runEffect, command.saga);
          nxt(saga.next(taskId));
          break;
        }
        case 'kill': {
          const task = taskTable[command.taskId];
          if (!task) saga.throw(new Error(`Task with id ${command.taskId} does not exist`));
          task.kill();
          nxt(saga.next());
          break;
        }
        case 'isDying': {
          nxt(saga.next(task.status === 'dying'));
          break;
        }
      }
    }

    nxt(saga.next());

    const noop = () => {};

    const task = { status: 'running', kill: noop };
    task.kill = () => {
      // TODO: cancel `take` and `call` on kill
      task.status = 'dying';
      task.kill = noop;
      const ret = saga.return();
      nxt(saga.return());
    };
    return task;
  }
}
