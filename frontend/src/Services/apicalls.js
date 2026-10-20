import axios from 'axios';

export const API =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000/api`;

const apiClient = axios.create({
  baseURL: API,
  withCredentials: true,
});

function getCsrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find(value => value.startsWith('csrftoken='));

  return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}

apiClient.interceptors.request.use(config => {
  const method = config.method?.toLowerCase();
  const changesData = ['post', 'put', 'patch', 'delete'].includes(method);

  if (changesData) {
    config.headers['X-CSRFToken'] = getCsrfToken();
  }

  return config;
});

async function getErrorMessage(error) {
  let responseData = error.response?.data;

  if (responseData instanceof Blob) {
    try {
      responseData = JSON.parse(await responseData.text());
    } catch {
      responseData = null;
    }
  }

  return (
    responseData?.detail ||
    JSON.stringify(responseData) ||
    error.message ||
    'Request failed'
  );
}

async function handleRequest(request) {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    throw new Error(await getErrorMessage(error));
  }
}

export function getCsrfCookie() {
  return handleRequest(apiClient.get('/csrf/'));
}

export function registerAccount(username, password) {
  return handleRequest(
    apiClient.post('/signup/', { username, password }),
  );
}

export function loginAccount(username, password) {
  return handleRequest(
    apiClient.post('/login/', { username, password }),
  );
}

export function logoutAccount() {
  return handleRequest(apiClient.post('/logout/'));
}

export function getCategories() {
  return handleRequest(apiClient.get('/categories/'));
}

export function createCategory(data) {
  return handleRequest(apiClient.post('/categories/', data));
}

export function getProducts() {
  return handleRequest(apiClient.get('/products/'));
}

export function createProduct(data) {
  return handleRequest(apiClient.post('/products/', data));
}

export function updateProduct(id, data) {
  return handleRequest(apiClient.patch(`/products/${id}/`, data));
}

export function deleteProduct(id) {
  return handleRequest(apiClient.delete(`/products/${id}/`));
}

export function uploadAttachment(productId, file, kind) {
  const form = new FormData();
  form.append('product', productId);
  form.append('file', file);
  form.append('kind', kind);

  return handleRequest(apiClient.post('/attachments/', form));
}

export function getWishlistItems() {
  return handleRequest(apiClient.get('/wishlist/'));
}

export function createWishlistItem(data) {
  return handleRequest(apiClient.post('/wishlist/', data));
}

export function deleteWishlistItem(id) {
  return handleRequest(apiClient.delete(`/wishlist/${id}/`));
}

export function getReminderSettings() {
  return handleRequest(apiClient.get('/reminders/'));
}

export function updateReminderSettings(data) {
  return handleRequest(apiClient.patch('/reminders/', data));
}

export function getProfile() {
  return handleRequest(apiClient.get('/profile/'));
}

export function updateProfile(data) {
  return handleRequest(apiClient.patch('/profile/', data));
}

export async function downloadBackup() {
  const response = await handleRequest(
    apiClient.get('/export/', { responseType: 'blob' }),
  );
  const url = URL.createObjectURL(response);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'homekeeper-backup.zip';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function restoreBackup(file) {
  const form = new FormData();
  form.append('backup', file);
  form.append('confirm_replace', 'true');

  return handleRequest(apiClient.post('/restore/', form));
}
