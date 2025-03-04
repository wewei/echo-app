import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import type { VectorDbSearchResponse } from '@/shared/types/vectorDb';

interface SearchDialogRpProps {
  open: boolean;
  searchQuery: string;
  onClose: () => void;
  onSearch: () => void;
  onSearchQueryChange: (query: string) => void;
  searchResults: VectorDbSearchResponse | null;
  loading: boolean;
  onResultClick: (interactionId: number, contextId: number) => void;
}

const SearchDialogRp: React.FC<SearchDialogRpProps> = ({
  open,
  searchQuery,
  onClose,
  onSearch,
  onSearchQueryChange,
  searchResults,
  loading,
  onResultClick,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
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
        
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {searchResults && !loading && searchResults.documents.length > 0 && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Search Results ({searchResults.documents.length})
            </Typography>
            <List>
              {searchResults.documents.map((document, index) => (
                <React.Fragment key={index}>
                  <ListItem 
                    onClick={() => onResultClick(
                      searchResults.metadatas[index].interactionId, 
                      searchResults.metadatas[index].contextId
                    )}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          component="div"
                          variant="body1"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {document}
                        </Typography>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" color="textSecondary">
                            {searchResults.metadatas[index].role} • {formatDate(searchResults.metadatas[index].createdAt)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Distance: {(searchResults.distances[index]).toFixed(2)}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < searchResults.documents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}

        {searchResults && !loading && searchResults.documents.length === 0 && (
          <Box mt={3} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              No results found for "{searchQuery}"
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onSearch} color="primary" variant="contained" disabled={loading}>
          Search
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchDialogRp;
