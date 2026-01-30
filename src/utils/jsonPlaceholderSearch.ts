import type { SimpleItem } from '../data';
import { createAsyncSearch } from './asyncSearch';

export type JsonPlaceholderUser = {
  id: number;
  name: string;
  username: string;
  email: string;
};

const DEFAULT_URL = 'https://jsonplaceholder.typicode.com/users';

/**
 * Ready-made async search for JSONPlaceholder users (client-side filter).
 * Change url (and optionally getListFromResponse / mapToItem) to use another API.
 */
export const createJsonPlaceholderUserSearch = (options: {
  delayMs?: number;
  url?: string;
} = {}) =>
  createAsyncSearch<JsonPlaceholderUser, SimpleItem>({
    url: options.url ?? DEFAULT_URL,
    getListFromResponse: (res) => res as JsonPlaceholderUser[],
    mapToItem: (u) => ({ id: u.id, label: `${u.name} (${u.email})` }),
    searchFields: (u) => [u.name, u.email, u.username],
    delayMs: options.delayMs ?? 0,
  });
