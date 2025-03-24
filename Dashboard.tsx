import React from "react";
import { Box, Container, Typography, Grid, Paper } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user?.name}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Products
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No recent products to display
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Unread Messages
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No unread messages
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No recent activity
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
