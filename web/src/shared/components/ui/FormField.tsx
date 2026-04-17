import { useId } from 'react';
import type { ReactNode } from 'react';

type TFormFieldProps = {
  label: string;
  icon?: ReactNode;
  required?: boolean;
  placeholder?: string;
} & (
  | { type?: 'text'; value: string; onChange: (value: string) => void }
  | { type: 'numeric'; value: number; onChange: (value: number) => void }
);

const inputClass =
  'w-full border border-stone-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent';

export const FormField = (props: TFormFieldProps) => {
  const { label, icon, required, placeholder } = props;
  const inputId = useId();

  return (
    <div>
      <label
        htmlFor={inputId}
        className="flex items-center gap-1.5 text-sm font-medium text-stone-700 mb-1"
      >
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {props.type === 'numeric' ? (
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          placeholder={placeholder}
          value={props.value}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              props.onChange(0);
              return;
            }
            const parsed = Number(raw);
            if (Number.isFinite(parsed) && parsed >= 0) props.onChange(parsed);
          }}
          className={inputClass}
          required={required}
        />
      ) : (
        <input
          id={inputId}
          type="text"
          placeholder={placeholder}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          className={inputClass}
          required={required}
        />
      )}
    </div>
  );
};
