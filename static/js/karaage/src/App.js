import React, { Component, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import { TransitionMotion, spring } from 'react-motion';
import './App.css';

// Component
const Nav = (props) => {
  return (
    <nav>
      <h2 className='align-center' data-text='Hello, World!'><span>{'Hello, World!'}</span></h2>
      <ul className='without-list-style align-center cursor-pointer'>
        <li><Link className='underline' to='/posts'>POSTS</Link></li>
        <li><Link className='underline' to='/categories'>CAREGORIES</Link></li>
        <li><Link className='underline' to='/tags'>TAGS</Link></li>
        <li><Link className='underline' to='/about'>ABOUT</Link></li>
      </ul>
    </nav>
  );
}

const Paper = (props) => {
  return <div>PAPER</div>;
}

const Posts = (props) => {
  return <div>POSTS</div>;
}

const Categories = (props) => {
  return <div>CATEGORIES</div>;
}

const Tags = (props) => {
  return <div>TAGS</div>;
}

const About = (props) => {
  return <div>ABOUT</div>;
}

function Machine (props) {
  const views = {
    main: { left: 0, top: 0 },
    right: { left: 100, top: 0 },
    bottom: { left: 0, top: 0 },
    opaque: { opacity: 1 },
    transparent: { opacity: 1 }
  };
  const [record, setRecord] = useState({
    frames: [
      { key: 'frame-home', path: '/', exact: true, component: Nav, from: 'main', show: true },
      { key: 'frame-posts', path: '/posts', component: Posts, from: 'right', show: false },
      { key: 'frame-categories', path: '/categories', component: Categories, from: 'right', show: false },
      { key: 'frame-tags',path: '/tags', component: Tags, from: 'right', show: false },
      { key: 'frame-about', path: '/about', component: About, from: 'right', show: false },
      { key: 'frame-paper', path: 'posts/:identifier', component: Paper, from: 'bottom', show: false },
    ],
    queue: ['frame-home'],
  });
  const { frames, queue } = record;
  const willLeave = ({ data: { from } }) => {
    const { left, top } = views[from];
    return { left: spring(left), top: spring(top), opacity: spring(0) };
  }
  const willEnter = ({ data: { from } }) => {
    return { ...views[from], opacity: 0 };
  }
  const getStyles = () => {
    return frames.filter(frame => frame.show)
    .map(({ key, ...data }) => ({ key, data, style: { left: spring(0), top: spring(0), opacity: spring(1) }}));
  }
  console.log(queue);
  console.log(frames.filter(frame => frame.key !== queue.slice(-1)[0]));
  const getRoutes = () => {
    return frames.filter(frame => frame.key !== queue.slice(-1)[0])
      .map(frame => <Route key={frame.key} path={frame.path} exact={!!frame.exact} component={() => {
        const alias = frame;
        const index = queue.indexOf(frame.key) + 1;
        useEffect(() => {
          if (!index) {
            setRecord({ 
              frames: frames.map(frame => frame.key !== alias.key ? frame : { ...frame, show: true } ),
              queue: [ ...queue, frame.key ] 
            });
          } else {
            const next = queue.slice(0, index);
            setRecord({
              frames: frames.map(frame => next.includes(frame.key) ? frame : { ...frame, show: false }),
              queue: next,
            })
          }
        });
        return <></>;
      }}/>)
  }
  return (
    <>
      {getRoutes()}
      <TransitionMotion willEnter={willEnter} willLeave={willLeave} styles={getStyles()}>
        {styles => <>{styles.map(({ key, style, data }) => 
        <section key={key} className={`frame ${key}`} style={{ left: `${style.left}%`, top: `${style.top}%`, opacity: style.opacity }}><data.component /></section>)}</>}
      </TransitionMotion>
    </>
  );
}

// App component
class App extends Component {
  render() {
    return (
      <Router>
        <Switch><Machine /></Switch>
      </Router>
    );
  }
}

export default App;
