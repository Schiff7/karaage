import axios from 'axios';
import * as R from 'ramda';

/**
 * TODO: async and life cycle
 * TODO: separate async actions and sync ones
 * TODO: add types
 * TODO: ramda
 */

axios.defaults.baseURL = 'https://karaage.me';
type Post = {
  name: string;
  slug: string;
  date: { y: string; m: string; d: string; };
  category: string;
  tags: string[];
};
const fetchContent = async (): Promise<Post[]> => {
  const response = await axios.get('/api/content.json');
  return response.data;
}

const fetchPost = async (name: string): Promise<string> => {
  const response = await axios.get(`/data/${name}`);
  return response.data;
}


const want = (...keywords: string[]): Promise<{}> => (Promise.resolve({}));

type Mutation = ((...args: any[]) => IterableIterator<any>) | ((...args: any[]) => any);
type StateAndMutation = {
  keyword: string;
  state: any;
  mutation: Mutation;
}

const content: StateAndMutation = {
  keyword: 'content',
  state: [],
  mutation: function* () {
    const content = yield fetchContent();
    return content;
  }
}
const post: StateAndMutation = {
  keyword: 'post',
  state: '',
  mutation: function* (slug) {
    const { content }: { content: Post[] } = yield want('content');
    const one = R.find(R.propEq('slug', slug), content);
    const post = one ? fetchPost(one.name): '404';
    return post;
  }
}
const tags: StateAndMutation = {
  keyword: 'tags',
  state: [],
  mutation: function* () {
    const { content }: { content: Post[] } = yield want('content');
    const tags = R.pipe(
      R.reduce((acc: string[], item: Post) => acc.concat(item.tags))([]),
      R.dropRepeats
    )(content);
    return tags;
  }
}

const categories: StateAndMutation = {
  keyword: 'categories',
  state: [],
  mutation: function* () {
    const { content }: { content: Post[] } = yield want('content');
    const tags = R.pipe(
      R.reduce((acc: string[], item: Post) => R.append(item.category, acc))([]),
      R.dropRepeats
    )(content);
    return tags;
  }
}

function executor (gen: Mutation, send: (v: any) => void, ...params: any[]) {
  function next (cont: any, prev: any) {
    const { value, done } = cont.next(prev);
    if (done) { send(value); return; };
    if (value instanceof Promise) {
      value.then(_value => {
        next(cont, _value);
      });
    } else {
      send(value);
      next(cont, value);
    }
  }
  if (Object.prototype.toString.call(gen) !== '[object GeneratorFunction]') {
    send(gen(...params));
  } else {
    const cont = gen(...params);
    next(cont, undefined);
  }
}