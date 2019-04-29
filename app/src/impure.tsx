import React, { PureComponent } from 'react';
import { fromJS, Set, Map, List } from 'immutable';
import axios from 'axios';
import marked from 'marked';

axios.defaults.baseURL = 'https://karaage.me';

/** states and mutations */
const statesAndMutations = fromJS({
  'posts/tags/categories': [
    { posts: [], tags: [], categories: [], status: 'init' },
    function* () {
      yield Map({ status: 'pending' });
      try {
        const response = yield axios.get('/api/posts.json');
        const posts = fromJS(response.data.values);
        const tags = posts.reduce((acc: any, post: any) => {
          return acc.concat(post.get('tags'));
        }, Set()).toList();
        const categories = posts.reduce((acc: any, post: any) => {
          return acc.add(post.get('category'));
        }, Set()).toList();
        return Map({ posts, tags, categories, status: 'successful' });
      } catch (e) {
        yield Map({ status: 'failed', error: e });
        return;
      }
    }
  ],
  'post': [
    { name: '', post: '', status: 'init' },
    function* (name: any) {
      yield Map({ status: 'pending' });
      try {
        const response = yield axios.get(`/data/${name}`);
        const post = marked(response.data || '');
        return Map({ name, post, status: 'successful' });
      } catch (e) {
        yield Map({ status: 'failed', error: e });
        return;
      }
    }
  ]
});

/** executor of mutation (generator and function) */
function executor (gen: any, send: any, ...params: any[]) {
  function next (cont: any, prev: any) {
    const { value, done } = cont.next(prev);
    if (done) { send(value); return; };
    if (value instanceof Promise) {
      value.then(_value => {
        next(cont, _value);
      });
    } else {
      send(value);
      next(cont, value);
    }
  }
  if (Object.prototype.toString.call(gen) !== '[object GeneratorFunction]') {
    send(gen(...params));
  } else {
    const cont = gen(...params);
    next(cont, undefined);
  }
}

/** create context */
const ImpureContext = React.createContext({ store: {}, use: (keyword: string) => List([]) });

/** context wrapper */
export class ContextWrapper extends PureComponent<{}, { store: any, use: (keyword: string) => any }> {
  constructor (props: any) {
    super(props);
    this.state = {
      store: statesAndMutations.map(([states, _]: [any, unknown]) => states),
      use: this._use
    };
  }

  send = (keyword: string, states: any): void => {
    this.setState({ store: this.state.store.mergeDeep({ [keyword]: states }) });
  }

  _use = (keyword: string) => {
    const mutation = (...params: any[]) => executor(
      statesAndMutations.get(keyword).last(),
      (states: any) => this.send(keyword, states),
      ...params);
    const states = this.state.store.get(keyword);
    return List([states, mutation]);
  }

  render () {
    return (
      <ImpureContext.Provider value={this.state}>
        {this.props.children}
      </ImpureContext.Provider>
    );
  }
}

/** consumer */
export const withEffect = (component: any, ...keywords: string[]) => {
  const Alias = component;
  return function (props: any) {
    return (
      <ImpureContext.Consumer>
        {({ use }) => {
          const effect = Map(keywords.map(keyword => [keyword, use(keyword)]));
          return <Alias effect={effect} {...props} />
        }}
      </ImpureContext.Consumer>
    );
  }
}