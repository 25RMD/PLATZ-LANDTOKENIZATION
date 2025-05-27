import { toast as hotToast } from 'react-hot-toast';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

export const useToast = () => {
  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    const message = title ? `${title}${description ? `: ${description}` : ''}` : description || '';
    
    switch (variant) {
      case 'destructive':
        hotToast.error(message);
        break;
      case 'success':
        hotToast.success(message);
        break;
      default:
        hotToast(message);
        break;
    }
  };

  return { toast };
}; 