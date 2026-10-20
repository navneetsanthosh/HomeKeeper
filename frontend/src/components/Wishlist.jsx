import EmptyState from './EmptyState';
import PageHeading from './PageHeading';

export default function Wishlist({ items, categories, onAdd, onDelete }) {
  return (
    <>
      <PageHeading
        eyebrow="PLAN AHEAD"
        title="Bucket list"
        description="Keep track of the things you’d like to buy next."
        action={
          <button className="button primary" onClick={onAdd}>
            ＋ Add to list
          </button>
        }
      />

      {items.length ? (
        <div className="wishlist-grid">
          {items.map(item => (
            <article className="wish-card" key={item.id}>
              <button
                className="delete-action wish-delete"
                onClick={() => onDelete(item.id)}
                title="Remove"
              >
                ×
              </button>
              <span className="wish-icon">♡</span>
              <h3>{item.name}</h3>
              <p>
                {item.category_name ||
                  categories.find(category => category.id === item.category)?.name ||
                  'No category'}
              </p>
              {item.estimated_price && (
                <strong>Estimated price · {item.estimated_price}</strong>
              )}
              {item.notes && <small>{item.notes}</small>}
            </article>
          ))}
        </div>
      ) : (
        <div className="surface">
          <EmptyState
            icon="♡"
            title="Your bucket list is empty"
            text="Save products you’re considering for later."
          />
        </div>
      )}
    </>
  );
}
