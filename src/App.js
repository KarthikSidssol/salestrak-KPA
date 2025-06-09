import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import Login from './Login';
import Dashboard from './Dashboard';
import RedirectIfLoggedIn from './RedirectIfLoggedIn';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <SnackbarProvider 
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
      autoHideDuration={3000}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} />
          <Route path="/login" element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} />
          <Route path="/home" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  );
}

export default App;