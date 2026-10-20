import { useState } from 'react';
import EmptyState from './EmptyState';
import PageHeading from './PageHeading';

export default function Categories({ categories, products, onAdd }) {
  const [query, setQuery] = useState('');
  const filteredCategories = categories.filter(category =>
    category.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );

  return (
    <>
      <PageHeading
        eyebrow="ORGANIZE YOUR HOME"
        title="Categories"
        description="Group items in a way that makes sense for you."
        action={
          <button className="button primary" onClick={onAdd}>
            ＋ New category
          </button>
        }
      />

      {categories.length > 5 && (
        <div className="category-search-wrap">
          <input
            className="category-search-input"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search categories"
            aria-label="Search categories"
          />
          <span>{filteredCategories.length} of {categories.length}</span>
        </div>
      )}

      {filteredCategories.length ? (
        <div className="category-cards">
          {filteredCategories.map(category => {
            const items = products.filter(
              product => product.category === category.id,
            );

            return (
              <div className="category-card" key={category.id}>
                <div className="category-card-icon">▦</div>
                <div>
                  <h3>{category.name}</h3>
                  <p>{items.length} {items.length === 1 ? 'item' : 'items'}</p>
                </div>
                <div className="category-items">
                  {items.slice(0, 3).map(product => (
                    <span key={product.id}>{product.name}</span>
                  ))}
                  {items.length > 3 && <span>+{items.length - 3} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      ) : categories.length ? (
        <div className="surface">
          <EmptyState
            icon="⌕"
            title="No categories match"
            text="Try another search."
          />
        </div>
      ) : (
        <div className="surface">
          <EmptyState
            icon="▦"
            title="No categories yet"
            text="Create your first category to organize your inventory."
          />
        </div>
      )}
    </>
  );
}
