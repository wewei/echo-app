import React, { useState } from 'react';
import SearchDialogRp from './SearchDialogRp';

interface SearchDialogCtProps {
  open: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

const SearchDialogCt: React.FC<SearchDialogCtProps> = ({
  open,
  onClose,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setSearchQuery('');
      onClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <SearchDialogRp
      open={open}
      searchQuery={searchQuery}
      onClose={handleClose}
      onSearch={handleSearch}
      onSearchQueryChange={handleSearchQueryChange}
    />
  );
};

export default SearchDialogCt;
