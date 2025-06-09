import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
  Divider,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import backgroundImage from './assets/spa_bg.png';
import { GoogleReCaptchaProvider, GoogleReCaptcha } from 'react-google-recaptcha-v3';
import logo from './assets/salestrakpa-logo.png';
import { SnackbarProvider, useSnackbar } from 'notistack';

const AuthContainer = styled(Container)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  paddingLeft: '10%',
}));

const AuthPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  width: '100%',
  maxWidth: 380,
  borderRadius: theme.shape.borderRadius * 1.5,
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(4px)',
  boxShadow: theme.shadows[3],
}));

const AuthForm = ({ isRegister, toggleForm, onSubmit, isLoading ,  isForgotPassword,
  setIsForgotPassword }) => {
  // const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    mobile: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: ''
  });

  const validatePassword = (password) => {
    const regex = /^(?=.*[!@#$%^&*])(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'password') {
      if (value && !validatePassword(value)) {
        setErrors(prev => ({
          ...prev,
          password: 'Password must be at least 8 characters with 1 special character and alphanumeric'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          password: ''
        }));
      }

      if (formData.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: value === formData.confirmPassword ? '' : 'Passwords do not match'
        }));
      }
    }

    if (name === 'confirmPassword') {
      setErrors(prev => ({
        ...prev,
        confirmPassword: value === formData.password ? '' : 'Passwords do not match'
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (isForgotPassword || isRegister) {
      if (formData.password !== formData.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
        return;
      }
      
      if (!validatePassword(formData.password)) {
        setErrors(prev => ({
          ...prev,
          password: 'Password must be at least 8 characters with 1 special character and alphanumeric'
        }));
        return;
      }
    }
    
    onSubmit(formData, isForgotPassword);
  };

  return (
    <form onSubmit={handleSubmit}>
      {isForgotPassword ? (
        <>
          <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 500 }}>
            Reset Password
          </Typography>
          
          <TextField
            fullWidth
            margin="normal"
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            size="small"
            sx={{ '& .MuiInputBase-root': { backgroundColor: 'rgba(255, 255, 255, 0.8)' } }}
          />

          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            size="small"
            error={!!errors.password}
            helperText={errors.password}
            sx={{ 
              '& .MuiInputBase-root': { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
              '& .MuiFormHelperText-root': {
                color: errors.password ? 'error.main' : 'success.main'
              }
            }}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            size="small"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            sx={{ 
              '& .MuiInputBase-root': { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
              '& .MuiFormHelperText-root': {
                color: errors.confirmPassword ? 'error.main' : 'success.main'
              }
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="medium"
            sx={{ 
              mt: 2, 
              py: 1,
              backgroundColor: 'primary.main',
              '&:hover': { backgroundColor: 'primary.dark' }
            }}
            disabled={isLoading || !!errors.password || !!errors.confirmPassword}
          >
            {isLoading ? <CircularProgress size={22} /> : 'Reset Password'}
          </Button>

          <Typography variant="body2" align="center" sx={{ mt: 2, opacity: 0.7 }}>
            <Link 
              component="button" 
              onClick={() => setIsForgotPassword(false)}
            >
              Back to Login
            </Link>
          </Typography>
        </>
      ) : (
        <>
          {isRegister ? (
            <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 500 }}>
              Registration
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <img 
                src={logo} 
                alt="Salestrak PA Logo" 
                style={{ 
                  height: 'auto', 
                  width: '180px',
                  maxWidth: '100%' 
                }} 
              />
            </Box>
          )}
          
          {isRegister && (
            <TextField
              fullWidth
              margin="normal"
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              size="small"
              sx={{ '& .MuiInputBase-root': { backgroundColor: 'rgba(255, 255, 255, 0.8)' } }}
            />
          )}

          <TextField
            fullWidth
            margin="normal"
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete='off'
            autoFocus
            required
            size="small"
            sx={{ '& .MuiInputBase-root': { backgroundColor: 'rgba(255, 255, 255, 0.8)' } }}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            size="small"
            error={!!errors.password}
            helperText={errors.password}
            sx={{ 
              '& .MuiInputBase-root': { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
              '& .MuiFormHelperText-root': {
                color: errors.password ? 'error.main' : 'success.main'
              }
            }}
          />

          {isRegister && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                size="small"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                sx={{ 
                  '& .MuiInputBase-root': { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
                  '& .MuiFormHelperText-root': {
                    color: errors.confirmPassword ? 'error.main' : 'success.main'
                  }
                }}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Mobile Number"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                required
                size="small"
                sx={{ '& .MuiInputBase-root': { backgroundColor: 'rgba(255, 255, 255, 0.8)' } }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    required
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    I agree to the <Link href="#" color="primary">Terms</Link>
                  </Typography>
                }
                sx={{ mt: 1 }}
              />
            </>
          )}

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="medium"
            sx={{ 
              mt: 2, 
              py: 1,
              backgroundColor: 'primary.main',
              '&:hover': { backgroundColor: 'primary.dark' }
            }}
            disabled={isLoading || (isRegister && (!!errors.password || !!errors.confirmPassword))}
          >
            {isLoading ? <CircularProgress size={22} /> : (isRegister ? 'Register' : 'Sign In')}
          </Button>

          <Divider sx={{ my: 2, opacity: 0.5 }} />

          <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <Link 
              component="button" 
              variant="body2" 
              onClick={toggleForm}
              sx={{ ml: 0.5 }}
            >
              {isRegister ? 'Sign in' : 'Register'}
            </Link>
          </Typography>

          {!isRegister && (
            <Typography variant="body2" align="center" sx={{ mt: 1, opacity: 0.7 }}>
              <Link 
                component="button" 
                onClick={() => setIsForgotPassword(true)}
              >
                Forgot password?
              </Link>
            </Typography>
          )}
        </>
      )}
    </form>
  );
};

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (formData, isForgotPassword) => {
    setIsLoading(true);
    
    try {
      const apiUrl = isForgotPassword 
        ? '/forgotPassword' 
        : isRegister 
          ? '/register' 
          : '/login';

      const payload = isForgotPassword
        ? {
            email: formData.email,
            password: formData.password,
            newPassword: formData.confirmPassword
          }
        : isRegister
          ? {
              name: formData.name,
              email: formData.email,
              password: formData.password,
              mobile: formData.mobile,
              acceptTerms: formData.acceptTerms,
            }
          : {
              email: formData.email,
              password: formData.password,
            };

      const response = await fetch(`${process.env.REACT_APP_API_URL}${apiUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include' 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (isForgotPassword) {
        enqueueSnackbar('Password reset successful! Please login', { variant: 'success' });
        // setIsRegister(false);
        setIsForgotPassword(false);
      } else if (isRegister) {
        enqueueSnackbar('Registration successful! Please login', { variant: 'success' });
        setIsRegister(false);
      } else {
        enqueueSnackbar('Login successful! Redirecting...', { variant: 'success' });
        // Handle login success (store token, redirect, etc.)
      }
    } catch (error) {
      console.error('Error:', error);
      enqueueSnackbar(error.message || 'Request failed', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer maxWidth={false}>
      <AuthPaper elevation={3}>
        <AuthForm 
          isRegister={isRegister}
          toggleForm={() => setIsRegister(!isRegister)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isForgotPassword={isForgotPassword}
          setIsForgotPassword={setIsForgotPassword}
        />
      </AuthPaper>
    </AuthContainer>
  );
};

export default Login;