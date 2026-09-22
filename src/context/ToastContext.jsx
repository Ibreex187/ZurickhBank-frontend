import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ToastContainer, Toast } from 'react-bootstrap';

const ToastContext = createContext(null);

// Success/info toasts clear themselves; errors and warnings stay until the person dismisses them,
// so a message that needs action is never lost off-screen before it's read.
const AUTO_DISMISS_MS = { success: 4000, info: 5000 };

let nextId = 0;

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    ({ variant = 'info', text, title }) => {
      if (!text) return;

      const id = (nextId += 1);
      setToasts((current) => [...current, { id, variant, text, title }]);

      const autoDismissAfter = AUTO_DISMISS_MS[variant];
      if (autoDismissAfter) {
        const timer = setTimeout(() => dismiss(id), autoDismissAfter);
        timers.current.set(id, timer);
      }

      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* react-bootstrap's Toast always renders role="alert" aria-live="assertive" on its root element
          itself (it applies those after spreading props, so they can't be overridden here) */}
      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 1080 }}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            bg={toast.variant === 'danger' ? undefined : toast.variant}
            onClose={() => dismiss(toast.id)}
            transition={false}
          >
            <Toast.Header closeButton>
              <strong className="me-auto">{toast.title || defaultTitle(toast.variant)}</strong>
            </Toast.Header>
            <Toast.Body className={toast.variant === 'danger' ? 'bg-danger text-white' : undefined}>
              {toast.text}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

const defaultTitle = (variant) => {
  switch (variant) {
    case 'success':
      return 'Success';
    case 'danger':
      return 'Error';
    case 'warning':
      return 'Warning';
    default:
      return 'Notice';
  }
};

ToastProvider.propTypes = {
  children: PropTypes.node,
};

export default ToastProvider;
