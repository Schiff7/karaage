import React, { Component, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch, Link } from 'react-router-dom';
import { TransitionMotion, spring } from 'react-motion';
import { fromJS, List } from 'immutable';
import { mdx } from 'mdx.macro';
import axios from 'axios';
import './App.css';

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

const Paper = (props) => {
  const [paper, setPaper] = useState('');
  useEffect(() => {
    axios.get("https://karaage-git-master.zyxwv.now.sh/data/2019-01-28-object-oriented.mdx")
      .then(function (response) {
        setPaper(response.data);
      });
  }, [paper]);
  const Doc = mdx`${paper}`;
  return <div><Doc /></div>;
}

const Posts = (props) => {
  return <div>POSTS<Link to='/tags'>TAGS</Link><Link to='/paper'>PAPER</Link>{JSON.stringify(props)}</div>;
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
      { key: 'frame-paper', path: '/paper/:identifier', component: Paper, from: 'bottom', show: false },
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
      <TransitionMotion willEnter={willEnter} willLeave={willLeave} styles={getStyles()}>
        {styles => <>{styles.map(({ key, data, style: { left, top, opacity } }) => 
        <section key={key} className={`frame ${key}`} style={{ left: `${left}%`, top: `${top}%`, opacity, zIndex: data.zIndex }}>
          <data.component {...(queue.last() === key ? record.props : {})} />
        </section>)}</>}
      </TransitionMotion>
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
