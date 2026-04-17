import { toast as sonner } from 'sonner';

export const useToast = () => ({
  success: (message: string) => sonner.success(message),
  error: (message: string) => sonner.error(message),
  info: (message: string) => sonner.message(message),
});

export const toast = {
  success: (message: string) => sonner.success(message),
  error: (message: string) => sonner.error(message),
  info: (message: string) => sonner.message(message),
};
