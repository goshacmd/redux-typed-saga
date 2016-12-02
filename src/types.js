// @flow

export type Yield<Effect, Action, State> = { type: 'command', command: Command<Effect, Action, State> };
export type Command<Effect, Action, State> =
  { type: 'put', action: Action } |
  { type: 'take', actionMatcher: (action: Action) => any } |
  { type: 'select', selector: (state: State) => any } |
  { type: 'call', effect: Effect } |
  { type: 'spawn', saga: Saga<Effect, Action, State, any> } |
  { type: 'kill', taskId: TaskId };
export type Saga<Effect, Action, State, A> = Generator<Yield<Effect, Action, State>, A, any>;

export type EffectRunner<Effect> = (effect: Effect) => Promise<any>;

export type TaskId = number;
export type Task = { status: 'running' | 'dead', kill: () => void };
export type TaskTable = { [key: TaskId]: Task };
