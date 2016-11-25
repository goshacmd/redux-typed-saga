// @flow

export type Yield<Action, State> = { type: 'command', command: Command<Action, State> };
export type Command<Action, State> =
  { type: 'put', action: Action } |
  { type: 'take', actionMatcher: (action: Action) => any } |
  { type: 'select', selector: (state: State) => any };
export type Saga<Action, State, A> = Generator<Yield<Action, State>, A, any>;
