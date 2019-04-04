import React, { Component, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch, Link } from 'react-router-dom';
import { TransitionMotion, spring } from 'react-motion';
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
  return <div>PAPER{JSON.stringify(props)}<Link to='/'>HOME</Link></div>;
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
  const [record, setRecord] = useState({
    frames: [
      { key: 'frame-home', path: '/', exact: true, component: Nav, from: 'main', show: true },
      { key: 'frame-posts', path: '/posts/:query(category|tag|date|limit)/:keyword', component: Posts, from: 'right', show: false },
      { key: 'frame-categories', path: '/categories/:category?', component: Categories, from: 'right', show: false },
      { key: 'frame-tags',path: '/tags/:tag?', component: Tags, from: 'right', show: false },
      { key: 'frame-about', path: '/about', component: About, from: 'right', show: false },
      { key: 'frame-paper', path: '/paper/:identifier', component: Paper, from: 'bottom', show: false },
      { key: 'frame-no-match', path: undefined, component: NoMatch, from: 'bottom', show: false }
    ],
    queue: ['frame-home'],
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
    return frames.filter(frame => frame.show)
    .map(({ key, ...data }) => {
      const zIndex = queue.indexOf(key);
      return { key, data: { ...data, zIndex }, style: { left: spring(1), top: spring(1), opacity: spring(1) } };
    });
  }
  const getRoutes = () => {
    const actionRoutes = frames.map(frame => <Route key={frame.key} path={frame.path} exact={!!frame.exact} component={(props) => {
      const alias = frame;
      const index = queue.indexOf(frame.key) + 1;
      useEffect(() => {
        if (queue.slice(-1)[0] === frame.key && frame.show) return;
        if (!index) {
          setRecord({ 
            frames: frames.map(frame => frame.key !== alias.key ? frame : { ...frame, show: true } ),
            queue: [ ...queue, frame.key ], 
            props: props,
          });
        } else {
          const next = queue.slice(0, index);
          setRecord({
            frames: frames.map(frame => next.includes(frame.key) ? frame : { ...frame, show: false }),
            queue: next,
            props: props,
          })
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
          <data.component {...(queue.slice(-1)[0] === key ? record.props : {})} />
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
