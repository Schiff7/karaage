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
  const [{ posts, status }, fetchPosts] = props.effect.get('posts/tags/categories').toJS();
  const [{ post }, fetchPost] = props.effect.get('post').toJS();
  useEffect (() => {
    if (status === 'init') {
      fetchPosts();
    } else {
      if (status === 'successful') {
        const { match } = props;
        if (!!match) {
          const slug = match.params.identifier;
          console.log(slug);
          const fullName = fromJS(posts).find(post => post.slug = slug).get('fullName');
          fetchPost(fullName);
        }
      }
    }
  });
  return <div dangerouslySetInnerHTML={{ __html: post }}></div>;
}, 'post', 'posts/tags/categories');

export const Posts = withEffect(function (props) {
  const [states, fetchPosts] = props.effect.get('posts/tags/categories').toJS();
  const posts = states.posts;
  useEffect(() => {
    if (states.status === 'init') {
      fetchPosts();
    }
  });
  return (
    <div className="posts">
      <ul>{posts.map(({ slug }) => <li key={slug}><Link to={`/posts/${slug}`}>{slug}</Link></li>)}</ul>
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