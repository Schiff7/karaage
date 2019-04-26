import React, { Component, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { TransitionMotion, spring } from 'react-motion';
import { fromJS, List } from 'immutable';
import { Nav, Post, Posts, Categories, Tags, About, NoMatch } from './frames';
import { ContextWrapper } from './impure';
import './App.css';


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
      { key: 'frame-posts', path: '/posts', exact: true, component: Posts, from: 'right', show: false },
      { key: 'frame-categories', path: '/categories', component: Categories, from: 'right', show: false },
      { key: 'frame-tags',path: '/tags', component: Tags, from: 'right', show: false },
      { key: 'frame-about', path: '/about', component: About, from: 'right', show: false },
      { key: 'frame-post', path: '/posts/:slug', component: Post, from: 'bottom', show: false },
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
      <Switch>{getRoutes()}</Switch>
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
