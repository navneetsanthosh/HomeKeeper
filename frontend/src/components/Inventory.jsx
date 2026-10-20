import { useState } from 'react';
import EmptyState from './EmptyState';
import PageHeading from './PageHeading';
import ProductCard from './ProductCard';
import { isActiveProduct, statusLabels } from './productUtils';

export default function Inventory({
  products,
  categories,
  onAdd,
  onEdit,
  onDelete,
  onStatus,
}) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const shownProducts = products.filter(product => {
    const searchText = `${product.name} ${product.brand} ${product.model_number}`;
    const matchesQuery = searchText.toLowerCase().includes(query.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || String(product.category || '') === selectedCategory;
    const matchesStatus =
      selectedStatus === 'all' || product.status === selectedStatus;

    return matchesQuery && matchesCategory && matchesStatus;
  });

  return (
    <>
      <PageHeading
        eyebrow="YOUR BELONGINGS"
        title="Inventory"
        description={`${products.filter(isActiveProduct).length} items currently tracked in your home.`}
        action={
          <div className="dashboard-actions">
            <button className="button primary" onClick={onAdd}>＋ Add an item</button>
          </div>
        }
      />

      <div className="toolbar surface">
        <div className="search-box">
          <span>⌕</span>
          <input
            placeholder="Search products, brands, models…"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={event => setSelectedCategory(event.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={event => setSelectedStatus(event.target.value)}
        >
          <option value="all">All statuses</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option value={value} key={value}>{label}</option>
          ))}
        </select>
      </div>

      {shownProducts.length ? (
        <div className="product-grid">
          {shownProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => onEdit(product)}
              onDelete={() => onDelete(product.id)}
              onStatus={status => onStatus(product.id, status)}
            />
          ))}
        </div>
      ) : (
        <div className="surface">
          <EmptyState
            icon="⌕"
            title="No matching items"
            text={products.length
              ? 'Try another search or filter.'
              : 'Add a product to start your inventory.'}
          />
        </div>
      )}
    </>
  );
}
