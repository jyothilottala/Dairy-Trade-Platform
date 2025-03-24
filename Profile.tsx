import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types";
import { userService } from "../services/api";

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: user?.name || "",
    email: user?.email || "",
    companyName: user?.companyName || "",
    country: user?.country || "",
    phone: user?.phone || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) {
      setError("User ID not found");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const updatedUser = await userService.updateProfile(user._id, formData);
      setUser(updatedUser);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Profile
          </Typography>
          <Alert severity="error">Please log in to view your profile.</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Profile Header */}
            <Grid item xs={12} sx={{ textAlign: "center", mb: 2 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: "0 auto",
                  fontSize: "3rem",
                }}
              >
                {user.name[0].toUpperCase()}
              </Avatar>
              <Typography variant="h5" sx={{ mt: 2 }}>
                {user.name}
              </Typography>
              <Chip
                label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                color="primary"
                sx={{ mt: 1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Profile Form */}
            <Grid item xs={12}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing || isLoading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing || isLoading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      disabled={!isEditing || isLoading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      disabled={!isEditing || isLoading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing || isLoading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        justifyContent: "flex-end",
                      }}
                    >
                      {isEditing ? (
                        <>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setIsEditing(false);
                              setFormData({
                                name: user.name,
                                email: user.email,
                                companyName: user.companyName,
                                country: user.country,
                                phone: user.phone,
                              });
                            }}
                            disabled={isLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isLoading}
                          >
                            {isLoading ? "Saving..." : "Save Changes"}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => setIsEditing(true)}
                        >
                          Edit Profile
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Member Since
                  </Typography>
                  <Typography variant="body1">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Account Type
                  </Typography>
                  <Typography variant="body1">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;
