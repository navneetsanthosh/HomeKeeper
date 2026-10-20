import EmptyState from './EmptyState';
import MetricCard from './MetricCard';
import PageHeading from './PageHeading';
import StatusBadge from './StatusBadge';
import { daysUntil, isActiveProduct } from './productUtils';

export default function Dashboard({ products, categories, onAdd, onNavigate }) {
  const expiringProducts = products
    .map(product => ({
      ...product,
      daysLeft: daysUntil(product.warranty_end),
    }))
    .filter(
      product =>
        isActiveProduct(product) &&
        product.daysLeft !== null &&
        product.daysLeft >= 0 &&
        product.daysLeft <= 30,
    )
    .sort((first, second) => first.daysLeft - second.daysLeft);

  const trackedItems = products.filter(isActiveProduct).length;
  const missingItems = products.filter(product => product.status === 'missing').length;
  const recentProducts = [...products].slice(-4).reverse();

  return (
    <>
      <PageHeading
        eyebrow="YOUR HOME AT A GLANCE"
        title="Overview"
        description="A clear view of what you own and what needs attention."
        action={
          <div className="dashboard-actions">
            <button className="button primary" onClick={onAdd}>
              ＋ Add an item
            </button>
          </div>
        }
      />

      <div className="metric-grid">
        <MetricCard
          label="Items tracked"
          value={trackedItems}
          note="Across your categories"
          icon="▤"
        />
        <MetricCard
          label="Categories"
          value={categories.length}
          note="Your personal groups"
          icon="▦"
        />
        <MetricCard
          label="Missing"
          value={missingItems}
          note={missingItems ? 'Check these items' : 'Everything accounted for'}
          icon="⌕"
          tone={missingItems ? 'warning' : ''}
        />
        <MetricCard
          label="Warranty alerts"
          value={expiringProducts.length}
          note="Ending in the next 30 days"
          icon="◷"
          tone={expiringProducts.length ? 'warning' : ''}
        />
      </div>

      <div className="dashboard-grid">
        <section className="surface">
          <div className="section-title">
            <div>
              <h2>Warranty watch</h2>
              <p>Items expiring in the next 30 days</p>
            </div>
            <button className="text-button" onClick={() => onNavigate('reminders')}>
              Reminder settings →
            </button>
          </div>

          {expiringProducts.length ? (
            <div className="compact-list">
              {expiringProducts.slice(0, 5).map(product => (
                <div className="compact-row" key={product.id}>
                  <div className="item-monogram">
                    {product.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="compact-main">
                    <b>{product.name}</b>
                    <small>Warranty ends {product.warranty_end}</small>
                  </div>
                  <span className="due-pill">
                    {product.daysLeft === 0
                      ? 'Today'
                      : product.daysLeft === 1
                        ? '1 day'
                        : `${product.daysLeft} days`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="✓"
              title="All clear"
              text="No warranties are expiring in the next 30 days."
            />
          )}
        </section>

        <section className="surface">
          <div className="section-title">
            <div>
              <h2>Your categories</h2>
              <p>Items grouped around your home</p>
            </div>
            <button className="text-button" onClick={() => onNavigate('categories')}>
              View all →
            </button>
          </div>

          {categories.length ? (
            <div className="category-list">
              {categories.slice(0, 6).map(category => (
                <div className="category-row" key={category.id}>
                  <span className="category-icon">▦</span>
                  <span>{category.name}</span>
                  <b>
                    {
                      products.filter(
                        product =>
                          product.category === category.id &&
                          isActiveProduct(product),
                      ).length
                    }
                  </b>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="▦"
              title="No categories yet"
              text="Create categories to organize your items."
            />
          )}
        </section>
      </div>

      <section className="surface recent-surface">
        <div className="section-title">
          <div>
            <h2>Recently added</h2>
            <p>Your latest inventory entries</p>
          </div>
          <button className="text-button" onClick={() => onNavigate('inventory')}>
            Go to inventory →
          </button>
        </div>

        {recentProducts.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th>CATEGORY</th>
                  <th>STATUS</th>
                  <th>WARRANTY</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map(product => (
                  <tr key={product.id}>
                    <td>
                      <span className="table-item-icon">
                        {product.name.slice(0, 1).toUpperCase()}
                      </span>
                      {product.name}
                    </td>
                    <td>{product.category_name || 'Uncategorized'}</td>
                    <td><StatusBadge status={product.status} /></td>
                    <td>{product.warranty_end || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="＋"
            title="Your inventory starts here"
            text="Add your first product to keep its details and receipt together."
          />
        )}
      </section>
    </>
  );
}
