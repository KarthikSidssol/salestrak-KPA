import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardHeader, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText, 
  TextField, 
  Typography, 
  Chip,
  CircularProgress,
  Divider,
  Avatar,
  ListItemAvatar,
  useTheme,
  useMediaQuery,
  IconButton,
  Autocomplete,
  ListItemIcon
} from '@mui/material';
import Header from './Header';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [itemsData, setItemsData] = useState([]);
  const [remindersData, setRemindersData] = useState([]);
  const [documentData, setDocumentData] = useState([]);
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState({
    items: true,
    reminders: true,
    user: true,
    documents: true,
    search: false
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showAllItems, setShowAllItems] = useState(false);

  const [itemSearchOptions, setItemSearchOptions] = useState([]);
  const [itemSearchLoading, setItemSearchLoading] = useState(false);

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(prev => ({...prev, user: true, items: true, reminders: true}));
        
        // Fetch user data
        const userRes = await fetch(`${process.env.REACT_APP_API_URL}/me`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!userRes.ok) throw new Error('Failed to fetch user data');
        const userData = await userRes.json();
        setUser(userData.user);
        
        // Fetch items and reminders in parallel
        const [itemsRes, remindersRes , documentRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/getAllItemData`, {
            method: 'GET',
            credentials: 'include',
          }),
          fetch(`${process.env.REACT_APP_API_URL}/getAllremainderDate`, {
            method: 'GET',
            credentials: 'include',
          }),
          fetch(`${process.env.REACT_APP_API_URL}/getAllDocumentData`, {
            method: 'GET',
            credentials: 'include',
          })
        ]);

        const itemsData = await itemsRes.json();
        const remindersData = await remindersRes.json();
        const documentData = await documentRes.json();
        
        console.log("remindersData",remindersData);
        setItemsData(itemsData);
        setRemindersData(remindersData);
        setDocumentData(documentData);
        
        setLoading(prev => ({...prev, user: false, items: false, reminders: false , documents: false}));
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(prev => ({...prev, user: false, items: false, reminders: false , documents: false}));
      }
    };

    fetchAllData();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' }); // e.g., "Jun"
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };


  // Filter items based on search term
  const filteredItems = searchTerm 
    ? itemsData.flatMap(headerGroup => 
        headerGroup.items.filter(item => 
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.header_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : [];

  // Fetch search suggestions
const fetchAllDocuments = async () => {
  setLoading(prev => ({...prev, documents: true}));
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/getAllDocumentData`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    setDocumentData(data);
  } catch (err) {
    console.error('Error fetching documents:', err);
  } finally {
    setLoading(prev => ({...prev, documents: false}));
  }
};

const fetchSearchSuggestions = async (searchTerm) => {
  if (!searchTerm.trim()) {
    setSearchOptions([]);
    return;
  }

  setLoading(prev => ({...prev, search: true}));
  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/searchDocuments?term=${encodeURIComponent(searchTerm)}`, 
      {
        method: 'GET',
        credentials: 'include',
      }
    );
    const data = await res.json();
    setSearchOptions(data);
  } catch (err) {
    console.error('Search error:', err);
    setSearchOptions([]);
  } finally {
    setLoading(prev => ({...prev, search: false}));
  }
};

// Handle document selection
const handleDocumentSelect = (selectedDocument) => {
  if (selectedDocument) {
    // Filter to show only the selected document
    const filtered = documentData.filter(doc => doc.id === selectedDocument.id);
    setDocumentData(filtered.length > 0 ? filtered : [selectedDocument]);
  } else {
    // If cleared, reset to show all documents
    fetchAllDocuments();
  }
};

const handleShareDocument = (document) => {
  const shareableLink = `${process.env.REACT_APP_API_URL}/download/${document.id}`;

  // Option 1: Use Web Share API (mobile-friendly)
  if (navigator.share) {
    navigator.share({
      title: document.doc_name,
      text: 'Check out this document:',
      url: shareableLink,
    }).catch((err) => {
      console.error('Share failed:', err);
    });
  } 
  // Option 2: Fallback to clipboard copy
  else {
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        alert('Could not copy link. Please try again.');
      });
  }
};

  const totalItemCount = itemsData.reduce((acc, group) => acc + group.items.length, 0);

  // Flatten all items
const allItemsFlat = itemsData.flatMap(group =>
  group.items.map(item => ({
    ...item,
    header_id: group.header_id,
    header_name: group.header_name
  }))
);

// Sort by latest (optional - adjust logic as needed)
const sortedItems = [...allItemsFlat].sort((a, b) => b.id - a.id);

// Slice top 5 or all depending on toggle
const visibleItems = showAllItems ? sortedItems : sortedItems.slice(0, 5);

// Regroup items by header_name
const groupedItems = visibleItems.reduce((acc, item) => {
  const key = item.header_name;
  if (!acc[key]) {
    acc[key] = {
      header_id: item.header_id,
      header_name: item.header_name,
      items: [],
    };
  }
  acc[key].items.push(item);
  return acc;
}, {});

const fetchItemSearchSuggestions = async (term) => {
  if (!term.trim()) {
    setItemSearchOptions([]);
    return;
  }

  setItemSearchLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/searchItems?term=${encodeURIComponent(term)}`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();
      setItemSearchOptions(data);
    } catch (err) {
      console.error('Item search error:', err);
      setItemSearchOptions([]);
    } finally {
      setItemSearchLoading(false);
    }
  };

  const getDaysDifference = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    const diffTime = date - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // const today = new Date();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 00:00:00 today
  const upcomingReminders = [];
  const expiredReminders = [];

  remindersData.forEach((reminder) => {
    const reminderDate = new Date(reminder.reminder_date);
    if (reminderDate >= today) {
      upcomingReminders.push(reminder);
    } else {
      expiredReminders.push(reminder);
    }
  });

  return (
    <Header>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'row' : 'column', 
        minHeight: '100vh',
        backgroundColor: theme.palette.grey[100]
      }}>
        <Container maxWidth={false} sx={{ 
          flex: 1, 
          py: 3,
          px: isMobile ? 2 : 3
        }}>
          
          <Grid container spacing={3} sx={{ width: '100%' }}>
            {/* Items Column */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ 
                height: '75vh',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardHeader 
                   title={`All Items (${totalItemCount})`}
                  titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    py: 0.5
                  }}
                  action={
                    <IconButton 
                      aria-label="add" 
                      sx={{ color: 'white' }}
                      onClick={() => {
                        window.location.href = '/newitem';
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  }

                />
                
                <CardContent sx={{ 
                  flex: 1,
                  overflow: 'auto',
                  p: isMobile ? 1 : 1,
                  maxHeight: 'calc(75vh - 64px)', // Subtract header height
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: 'rgba(0,0,0,0.3)',
                  },
                }}>

                  <Autocomplete
                  freeSolo
                  options={itemSearchOptions}
                  getOptionLabel={(option) => option.title || ''}
                  onInputChange={(e, val) => fetchItemSearchSuggestions(val)}
                  loading={itemSearchLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      placeholder="Search Items..."
                      size="small"
                      sx={{ mb: 2 }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {itemSearchLoading ? <CircularProgress size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      const encodedHeaderId = btoa(newValue.header_id);
                      const encodedItemId = btoa(newValue.id);
                      window.location.href = `/newitem/${encodedHeaderId}/${encodedItemId}`;
                    }
                  }}
                />


                  {loading.items ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <CircularProgress />
                    </Box>
                  ) : itemsData.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                      <Typography variant="body2" color="textSecondary" textAlign="center">
                        No items found
                      </Typography>
                    </Box>
                  ) : (
                    Object.values(groupedItems).map((headerGroup) => (
                      <Box key={headerGroup.header_id} sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center" sx={{ mb: 1 , cursor: 'pointer' }}
                          onClick={() => {
                            window.location.href = `/newitem`;
                          }}
                        >
                          <Typography variant="subtitle1">
                            {headerGroup.header_name && headerGroup.header_name.toUpperCase()}
                          </Typography>
                          <Chip 
                            label={headerGroup.items.length} 
                            size="small" 
                          />
                        </Box>
                        <List dense disablePadding>
                          {headerGroup.items.map((item) => (
                            <ListItem 
                              key={item.id} 
                              button 
                              divider
                              sx={{ p: 0, cursor: 'pointer' }}
                              onClick={() => {
                                const encodedHeaderId = btoa(headerGroup.header_id);
                                const encodedItemId = btoa(item.id);
                                window.location.href = `/newitem/${encodedHeaderId}/${encodedItemId}`;
                              }}
                            >
                              <ListItemText
                                primary={item.title}
                                secondary={item.short_desc}
                                primaryTypographyProps={{ 
                                  fontWeight: 'medium',
                                  fontSize: '0.875rem'
                                }}
                                secondaryTypographyProps={{ 
                                  variant: 'body2',
                                  fontSize: '0.75rem'
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                        <Divider sx={{ my: 1 }} />
                      </Box>
                    ))
                  )}
                  {allItemsFlat.length > 5 && (
  <Box textAlign="center" sx={{ mt: 1 }}>
    <Typography 
      variant="body2" 
      sx={{ 
        color: 'primary.main', 
        cursor: 'pointer', 
        textDecoration: 'underline' 
      }}
      onClick={() => setShowAllItems(prev => !prev)}
    >
      {showAllItems ? 'See less' : 'See more'}
    </Typography>
  </Box>
)}

                </CardContent>
              </Card>
            </Grid>
            
            {/* Reminders Column */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ 
                height: '75vh',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardHeader 
                  title="Upcoming Reminders" 
                  titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  sx={{ 
                    bgcolor: 'warning.main', 
                    color: 'white',
                    py: 0.5
                  }}
                />
                <CardContent sx={{ 
                  flex: 1,
                  overflow: 'auto',
                  p: isMobile ? 1 : 1,
                  maxHeight: 'calc(75vh - 64px)', // Subtract header height
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: 'rgba(0,0,0,0.3)',
                  },
                }}>
                  {loading.reminders ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                      <CircularProgress />
                    </Box>
                  ) : remindersData.length === 0 ? (
                    <Typography variant="body2" color="textSecondary" textAlign="center">
                      No reminders found
                    </Typography>
                  ) : (
                    <List disablePadding>
                      {(upcomingReminders.length > 0 || expiredReminders.length > 0) ? (
  <>
    {/* Upcoming Reminders */}
    <List disablePadding>
      {upcomingReminders.map((reminder) => (
        <ListItem 
          key={reminder.id} 
          button 
          divider
          sx={{ py: 0.5 , px: 1 }}
        >
          <ListItemAvatar sx={{ minWidth: 40 }}>
            <Avatar sx={{ 
              bgcolor: 'warning.light',
              width: 32,
              height: 32
            }}>
              <Typography 
                variant="caption" 
                fontSize="0.75rem" 
                color="text.primary"
              >
                {getDaysDifference(reminder.reminder_date)}
              </Typography>
            </Avatar>

          </ListItemAvatar>

          <ListItemText
            secondary={
              <>
                <Typography component="div" variant="body2" color="text.primary">
                  {formatDate(reminder.reminder_date)} - {reminder.reminder_name}
                </Typography>

                <Typography component="div" variant="body2" color="text.primary">
                  {reminder.item_title.toUpperCase()} - {reminder.header_name}
                </Typography>

                {reminder.alert_before && (
                  <Box component="span" display="block">
                    <Chip 
                      label={`${reminder.alert_before}`} 
                      size="small" 
                      sx={{ 
                        mt: 0.5,
                        fontSize: '0.625rem'
                      }}
                    />
                  </Box>
                )}
              </>
            }
            primaryTypographyProps={{ 
              fontWeight: 'medium',
              fontSize: '0.875rem'
            }}
            secondaryTypographyProps={{ 
              variant: 'body2',
              fontSize: '0.75rem'
            }}
          />
        </ListItem>
      ))}
    </List>

    {/* Expired Reminders */}
    {expiredReminders.length > 0 && (
      <>
        <Divider sx={{ mt: 2, mb: 1 }} />
        <Typography 
          variant="subtitle2" 
          sx={{ color: 'error.main', mb: 1, fontWeight: 'bold' }}
        >
          EXPIRED REMINDERS
        </Typography>

        <List disablePadding>
          {expiredReminders.map((reminder) => (
            <ListItem 
              key={reminder.id} 
              button 
              divider
              sx={{ py: 0.5 , px: 1 }}
            >
              <ListItemAvatar sx={{ minWidth: 40 }}>
                <Avatar sx={{ 
                  bgcolor: 'error.light',
                  width: 32,
                  height: 32
                }}>
                  <Typography 
                    variant="caption" 
                    fontSize="0.75rem" 
                    color="text.primary"
                  >
                    {Math.abs(getDaysDifference(reminder.reminder_date))}
                  </Typography>
                </Avatar>

              </ListItemAvatar>

              <ListItemText
                secondary={
                  <>
                    <Typography component="div" variant="body2" color="text.primary">
                      {formatDate(reminder.reminder_date)} - {reminder.reminder_name}
                    </Typography>

                    <Typography component="div" variant="body2" color="text.primary">
                      {reminder.item_title.toUpperCase()} - {reminder.header_name}
                    </Typography>

                    {reminder.alert_before && (
                      <Box component="span" display="block">
                        <Chip 
                          label={`${reminder.alert_before}`} 
                          size="small" 
                          sx={{ 
                            mt: 0.5,
                            fontSize: '0.625rem'
                          }}
                        />
                      </Box>
                    )}
                  </>
                }
                primaryTypographyProps={{ 
                  fontWeight: 'medium',
                  fontSize: '0.875rem'
                }}
                secondaryTypographyProps={{ 
                  variant: 'body2',
                  fontSize: '0.75rem'
                }}
              />
            </ListItem>
          ))}
        </List>
      </>
    )}
  </>
) : (
  <Typography variant="body2" color="textSecondary" textAlign="center">
    No reminders found
  </Typography>
)}

                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Search Column */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ 
                height: '75vh',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardHeader 
                  title="Search Items" 
                  titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  sx={{ 
                    bgcolor: 'success.main', 
                    color: 'white',
                    py: 0.5
                  }}
                />
                <CardContent sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  p: isMobile ? 1 : 1,
                  maxHeight: 'calc(75vh - 64px)', // Subtract header height
                  overflow: 'hidden', // Prevent outer scroll
                }}>
                  <Autocomplete
                    freeSolo
                    options={searchOptions}
                    getOptionLabel={(option) => option.doc_name || ''}
                    onInputChange={(event, newValue) => {
                      fetchSearchSuggestions(newValue);
                    }}
                    onChange={(event, newValue) => {
                      handleDocumentSelect(newValue);
                    }}
                    loading={loading.search}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        variant="outlined"
                        placeholder="Search Documents..."
                        size="small"
                        sx={{ mb: 2 }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loading.search ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {option.doc_name}
                      </li>
                    )}
                  />
                  
                  <Box sx={{ 
                    flex: 1,
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      backgroundColor: 'rgba(0,0,0,0.3)',
                    },
                  }}>

                    {loading.documents ? (
                      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress />
                      </Box>
                    ) : documentData.length === 0 ? (
                      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Typography variant="body2" color="textSecondary" textAlign="center">
                          No documents found
                        </Typography>
                      </Box>
                    ) : (
                      <List disablePadding>
                        {documentData.map((document) => (
                          <ListItem 
                            key={document.id} 
                            button 
                            divider
                            sx={{ py: 0.5, px: 1 }}
                            onClick={() => {
                              window.open(`${process.env.REACT_APP_API_URL}/download/${document.id}`, '_blank');
                            }}
                          >
                            <ListItemText
                              primary={document.doc_name}
                              secondary={
                                <>
                                  {/* <Typography component="span" variant="body2" color="text.primary">
                                    Uploaded: {formatDate(document.doc_name)}
                                  </Typography> */}
                                  {/* {document.item_title && (
                                    <Typography component="div" variant="body2" color="text.primary">
                                      Item: {document.item_title}
                                    </Typography>
                                  )} */}
                                </>
                              }
                              primaryTypographyProps={{ 
                                fontWeight: 'medium',
                                fontSize: '0.875rem'
                              }}
                              secondaryTypographyProps={{ 
                                variant: 'body2',
                                fontSize: '0.75rem'
                              }}
                            />
                            <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>

                              <IconButton 
                                edge="end" 
                                aria-label="share"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent triggering the parent ListItem's onClick
                                  handleShareDocument(document);
                                }}
                                sx={{ mr: 1 }}
                              >
                                <ShareIcon fontSize="small" />
                              </IconButton>

                              <IconButton edge="end" aria-label="download">
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </ListItemIcon>
                          </ListItem>
                        ))}
                      </List>
                    )}
                                      

                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Header>
  );
};

export default Dashboard;