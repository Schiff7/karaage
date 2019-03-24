import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <Route path='/' component={M} />
      </Router>
    );
  }
}

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

const SKELETON = [
  { 
    name: 'main-view',
    frames: [
      { name: 'home', path: '/', exactPath: true, component: Nav },
    ],
  },
  {
    name: 'right-view',
    frames: [
      { name: 'posts', path: '/posts/:query(category|tag|date)?/:keyword?', component: Posts },
      { name: 'categories', path: '/categories', component: Categories },
      { name: 'tags',path: '/tags', component: Tags },
      { name: 'about', path: '/about', component: About },
    ],
  },
  {
    name: 'bottom-view',
    frames: [
      { name: 'post', path: 'posts/:identifier', component: Paper },
    ],
  }
]



const View = (props) => {
  return (
    <section className={props.name}>
      {props.frames.map( frame => <Frame key={frame.name} path={frame.path} component={frame.component} /> )}
    </section>
  );
}

const Frame = ({name, path, component}) => {
  const T = component;
  return <T {...{name, path}} />;
}

const M = () => {
  return (
    <div className='container'>{SKELETON.map(view => <View key={view.name} {...view} />)}</div>
  );
}

export default App;
