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
  return <div>PAPER:{JSON.stringify(props)}</div>;
}

const Posts = (props) => {
  return <div>POSTS:{JSON.stringify(props)}</div>;
}

const Categories = (props) => {
  return <div>CATEGORIES:{JSON.stringify(props)}</div>;
}

const Tags = (props) => {
  return <div>TAGS:{JSON.stringify(props)}</div>;
}

const About = (props) => {
  return <div>ABOUT:{JSON.stringify(props)}</div>;
}

function TransitionFrame (props) {
  const { is, frame, views, ...rest } = props;
  const DURATION = 7;
  const C = frame.component;
  // Trigger animation the time mounted.
  const [ inProp, setInProp ] = useState(false);
  useEffect(() => {
    setInProp(true);
  }, [inProp]);
  return (is.name !== frame.name
    ? <section className={`frame ${frame.name}`} style={frame.show ? views['main'] : views[frame['from']]}><C {...rest} /></section>
    : <Transition in={inProp} timeout={DURATION}>
        {state => {
          const defaultStyles = views[is['from']];
          const transitionStyles = frame.show
            ? { entering: views[is['from']], entered: views['main'] }
            : { entering: views['main'], entered: views[is['from']] };
          return <section className={`frame ${frame.name}`} style={{...defaultStyles, ...transitionStyles[state]}}><C {...rest} /></section>;
        }}
      </Transition>)
}

function Machine (props) {
  const [state, setState] = useState({
    is: { name: 'frame-home', path: '/', exactPath: true, component: Nav, from: 'main', show: false },
    views: {
      main: { left: '0', top: '0' },
      right: { left: '100%', top: '0' },
      bottom: { left: '0', top: '100%' },
    },
    frames: [
      { name: 'frame-home', path: '/', exactPath: true, component: Nav, from: 'main', show: true },
      { name: 'frame-posts', path: '/posts/:query(category|tag|date)?/:keyword?', component: Posts, from: 'right', show: false },
      { name: 'frame-categories', path: '/categories', component: Categories, from: 'right', show: false },
      { name: 'frame-tags',path: '/tags', component: Tags, from: 'right', show: false },
      { name: 'frame-about', path: '/about', component: About, from: 'right', show: false },
      { name: 'frame-post', path: 'posts/:identifier', component: Paper, from: 'bottom', show: false },
    ]
  });
  const { is, views, frames } = state;
  const routes = frames.map(frame => {
    const alias = frame;
    return frame.name !== is.name
      ? (<Route key={frame.name} path={frame.path} exact={!!frame.exactPath} component={
        function (props) {
          useEffect(() => { 
            setState({ ...state, is: frame, frames: frames.map((frame) => frame.name !== alias.name ? frame : { ...frame, show: true }), }); 
          });
          return <></>;
        }
      }/>)
      : (<Route key={frame.name} path={frame.path} exact={!!frame.exactPath} render={
        function (props) {
          return frames.map(frame => <TransitionFrame key={frame.name} frame={frame} is={is} views={views} {...props} />)
        }
      } />);
  });
  return <>{routes}</>;
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
