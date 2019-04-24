import React, { useEffect, PureComponent } from 'react';
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
  const { effect } = props;
  useEffect (() => {
    const fetchPost = effect.get('post').last();
    const postsStates = effect.get('posts/tags/categories').first();
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
  }, [effect.get('post').first().get('status')]);
  const post = effect.get('post').first().get('post');
  return <div dangerouslySetInnerHTML={{ __html: post }}></div>;
}, 'post', 'posts/tags/categories');

export const Posts = withEffect(class extends PureComponent {
  componentDidMount () {
    const fetchPosts = this.props.effect.get('posts/tags/categories').last();
    fetchPosts();
  }
  
  render () {
    const posts = this.props.effect.get('posts/tags/categories').first().get('posts');
    return (
      <div>
        <ul>{posts.map(post => <li key={post.get('slug')}><Link to={`/posts/${post.get('slug')}`}>{post.get('slug')}</Link></li>)}</ul>
      </div>
    );
  }
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