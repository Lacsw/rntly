import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

type TModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
};

export const Modal = ({ open, onClose, title, icon, children }: TModalProps) => {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-xl font-semibold text-stone-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
};
