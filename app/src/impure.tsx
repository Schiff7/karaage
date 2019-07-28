import React from 'react';
import axios from 'axios';
import * as R from 'ramda';
import marked from 'marked';

enum ActionType {
  WANT = 'WANT',
  CALL = 'CALL',
  PUSH = 'PUSH',
}

type StandardParams = Record<string, any> | undefined;

interface ActionInMutation<T> { 
  type: ActionType; 
  payload: T
}

type WantPayload = { keyword: string; params?: StandardParams; };
export function want<T> (payload: T): ActionInMutation<T> {
  return { type: ActionType.WANT, payload };
}
type CallPayload<T> = { fn: (params: T) => Promise<any>, params?: T };
export function call<T> (payload: CallPayload<T>): ActionInMutation<CallPayload<T>> {
  return { type: ActionType.CALL, payload };
}
type PushPayload = { state: any }
export function push<T> (payload: T): ActionInMutation<T> {
  return { type: ActionType.PUSH, payload };
}

type ActionPayload = WantPayload | CallPayload<any> | PushPayload;
type MutationEffect = Iterator<ActionInMutation<ActionPayload>> | ActionInMutation<PushPayload>;
interface Mutation<T> {
  (params: T): MutationEffect;
}

interface StateAndMutation<S, M> {
  state: S
  mutation: Mutation<M>;
}

type SomeError = any;
type OptionalStatus<T> = T & { status?: Status, error?: SomeError };
type MaybeUndefined<T> = T | undefined;
type Store<T> = { [P in keyof T]: T[P] extends { state: infer S } ? OptionalStatus<S> : never };
type Mutations<T> = { [P in keyof T]
  : T[P] extends { mutation: Mutation<infer M> } 
  ? [Mutation<MaybeUndefined<M>>, MaybeUndefined<M>] : never }
type StateAndMutations<T> = { [P in keyof T]: T[P] extends StateAndMutation<infer S, infer M>
  ? StateAndMutation<S, M>
  : never };
type Value<T> = T[keyof T]; 

declare function m<T>(p:T):Value<T>;
const a = m({ a: '1', b: 2 });

/**
 * Manage sharing state.
 */
class Nuts<T extends StateAndMutations<T>> {
  store: Store<T> = {} as Store<T>;
  mutations: Mutations<T>;
  stack: (keyof T)[] = [];
  listener: Map<string, (store: Store<T>) => void> = new Map();
  constructor (items: T) {
    this.mutations = R.map(({mutation}) => [mutation, undefined], items) as Mutations<T>;
    this.store = R.map(({state, mutation}) =>
      R.type(mutation) === 'Function' 
      ? state 
      : { ...state, status: Status.INITIAL }, items) as Store<T>;
  }
  // To update the store.
  _send = (state: Value<Store<T>>): void => {
    const keyword = R.last(this.stack);
    if (!!keyword) {
      const prev = R.prop(keyword, this.store);
      this.store = { ...this.store, [keyword]: { ...prev, ...state } };
      console.log(this.store);
    }
    this._notify();
  }
  // Handle the actions yield by mutation.
  _dispatch = async (action: ActionInMutation<ActionPayload>) => {
    switch (action.type) {
      case ActionType.WANT: {
        const { payload: { keyword, params } } = action as ActionInMutation<WantPayload>;
        await this.run(keyword as keyof T, params);
        return R.prop(keyword, this.store);
      }
      case ActionType.CALL: {
        const { payload: { fn, params } } = action as ActionInMutation<CallPayload<any>>;
        const result = await R.call(fn, params);
        return result;
      }
      case ActionType.PUSH: {
        const { payload: { state } } = action as ActionInMutation<PushPayload>;
        this._send(state);
      }
      default: return;
    }
  }
  // Recursively run the mutation of generator type.
  _next = async (cont: Iterator<ActionInMutation<ActionPayload>>, prev: any) => {
    const { value, done } = cont.next(prev);
    const returned = await this._dispatch(value);
    if (done) {
      this._send({ status: Status.SUCCESSFUL });
      this.stack = R.init(this.stack);
      return;
    }
    else await this._next(cont, returned);
  }
  // Run a mutation.
  run = async (keyword: keyof T, params: StandardParams) => {
    // Avoid unnecessary running of mutation.
    const [m, d] = R.prop(keyword, this.mutations);
    const s = R.prop(keyword, this.store);
    if (R.prop('status', s) !== Status.INITIAL 
      && R.equals(d, params)) return;
    // Run the mutation.
    this.stack = R.append(keyword, this.stack);
    this.mutations = R.assoc(keyword, [m, params], this.mutations);
    this._send({ status: Status.PENDING });
    if (!m) throw Error(`Can not found the keyword ${keyword}`);
    const cont = m(params);
    if ((function (x: MutationEffect): x is ActionInMutation<PushPayload> {
      return R.type(x) === 'Function';
    })(cont)) await this._dispatch(cont);
    else {
      try {
        await this._next(cont, undefined);
      } catch (e) {
        this._send({ status: Status.ERROR, error: e });
      }
    }
    return;
  }
  subscribe = (name: string, fn: (store: Store<T>) => void) => {
    this.listener.set(name, fn);
  } 
  unsubscribe = (name: string) => {
    this.listener.delete(name);
  }
  _notify = () => {
    this.listener.forEach((fn, _) => {
      fn(this.store);
    });
  }
}

export interface ContentItem {
  name: string;
  date: { y: string; m: string; d: string };
  category: string;
  tags: string[];
  slug: string;
}
export enum Status {
  INITIAL = 'INITIAL',
  PENDING = 'PENDING',
  SUCCESSFUL = 'SUCCESSFUL',
  ERROR = 'ERROR',
}

axios.defaults.baseURL = 'https://karaage.me';

const fetchContent = async (): Promise<ContentItem[]> => {
  const response = await axios.get('/api/content.json');
  return response.data;
}

const fetchPost = async ({ name }: { name: string }): Promise<string> => {
  const response = await axios.get(`/data/${name}`);
  return marked(response.data);
}

const content: StateAndMutation<{ value: ContentItem[] }, void> = {
  state: { value: [] },
  mutation: function* () {
    const content = yield call({ fn: fetchContent });
    return push({ state: { value: content } });
  }
}

const tags: StateAndMutation<{ value: string[] }, void> = {
  state: { value: [] },
  mutation: function* () {
    const content: { value: ContentItem[] } = yield want({ keyword: 'content'});
    const tags = R.pipe(
      R.reduce((acc, item: ContentItem) => R.concat(acc, item.tags), [] as string[]),
      R.dropRepeats
    )(content.value);
    return push({ state: { value: tags } });
  }
}

const categories: StateAndMutation<{ value: string[] }, void> = {
  state: { value: [] },
  mutation: function* () {
    const content: { value: ContentItem[] } = yield want({ keyword: 'content' });
    const categories = R.pipe(
      R.reduce((acc, item: ContentItem) => R.append(item.category, acc), [] as string[]),
      R.dropRepeats
    )(content.value);
    return push({ state: { value: categories } });
  }
}

const post: StateAndMutation<{ value: string, slug: string }, { slug: string }> = {
  state: { value: '', slug: '' },
  mutation: function* ({ slug }) {
    const content: { value: ContentItem[] } = yield want({ keyword: 'content' });
    const { name } = R.find(R.propEq('slug', slug), content.value) as ContentItem;
    const post = yield call({ fn: fetchPost, params: { name } });
    return push({ state: { value: post, slug } });
  }
}

const ASSETS = { content, tags, categories, post };

const instance = new Nuts(ASSETS);

const ImpureContext = React.createContext({ store: {}, run: instance.run });

interface ContextWrapperState {
  store: { [key: string]: any };
}
export class ContextWrapper extends React.PureComponent<{}, ContextWrapperState> {
  constructor (props: {}) {
    super(props);
    instance.subscribe('wrapper', this.callBack);
    this.state = {
      store: instance.store
    };
  }

  callBack = (store: { [key: string]: any }) => {
    this.setState({ store });
  }
  
  render () {
    return (
      <ImpureContext.Provider value={{ store: this.state.store, run: instance.run }}>
        {this.props.children}
      </ImpureContext.Provider>
    );
  }
}

export const withEffect = (component: any) => {
  const Alias = component;
  return function (props: any) {
    return (
      <ImpureContext.Consumer>
        {context => <Alias run={context.run} store={context.store} {...props}/>}
      </ImpureContext.Consumer>
    );
  }
}




