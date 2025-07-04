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
  useMediaQuery
} from '@mui/material';
import Header from './Header';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [itemsData, setItemsData] = useState([]);
  const [remindersData, setRemindersData] = useState([]);
  const [documentData, setDocumentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState({
    items: true,
    reminders: true,
    user: true,
    documents: true
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  // Filter items based on search term
  const filteredItems = searchTerm 
    ? itemsData.flatMap(headerGroup => 
        headerGroup.items.filter(item => 
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.header_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : [];

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
          {user && (
            <Typography variant="h5" gutterBottom sx={{ 
              mb: 2,
              fontWeight: 'bold',
              color: 'primary.main'
            }}>
              Welcome, {user.email}!
            </Typography>
          )}
          
          <Grid container spacing={3} sx={{ width: '100%' }}>
            {/* Items Column */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ 
                height: '75vh',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardHeader 
                  title="All Items" 
                  titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  sx={{ 
                    bgcolor: 'primary.main', 
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
                    itemsData.map((headerGroup) => (
                      <Box key={headerGroup.header_id} sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center" sx={{ mb: 1 , cursor: 'pointer' }}
                          onClick={() => {
                            window.location.href = `/newitem`;
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {headerGroup.header_name}
                          </Typography>
                          <Chip 
                            label={headerGroup.items.length} 
                            size="small" 
                            sx={{ ml: 1 }} 
                          />
                        </Box>
                        <List dense disablePadding>
                          {headerGroup.items.map((item) => (
                            <ListItem 
                              key={item.id} 
                              button 
                              divider
                              sx={{ py: 0.5 , px: 1 , cursor: 'pointer' }}
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
                      {remindersData.map((reminder) => (
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
                              <Typography variant="caption" fontSize="0.75rem">
                                {new Date(reminder.reminder_date).getDate()}
                              </Typography>
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={reminder.reminder_name}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {reminder.item_title} • {reminder.header_name}
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
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search Documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ mb: 2 }}
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
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Search Results
                    </Typography>
                    
                    {searchTerm ? (
                      filteredItems.length > 0 ? (
                        <List disablePadding>
                          {filteredItems.map((item) => (
                            <ListItem 
                              key={item.id} 
                              button 
                              divider
                              sx={{ py: 0.5, px: 1 }}
                            >
                              <ListItemText
                                primary={item.title}
                                secondary={
                                  <>
                                    <Typography component="span" variant="body2" color="text.primary">
                                      {item.header_name}
                                    </Typography>
                                    {item.short_desc && (
                                      <Box component="span" display="block">
                                        {item.short_desc}
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
                      ) : (
                        <Typography variant="body2" color="textSecondary" textAlign="center">
                          No matching items found
                        </Typography>
                      )
                    ) : (
                      <Box 
                        display="flex" 
                        flexDirection="column" 
                        justifyContent="center" 
                        alignItems="center" 
                        height="100%"
                        textAlign="center"
                      >
                        <Typography variant="body2" color="textSecondary">
                          Enter a search term to find items
                        </Typography>
                      </Box>
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