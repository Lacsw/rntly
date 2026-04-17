import { useId } from 'react';
import type { ReactNode } from 'react';

type TFormSelectOption = { value: string; label: string };

type TFormSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: TFormSelectOption[];
  icon?: ReactNode;
  required?: boolean;
};

const selectClass =
  'w-full border border-stone-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent';

export const FormSelect = ({ label, value, onChange, options, icon, required }: TFormSelectProps) => {
  const selectId = useId();
  return (
    <div>
      <label
        htmlFor={selectId}
        className="flex items-center gap-1.5 text-sm font-medium text-stone-700 mb-1"
      >
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClass}
        required={required}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
