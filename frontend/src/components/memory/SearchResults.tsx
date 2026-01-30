'use client';

import { MemorySearchResult } from '@/lib/supabase/types';
import { useMemoryStore } from '@/store/memory';
import { ListView } from './ListView';
import { GridView } from './GridView';
import { TableView } from './TableView';

interface SearchResultsProps {
  items: MemorySearchResult[];
}

export function SearchResults({ items }: SearchResultsProps) {
  const { viewMode } = useMemoryStore();

  switch (viewMode) {
    case 'grid':
      return <GridView items={items} />;
    case 'table':
      return <TableView items={items} />;
    default:
      return <ListView items={items} />;
  }
}