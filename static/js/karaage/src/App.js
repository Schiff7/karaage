import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
    return (
      <section><Nav /></section>
    );
  }
}

const Nav = (props) => {
  return (
    <nav>
      <h2 className="align-center" data-text="Hello, World!"><span>{"Hello, World!"}</span></h2>
      <ul className="without-list-style align-center cursor-pointer">
        <li><a className="underline" href="/posts">POSTS</a></li>
        <li><a className="underline" href="/categories">CAREGORIES</a></li>
        <li><a className="underline" href="/tags">TAGS</a></li>
        <li><a className="underline" href="/about">ABOUT</a></li>
      </ul>
    </nav>
  );
}

export default App;
