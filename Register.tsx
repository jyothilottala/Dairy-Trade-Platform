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
  MenuItem,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  role: "importer" | "manufacturer";
  companyName: string;
  country: string;
  phone: string;
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    role: "importer",
    companyName: "",
    country: "",
    phone: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "role" ? (value as "importer" | "manufacturer") : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "url('https://www.expressinfo.cz/wp-content/uploads/2022/05/kravy-na-louce.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "auto", // Ensures page can scroll up and down
        p: 3, // Adds some padding for better spacing
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent white
            backdropFilter: "blur(10px)", // Glass effect
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)", // Subtle shadow
          }}
        >
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sign up
          </Typography>
          {error && (
            <Typography color="error" align="center" gutterBottom>
              {error}
            </Typography>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              name="role"
              label="Role"
              value={formData.role}
              onChange={handleChange}
            >
              <MenuItem value="importer">Importer</MenuItem>
              <MenuItem value="manufacturer">Manufacturer</MenuItem>
            </TextField>
            <TextField
              margin="normal"
              required
              fullWidth
              name="companyName"
              label="Company Name"
              value={formData.companyName}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="country"
              label="Country"
              value={formData.country}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Box sx={{ textAlign: "center" }}>
              <Link href="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
