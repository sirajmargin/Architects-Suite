import { useState, useCallback } from 'react';

type ToastVariant = 'default' | 'destructive' | 'success';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastAction {
  (options: {
    title?: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
  }): void;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast: ToastAction = useCallback((options) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = {
      id,
      variant: 'default',
      duration: 5000,
      ...options,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, newToast.duration);
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    } else {
      setToasts([]);
    }
  }, []);

  return {
    toast,
    toasts,
    dismiss,
  };
}