import CategoryPicker from './CategoryPicker';

export default function WishDialog({ categories, onClose, onSave }) {
  function submitWishlistItem(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    data.category = data.category || null;
    data.estimated_price = data.estimated_price || null;
    onSave(data);
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="product-dialog small-dialog">
        <div className="dialog-heading">
          <div>
            <div className="eyebrow">PLAN A FUTURE PURCHASE</div>
            <h2>Add to bucket list</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form className="form-grid" onSubmit={submitWishlistItem}>
          <label className="wide">
            Product
            <input name="name" placeholder="What would you like to buy?" required />
          </label>
          <label>
            Category
            <CategoryPicker categories={categories} emptyLabel="No category" />
          </label>
          <label>
            Estimated price
            <input
              name="estimated_price"
              type="number"
              step="0.01"
              placeholder="0.00"
            />
          </label>
          <label className="wide">
            Notes
            <textarea
              name="notes"
              placeholder="Why or when you might need it"
            />
          </label>
          <div className="dialog-actions">
            <button type="button" className="button secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="button primary">Add to bucket list</button>
          </div>
        </form>
      </section>
    </div>
  );
}
