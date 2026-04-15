import { Modal } from './Modal';
import { cn } from '../../lib/cn';

type TConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  destructive = false,
  onConfirm,
  onCancel,
}: TConfirmDialogProps) => {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-stone-600 mb-6">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-stone-700 hover:bg-stone-100 rounded"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={cn(
            'px-4 py-2 text-white rounded',
            destructive ? 'bg-red-700 hover:bg-red-800' : 'bg-orange-700 hover:bg-orange-800',
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
