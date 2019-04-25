import React, { useEffect } from 'react';
import { fromJS } from 'immutable';
import { Link } from 'react-router-dom';
import { withEffect } from './impure';

// Component
export function Nav (props) {
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

export const Post = withEffect(function (props) {
  const [s0, m0] = props.effect.get('posts/tags/categories').toJS();
  const [s1, m1] = props.effect.get('post').toJS();
  useEffect (() => {
    if (s0.status === 'init') {
      m0();
    } else {
      if (s0.status === 'successful') {
        const { match } = props;
        if (!!match) {
          const slug = match.params.identifier;
          const name = fromJS(s0.posts).find(post => post.get('slug') === slug).get('name');
          m1(name);
        }
      }
    }
  }, [s1.name, s0.status]);
  return (
    s1.status !== 'successful'
    ? <div className='loading'>Loading...</div>
    : <div className='post' dangerouslySetInnerHTML={{ __html: s1.post }}></div>
  );
}, 'post', 'posts/tags/categories');

export const Posts = withEffect(function (props) {
  const [s0, m0] = props.effect.get('posts/tags/categories').toJS();
  useEffect(() => {
    if (s0.status === 'init') {
      m0();
    }
  }, [s0.status]);
  return (
    s0.status !== 'successful'
    ? <div className='loading'>Loading...</div>
    : <div className='posts'>
        <ul>{s0.posts.map(({ slug }) => <li key={slug}><Link to={`/posts/${slug}`}>{slug}</Link></li>)}</ul>
      </div>
  );
}, 'posts/tags/categories');

export const Categories = (props) => {
  return <div>CATEGORIES</div>;
}

export const Tags = (props) => {
  return <div>TAGS<Link to='/'>HOME</Link></div>;
}

export const About = (props) => {
  return <div>ABOUT</div>;
}

export function NoMatch (props) {
  return <div>NO-MATCH</div>;
}