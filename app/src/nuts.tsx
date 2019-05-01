import * as R from 'ramda';


interface withEffect {}


enum ActionType {
  WANT = 'WANT',
  CALL = 'CALL',
  PUSH = 'PUSH',
}

interface ActionInMutation<T> { 
  type: ActionType; 
  payload: T
}

interface CreateActionInMutation<P> {
  (p: P): ActionInMutation<P>;
}

type WantPayload = { keyword: string; params: any[]; };
export const want: CreateActionInMutation<WantPayload> = function (p) {
  return { type: ActionType.WANT, payload: p };
}
type CallPayload = { fn: (...params: any[]) => Promise<any>, params: any[] };
export const call: CreateActionInMutation<CallPayload> = function (p) {
  return { type: ActionType.CALL, payload: p }; 
}
type PushPayload = { state: any }
export const push: CreateActionInMutation<PushPayload> = function (p) {
  return { type: ActionType.PUSH, payload: p };
}

type ActionPayload = WantPayload | CallPayload | PushPayload;
interface Mutation<T> {
  (p: T): Iterator<ActionInMutation<ActionPayload>>
}

interface StateAndMutation<S, M> {
  key: string;
  state: S
  mutation: Mutation<M>;
}

class Nuts {
  mutations: Map<string, Mutation<any>>;
  store: { [key: string]: any } = Object.create(null);
  stack: string[] = [];
  constructor (p: StateAndMutation<any, any>[]) {
    this.mutations = new Map(R.map(({key, mutation}) => [key, mutation], p));
    p.forEach(({key, state}) => {
      this.store[key] = state;
    });
  }
  async _dispatch (this: Nuts, action: ActionInMutation<ActionPayload>) {
    switch (action.type) {
      case ActionType.WANT: {
        const { payload: { keyword, params } } = action as ActionInMutation<WantPayload>;
        this.execute(keyword, params);
        break;
      }
      case ActionType.CALL: {
        const { payload: { fn, params } } = action as ActionInMutation<CallPayload>;
        const result = await R.apply(fn, params);
        return result;
      }
      case ActionType.PUSH: {
        const { payload: { state } } = action as ActionInMutation<PushPayload>;
        const keywrod = R.last(this.stack);
        if (!!keywrod) this.store = R.merge({ [keywrod]: state });
        this.stack = R.init(this.stack);
        break;
      }
      default: break;
    }
  }
  _next (this: Nuts, cont: Iterator<ActionInMutation<ActionPayload>>, prev: any): void {
    const { value, done } = cont.next(prev);
    if (done) this._dispatch(value);
    else {
      this._dispatch(value).then(returned => {
        this._next(cont, returned);
      });
    }
  }
  execute<T> (keyword: string, p: T): void {
    this.stack = R.append(keyword, this.stack);
    const m = this.mutations.get(keyword);
    if (!m) return;
    const cont = m(p);
    this._next(cont, undefined);
  } 
}

