import React from 'react';
import axios from 'axios';
import * as R from 'ramda';

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
type MutationEffect = Iterator<ActionInMutation<ActionPayload>> | ActionInMutation<PushPayload>;
interface Mutation<T> {
  (p: T): MutationEffect;
}

interface StateAndMutation<S, M> {
  key: string;
  state: S
  mutation: Mutation<M>;
}

class Nuts {
  mutations: Map<string, Mutation<any>>;
  store: { [key: string]: any } = {};
  stack: string[] = [];
  diffs: Map<string, any> = new Map();
  constructor (p: StateAndMutation<any, any>[]) {
    this.mutations = new Map(R.map(({key, mutation}) => [key, mutation], p));
    R.forEach(({key, state, mutation}) => {
      this.store[key] = R.type(mutation) === 'Function' ? state : { ...state, status: Status.INITIAL };
    }, p);
  }
  _send = (state: any): void => {
    const keyword = R.last(this.stack);
    if (!!keyword) {
      const prev = this.store[keyword];
      this.store = { ...this.store, [keyword]: { ...prev, ...state } };
    }
  }
  _dispatch = async (action: ActionInMutation<ActionPayload>) => {
    switch (action.type) {
      case ActionType.WANT: {
        const { payload: { keyword, params } } = action as ActionInMutation<WantPayload>;
        await this.run(keyword, params);
        return this.store[keyword];
      }
      case ActionType.CALL: {
        const { payload: { fn, params } } = action as ActionInMutation<CallPayload>;
        const keyword = R.last(this.stack) as string;
        const prev = this.diffs.get(keyword);
        if (R.equals(prev, params)) return this.store[keyword];
        const result = await R.apply(fn, params);
        this.diffs.set(keyword, params);
        return result;
      }
      case ActionType.PUSH: {
        const { payload: { state } } = action as ActionInMutation<PushPayload>;
        this._send(state);
      }
      default: return;
    }
  }
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
  run = async (keyword: string, p: any) => {
    this.stack = R.append(keyword, this.stack);
    this._send({ status: Status.PENDING });
    const m = this.mutations.get(keyword);
    if (!m) throw Error(`Can not found the keyword ${keyword}`);
    const cont = m(p);
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
}

interface ContentItem {
  name: string;
  date: { y: string; m: string; d: string };
  category: string;
  tags: string[];
  slug: string;
}
enum Status {
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

const fetchPost = async (slug: string): Promise<string> => {
  const response = await axios.get(`/data/${slug}`);
  return response.data;
}

const content: StateAndMutation<{ value: ContentItem[] }, void> = {
  key: 'content',
  state: { value: [] },
  mutation: function* () {
    const content = yield call({ fn: fetchContent, params: [] });
    return push({ state: { value: content } });
  }
}

const tags: StateAndMutation<{ value: string[] }, void> = {
  key: 'tags',
  state: { value: [] },
  mutation: function* () {
    const content: { value: ContentItem[] } = yield want({ keyword: 'content', params: [] });
    const tags = R.pipe(
      R.reduce((acc, item: ContentItem) => R.concat(acc, item.tags), [] as string[]),
      R.dropRepeats
    )(content.value);
    return push({ state: { value: tags } });
  }
}

const categories: StateAndMutation<{ value: string[] }, void> = {
  key: 'tags',
  state: { value: [] },
  mutation: function* () {
    const content: { value: ContentItem[] } = yield want({ keyword: 'content', params: [] });
    const categories = R.pipe(
      R.reduce((acc, item: ContentItem) => R.append(item.category, acc), [] as string[]),
      R.dropRepeats
    )(content.value);
    return push({ state: { value: categories } });
  }
}

const post: StateAndMutation<{ value: string }, string> = {
  key: 'post',
  state: { value: '' },
  mutation: function* (slug: string) {
    const content: { value: ContentItem[] } = yield want({ keyword: 'content', params: [] });
    const name = R.find(R.propEq('slug', slug), content.value);
    const post = yield call({ fn: fetchPost, params: [name] });
    return push({ state: { value: post } });
  }
}

const instance = new Nuts([ content, tags, categories, post ]);

const ImpureContext = React.createContext(instance);

export class ContextWrapper extends React.PureComponent<{}, { context: Nuts }> {
  constructor (props: {}) {
    super(props);
    this.state = {
      context: instance,
    };
  }
  render () {
    return (
      <ImpureContext.Provider value={this.state.context}>
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




