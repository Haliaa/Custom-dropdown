import { useState } from 'react';
import { DropdownProvider, CustomDropdown } from './components/CustomDropdown';
import { CITIES, SIMPLE_ITEMS, type City, type SimpleItem } from './data';
import { createJsonPlaceholderUserSearch } from './utils';
import './App.css';

// Change url (and getListFromResponse / mapToItem / searchFields) to use another API.
// For server-side search use: url: buildSearchUrl('https://api.example.com/users', 'q')
const asyncSearch = createJsonPlaceholderUserSearch({ delayMs: 400 });

function App() {
  const [city, setCity] = useState<City | null>(null);
  const [simple, setSimple] = useState<SimpleItem | null>(null);
  const [asyncSelected, setAsyncSelected] = useState<SimpleItem | null>(null);

  return (
    <DropdownProvider>
      <div className="app">
      <header className="header">
        <h1>Custom Dropdown — Демо</h1>
        <p>Перевірка відкриття/закриття, пошуку, кастомного рендеру та асинхронного пошуку.</p>
      </header>

      <main className="main">
        <section className="section">
          <h2>1. Місто (як у макеті)</h2>
          <CustomDropdown<City>
            options={CITIES}
            value={city}
            onChange={setCity}
            placeholder="Оберіть ваше місто"
            searchPlaceholder="Пошук..."
            getItemKey={(c) => c.id}
            getItemLabel={(c) => c.name}
          />
        </section>

        <section className="section">
          <h2>2. Простий список (Item 1, Item 2, Item 3)</h2>
          <CustomDropdown<SimpleItem>
            options={SIMPLE_ITEMS}
            value={simple}
            onChange={setSimple}
            placeholder="Оберіть варіант"
            searchPlaceholder="Пошук..."
            getItemKey={(i) => i.id}
            getItemLabel={(i) => i.label}
          />
        </section>

        <section className="section">
          <h2>3. Кастомний вигляд елемента та обраного</h2>
          <CustomDropdown<City>
            options={CITIES}
            value={city}
            onChange={setCity}
            placeholder="Оберіть місто"
            getItemKey={(c) => c.id}
            getItemLabel={(c) => c.name}
            renderItem={(c) => (
              <span><strong>{c.name}</strong> — {c.region}</span>
            )}
            renderSelected={(c) => (
              <span>📍 {c.name}</span>
            )}
          />
        </section>

        <section className="section">
          <h2>4. Асинхронний пошук з Debounce 300ms (JSONPlaceholder users)</h2>
          <CustomDropdown<SimpleItem>
            options={[]}
            value={asyncSelected}
            onChange={setAsyncSelected}
            placeholder="Введіть текст для пошуку..."
            searchPlaceholder="Пошук..."
            getItemKey={(i) => i.id}
            getItemLabel={(i) => i.label}
            onSearch={asyncSearch}
            searchDebounceMs={300}
          />
        </section>
      </main>
      </div>
    </DropdownProvider>
  );
}

export default App;
