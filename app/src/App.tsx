import React, { Component, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, RouteComponentProps } from 'react-router-dom';
import { TransitionMotion, spring, TransitionStyle, presets } from 'react-motion';
import { Nav, Post, Content, Categories, Tags, About, NoMatch, Loading } from './frames';
import { ContextWrapper } from './impure';
import * as R from 'ramda';
import './App.css';

// Frame
interface Frame {
  key: string;
  component: any;
  from: string;
  show: boolean;
  path: string | undefined;
  exact?: boolean;
}
// Record
interface Record { 
  frames: Frame[];
  queue: string[];
  props: RouteComponentProps;
}

// Global react-motion genSpring config helper;
const genSpring = (val: number) => {
  return spring(val, {stiffness: 60, damping: 15});
}

// Fundamental component
/**
 * 
 * There are Frames in the Machine.
 * Frames are basic assets to hold web content.
 * Frames have the same size as the window.
 * There are three position views: `main`, `right`, `bottom`.
 * A Frame can only be in either the `main` view, or the view where it is from.
 * Only the last Frame that be put into the `main` view can be seen by user.
 * Set the property of Frame `show` true will render the frame 
 * - and trigger an animation of the frame from the view where it is from to `main` view.
 * Set the property of Frame `show` false will trigger an animation of the frame 
 * - from the `main` view to the view where it is from and remove the frame.
 * Use router to control the visible of Frames.
 * Based on `TransitionMotion` of `react-motion`.
 * 
 */
const Machine = () => {
  const views: { [key: string]: { [key: string]: number } } = {
    main: { left: 1, top: 1, scale: 1, rotateX: 0, rotateY: 0 },
    right: { left: 100, top: 1, scale: 1.25, rotateX: 0, rotateY: 60 },
    bottom: { left: 1, top: 100, scale: 1.25, rotateX: 60, rotateY: 0 },
    opaque: { opacity: 1 },
    transparent: { opacity: 0 }
  };
  const [record, setRecord]: [Record, (record: Record) => void] = useState({
    // Frames
    frames: [
      { key: 'frame-home', path: '/', exact: true, component: Nav, from: 'main', show: true },
      { key: 'frame-content', path: '/posts', exact: true, component: Content, from: 'right', show: false },
      { key: 'frame-categories', path: '/categories', component: Categories, from: 'right', show: false },
      { key: 'frame-tags',path: '/tags', component: Tags, from: 'right', show: false },
      { key: 'frame-about', path: '/about', component: About, from: 'right', show: false },
      { key: 'frame-post', path: '/posts/:slug', component: Post, from: 'bottom', show: false },
      { key: 'frame-no-match', path: undefined, component: NoMatch, from: 'bottom', show: false },
    ],
    // Frames in `main` view
    queue: ['frame-home'],
    // Route props
    // Will be passed to the current visible Frame.
    props: {} as RouteComponentProps,
  } as Record);
  const { frames, queue } = record;
  // Styles that will be applied before the Frames unmount.
  const willLeave = ({ data: { from, zIndex } }: TransitionStyle) => {
    const { left, top, scale, rotateX, rotateY } = views[from];
    return { 
      zIndex, 
      left: genSpring(left), 
      top: genSpring(top), 
      opacity: genSpring(0),
      scale: genSpring(scale),
      rotateX: genSpring(rotateX),
      rotateY: genSpring(rotateY)
    };
  }
  // Styles that will be applied when Frames mount.
  // Add special key `finished` to predict if the animation has finished, 
  // Maybe crashed.
  const willEnter = ({ data: { from } }: TransitionStyle) => {
    return { ...views[from], opacity: 0, finished: 0 };
  }
  // Generate styles passed to `TransitionMotion`.
  const getStyles = (): TransitionStyle[] => {
    const styles = R.pipe(
      R.filter((frame: Frame) => frame.show),
      R.map((frame: Frame) => {
        const { key } = frame;
        const zIndex = queue.indexOf(key);
        const data = R.pipe(R.dissoc('key'), R.merge({zIndex}))(frame);
        return { key, data, style: { 
          left: genSpring(1), 
          top: genSpring(1), 
          opacity: genSpring(1), 
          scale: genSpring(1),
          rotateX: genSpring(0),
          rotateY: genSpring(0),
          finished: genSpring(1) 
        } };
      })
    )(frames);
    return styles as TransitionStyle[];
  }
  // The Route matches current path does nothing.
  // Routes do not match current path will render a component 
  // - in which the effect hook update the record state hook result in triggering a new render.
  // The above two points keep the Machine run with Router.
  const getRoutes = () => {
    const actionRoutes = frames.map((frame: Frame) => 
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
                frames: frames.map((frame: Frame) => frame.key !== alias.key ? frame : R.assoc('show', true, frame)),
                queue: R.append(frame.key, queue), 
                props: props,
              });
            } else {
              const next = queue.slice(0, index);
              setRecord({
                frames: frames.map((frame: Frame) => next.includes(frame.key) ? frame : R.assoc('show', false, frame)),
                queue: next,
                props: props,
              });
            }
          });
          return <></>;
        }}
      />);
    return actionRoutes;
  }
  return (
    <>
      <Switch>{getRoutes()}</Switch>
      <ContextWrapper>
        <TransitionMotion willEnter={willEnter} willLeave={willLeave} styles={getStyles() as TransitionStyle[]}>
          {styles => <>{styles.map(({ key, data, style: { left, top, opacity, scale, rotateX, rotateY, finished } }) => 
          <section key={key} className={`frame ${key}`} style={{
            opacity,
            zIndex: data.zIndex,
            left: `${left}%`, 
            top: `${top}%`, 
            transform: `scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          }}>
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
