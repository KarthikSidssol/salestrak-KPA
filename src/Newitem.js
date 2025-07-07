import React, { useState, useEffect } from 'react';
import Header from './Header';
import {
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { useSnackbar } from 'notistack';
import { useParams, useNavigate  } from 'react-router-dom';
import ConfirmDlgBox from './utils/ConfirmDlgBox'; 
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const NewItem = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { encodedHeaderId, encodedItemId } = useParams();

  const [headers, setHeaders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newHeaderName, setNewHeaderName] = useState('');
  const [newDocument, setNewDocument] = useState({
    name: '',
    file: null
});
  const [reminders, setReminders] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [selectedHeader, setSelectedHeader] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [highlighted, setHighlighted] = useState('');
  const [newReminder, setNewReminder] = useState({
    name: '',
    date: '',
    before: ''
  });
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [ remindMeName , setRemindMeName] = useState ('');

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [showItemDetails, setShowItemDetails] = useState(false);

  const handleAddHeader = () => {
    setShowModal(true);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));



  const fetchItemData = async () => {
    if (encodedHeaderId && encodedItemId) {
      const headerId = atob(encodedHeaderId);
      const itemId = atob(encodedItemId);
      const payload = {
        headerId,
        itemId
      };
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/getItemByHeaderId`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log('Fetched item data:', data);

        setSelectedHeader(data.item.header_id);
        setTitle(data.item.title);
        setDescription(data.item.short_desc);
        setDetails(data.item.det_desc);
        setHighlighted(data.item.highlights);
        setReminders(data.reminders || []);
        setDocuments(data.documents || []);
        setIsReadOnly(true);
      } catch (err) {
        console.error('Error loading item:', err);
      }
    }
  };

  const fetchHeaders = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/Header`, {
      credentials: 'include',
    });
    const data = await res.json();
    setHeaders(data);
  };

  const RemindMeDropdown = async () =>{
    const res = await fetch (`${process.env.REACT_APP_API_URL}/remindMeName`);
    const data = await res.json();
    setRemindMeName(data);
  }


  useEffect(() => {
    fetchHeaders();
    fetchItemData();
    RemindMeDropdown();
    if( encodedHeaderId){
      setShowItemDetails(true);
    }
  }, [encodedHeaderId, encodedItemId]);

  const handleSubmitHeader = async () => {
    if (!newHeaderName.trim()) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/addHeader`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ name: newHeaderName })
      });

      const data = await res.json();
      if (res.ok) {
        setHeaders(prev => [...prev, data.header]);
        setSelectedHeader(data.header.id);
        setNewHeaderName('');
        setShowModal(false);
        await fetchHeaders();
      } else {
        enqueueSnackbar(data.error || 'Error adding header', { 
          variant: res.status === 409 ? 'warning' : 'error' 
        });
      }
    } catch (error) {
      console.error('Failed to add header:', error);
      alert('Failed to add header');
    }
  };

  const handleCreate = async () => {
     if (!selectedHeader || !title.trim()) {
      enqueueSnackbar("Header and Title are required", { variant: 'warning' });
      return;
    }

    try {
      const selected = headers.find(h => h.id === selectedHeader);

      const payload = {
        header_id: selected.id,
        header_name: selected.header_name || selected.name,
        title,
        short_desc: description,
        det_desc: details,
        highlights: highlighted
      };

       if (encodedHeaderId) {
        payload.updatedHeaderId = atob(encodedHeaderId);
        payload.updatedItemId = atob(encodedItemId);
     }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/addItems`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        enqueueSnackbar(
            encodedHeaderId ? 'Item updated successfully' : 'Item created successfully',
            { variant: 'success' }
        );
        if(!encodedHeaderId) {
            const newEncodedHeaderId  = btoa(data.header_id);
            const itemId = btoa(data.item_id);
            navigate(`/newitem/${newEncodedHeaderId }/${itemId}`);
        }
        // setTitle('');
        // setDescription('');
        // setDetails('');
        // setHighlighted('');
      } else {
        enqueueSnackbar(data.error || 'Failed to create item', { variant: 'error' });
      }

    } catch (err) {
      console.error('Error:', err);
      enqueueSnackbar('An error occurred while creating item', { variant: 'error' });
    }
  };

  const handleAddReminder = async () => {
    // console.log("new Reminder",newReminder);
    if (!newReminder.name.trim() || !newReminder.date.trim() || !newReminder.before) {
      enqueueSnackbar("Please fill all fields for the reminder", { variant: "warning" });
      return;
    }

    try {
      const payload = {
        header_id: atob(encodedHeaderId),
        item_id: atob(encodedItemId),
        name: newReminder.name,
        date: newReminder.date,
        before: newReminder.before
      };

      const res = await fetch(`${process.env.REACT_APP_API_URL}/addReminder`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        enqueueSnackbar('Reminder added successfully!', { variant: 'success' });
        // Optionally clear form or refresh reminder list
        setNewReminder({ name: '', date: '', before: '' });
        await fetchItemData();
      } else {
        enqueueSnackbar(data.error || 'Failed to add reminder', { variant: 'error' });
      }

    } catch (err) {
      console.error('Error adding reminder:', err);
      enqueueSnackbar('An error occurred while adding reminder', { variant: 'error' });
    }
  };

  const handleEditReminder = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/editReminder/${id}`, {
        credentials: 'include',
      });
      const data = await res.json();
      console.log('Edit reminder data:', data);
      if (res.ok) {
        setNewReminder({
          name: data.reminder_name,
          date: data.reminder_date,
          before: data.alert_before,
        });
        setIsEditing(true);
        setEditingId(id);
        setShowAddReminder(true);
      } else {
        enqueueSnackbar(data.error || 'Failed to fetch reminder', { variant: 'error' });
      }
    } catch (error) {
      console.error('Edit error:', error);
      enqueueSnackbar('An error occurred', { variant: 'error' });
    }
  };

  const handleDeleteClick = (id) => {
    setDialogConfig({
      title: "Delete Reminder?",
      message: "This will permanently delete the reminder.",
      onConfirm: () => handleDeleteReminder(id),
      confirmText: "Delete",
      confirmColor: "error",
      variant: "contained",
    });
    setDialogOpen(true);
  };

  const handleDeleteReminder = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/deleteReminder/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setReminders((prev) => prev.filter((r) => r.id !== id));
        enqueueSnackbar('Reminder deleted', { variant: 'success' });
      } else {
        const data = await res.json();
        enqueueSnackbar(data.error || 'Failed to delete', { variant: 'error' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      enqueueSnackbar('An error occurred', { variant: 'error' });
    }
    setDialogOpen(false);
  };

  const handleUpdateReminder = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/updateReminder/${editingId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReminder),
      });
      const data = await res.json();
      if (res.ok) {
        enqueueSnackbar('Reminder updated successfully', { variant: 'success' });
        // Reset form and fetch updated reminders
        setNewReminder({ name: '', date: '', before: '' });
        setIsEditing(false);
        setEditingId(null);
        setShowAddReminder(false);
        await fetchItemData();
        // Add your function to refresh the reminders list here
      } else {
        enqueueSnackbar(data.error || 'Failed to update reminder', { variant: 'error' });
      }
    } catch (error) {
      console.error('Update error:', error);
      enqueueSnackbar('An error occurred', { variant: 'error' });
    }
  };

  const handleDeleteItem = async (itemId) => {
    setDialogConfig({
      title: "Delete Item?",
      message: "This will permanently delete the item.",
      onConfirm: async () => {
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/deleteItem/${itemId}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          if (res.ok) {
            enqueueSnackbar('Item deleted successfully', { variant: 'success' });
            navigate('/'); // Redirect to home or another page after deletion
          } else {
            const data = await res.json();
            enqueueSnackbar(data.error || 'Failed to delete item', { variant: 'error' });
          }
        } catch (error) {
          console.error('Delete error:', error);
          enqueueSnackbar('An error occurred while deleting item', { variant: 'error' });
        }
      },
      confirmText: "Delete",
      confirmColor: "error",
      variant: "contained",
    });
    setDialogOpen(true);
  };

  // const handleAddDocument = async () => {
  //   if (!newDocument.name.trim() || !newDocument.file) {
  //     enqueueSnackbar("Document name and file are required", { variant: "warning" });
  //     return;
  //   }

  //   try {
  //     const formData = new FormData();
  //     formData.append('doc_name', newDocument.name);
  //     formData.append('doc_file', newDocument.file);
  //     formData.append('header_id', atob(encodedHeaderId));
  //     formData.append('item_id', atob(encodedItemId));

  //     const res = await fetch(`${process.env.REACT_APP_API_URL}/addDocument`, {
  //       method: 'POST',
  //       credentials: 'include',
  //       body: formData,
  //     });

  //     const data = await res.json();

  //     if (res.ok) {
  //       enqueueSnackbar('Document added successfully!', { variant: 'success' });
  //       setNewDocument({ name: '', file: null });
  //       await fetchItemData();
  //     } else {
  //       enqueueSnackbar(data.error || 'Failed to add document', { variant: 'error' });
  //     }
  //   } catch (err) {
  //     console.error('Error adding document:', err);
  //     enqueueSnackbar('An error occurred while adding document', { variant: 'error' });
  //   }
  // };

  const handleAddDocument = async () => {
    try {

      if (newDocument.file && !newDocument.file.isExisting) {
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        // Check file type
        if (!allowedTypes.includes(newDocument.file.type)) {
          throw new Error('Only PDF, JPG, PNG, and Excel files are allowed');
        }

        // Check file size (2MB limit)
        if (newDocument.file.size > 2 * 1024 * 1024) {
          throw new Error('File size must be less than 2MB');
        }
      }


      const formData = new FormData();
      formData.append('doc_name', newDocument.name);
      formData.append('item_id', atob(encodedItemId));
      formData.append('header_id', atob(encodedHeaderId));

      // Only append file if it's a new upload
      if (newDocument.file && !newDocument.file.isExisting) {
        formData.append('doc_file', newDocument.file);
      }

      const endpoint = newDocument.editingId 
        ? `${process.env.REACT_APP_API_URL}/updateDocument/${newDocument.editingId}`
        : `${process.env.REACT_APP_API_URL}/addDocument`;

      const res = await fetch(endpoint, {
        method: newDocument.editingId ? 'PUT' : 'POST',
        credentials: 'include',
        body: formData,
      });

      if (res.ok) {
        enqueueSnackbar(`Document ${newDocument.editingId ? 'updated' : 'added'} successfully!`, { 
          variant: 'success' 
        });
        setNewDocument({ name: '', file: null, editingId: null });
        await fetchItemData();
        setShowAddDocument(false);
      } else {
        throw new Error('Operation failed');
      }
    } catch (err) {
      enqueueSnackbar(`Failed to ${newDocument.editingId ? 'update' : 'add'} document`, { 
        variant: 'error' 
      });
      console.error(err);
    }
  };

// const handleDownloadDocument = async (docId, docName) => {
//   try {
//     const response = await fetch(
//       `${process.env.REACT_APP_API_URL}/downloadDocument/${docId}`,
//       { credentials: 'include' }
//     );
    
//     if (!response.ok) throw new Error('Failed to get download URL');
    
//     const { downloadUrl } = await response.json();
    
//     const link = document.createElement('a');
//     link.href = downloadUrl;
//     link.setAttribute('download', docName);
//     link.setAttribute('target', '_blank'); 
//     document.body.appendChild(link);
//     link.click();
//     link.remove();

//   } catch (err) {
//     enqueueSnackbar('Failed to download document', { variant: 'error' });
//     console.error(err);
//   }
// };

const handleDownloadDocument = (docId) => {
  window.open(`${process.env.REACT_APP_API_URL}/download/${docId}`, '_blank');
};


  const handleDeleteDocument = (docId) => {
    setDialogConfig({
      title: "Delete Document?",
      message: "This will permanently delete the document.",
      onConfirm: async () => {
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/deleteDocument/${docId}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          
          if (res.ok) {
            enqueueSnackbar('Document deleted', { variant: 'success' });
            fetchItemData();
          } else {
            throw new Error('Delete failed');
          }
        } catch (err) {
          enqueueSnackbar('Failed to delete document', { variant: 'error' });
        } finally {
          setDialogOpen(false);
        }
      },
      confirmText: "Delete",
      confirmColor: "error"
    });
    setDialogOpen(true);
  };

  const handleEditDocument = (doc) => {
    setNewDocument({
      name: doc.doc_name,
      file: {
        name: doc.doc_name, // Display name
        path: doc.doc_file_path, // Reference to existing file
        isExisting: true // Flag to indicate this is an existing file
      },
      editingId: doc.id
    });
    setShowAddDocument(true);
  };


  return (
    <div>
      <Header>
        <Box sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          p: 2,
          overflowX: 'auto',
          minHeight: '80vh',
        }}>
          {/* First Column - New Item Form */}
          <Paper elevation={3}   sx={{ p: 2, flex: '0 0 33%'}}>

            { encodedHeaderId && showItemDetails ? (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" gutterBottom>
                    Item Details
                  </Typography>
                  <Box>
                    <IconButton onClick={() => {
                      setShowItemDetails(false);
                      setIsReadOnly(false);
                    }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteItem(atob(encodedItemId))}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Header:</strong> {headers.find(h => h.id === selectedHeader)?.header_name || 'No header selected'}
                </Typography>

                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Title:</strong> {title}
                </Typography>

                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Short Description:</strong> {description}
                </Typography>

                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Details & Info:</strong> {details}
                </Typography>

                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Highlight Charts:</strong> {highlighted}
                </Typography>

              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {encodedHeaderId ? 'Edit Item' : 'New Item'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Header</InputLabel>
                    <Select
                      value={selectedHeader}
                      onChange={(e) => setSelectedHeader(e.target.value)}
                      label="Select Header"
                      disabled={isReadOnly}
                    >
                      {headers.map((header) => (
                        <MenuItem key={header.id} value={header.id}>
                          {header.header_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {!encodedHeaderId && (
                    <IconButton color="primary" onClick={handleAddHeader}>
                      <AddIcon />
                    </IconButton>
                  )}
                </Box>

                <TextField
                  fullWidth
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  margin="normal"
                  size="small"
                />

                <TextField
                  fullWidth
                  label="Short Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  margin="normal"
                  multiline
                  rows={2}
                  size="small"
                  sx={{
                    '& textarea': {
                      resize: 'vertical',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Details & Info"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  margin="normal"
                  multiline
                  rows={2}
                  size="small"
                  sx={{
                    '& textarea': {
                      resize: 'vertical',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Highlight Charts"
                  value={highlighted}
                  onChange={(e) => setHighlighted(e.target.value)}
                  margin="normal"
                  multiline
                  rows={2}
                  size="small"
                  sx={{
                    '& textarea': {
                      resize: 'vertical',
                    },
                  }}
                />

                <Box sx={{ textAlign: 'left', mt: 2 }}>
                  <Button variant="contained" onClick={handleCreate}>
                    {encodedHeaderId ? 'Update' : 'Create'}
                  </Button>
                  {encodedHeaderId && (
                    <Button 
                      variant="outlined" 
                      sx={{ ml: 2 }}
                      onClick={() => {
                        setShowItemDetails(true);
                        setIsReadOnly(true);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </Box>
              </Box>
          ) }
          </Paper>

          {/* Second Column - Reminders & Documents */}
          {encodedHeaderId && (
            <Paper elevation={3} sx={{ p: 2, flex: '0 0 33%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" gutterBottom>
                      Reminder Dates
                  </Typography>
                  <IconButton 
                    onClick={() => {
                      setShowAddReminder(prev => !prev);
                      setIsEditing(false);
                      setEditingId(null);
                      setNewReminder({ name: '', date: '', before: '' });
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>

                <List sx={{ p: 0 }}>
                  {reminders.length > 0 ? (
                    reminders.map((reminder, index) => (
                      <React.Fragment key={reminder.id}>
                        <ListItem sx={{ padding: '0px' }}>
                          <ListItemText
                            primary={`${reminder.reminder_date} - ${reminder.reminder_name}`}
                            primaryTypographyProps={{ sx: { fontSize: '14px' } }}
                          />
                          <EditIcon 
                            fontSize='small'
                            sx={{ cursor: 'pointer' }}
                            onClick={() => handleEditReminder(reminder.id)}
                          /> 
                          <DeleteIcon 
                            fontSize='small'
                            sx={{ cursor: 'pointer' }}
                            onClick={() => handleDeleteClick(reminder.id)}
                          />
                        </ListItem>
                        {index < reminders.length - 1 && <Divider />}
                      </React.Fragment>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No reminders found.
                    </Typography>
                  )}
                </List>

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
                <Typography variant="h6" gutterBottom>
                    Upload Documents
                </Typography>
                <IconButton onClick={() => setShowAddDocument(prev => !prev)}>
                    <AddIcon />
                </IconButton>
                </Box>

                {documents.length > 0 ? (
                  <List sx={{ p:0 }}>
                    {documents.map((doc, index) => (
                      <React.Fragment key={doc.id}>
                        <ListItem sx={{ padding: '0px' }}>
                          <ListItemText 
                            primary={doc.doc_name}
                          />
                          
                          <CloudDownloadIcon 
                            fontSize="small" 
                            sx={{ cursor: 'pointer' }} 
                            onClick={() => handleDownloadDocument(doc.id, doc.doc_name)} 
                          />
                          
                          <EditIcon 
                            fontSize="small" 
                            sx={{ cursor: 'pointer' }}
                            onClick={() => handleEditDocument(doc)}
                          />
                          
                          <DeleteIcon 
                            fontSize="small" 
                            sx={{ cursor: 'pointer' }}
                            onClick={() => handleDeleteDocument(doc.id)}
                          />

                        </ListItem>
                        {index < documents.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No documents found.
                  </Typography>
                )}

            </Paper>
        )}

          {/* Third Column - Add Reminder */}
        {encodedHeaderId && (showAddReminder || showAddDocument) && (
            <Paper elevation={3} sx={{ p: 2, flex: '1 1 33%' }}>
                {showAddReminder && (
                <>
                    <Typography variant="h6" gutterBottom>
                      {isEditing ? 'Edit Reminder' : 'Add Reminder'}
                    </Typography>

                    <TextField
                    fullWidth
                    label="Reminder Name"
                    value={newReminder.name}
                    onChange={(e) => setNewReminder({ ...newReminder, name: e.target.value })}
                    margin="normal"
                    size="small"
                    />

                    <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={newReminder.date}
                    onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                      select
                      fullWidth
                      label="Remind Me"
                      value={newReminder.before}
                      onChange={(e) => setNewReminder({ ...newReminder, before: e.target.value })}
                      margin="normal"
                      size="small"
                    >
                      {remindMeName.map((option, index) => (
                        <MenuItem key={index} value={option.id}>
                          {option.remind_me_name}
                        </MenuItem>
                      ))}
                    </TextField>


                    {isEditing ? (
                      <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleUpdateReminder}>
                        Update Reminder
                      </Button>
                    ) : (
                      <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleAddReminder}>
                        Add Reminder
                      </Button>
                    )}

                </>
                )}

                {showAddDocument && (
                  <Box mt={4}>
                    <Typography variant="h6" gutterBottom>
                      {newDocument.editingId ? 'Edit Document' : 'Add Document'}
                    </Typography>

                    <TextField
                      fullWidth
                      label="Document Name"
                      value={newDocument.name}
                      onChange={(e) =>
                        setNewDocument((prev) => ({ ...prev, name: e.target.value }))
                      }
                      margin="normal"
                      size="small"
                      required
                    />

                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      Upload File
                      <input
                        type="file"
                        hidden
                        onChange={(e) =>
                          setNewDocument((prev) => ({ ...prev, file: e.target.files[0] }))
                        }
                        required
                      />
                    </Button>

                    {newDocument.file && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Selected File: {newDocument.file.name}
                      </Typography>
                    )}

                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={handleAddDocument}
                      disabled={!newDocument.name || (!newDocument.file && !newDocument.editingId)}
                    >
                      {newDocument.editingId ? 'Update Document' : 'Add Document'}
                    </Button>
                    
                  </Box>
                  )}
                </Paper>
              )}
          </Box>
      </Header>

      {/* Dialog for adding header */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>Add New Header</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Header Name"
            fullWidth
            size="small"
            value={newHeaderName}
            onChange={(e) => setNewHeaderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSubmitHeader} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>


      <ConfirmDlgBox
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={dialogConfig.onConfirm}
        title={dialogConfig.title}
        message={dialogConfig.message}
        confirmText={dialogConfig.confirmText}
        confirmColor={dialogConfig.confirmColor}
        variant={dialogConfig.variant}
      />

    </div>
  );
};

export default NewItem;
