import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Grid, 
  Container, 
  TextField, 
  Button, 
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tooltip 
} from '@mui/material';
import { User } from '../../types/auth';
import { DashboardLayout } from '../../components/dashboard/layout/dashboard-layout';
import { userService } from '../../services/user-service';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

interface ProfilePageProps {
  user: User;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const ProfilePage = ({ user }: ProfilePageProps) => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<User>(user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    bio: user.bio || '',
  });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const profile = await userService.getUserProfile(user.id);
        setUserProfile(profile);
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          bio: profile.bio || '',
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setNotification({
          open: true,
          message: 'Failed to load user profile',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user.id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await userService.updateUserProfile(user.id, formData);
      setNotification({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        open: true,
        message: 'Failed to update profile',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.new !== password.confirm) {
      setNotification({
        open: true,
        message: 'New passwords do not match',
        severity: 'error',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await userService.changePassword(user.id, password.current, password.new);
      setPassword({
        current: '',
        new: '',
        confirm: '',
      });
      setNotification({
        open: true,
        message: 'Password changed successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setNotification({
        open: true,
        message: 'Failed to change password',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const handleProfilePictureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Simple validation
    if (!file.type.startsWith('image/')) {
      setNotification({
        open: true,
        message: 'Please select an image file',
        severity: 'error',
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        open: true,
        message: 'Image size should be less than 5MB',
        severity: 'error',
      });
      return;
    }
    
    setUploadLoading(true);
    
    try {
      const response = await userService.uploadProfilePicture(user.id, file);
      
      // Update profile with new picture
      setUserProfile(prev => ({
        ...prev,
        profilePicture: response.profilePicture
      }));
      
      setNotification({
        open: true,
        message: 'Profile picture updated successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setNotification({
        open: true,
        message: 'Failed to upload profile picture',
        severity: 'error',
      });
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <DashboardLayout user={user}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Box position="relative">
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  bgcolor: 'primary.main',
                }}
                src={userProfile.profilePicture}
              >
                {userProfile.firstName?.charAt(0)}
                {userProfile.lastName?.charAt(0)}
              </Avatar>
              
              {uploadLoading ? (
                <CircularProgress 
                  size={36} 
                  sx={{ position: 'absolute', bottom: 10, right: 0 }} 
                />
              ) : (
                <Tooltip title="Change profile picture">
                  <IconButton
                    onClick={handleProfilePictureClick}
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      right: 0,
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    size="small"
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                </Tooltip>
              )}
              
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleProfilePictureChange}
              />
            </Box>
            <Typography variant="h4" gutterBottom>
              {userProfile.firstName} {userProfile.lastName}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Typography>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleTabChange} aria-label="profile tabs">
              <Tab label="Profile Information" />
              <Tab label="Security" />
              <Tab label="Notifications" />
            </Tabs>
          </Box>

          <TabPanel value={value} index={0}>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <form onSubmit={handleProfileUpdate}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleFormChange}
                      margin="normal"
                      multiline
                      rows={4}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          </TabPanel>

          <TabPanel value={value} index={1}>
            <form onSubmit={handlePasswordUpdate}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="current"
                    type="password"
                    value={password.current}
                    onChange={handlePasswordChange}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="new"
                    type="password"
                    value={password.new}
                    onChange={handlePasswordChange}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirm"
                    type="password"
                    value={password.confirm}
                    onChange={handlePasswordChange}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Change Password'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </TabPanel>

          <TabPanel value={value} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Notification Preferences
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Alert severity="info" sx={{ mb: 3 }}>
                  Notification preferences will be available in a future update.
                </Alert>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};
