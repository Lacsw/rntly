---
name: react-component
description: Create React components following rntly patterns. Use when creating new UI components, cards, dialogs, list items, or any reusable UI element. Uses type TProps, functional components, Tailwind CSS, and lucide-react icons.
---

# React Component Creation

## Component Location

- **App shared:** `web/src/shared/components/ui/`
- **Domain-specific:** `web/src/domains/{domain}/components/`

## Standard Component Template

```tsx
import { cn } from '@/shared/lib/cn';

type TProps = {
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export const ComponentName = ({
  title,
  children,
  onClick,
  className,
}: TProps) => {
  return (
    <div
      className={cn("rounded-md border border-stone-200 p-4", className)}
      onClick={onClick}
    >
      <h6 className="text-base font-semibold">{title}</h6>
      {children}
    </div>
  );
};
```

## Key Patterns

1. **Props**: Always use `type TProps = {...}` - never `interface`
2. **Export**: Named export `export const ComponentName`
3. **No displayName**: Only needed with forwardRef
4. **No data-testid**: Use semantic HTML and ARIA roles instead (see e2e-principles)
5. **JSX props order**: Reserved (key, ref) → alphabetical → shorthand last

## Component with State

```tsx
import { useState } from "react";

type TProps = {
  initialValue: string;
  onSave: (value: string) => void;
};

export const EditableField = ({ initialValue, onSave }: TProps) => {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(value);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span>{value}</span>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-stone-900 text-white px-3 py-1.5 rounded"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        className="rounded border border-stone-200 px-3 py-2"
        onChange={(e) => setValue(e.target.value)}
        value={value}
      />
      <button
        onClick={handleSave}
        className="bg-stone-900 text-white px-3 py-1.5 rounded"
      >
        Save
      </button>
    </div>
  );
};
```

## Component with Hooks

```tsx
import { useState } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
import type { TProperty } from '../api';
import { ConfirmDialog } from '@/shared/components';

type TProps = {
  property: TProperty;
  onDelete?: (id: string) => void;
};

export const PropertyActions = ({ property, onDelete }: TProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!onDelete) return null;

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        aria-label="Property actions"
        className="p-1.5 hover:bg-stone-100 rounded-full"
      >
        <MoreVertical size={16} aria-hidden />
      </button>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete property"
        message={`Delete ${property.address}?`}
        destructive
        onConfirm={() => {
          onDelete(property.id);
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};
```

## Clickable Card Pattern

```tsx
import { cn } from '@/shared/lib/cn';

type TProps = {
  imageSrc: string;
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
};

export const Card = ({ imageSrc, title, children, onClick }: TProps) => {
  const isClickable = !!onClick;

  return (
    <div
      className={cn("overflow-hidden rounded-md border border-stone-200", {
        "cursor-pointer hover:bg-stone-50 active:bg-stone-100": isClickable,
        "cursor-default": !isClickable,
      })}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="flex h-[120px]">
        <img
          alt={`${title} card`}
          className="w-full object-cover"
          loading="lazy"
          src={imageSrc}
        />
      </div>
      <div className="p-4">
        <h6 className="text-base font-semibold">{title}</h6>
        {children}
      </div>
    </div>
  );
};
```

## Imports Order

```tsx
// 1. React/external libraries
import { useState } from "react";

// 2. Icons
import { Trash2, PencilLine } from "lucide-react";

// 3. Local domain imports (relative)
import { useResource } from "../hooks/useResource";
import type { TResource } from "../types";

// 4. App-wide imports (@/ alias)
import { cn } from "@/shared/lib/cn";
import { formatCurrency } from "@/shared/utils/format";
```

## Tailwind Classes

- **Typography**: `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`
- **Font weight**: `font-medium`, `font-semibold`, `font-bold`
- **Borders**: `border-stone-100`, `border-stone-200`
- **Backgrounds**: `bg-white`, `bg-stone-50`, `bg-stone-100`
- **Text colors**: `text-stone-500`, `text-stone-700`, `text-stone-900`
- **Accent**: `bg-orange-700` (primary), `text-red-700` (destructive)
- **Spacing**: Tailwind defaults (`p-4`, `gap-4`, `py-3`)
