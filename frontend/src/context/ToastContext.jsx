// context/ToastContext.jsx — Notificações globais
import { createContext, useContext, useState, useCallback } from 'react';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((msg, type = 'ok', duration = 3800) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  const icons = { ok: '✅', err: '❌', warn: '⚠️' };

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-root">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="toast-icon">{icons[t.type] ?? '💬'}</span>
            <span className="toast-msg">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
