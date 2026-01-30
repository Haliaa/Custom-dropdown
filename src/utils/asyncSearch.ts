/**
 * Generic async search for dropdowns. Works with any API:
 * - Server-side search: url is a function (query) => fetchUrl — API filters by query param.
 * - Client-side filter: url is a string — fetch list once, filter in JS by searchFields.
 */

export type AsyncSearchOptions<TRaw, TItem> = {
  /**
   * Request URL.
   * - string: fetch this URL once, filter results client-side (use searchFields).
   * - (query: string) => string: build URL with query for server-side search (e.g. ?search=...).
   */
  url: string | ((query: string) => string);
  /** How to get the list from the API response (e.g. res => res, or res => res.data). */
  getListFromResponse: (response: unknown) => TRaw[];
  /** Map raw API item to dropdown item (e.g. { id, label }). */
  mapToItem: (raw: TRaw) => TItem;
  /**
   * For client-side filter when url is a string.
   * Return strings to match against query (e.g. name, email). Omit when using server-side url.
   */
  searchFields?: (raw: TRaw) => string[];
  /** Optional delay in ms before fetch (e.g. to simulate slow network). */
  delayMs?: number;
};

/**
 * Creates a reusable async search function for any API.
 * Use a string url for APIs that return a full list (filter client-side).
 * Use a function url for APIs that accept a search param (filter server-side).
 */
export function createAsyncSearch<TRaw, TItem>(
  options: AsyncSearchOptions<TRaw, TItem>
): (query: string) => Promise<TItem[]> {
  const {
    url,
    getListFromResponse,
    mapToItem,
    searchFields,
    delayMs = 0,
  } = options;

  return async (query: string): Promise<TItem[]> => {
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }

    const urlToFetch = typeof url === 'function' ? url(query) : url;
    const res = await fetch(urlToFetch);
    const data = await res.json();
    const rawList = getListFromResponse(data);
    const items = rawList.map(mapToItem);

    // Server-side search: API already filtered
    if (typeof url === 'function') {
      return items;
    }

    // Client-side filter
    if (!query.trim()) return items;
    const lower = query.toLowerCase();
    const filtered = rawList.filter((raw) =>
      (searchFields?.(raw) ?? []).some((s) =>
        String(s).toLowerCase().includes(lower)
      )
    );
    return filtered.map(mapToItem);
  };
}

/**
 * Builds a URL builder for APIs that use a search query param.
 * Example: buildSearchUrl('https://api.example.com/users') → (q) => '...?search=...'
 */
export function buildSearchUrl(
  baseUrl: string,
  paramName = 'search'
): (query: string) => string {
  const separator = baseUrl.includes('?') ? '&' : '?';
  return (query: string) =>
    `${baseUrl}${separator}${paramName}=${encodeURIComponent(query)}`;
}
