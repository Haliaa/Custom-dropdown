# Custom-dropdown

Кастомний React-компонент dropdown згідно з макетом: відкриття по кліку/фокусу, пошук, кастомний рендер елементів і обраного, підтримка асинхронного пошуку.

## Встановлення

```bash
npm install
```

## Запуск демо

```bash
npm run dev
```

Відкрийте в браузері URL з терміналу (зазвичай `http://localhost:5173`).

## Збірка

```bash
npm run build
```

## Використання

Обгорніть застосунок у `DropdownProvider`, щоб кілька дропдаунів на сторінці коректно закривали один одного:

```tsx
import { DropdownProvider, CustomDropdown } from './components/CustomDropdown';

<DropdownProvider>
  <CustomDropdown
    options={items}
    value={selected}
    onChange={setSelected}
    placeholder="Оберіть ваше місто"
    searchPlaceholder="Пошук..."
    getItemKey={(item) => item.id}
    getItemLabel={(item) => item.name}
    renderItem={(item) => <span>{item.name}</span>}
    renderSelected={(item) => <span>📍 {item.name}</span>}
    onSearch={async (query) => fetchFromServer(query)}
  />
</DropdownProvider>
```

### Асинхронний пошук

Є два варіанти: **клієнтський пошук** (API повертає весь список, фільтрація в JS) і **серверний пошук** (API приймає параметр у URL і повертає вже відфільтрований список).

**Клієнтський пошук** — API без параметра пошуку, фільтрація за `searchFields` у браузері. Готовий приклад: `createJsonPlaceholderUserSearch` з `./utils` (як у демо, секція 4).

**Серверний пошук** — API приймає параметр пошуку в URL (наприклад, `GET https://api.example.com/users?q=john`). Використовуйте `createAsyncSearch` з функцією `url` та `buildSearchUrl`:

```tsx
import { createAsyncSearch, buildSearchUrl } from './utils';

// Тип користувача з API
type ApiUser = {
  id: number;
  name: string;
  email: string;
};

// Елемент для dropdown (наприклад, SimpleItem)
type UserItem = { id: number; label: string };

// Серверний пошук: URL залежить від запиту
const searchUsers = createAsyncSearch<ApiUser, UserItem>({
  url: buildSearchUrl('https://api.example.com/users', 'q'),
  getListFromResponse: (res) => (res as { data: ApiUser[] }).data,
  mapToItem: (u) => ({ id: u.id, label: `${u.name} (${u.email})` }),
});

// Використання в dropdown — передайте searchUsers як onSearch
<CustomDropdown
  options={[]}
  value={selected}
  onChange={setSelected}
  getItemKey={(i) => i.id}
  getItemLabel={(i) => i.label}
  onSearch={searchUsers}
  searchDebounceMs={300}
/>
```

**Інший параметр у URL:**

```tsx
url: buildSearchUrl('https://api.example.com/users', 'search'),  // ?search=...
```

**Базовий URL вже містить query-параметри:**

```tsx
url: buildSearchUrl('https://api.example.com/users?limit=20', 'q'),  // додасть &q=...
```

**Власний формат URL (не ?param=query):**

```tsx
url: (query) =>
  `https://api.example.com/users?filter=${encodeURIComponent(query)}&sort=name`,
```

### Пропси

| Проп | Опис |
|------|------|
| `options` | Масив варіантів |
| `value` | Обраний елемент або `null` |
| `onChange` | Колбек при виборі |
| `getItemKey` | Функція ключа для React |
| `getItemLabel` | Текст для пошуку та за замовчуванням (опційно) |
| `placeholder` | Текст тригера без вибору |
| `searchPlaceholder` | Плейсхолдер поля пошуку |
| `renderItem` | Кастомний рендер елемента списку |
| `renderSelected` | Кастомний вигляд обраного в тригері |
| `onSearch` | Кастомна функція пошуку (sync або async); при наявності — асинхронний режим |
| `searchDebounceMs` | Затримка debounce в мс для `onSearch`; за замовчуванням 0 (без debounce) |
| `searchable` | Чи показувати поле пошуку; за замовчуванням `true` |
| `disabled` | Вимкнути dropdown |
| `className` | Додатковий CSS-клас для кореневого елемента |
| `loadingText` | Текст під час завантаження (async-пошук); за замовчуванням «Завантаження...» |
| `emptyText` | Текст, якщо нічого не знайдено; за замовчуванням «Нічого не знайдено» |

## License

MIT
