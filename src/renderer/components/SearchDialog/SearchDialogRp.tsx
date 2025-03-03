import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

interface SearchDialogRpProps {
  open: boolean;
  searchQuery: string;
  onClose: () => void;
  onSearch: () => void;
  onSearchQueryChange: (query: string) => void;
}

const SearchDialogRp: React.FC<SearchDialogRpProps> = ({
  open,
  searchQuery,
  onClose,
  onSearch,
  onSearchQueryChange,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Search</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Search Query"
          type="text"
          fullWidth
          variant="outlined"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onSearch} color="primary" variant="contained">
          Search
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchDialogRp;
