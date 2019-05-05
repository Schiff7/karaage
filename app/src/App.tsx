import React, { Component, useState, useEffect, ReactComponentElement } from 'react';
import { BrowserRouter as Router, Route, Switch, RouteComponentProps } from 'react-router-dom';
import { TransitionMotion, spring, TransitionStyle } from 'react-motion';
import { Nav, Post, Content, Categories, Tags, About, NoMatch, Loading } from './frames';
import { ContextWrapper } from './impure';
import * as R from 'ramda';
import './App.css';

interface FrameItem {
  key: string;
  component: any;
  from: string;
  show: boolean;
  path: string | undefined;
  exact?: boolean;
}
// Fundamental component
const Machine = () => {
  const views: { [key: string]: { [key: string]: number } } = {
    main: { left: 1, top: 1 },
    right: { left: 100, top: 1 },
    bottom: { left: 1, top: 100 },
    opaque: { opacity: 1 },
    transparent: { opacity: 0 }
  };
  const [ record, setRecord ]: [
    { frames: FrameItem[], queue: string[], props: {} },
    (record: any) => void
  ] = useState({
    frames: [
      { key: 'frame-home', path: '/', exact: true, component: Nav, from: 'main', show: true },
      { key: 'frame-content', path: '/posts', exact: true, component: Content, from: 'right', show: false },
      { key: 'frame-categories', path: '/categories', component: Categories, from: 'right', show: false },
      { key: 'frame-tags',path: '/tags', component: Tags, from: 'right', show: false },
      { key: 'frame-about', path: '/about', component: About, from: 'right', show: false },
      { key: 'frame-post', path: '/posts/:slug', component: Post, from: 'bottom', show: false },
      { key: 'frame-no-match', path: undefined, component: NoMatch, from: 'bottom', show: false }
    ],
    queue: ['frame-home'],
    props: {},
  });
  const { frames, queue } = record;
  const willLeave = ({ data: { from, zIndex } }: TransitionStyle) => {
    const { left, top } = views[from];
    return { left: spring(left), top: spring(top), opacity: spring(0), zIndex };
  }
  // Add special key `finished` to predict if the animation has finished, 
  // maybe crashed.
  const willEnter = ({ data: { from } }: TransitionStyle) => {
    return { ...views[from], opacity: 0, finished: 0 };
  }

  const getStyles = (): TransitionStyle[] => {
    const styles = R.pipe(
      R.filter((frame: FrameItem) => frame.show),
      R.map((frame: FrameItem) => {
        const { key } = frame;
        const zIndex = queue.indexOf(key);
        const data = R.pipe(R.dissoc('key'), R.merge({zIndex}))(frame);
        return { key, data, style: { left: spring(1), top: spring(1), opacity: spring(1), finished: spring(1) } };
      })
    )(frames);
    return styles as TransitionStyle[];
  }
  const getRoutes = () => {
    const actionRoutes = frames.map((frame: FrameItem) => 
      <Route 
        key={frame.key} 
        path={frame.path} 
        exact={!!frame.exact} component={(props: RouteComponentProps) => {
        const alias = frame;
        const index = queue.indexOf(frame.key) + 1;
        useEffect(() => {
          if (R.last(queue) === frame.key && frame.show) return;
          if (!index) {
            setRecord({ 
              frames: frames.map((frame: FrameItem) => frame.key !== alias.key ? frame : R.assoc('show', true, frame)),
              queue: R.append(frame.key, queue), 
              props: props,
            });
          } else {
            const next = queue.slice(0, index);
            setRecord({
              frames: frames.map((frame: FrameItem) => next.includes(frame.key) ? frame : R.assoc('show', false, frame)),
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
        <TransitionMotion willEnter={willEnter} willLeave={willLeave} styles={getStyles() as TransitionStyle[]}>
          {styles => <>{styles.map(({ key, data, style: { left, top, opacity, finished } }) => 
          <section key={key} className={`frame ${key}`} style={{ left: `${left}%`, top: `${top}%`, opacity, zIndex: data.zIndex }}>
            {finished < 1 ? <Loading /> : <data.component {...(R.last(queue) === key ? record.props : {})} />}
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
