import type { LucideIcon } from 'lucide-react';

export type TNavLink = {
  to: string;
  label: string;
  icon: LucideIcon;
};

export type TNavSectionProps = {
  label: string;
  links: TNavLink[];
};
