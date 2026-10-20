import { createWorker } from 'tesseract.js';
export function parseReceipt(text) {
  const lines = text.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  let name = lines.find(x => /^(item|product|description)\s*[:\-]\s*\S/i.test(x)) || '';
  name = name.replace(/^(item|product|description)\s*[:\-]\s*/i, '').trim();
  if (!name) name = lines.find(x => x.length >= 3 && x.length <= 70 && !/receipt|invoice|tax|subtotal|total|cashier|customer|phone|address|date|thank|gst|vat/i.test(x) && !/[0-9]{5,}/.test(x)) || '';
  let purchase_date = '';
  let match = text.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](20\d{2})\b/);
  if (match) purchase_date = `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
  else { match = text.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/); if (match) purchase_date = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`; }
  const totalLine = lines.slice().reverse().find(x => /grand\s*total|amount\s*paid|net\s*total|total/i.test(x));
  const amounts = totalLine ? [...totalLine.matchAll(/(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d{1,2})?)/gi)].map(x => x[1].replace(/,/g, '')) : [];
  return { name, purchase_date, price: amounts.at(-1) || '' };
}
export async function readReceipt(file) {
  const worker = await createWorker('eng');
  try { const { data } = await worker.recognize(file); return { text: data.text, fields: parseReceipt(data.text) }; }
  finally { await worker.terminate(); }
}
