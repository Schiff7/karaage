import React, { Component, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch, Link } from 'react-router-dom';
import { TransitionMotion, spring } from 'react-motion';
import { fromJS, List, Set, Map } from 'immutable';
import axios from 'axios';
import './App.css';

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
        const posts = fromJS(response.data);
        console.log(response);
        const tags = posts.reduce((acc, post) => {
          return acc.concat(post.tags);
        }, Set()).toList();
        const categories = posts.reduce((acc, post) => {
          return acc.add(post.category);
        }, Set()).toList();
        return Map({ posts, tags, categories, status: 'successful' });
      } catch (e) {
        yield { status: 'failed', error: e };
      }
    }
  ],
  'post': [
    { post: '', status: 'init' },
    function* (slug) {
      yield { status: 'pending' };
      try {
        const response = yield axios.get(`/data/${slug}.md`);
        return { post: response.data };
      } catch (e) {
        yield { status: 'failed', error: e }
      }
    }
  ]
});

/** executor of mutation (generator and function) */
export function executor (gen, send, ...params) {
  function next (cont, prev) {
    const { value, done } = cont.next(prev);
    if (done) return true;
    if (value instanceof Promise) {
      value.then(data => {
        send(data);
        next(cont, data);
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

const ImpureContext = React.createContext();
class ContextWrapper extends Component {
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
    return [states, mutation];
  }

  render () {
    return (
      <ImpureContext.Provider value={{ use: this.use }}>
        {this.props.children}
      </ImpureContext.Provider>
    );
  }
}

// Component
const Nav = (props) => {
  return (
    <nav>
      <h2 className='align-center' data-text='Hello, World!'><span>{'Hello, World!'}</span></h2>
      <ul className='without-list-style align-center cursor-pointer'>
        <li><Link className='underline' to='/posts'>POSTS</Link></li>
        <li><Link className='underline' to='/categories'>CATEGORIES</Link></li>
        <li><Link className='underline' to='/tags'>TAGS</Link></li>
        <li><Link className='underline' to='/about'>ABOUT</Link></li>
      </ul>
    </nav>
  );
}

class Post extends Component {
  static contextType = ImpureContext;
  componentDidMount () {
    const mutation = this.context.use('post')[1];
    mutation('work-with-css');
  }
  render () {
    const states = this.context.use('post')[0];
    return (
      <div>{states.post}</div>
    );
  }
}

const Posts = (props) => {
  return <div>POSTS<Link to='/tags'>TAGS</Link><Link to='/post/something'>PAPER</Link>{JSON.stringify(props)}</div>;
}

const Categories = (props) => {
  return <div>CATEGORIES</div>;
}

const Tags = (props) => {
  return <div>TAGS<Link to='/'>HOME</Link></div>;
}

const About = (props) => {
  return <div>ABOUT</div>;
}

const NoMatch = (props) => {
  return <div>NO-MATCH</div>;
}

const Machine = (props) => {
  const views = {
    main: { left: 1, top: 1 },
    right: { left: 100, top: 1 },
    bottom: { left: 1, top: 100 },
    opaque: { opacity: 1 },
    transparent: { opacity: 0 }
  };
  const [ record, setRecord ] = useState({
    frames: fromJS([
      { key: 'frame-home', path: '/', exact: true, component: Nav, from: 'main', show: true },
      { key: 'frame-posts', path: '/posts/:query(category|tag|date|limit)/:keyword', component: Posts, from: 'right', show: false },
      { key: 'frame-categories', path: '/categories/:category?', component: Categories, from: 'right', show: false },
      { key: 'frame-tags',path: '/tags/:tag?', component: Tags, from: 'right', show: false },
      { key: 'frame-about', path: '/about', component: About, from: 'right', show: false },
      { key: 'frame-post', path: '/post/:identifier', component: Post, from: 'bottom', show: false },
      { key: 'frame-no-match', path: undefined, component: NoMatch, from: 'bottom', show: false }
    ]),
    queue: List(['frame-home']),
    props: {},
  });
  const { frames, queue } = record;
  const willLeave = ({ data: { from, zIndex } }) => {
    const { left, top } = views[from];
    return { left: spring(left), top: spring(top), opacity: spring(0), zIndex };
  }
  const willEnter = ({ data: { from } }) => {
    return { ...views[from], opacity: 0 };
  }
  const getStyles = () => {
    return frames.filter(frame => frame.get('show'))
      .map(frame => {
        const key = frame.get('key');
        const zIndex = queue.indexOf(key);
        const data = frame.remove('key').merge({zIndex});
        return { key, data, style: { left: spring(1), top: spring(1), opacity: spring(1) } };
      }).toJS();
  }
  const getRoutes = () => {
    const actionRoutes = frames.map(frame => 
      <Route 
        key={frame.get('key')} 
        path={frame.get('path')} 
        exact={!!frame.get('exact')} component={(props) => {
        const alias = frame;
        const index = queue.indexOf(frame.get('key')) + 1;
        useEffect(() => {
          if (queue.last() === frame.get('key') && frame.get('show')) return;
          if (!index) {
            setRecord({ 
              frames: frames.map(frame => frame.get('key') !== alias.get('key') ? frame : frame.set('show', true)),
              queue: queue.push(frame.get('key')), 
              props: props,
            });
          } else {
            const next = queue.slice(0, index);
            setRecord({
              frames: frames.map(frame => next.includes(frame.get('key')) ? frame : frame.set('show', false)),
              queue: next,
              props: props,
            });
          }
        });
        return <></>;
      }}/>);
    return actionRoutes;
  }
  return (
    <>
      <Switch>
        <Redirect exact from='/posts' to='/posts/limit/none' />
        {getRoutes()}
      </Switch>
      <ContextWrapper>
        <TransitionMotion willEnter={willEnter} willLeave={willLeave} styles={getStyles()}>
          {styles => <>{styles.map(({ key, data, style: { left, top, opacity } }) => 
          <section key={key} className={`frame ${key}`} style={{ left: `${left}%`, top: `${top}%`, opacity, zIndex: data.zIndex }}>
            <data.component {...(queue.last() === key ? record.props : {})} />
          </section>)}</>}
        </TransitionMotion>
      </ContextWrapper>
    </>
  );
}

// App component
class App extends Component {
  render() {
    return (
      <Router><Machine /></Router>
    );
  }
}

export default App;
