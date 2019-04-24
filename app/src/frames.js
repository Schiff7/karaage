import React, { useEffect } from 'react';
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
  console.log(props);
  useEffect (() => {
    const effect = props.effect;
    const fetchPost = effect.get('post').last();
    const postsStates = effect.get('posts/tags/categories').first();
    console.log(postsStates)
    const isPostsFetched = postsStates.get('status');
    if (isPostsFetched !== 'successful') {
      const fetchPosts = effect.get('posts/tags/categories').last();
      fetchPosts();
    } else {
      const { match } = props;
      const slug = match.params.identifier;
      const fullName = postsStates.get('posts').find(post => post.slug = slug).get('fullName');
      fetchPost(fullName);
    }
  })
  const { effect } = props;
  const post = effect.get('post').first().get('post');
  return <div dangerouslySetInnerHTML={{ __html: post }}></div>;
}, 'post', 'posts/tags/categories');

export const Posts = (props) => {
  return <div>POSTS<Link to='/tags'>TAGS</Link><Link to='/posts/something'>PAPER</Link>{JSON.stringify(props)}</div>;
}

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