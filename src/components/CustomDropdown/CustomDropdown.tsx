import { useRef, useId, useMemo, useCallback, type ReactNode } from 'react';
import { useDropdownOpenClose } from './useDropdownOpenClose';
import { useDropdownSearch } from './useDropdownSearch';
import styles from './CustomDropdown.module.css';

export type CustomDropdownProps<T> = {
  options: T[];
  value: T | null;
  onChange: (value: T | null) => void;
  getItemKey: (item: T) => string | number;
  getItemLabel?: (item: T) => string;
  renderItem?: (item: T) => ReactNode;
  renderSelected?: (item: T) => ReactNode;
  onSearch?: (query: string) => T[] | Promise<T[]>;
  /** Debounce delay in ms for async onSearch. No debounce when 0 or omitted. */
  searchDebounceMs?: number;
  /** When false, no search input; list shows all options. */
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  /** i18n / reuse: all copy is configurable */
  placeholder?: string;
  searchPlaceholder?: string;
  loadingText?: string;
  emptyText?: string;
};

const defaultGetLabel = (item: unknown) =>
  typeof item === 'object' && item !== null && 'label' in item
    ? String((item as { label: string }).label)
    : String(item);

export function CustomDropdown<T>({
  options,
  value,
  onChange,
  getItemKey,
  getItemLabel = defaultGetLabel as (item: T) => string,
  renderItem,
  renderSelected,
  onSearch,
  searchDebounceMs = 0,
  searchable = true,
  disabled = false,
  className = '',
  placeholder = 'Оберіть варіант',
  searchPlaceholder = 'Пошук...',
  loadingText = 'Завантаження...',
  emptyText = 'Нічого не знайдено',
}: CustomDropdownProps<T>) {
  const id = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const onOpenRef = useRef<(() => void) | undefined>();

  const openClose = useDropdownOpenClose({
    id,
    disabled,
    onOpenRef,
  });

  const search = useDropdownSearch({
    options,
    isOpen: openClose.isOpen,
    getItemLabel,
    onSearch: searchable ? onSearch : undefined,
    searchDebounceMs,
  });

  onOpenRef.current = () => {
    search.resetSearch();
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  const displayOptions = openClose.isOpen
    ? (searchable ? search.searchResults : options)
    : options;

  const listContent = useMemo(() => {
    if (searchable && search.searchLoading)
      return <div className={styles.loading}>{loadingText}</div>;
    if (displayOptions.length === 0)
      return <div className={styles.empty}>{emptyText}</div>;
    return displayOptions.map((item) => (
      <div
        key={getItemKey(item)}
        role="option"
        aria-selected={value !== null && getItemKey(value) === getItemKey(item)}
        className={`${styles.option} ${value !== null && getItemKey(value) === getItemKey(item) ? styles.optionSelected : ''}`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          onChange(item);
          openClose.close();
        }}
      >
        {renderItem ? renderItem(item) : getItemLabel(item)}
      </div>
    ));
  }, [
    displayOptions,
    value,
    getItemKey,
    getItemLabel,
    renderItem,
    onChange,
    openClose.close,
    searchable,
    search.searchLoading,
    loadingText,
    emptyText,
  ]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => search.handleSearchChange(e),
    [search.handleSearchChange]
  );

  return (
    <div
      ref={openClose.containerRef}
      className={`${styles.root} ${className}`}
      onBlur={openClose.handleBlur}
      onKeyDown={openClose.handleKeyDown}
    >
      <button
        type="button"
        className={`${styles.trigger} ${openClose.isOpen ? styles.triggerOpen : ''}`}
        onMouseDown={openClose.handleTriggerMouseDown}
        onClick={openClose.handleTriggerClick}
        onFocus={openClose.handleTriggerFocus}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={openClose.isOpen}
        aria-labelledby={`${id}-label`}
      >
        <span
          id={`${id}-label`}
          className={`${styles.triggerLabel} ${value === null ? styles.triggerPlaceholder : ''}`}
        >
          {value !== null
            ? (renderSelected ? renderSelected(value) : getItemLabel(value))
            : placeholder}
        </span>
        <span className={styles.chevron} aria-hidden>▼</span>
      </button>

      {openClose.isOpen && (
        <div
          className={styles.panel}
          role="listbox"
          aria-activedescendant={value ? String(getItemKey(value)) : undefined}
        >
          {searchable && (
            <input
              ref={searchInputRef}
              type="text"
              className={styles.search}
              placeholder={searchPlaceholder}
              value={search.searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.stopPropagation()}
              autoComplete="off"
            />
          )}
          <div className={styles.list}>{listContent}</div>
        </div>
      )}
    </div>
  );
}
