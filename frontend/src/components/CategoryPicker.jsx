import { useState } from 'react';

export default function CategoryPicker({
  categories,
  defaultValue = '',
  emptyLabel = 'Uncategorized',
}) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(String(defaultValue || ''));
  const matchingCategories = categories.filter(category =>
    category.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  const selectedCategory = categories.find(
    category => String(category.id) === selected,
  );
  const visibleCategories =
    selectedCategory &&
    !matchingCategories.some(category => category.id === selectedCategory.id)
      ? [selectedCategory, ...matchingCategories]
      : matchingCategories;

  return (
    <>
      {categories.length > 5 && (
        <input
          className="category-search-input"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search categories"
          aria-label="Search categories"
        />
      )}
      <select
        name="category"
        value={selected}
        onChange={event => setSelected(event.target.value)}
      >
        <option value="">{emptyLabel}</option>
        {visibleCategories.map(category => (
          <option value={category.id} key={category.id}>{category.name}</option>
        ))}
      </select>
      {query && !matchingCategories.length && (
        <small className="category-search-hint">
          No categories match. Try another search.
        </small>
      )}
    </>
  );
}
