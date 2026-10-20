import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  createCategory,
  createProduct,
  createWishlistItem,
  deleteProduct,
  deleteWishlistItem,
  downloadBackup,
  getCategories,
  getCsrfCookie,
  getProducts,
  getProfile,
  getReminderSettings,
  getWishlistItems,
  loginAccount,
  logoutAccount,
  registerAccount,
  restoreBackup,
  updateProduct,
  updateProfile,
  updateReminderSettings,
  uploadAttachment,
} from './Services/apicalls';
import {
  AppShell,
  Categories,
  Dashboard,
  Inventory,
  Login,
  ProductDialog,
  Profile,
  Register,
  Reminders,
  Wishlist,
  WishDialog,
} from './components';

function App() {
  return (
    <BrowserRouter>
      <HomeKeeperApp />
    </BrowserRouter>
  );
}

function HomeKeeperApp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [reminderSettings, setReminderSettings] = useState({
    email: '',
    enabled: false,
    reminder_days: [30, 7, 1],
  });
  const [profile, setProfile] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
  });

  const [modal, setModal] = useState(null);
  const [message, setMessage] = useState('');
  const [backupBusy, setBackupBusy] = useState(false);
  const [restoreBusy, setRestoreBusy] = useState(false);

  async function refreshData() {
    await getCsrfCookie();

    try {
      const [categoryData, productData, wishlistData, reminderData, profileData] =
        await Promise.all([
          getCategories(),
          getProducts(),
          getWishlistItems(),
          getReminderSettings(),
          getProfile(),
        ]);

      setCategories(categoryData);
      setProducts(productData);
      setWishlistItems(wishlistData);
      setReminderSettings(reminderData);
      setProfile(profileData);
      setUsername(profileData.username);
      setAuthenticated(true);
      return true;
    } catch {
      setAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  async function authenticate(event, isSigningUp) {
    event.preventDefault();
    setAuthError('');

    try {
      const result = isSigningUp
        ? await registerAccount(username, password)
        : await loginAccount(username, password);

      setUsername(result.username);
      const loaded = await refreshData();
      if (loaded) navigate('/dashboard');
    } catch (error) {
      setAuthError(error.message);
    }
  }

  async function exportBackup() {
    setBackupBusy(true);
    setMessage('');

    try {
      await downloadBackup();
      setMessage('Backup downloaded. Keep the ZIP file somewhere safe.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBackupBusy(false);
    }
  }

  async function importBackup(file) {
    if (!file) return;

    const confirmed = confirm(
      `Restoring “${file.name}” will REPLACE your current products, categories, bucket list, bills, and photos. Download a backup of your current data first if you may need it. Continue?`,
    );
    if (!confirmed) return;

    setRestoreBusy(true);
    setMessage('');

    try {
      const result = await restoreBackup(file);
      await refreshData();
      setMessage(result.detail || 'Backup restored successfully.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setRestoreBusy(false);
    }
  }

  async function logout() {
    try {
      await logoutAccount();
    } finally {
      setAuthenticated(false);
      setPassword('');
      navigate('/login');
    }
  }

  async function saveProduct(data, file, kind) {
    try {
      const product = modal.product
        ? await updateProduct(modal.product.id, data)
        : await createProduct(data);

      if (file?.size) {
        await uploadAttachment(product.id, file, kind);
      }

      setModal(null);
      setMessage('');
      await refreshData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function addCategory() {
    const name = prompt('Category name');
    if (!name?.trim()) return;

    try {
      await createCategory({ name: name.trim() });
      await refreshData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function removeProduct(id) {
    if (!confirm('Delete this product and its attachments?')) return;

    try {
      await deleteProduct(id);
      await refreshData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function changeProductStatus(id, status) {
    try {
      await updateProduct(id, { status });
      await refreshData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveWishlistItem(data) {
    try {
      await createWishlistItem(data);
      setModal(null);
      await refreshData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function removeWishlistItem(id) {
    if (!confirm('Remove this item from your bucket list?')) return;

    try {
      await deleteWishlistItem(id);
      await refreshData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveReminders(event) {
    event.preventDefault();

    try {
      const result = await updateReminderSettings(reminderSettings);
      setReminderSettings(result);
      setMessage('Reminder settings saved.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setMessage('');

    try {
      const savedProfile = await updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
      });

      setProfile(savedProfile);
      setReminderSettings(current => ({ ...current, email: savedProfile.email }));
      setMessage('Profile saved.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <span className="brand-mark">H</span>
        <p>Loading your home inventory…</p>
      </div>
    );
  }

  const authProps = {
    username,
    password,
    authError,
    onUsernameChange: setUsername,
    onPasswordChange: setPassword,
  };
  const currentPath = location.pathname;
  const firstPage = authenticated ? '/dashboard' : '/register';

  return (
    <Routes>
      <Route path="/" element={<Navigate to={firstPage} replace />} />
      <Route
        path="/login"
        element={authenticated
          ? <Navigate to="/dashboard" replace />
          : <Login {...authProps} onSubmit={event => authenticate(event, false)} />}
      />
      <Route
        path="/register"
        element={authenticated
          ? <Navigate to="/dashboard" replace />
          : <Register {...authProps} onSubmit={event => authenticate(event, true)} />}
      />

      <Route
        element={authenticated ? (
          <AppShell username={username || 'Home'} onLogout={logout}>
            <div className="toast-area">
              {message && currentPath !== '/reminders' && (
                <div className="inline-message">
                  {message}
                  <button onClick={() => setMessage('')}>×</button>
                </div>
              )}
            </div>

            <Outlet />

            {modal?.type === 'product' && (
              <ProductDialog
                key={modal.product?.id || 'new-product'}
                product={modal.product}
                categories={categories}
                onClose={() => setModal(null)}
                onSave={saveProduct}
              />
            )}
            {modal?.type === 'wish' && (
              <WishDialog
                categories={categories}
                onClose={() => setModal(null)}
                onSave={saveWishlistItem}
              />
            )}
          </AppShell>
        ) : (
          <Navigate to="/login" replace />
        )}
      >
        <Route
          path="/dashboard"
          element={(
            <Dashboard
              products={products}
              categories={categories}
              onAdd={() => setModal({ type: 'product' })}
              onNavigate={page => navigate(`/${page}`)}
            />
          )}
        />
        <Route
          path="/inventory"
          element={(
            <Inventory
              products={products}
              categories={categories}
              onAdd={() => setModal({ type: 'product' })}
              onEdit={product => setModal({ type: 'product', product })}
              onDelete={removeProduct}
              onStatus={changeProductStatus}
            />
          )}
        />
        <Route
          path="/categories"
          element={(
            <Categories
              categories={categories}
              products={products}
              onAdd={addCategory}
            />
          )}
        />
        <Route
          path="/wishlist"
          element={(
            <Wishlist
              items={wishlistItems}
              categories={categories}
              onAdd={() => setModal({ type: 'wish' })}
              onDelete={removeWishlistItem}
            />
          )}
        />
        <Route
          path="/reminders"
          element={(
            <Reminders
              settings={reminderSettings}
              onChange={setReminderSettings}
              onSave={saveReminders}
              error={message}
            />
          )}
        />
        <Route
          path="/profile"
          element={(
            <Profile
              profile={profile}
              onChange={setProfile}
              onSave={saveProfile}
              onBackup={exportBackup}
              backupBusy={backupBusy}
              onRestore={importBackup}
              restoreBusy={restoreBusy}
              error={message}
            />
          )}
        />
      </Route>

      <Route path="*" element={<Navigate to={firstPage} replace />} />
    </Routes>
  );
}

export default App;
