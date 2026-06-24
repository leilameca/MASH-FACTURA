import { Search } from 'lucide-react';
import { Input } from './Input';

export function SearchBar({ placeholder = 'Buscar...', ...props }) {
  return (
    <Input
      className="border-mash-border bg-mash-surface2"
      prefix={Search}
      placeholder={placeholder}
      {...props}
    />
  );
}
