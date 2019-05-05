import React, { Component, useEffect, useState, ReactElement } from 'react';
import { Motion, spring, Style } from 'react-motion';
import { Link, RouteComponentProps } from 'react-router-dom';
import { withEffect, Status, ContentItem } from './impure';

export class FadeOut extends Component<{}, Style> {
  constructor (props: {}) {
    super(props);
    this.state = { opacity: 0 };
  }
  componentDidMount () {
    this.setState({ opacity: spring(1) });
  }
  render () {
    return (
      <Motion defaultStyle={{ opacity: 0 }} style={this.state}>
        {style => <div style={style}>{this.props.children}</div>}
      </Motion>
    );
  }
}

export function Loading () {
  return <div className="loading">LOADING...</div>;
}

export function MaybeLoading (props: { predict: boolean; children: ReactElement }) {
  return props.predict ? <FadeOut>{props.children}</FadeOut> : <Loading />;
}

type FrameProp<T> = RouteComponentProps<T> & { run: (keyword: string, params?: any) => void, store: { [key: string]: any } };

// Component
export function Nav () {
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

export const Post = withEffect(function (props: FrameProp<{ slug?: string }>) {
  const { post: { value, status } } = props.store;
  const slug = props.match && props.match.params.slug; 
  useEffect(() => {
    const { run } = props;
    if (!!slug) run('post', slug);
  }, [slug, status]);
  return (
    <MaybeLoading predict={status === Status.SUCCESSFUL}>
      <div className='post' dangerouslySetInnerHTML={{ __html: value }}></div>
    </MaybeLoading>
  );
});

export const Content = withEffect(function (props: FrameProp<{}>) {
  const { content: { value, status } } = props.store;
  const [content, setContent] = useState([] as ContentItem[]);
  useEffect(() => {
    if (status === Status.INITIAL) {
      const { run } = props;
      run('content');
    }
    if (status === Status.SUCCESSFUL) {
      const urlParams = new URLSearchParams(props.location ? props.location.search : '');
      const filterWithUrlParams = (col: ContentItem[]) => {
        const cat = urlParams.get('category');
        col = !cat ? col : col.filter((item) => item.category === cat);
        const tag = urlParams.get('tags');
        col = !tag ? col : col.filter((item) => item.tags.includes(tag));
        const date = urlParams.get('date');
        col = !date ? col : col.filter((item) => {
          const fullDate: string = item.date.y + item.date.m + item.date.d;
          return fullDate.includes(date);
        })
        return col;
      }
      setContent(filterWithUrlParams(value));
    }
  }, [status]);

  return (
    <MaybeLoading predict={status === Status.SUCCESSFUL}>
      <div className='content'>
        <ul>
          {content.length === 0
            ? <li>Nothing here.</li>
            : content.map(({ slug }: { slug: string }) => <li key={slug}><Link className="underline" to={`/posts/${slug}`}>{slug}</Link></li>)}
        </ul>
      </div>
    </MaybeLoading>
  );
});

export const Categories = withEffect(function (props: FrameProp<{}>) {
  const { categories: { value, status } } = props.store;
  useEffect(() => {
    if (status === Status.INITIAL) {
      const { run } = props;
      run('categories');
    }
  }, [status]);
  return (
    <MaybeLoading predict={status === Status.SUCCESSFUL}>
      <div className='categories'>
        <ul>{value.map((category: string) => <li key={category}><Link className="underline" to={`/posts?category=${category}`}>{category}</Link></li>)}</ul>
      </div>
    </MaybeLoading>
  );
});

export const Tags = withEffect(function (props: FrameProp<{}>) {
  const { tags: { value, status } } = props.store;
  useEffect(() => {
    if (status === Status.INITIAL) {
      const { run } = props;
      run('tags');
    }
  }, [status]);
  return (
    <MaybeLoading predict={status === Status.SUCCESSFUL}>
      <div className='tags'>
        <ul>{value.map((tag: string) => <li key={tag}><Link className="underline" to={`/posts?tags=${tag}`}>{tag}</Link></li>)}</ul>
      </div>
    </MaybeLoading>
  );
});

export function About () {
  return <div className='about'>UNDER CONSTRUCTION</div>;
}

export function NoMatch () {
  return <div className='no-match'>NO-MATCH</div>;
};