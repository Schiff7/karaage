import React, { Component, useEffect } from 'react';
import { Motion, spring } from 'react-motion';
import { fromJS } from 'immutable';
import { Link } from 'react-router-dom';
import { withEffect } from './impure';

class FadeOut extends Component {
  constructor (props) {
    super(props);
    this.state = { opacity: 0 };
  }
  componentDidMount () {
    this.setState({ opacity: spring(1, { stiffness: 60, damping: 15 }) });
  }
  render () {
    return (
      <Motion defaultStyle={{ opacity: 0 }} style={this.state}>
        {style => <div style={style}>{this.props.children}</div>}
      </Motion>
    );
  }
}

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
      console.log('================= FETCH POSTS');
      m0();
    } else {
      if (s0.status === 'successful') {
        const { match } = props;
        if (!!match) {
          const slug = match.params.slug;
          const name = fromJS(s0.posts).find(post => post.get('slug') === slug).get('name');
          if (s1.name !== name) {
            console.log('================= FETCH POST');
            m1(name)
          };
        }
      }
    }
  }, [s1.name, s0.status, props.match]);
  return (
    s1.status !== 'successful'
    ? <div className='loading'>Loading...</div>
    : <FadeOut><div className='post' dangerouslySetInnerHTML={{ __html: s1.post }}></div></FadeOut>
  );
}, 'post', 'posts/tags/categories');

export const Posts = withEffect(function (props) {
  const [s0, m0] = props.effect.get('posts/tags/categories').toJS();
  const urlParams = new URLSearchParams(!props.location ? '' : props.location.search);
  const filterWithUrlParams = (col) => {
    const cat = urlParams.get('category');
    const tag = urlParams.get('tag');
    return !(cat || tag) ? col : col.filter((item) => item.category === cat || item.tags.includes(tag));
  }
  const posts = filterWithUrlParams(s0.posts);
  useEffect(() => {
    if (s0.status === 'init') {
      console.log('================= FETCH POSTS');
      m0();
    }
  }, [s0.status]);
  return (
    s0.status !== 'successful'
    ? <div className='loading'>Loading...</div>
    : <FadeOut>
        <div className='posts'>
          <ul>
            {posts.length === 0
              ? <li>Nothing here.</li>
              : posts.map(({ slug }) => <li key={slug}><Link className="underline" to={`/posts/${slug}`}>{slug}</Link></li>)}
          </ul>
        </div>
      </FadeOut>
  );
}, 'posts/tags/categories');

export const Categories = withEffect(function (props) {
  const [s0, m0] = props.effect.get('posts/tags/categories').toJS();
  useEffect(() => {
    if (s0.status === 'init') {
      console.log('================= FETCH POSTS');
      m0();
    }
  }, [s0.status]);
  return (
    s0.status !== 'successful'
    ? <div className='loading'>Loading...</div>
    : <FadeOut>
        <div className='categories'>
          <ul>{s0.categories.map(category => <li key={category}><Link className="underline" to={`/posts?category=${category}`}>{category}</Link></li>)}</ul>
        </div>
      </FadeOut>
  );
}, 'posts/tags/categories');

export const Tags = withEffect(function (props) {
  const [s0, m0] = props.effect.get('posts/tags/categories').toJS();
  useEffect(() => {
    if (s0.status === 'init') {
      console.log('================= FETCH POSTS');
      m0();
    }
  }, [s0.status]);
  return (
    s0.status !== 'successful'
    ? <div className='loading'>Loading...</div>
    : <FadeOut>
        <div className='tags'>
          <ul>{s0.tags.map(tag => <li key={tag}><Link className="underline" to={`/posts?tag=${tag}`}>{tag}</Link></li>)}</ul>
        </div>
      </FadeOut>
  );
}, 'posts/tags/categories');

export const About = (props) => {
  return <div className='about'>UNDER CONSTRUCTION</div>;
}

export function NoMatch (props) {
  return <div className='no-match'>NO-MATCH</div>;
}