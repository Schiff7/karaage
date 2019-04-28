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
        const tags = posts.reduce((acc, post) => {
          return acc.concat(post.get('tags'));
        }, Set()).toList();
        const categories = posts.reduce((acc, post) => {
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
    function* (name) {
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
function executor (gen, send, ...params) {
  function next (cont, prev) {
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
const ImpureContext = React.createContext();

/** context wrapper */
export class ContextWrapper extends PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      store: statesAndMutations.map(([states, _]) => states),
      use: this._use
    };
  }

  send = (keyword, states) => {
    this.setState({ store: this.state.store.mergeDeep({ [keyword]: states }) });
  }

  _use = (keyword) => {
    const mutation = (...params) => executor(
      statesAndMutations.get(keyword).last(),
      (states) => this.send(keyword, states),
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
export const withEffect = (component, ...keywords) => {
  const Alias = component;
  return function (props) {
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