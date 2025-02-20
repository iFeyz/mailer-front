'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (term: string) => void;
}

export function SearchBar({ placeholder = 'Search...', onSearch }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');

  // Debounce the search to avoid too many updates
  const debouncedSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    params.set('page', '1');

    // Call the onSearch prop if provided
    if (onSearch) {
      onSearch(term);
    }

    // Use router.replace instead of push to avoid adding to history
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, 300);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    debouncedSearch(term);
  }, [debouncedSearch]);

  // Keep search input in sync with URL
  useEffect(() => {
    const currentQuery = searchParams.get('query') || '';
    if (currentQuery !== searchTerm) {
      setSearchTerm(currentQuery);
    }
  }, [searchParams, searchTerm]);

  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-8"
      />
    </div>
  );
} 