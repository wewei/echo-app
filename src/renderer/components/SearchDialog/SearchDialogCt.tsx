import React, { useState } from 'react';
import SearchDialogRp from './SearchDialogRp';
import type { VectorDbSearchResponse } from '@/shared/types/vectorDb';

interface SearchDialogCtProps {
  open: boolean;
  onClose: () => void;
  onSearch: (query: string) => Promise<VectorDbSearchResponse>;
  onResultClick: (interactionId: number, contextId: number) => void;
}

const SearchDialogCt: React.FC<SearchDialogCtProps> = ({
  open,
  onClose,
  onSearch,
  onResultClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VectorDbSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setLoading(true);
      try {
        const results = await onSearch(searchQuery);

        console.log("Search results:", results);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults(null);
    onClose();
  };

  const handleResultClick = (interactionId: number, contextId: number) => {
    onResultClick(interactionId, contextId);
    handleClose();
  };

  return (
    <SearchDialogRp
      open={open}
      searchQuery={searchQuery}
      onClose={handleClose}
      onSearch={handleSearch}
      onSearchQueryChange={handleSearchQueryChange}
      searchResults={searchResults}
      loading={loading}
      onResultClick={handleResultClick}
    />
  );
};

export default SearchDialogCt;
