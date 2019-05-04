import React, { Component, useEffect, useState } from 'react';
import { Motion, spring, OpaqueConfig } from 'react-motion';
import { Link } from 'react-router-dom';
import { withEffect, Status } from './impure';

export class FadeOut extends Component<{}, { [key: string]: number | OpaqueConfig }> {
  constructor (props: any) {
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

export function Loading (props: any) {
  return <div className="loading">LOADING...</div>;
}

// Component
export function Nav (props: any) {
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

export const Post = withEffect(function (props: any) {
  const { post } = props.store;
  useEffect(() => {
    const { run, match } = props;
    if (!!match) run('post', match.params.slug);
  }, [post.slug, post.status, props.slug]);
  return (
    post.status !== Status.SUCCESSFUL
    ? <Loading />
    : <FadeOut><div className='post' dangerouslySetInnerHTML={{ __html: post.value }}></div></FadeOut>
  );
});

export const Content = withEffect(function (props: any) {
  const { content: { value, status } } = props.store;
  const [content, setContent] = useState([]);
  useEffect(() => {
    if (status === Status.INITIAL) {
      const { run } = props;
      run('content');
    }
    if (status === Status.SUCCESSFUL) {
      const urlParams = new URLSearchParams(!props.location ? '' : props.location.search);
      const filterWithUrlParams = (col: any) => {
        const cat = urlParams.get('category');
        const tag = urlParams.get('tags');
        return !(cat || tag) ? col : col.filter((item: any) => item.category === cat || item.tags.includes(tag));
      }
      setContent(filterWithUrlParams(value));
    }
  }, [status]);

  return (
    status !== Status.SUCCESSFUL
    ? <Loading />
    : <FadeOut>
        <div className='content'>
          <ul>
            {content.length === 0
              ? <li>Nothing here.</li>
              : content.map(({ slug }: { slug: string }) => <li key={slug}><Link className="underline" to={`/posts/${slug}`}>{slug}</Link></li>)}
          </ul>
        </div>
      </FadeOut>
  );
});

export const Categories = withEffect(function (props: any) {
  const { categories: { value, status } } = props.store;
  useEffect(() => {
    if (status === Status.INITIAL) {
      const { run } = props;
      run('categories');
    }
  }, [status]);
  return (
    status !== Status.SUCCESSFUL
    ? <Loading />
    : <FadeOut>
        <div className='categories'>
          <ul>{value.map((category: any) => <li key={category}><Link className="underline" to={`/posts?category=${category}`}>{category}</Link></li>)}</ul>
        </div>
      </FadeOut>
  );
});

export const Tags = withEffect(function (props: any) {
  const { tags: { value, status } } = props.store;
  useEffect(() => {
    if (status === Status.INITIAL) {
      const { run } = props;
      run('tags');
    }
  }, [status]);
  return (
    status !== Status.SUCCESSFUL
    ? <Loading />
    : <FadeOut>
        <div className='tags'>
          <ul>{value.map((category: any) => <li key={category}><Link className="underline" to={`/posts?tags=${category}`}>{category}</Link></li>)}</ul>
        </div>
      </FadeOut>
  );
});

export const About = (props: any) => {
  return <div className='about'>UNDER CONSTRUCTION</div>;
}

export const NoMatch = function (props: any) {
  return <div className='no-match'>NO-MATCH</div>;
};