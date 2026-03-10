import { toast } from 'sonner'

interface ToastOptions {
  title?: string
  description?: string
  duration?: number
}

export const useToast = () => {
  const success = ({ title, description, duration = 3000 }: ToastOptions) => {
    toast.success(title, {
      description,
      duration,
    })
  }

  const error = ({ title, description, duration = 5000 }: ToastOptions) => {
    toast.error(title, {
      description,
      duration,
    })
  }

  const info = ({ title, description, duration = 3000 }: ToastOptions) => {
    toast.info(title, {
      description,
      duration,
    })
  }

  const warning = ({ title, description, duration = 4000 }: ToastOptions) => {
    toast.warning(title, {
      description,
      duration,
    })
  }

  const loading = ({ title, description }: ToastOptions) => {
    return toast.loading(title, {
      description,
    })
  }

  const dismiss = (toastId: string | number) => {
    toast.dismiss(toastId)
  }

  return {
    success,
    error,
    info,
    warning,
    loading,
    dismiss,
  }
}