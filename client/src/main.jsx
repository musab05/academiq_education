import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { Provider } from 'react-redux';
import store, { persistor } from './store/store.js';
import { PersistGate } from 'redux-persist/integration/react';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </PersistGate>
  </Provider>
);
