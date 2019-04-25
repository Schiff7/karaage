import React, { PureComponent } from 'react';
import { fromJS, Set, Map, List } from 'immutable';
import axios from 'axios';
import marked from 'marked';

/** axios global configuration */
axios.defaults.baseURL = 'https://karaage-git-master.zyxwv.now.sh';

/** states and mutations */
const statesAndMutations = fromJS({
  'posts/tags/categories': [
    { posts: [], tags: [], categories: [], status: 'init' },
    function* () {
      yield { status: 'pending' };
      try {
        const response = yield axios.get('/api/posts.json');
        const posts = fromJS(response.data.values);
        const tags = posts.reduce((acc, post) => {
          return acc.concat(post.get('tags'));
        }, Set()).toList();
        const categories = posts.reduce((acc, post) => {
          return acc.add(post.get('category'));
        }, Set()).toList();
        return { posts, tags, categories, status: 'successful' };
      } catch (e) {
        yield { status: 'failed', error: e };
      }
    }
  ],
  'post': [
    { post: '', status: 'init' },
    function* (fullName) {
      yield { status: 'pending' };
      try {
        const response = yield axios.get(`/data/${fullName}`);
        const post = marked(response.data || '');
        return { fullName, post, status: 'successful' };
      } catch (e) {
        yield { status: 'failed', error: e }
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
  if (gen.constructor.name !== 'GeneratorFunction') {
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
      store: statesAndMutations.map(([states, _]) => states)
    };
  }

  send = (keyword, states) => {
    this.setState({ store: this.state.store.mergeDeep({ [keyword]: states }) });
  }

  use = (keyword) => {
    const mutation = (...params) => executor(
      statesAndMutations.get(keyword).last(),
      (states) => this.send(keyword, states),
      ...params);
    const states = this.state.store.get(keyword);
    return List([states, mutation]);
  }

  render () {
    return (
      <ImpureContext.Provider value={this.use}>
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
        {use => {
          const effect = Map(keywords.map(keyword => [keyword, use(keyword)]));
          return <Alias effect={effect} {...props} />
        }}
      </ImpureContext.Consumer>
    );
  }
}