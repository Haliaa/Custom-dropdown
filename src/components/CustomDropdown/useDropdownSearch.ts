import { useState, useCallback, useEffect, useRef } from 'react';

type UseDropdownSearchOptions<T> = {
  options: T[];
  isOpen: boolean;
  getItemLabel: (item: T) => string;
  onSearch?: (query: string) => T[] | Promise<T[]>;
  /** Debounce delay in ms for async onSearch. Ignored when 0 or when no onSearch. */
  searchDebounceMs?: number;
};

const runSearch = <T,>(
  query: string,
  onSearch: (query: string) => T[] | Promise<T[]>,
  setSearchResults: (list: T[]) => void,
  setSearchLoading: (loading: boolean) => void
) => {
  setSearchLoading(true);
  const result = onSearch(query);
  if (result instanceof Promise) {
    result
      .then((list) => {
        setSearchResults(list);
        setSearchLoading(false);
      })
      .catch(() => setSearchLoading(false));
  } else {
    setSearchResults(result);
    setSearchLoading(false);
  }
};

/**
 * Single responsibility: search query, filtered/async results, loading state.
 * Reusable for any searchable list (dropdown, combobox, autocomplete).
 */
export function useDropdownSearch<T>({
  options,
  isOpen,
  getItemLabel,
  onSearch,
  searchDebounceMs = 0,
}: UseDropdownSearchOptions<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<T[]>(options);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setSearchQuery(q);

      if (onSearch) {
        const delay = searchDebounceMs > 0 ? searchDebounceMs : 0;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (delay > 0) {
          debounceRef.current = setTimeout(() => {
            debounceRef.current = null;
            runSearch(q, onSearch, setSearchResults, setSearchLoading);
          }, delay);
        } else {
          runSearch(q, onSearch, setSearchResults, setSearchLoading);
        }
      } else {
        const lower = q.toLowerCase();
        setSearchResults(
          options.filter((item) =>
            getItemLabel(item).toLowerCase().includes(lower)
          )
        );
      }
    },
    [onSearch, options, getItemLabel, searchDebounceMs]
  );

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  useEffect(() => {
    if (!isOpen && debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!onSearch) {
      setSearchResults(options);
      return;
    }
    // Async search: when opening with empty input, load all items via onSearch('')
    runSearch('', onSearch, setSearchResults, setSearchLoading);
  }, [isOpen, onSearch]);

  const resetSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults(options);
  }, [options]);

  return {
    searchQuery,
    searchResults,
    searchLoading,
    handleSearchChange,
    resetSearch,
  };
}
