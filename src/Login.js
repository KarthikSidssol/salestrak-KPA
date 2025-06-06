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

const AuthForm = ({ isRegister, toggleForm, onSubmit, isLoading }) => {
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
    // At least 8 characters, 1 special character, and alphanumeric
    const regex = /^(?=.*[!@#$%^&*])(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Validate password when it changes
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

      // Also validate confirmation if confirmPassword has value
      if (formData.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: value === formData.confirmPassword ? '' : 'Passwords do not match'
        }));
      }
    }

    // Validate confirmation when confirmPassword changes
    if (name === 'confirmPassword') {
      setErrors(prev => ({
        ...prev,
        confirmPassword: value === formData.password ? '' : 'Passwords do not match'
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Final validation before submit
    if (isRegister) {
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
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 500 }}>
        {isRegister ? 'Registration' : 'Salestrak PA'}
      </Typography>
      
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
          <Link href="#">Forgot password?</Link>
        </Typography>
      )}
    </form>
  );
};

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    console.log(isRegister ? 'Registering:' : 'Logging in:', formData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <AuthContainer maxWidth={false}>
      <AuthPaper elevation={3}>
        <AuthForm 
          isRegister={isRegister}
          toggleForm={() => setIsRegister(!isRegister)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </AuthPaper>
    </AuthContainer>
  );
};

export default Login;