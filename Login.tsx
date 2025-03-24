import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: "url('https://img.freepik.com/free-photo/photorealistic-view-cow-grazing-nature-outdoors_23-2151294209.jpg')", // Replace with actual path
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh", // Ensures it works on mobile
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2, // Padding to prevent content from touching edges
      }}
    >
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.7)", // Improved readability
              backdropFilter: "blur(8px)", // Smoother blur effect
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              Sign In
            </Typography>
            {error && (
              <Typography color="error" align="center" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              <Box sx={{ textAlign: "center" }}>
                <Link href="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
