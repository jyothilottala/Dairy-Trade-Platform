import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Badge,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  Send as SendIcon,
  Inbox as InboxIcon,
  Send as SentIcon,
  LocalShipping as ProductIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { Message, User } from "../types";
import { messageService, userService } from "../services/api";
import { useNavigate } from "react-router-dom";

const Messages: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [manufacturers, setManufacturers] = useState<User[]>([]);
  const [openNewMessageDialog, setOpenNewMessageDialog] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<User | null>(
    null
  );
  const [newMessage, setNewMessage] = useState({
    subject: "",
    content: "",
  });

  useEffect(() => {
    fetchMessages();
    if (user?.role === "importer") {
      fetchManufacturers();
    }
  }, [activeTab, user?.role]);

  const fetchManufacturers = async () => {
    try {
      const data = await userService.getAllManufacturers();
      setManufacturers(data);
    } catch (err) {
      console.error("Error fetching manufacturers:", err);
      setError("Failed to fetch manufacturers. Please try again.");
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;

      if (activeTab === 0) {
        // Inbox
        data = await messageService.getReceivedMessages();
      } else {
        // Sent
        data = await messageService.getSentMessages();
      }

      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to fetch messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (
      !message.isRead &&
      typeof message.sender !== "string" &&
      typeof message.recipient !== "string"
    ) {
      messageService.markAsRead(message._id).catch((err) => {
        console.error("Error marking message as read:", err);
      });
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      if (
        selectedMessage &&
        typeof selectedMessage.sender !== "string" &&
        typeof selectedMessage.recipient !== "string"
      ) {
        // In received messages, reply to the sender
        const recipientId =
          activeTab === 0
            ? typeof selectedMessage.sender === "string"
              ? selectedMessage.sender
              : selectedMessage.sender._id
            : typeof selectedMessage.recipient === "string"
            ? selectedMessage.recipient
            : selectedMessage.recipient._id;

        await messageService.sendMessage({
          recipient: recipientId,
          subject: `Re: ${selectedMessage.subject}`,
          content: replyText,
          product:
            typeof selectedMessage.product === "string"
              ? selectedMessage.product
              : selectedMessage.product?._id,
        });

        setReplyText("");
        fetchMessages();
      }
    } catch (err) {
      console.error("Error sending reply:", err);
      setError("Failed to send reply. Please try again.");
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSelectedMessage(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const viewProduct = (productId?: string) => {
    if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  const handleNewMessage = async () => {
    if (
      !selectedManufacturer ||
      !newMessage.subject.trim() ||
      !newMessage.content.trim()
    )
      return;

    try {
      await messageService.sendMessage({
        recipient: selectedManufacturer._id,
        subject: newMessage.subject,
        content: newMessage.content,
      });

      setOpenNewMessageDialog(false);
      setSelectedManufacturer(null);
      setNewMessage({ subject: "", content: "" });
      fetchMessages();
    } catch (err) {
      console.error("Error sending new message:", err);
      setError("Failed to send message. Please try again.");
    }
  };

  if (loading && messages.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const getSenderOrRecipientName = (message: Message) => {
    if (activeTab === 0) {
      // Inbox - show sender name
      if (typeof message.sender === "string") return "Unknown";
      return message.sender.companyName || message.sender.name;
    } else {
      // Sent - show recipient name
      if (typeof message.recipient === "string") return "Unknown";
      return message.recipient.companyName || message.recipient.name;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Messages
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {user?.role === "importer" && (
          <Paper sx={{ mb: 4, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Available Manufacturers
            </Typography>
            <Grid container spacing={2}>
              {manufacturers.map((manufacturer) => (
                <Grid item xs={12} sm={6} md={4} key={manufacturer._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">
                        {manufacturer.companyName}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        {manufacturer.country}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {manufacturer.description}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setSelectedManufacturer(manufacturer);
                          setOpenNewMessageDialog(true);
                        }}
                      >
                        Contact Manufacturer
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <InboxIcon sx={{ mr: 1 }} /> Inbox
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <SentIcon sx={{ mr: 1 }} /> Sent
                </Box>
              }
            />
          </Tabs>
        </Paper>

        <Grid container spacing={3}>
          {/* Message List */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ height: "600px", overflow: "auto" }}>
              {messages.length > 0 ? (
                <List>
                  {messages.map((message) => (
                    <React.Fragment key={message._id}>
                      <ListItemButton
                        selected={selectedMessage?._id === message._id}
                        onClick={() => handleSelectMessage(message)}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            {activeTab === 0 ? <InboxIcon /> : <SentIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              fontWeight={
                                !message.isRead && activeTab === 0 ? 700 : 400
                              }
                              noWrap
                            >
                              {message.subject}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              noWrap
                            >
                              {getSenderOrRecipientName(message)}
                              {" · "}
                              {formatDate(message.createdAt)}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                  <Typography color="textSecondary">
                    {activeTab === 0
                      ? "No messages in your inbox"
                      : "No sent messages"}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Message Content */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={2}
              sx={{
                height: "600px",
                p: 3,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {selectedMessage ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {selectedMessage.subject}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      {activeTab === 0 ? "From: " : "To: "}
                      {getSenderOrRecipientName(selectedMessage)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatDate(selectedMessage.createdAt)}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Typography
                    variant="body1"
                    paragraph
                    sx={{ flex: 1, overflow: "auto" }}
                  >
                    {selectedMessage.content}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Type your reply here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <Button
                            variant="contained"
                            color="primary"
                            endIcon={<SendIcon />}
                            disabled={!replyText.trim()}
                            onClick={handleReply}
                            sx={{ ml: 1 }}
                          >
                            Reply
                          </Button>
                        ),
                      }}
                    />
                  </Box>
                </>
              ) : (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                  <Typography color="textSecondary">
                    Select a message to view its contents
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* New Message Dialog */}
        <Dialog
          open={openNewMessageDialog}
          onClose={() => {
            setOpenNewMessageDialog(false);
            setSelectedManufacturer(null);
            setNewMessage({ subject: "", content: "" });
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            New Message to {selectedManufacturer?.companyName}
            <IconButton
              aria-label="close"
              onClick={() => {
                setOpenNewMessageDialog(false);
                setSelectedManufacturer(null);
                setNewMessage({ subject: "", content: "" });
              }}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Subject"
              value={newMessage.subject}
              onChange={(e) =>
                setNewMessage({ ...newMessage, subject: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={newMessage.content}
              onChange={(e) =>
                setNewMessage({ ...newMessage, content: e.target.value })
              }
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenNewMessageDialog(false);
                setSelectedManufacturer(null);
                setNewMessage({ subject: "", content: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNewMessage}
              disabled={
                !newMessage.subject.trim() || !newMessage.content.trim()
              }
            >
              Send Message
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Messages;
