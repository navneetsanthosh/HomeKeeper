import { useState } from 'react';
import { readReceipt } from '../receipt';
import CategoryPicker from './CategoryPicker';
import { statusLabels } from './productUtils';

export default function ProductDialog({ product, categories, onClose, onSave }) {
  const [message, setMessage] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [busy, setBusy] = useState(false);

  async function scanReceipt(event) {
    const file = event.target.files?.[0];
    const form = event.target.form;

    if (!file || new FormData(form).get('kind') !== 'bill') return;
    if (!file.type.startsWith('image/')) {
      setMessage('OCR reads bill images. The PDF will still be attached.');
      return;
    }

    setMessage('Reading bill…');
    setBusy(true);

    try {
      const result = await readReceipt(file);
      setOcrText(result.text);

      for (const field of ['name', 'purchase_date', 'price']) {
        if (result.fields[field] && !form.elements[field].value) {
          form.elements[field].value = result.fields[field];
        }
      }

      setMessage(
        'Review the suggested fields before saving. Warranty dates may not appear on the receipt.',
      );
    } catch {
      setMessage(
        'Could not read this image. You can still enter details and attach it.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitProduct(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const file = data.file;
    const kind = data.kind;

    delete data.file;
    delete data.kind;

    for (const field of ['category', 'price', 'purchase_date', 'warranty_end']) {
      if (!data[field]) data[field] = null;
    }

    await onSave(data, file, kind);
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="product-dialog">
        <div className="dialog-heading">
          <div>
            <div className="eyebrow">
              {product ? 'UPDATE INVENTORY' : 'NEW INVENTORY ITEM'}
            </div>
            <h2>{product ? 'Edit product' : 'Add a product'}</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form className="form-grid" onSubmit={submitProduct}>
          <label className="wide">
            Product name
            <input
              name="name"
              defaultValue={product?.name || ''}
              placeholder="e.g. Wireless headphones"
              required
            />
          </label>
          <label>
            Category
            <CategoryPicker
              categories={categories}
              defaultValue={product?.category || ''}
            />
          </label>
          <label>
            Brand
            <input name="brand" defaultValue={product?.brand || ''} placeholder="Brand" />
          </label>
          <label>
            Model
            <input
              name="model_number"
              defaultValue={product?.model_number || ''}
              placeholder="Model number"
            />
          </label>
          <label>
            Serial number
            <input
              name="serial_number"
              defaultValue={product?.serial_number || ''}
              placeholder="Serial number"
            />
          </label>
          <label>
            Purchase date
            <input
              name="purchase_date"
              type="date"
              defaultValue={product?.purchase_date || ''}
            />
          </label>
          <label>
            Price
            <input
              name="price"
              type="number"
              step="0.01"
              defaultValue={product?.price || ''}
              placeholder="0.00"
            />
          </label>
          <label>
            Warranty expires
            <input
              name="warranty_end"
              type="date"
              defaultValue={product?.warranty_end || ''}
            />
          </label>
          {product && (
            <label>
              Status
              <select name="status" defaultValue={product.status}>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option value={value} key={value}>{label}</option>
                ))}
              </select>
            </label>
          )}
          <label>
            Attachment type
            <select name="kind">
              <option value="bill">Bill / receipt</option>
              <option value="photo">Product photo</option>
            </select>
          </label>
          <label className="wide file-picker">
            <span>Bill or product image</span>
            <input
              name="file"
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              onChange={scanReceipt}
            />
          </label>
          {message && (
            <div className="wide ocr-message">
              {busy && <span className="spinner" />}
              {message}
            </div>
          )}
          {ocrText && (
            <details className="wide">
              <summary>Review extracted bill text</summary>
              <pre>{ocrText}</pre>
            </details>
          )}
          <label className="wide">
            Notes
            <textarea
              name="notes"
              defaultValue={product?.notes || ''}
              placeholder="Anything useful to remember"
            />
          </label>
          <div className="dialog-actions">
            <button type="button" className="button secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="button primary" disabled={busy}>
              {busy ? 'Reading bill…' : product ? 'Save changes' : 'Save item'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
