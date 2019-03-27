import React, { Component, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import { Transition } from 'react-transition-group';
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

// Skeleton
const SKELETON = {
  views: {
    main: { left: '0', top: '0' },
    right: { left: '100%', top: '0' },
    bottom: { left: '0', top: '100%' },
  },
  frames: [
    { name: 'frame-home', path: '/', exactPath: true, component: Nav, wrapper: 'main' },
    { name: 'frame-posts', path: '/posts/:query(category|tag|date)?/:keyword?', component: Posts, wrapper: 'right' },
    { name: 'frame-categories', path: '/categories', component: Categories, wrapper: 'right' },
    { name: 'frame-tags',path: '/tags', component: Tags, wrapper: 'right' },
    { name: 'frame-about', path: '/about', component: About, wrapper: 'right' },
    { name: 'frame-post', path: 'posts/:identifier', component: Paper, wrapper: 'bottom' },
  ],
};

const TransitionFrame = (props) => {
  const { frame, transitionStyles } = props;
  const C = frame.component;
  const [inProp, setInProp] = useState(false);
  useEffect(() => {
    setInProp(true);
  }, [inProp])
  return (
    <Transition in={inProp} key={frame.name} timeout={100}>
      {state => <section className={`frame ${frame.name}`} style={{...transitionStyles.entering ,...transitionStyles[state]}}><C /></section>}
    </Transition>
  );
}

// Functions to render App
function Hex ({ skeleton }) {
  const transitionStyles = { entered: skeleton.views['main'] };
  return skeleton.frames.map(({ name, path, exactPath }) => <Route key={`route-${name}`} exact={!!exactPath} path={path} component={function () { 
    return <>{
      skeleton.frames.map(frame => {
      const C = frame.component;
      if (frame.name === name) {
        transitionStyles.entering = skeleton.views[frame.wrapper];
        return <TransitionFrame key={frame.name} frame={frame} transitionStyles={transitionStyles} />;
      }
      return <section key={frame.name} className={`frame ${frame.name}`} style={skeleton.views[frame.wrapper]}><C /></section>;;
    })}</>
  }} />);
}

// App component
class App extends Component {
  render() {
    return (
      <Router>
        <Switch><Hex skeleton={SKELETON} /></Switch>
      </Router>
    );
  }
}

export default App;
