import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  MenuItem,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  InputAdornment,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  LocalShipping as RequestIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { Product, User } from "../types";
import { productService, messageService } from "../services/api";

const CATEGORIES = [
  "milk",
  "cheese",
  "yogurt",
  "butter",
  "ghee",
  "whey",
  "other",
] as const;
const CERTIFICATIONS = [
  "ISO",
  "HACCP",
  "Halal",
  "Kosher",
  "Organic",
  "FSSAI",
] as const;

type Category = (typeof CATEGORIES)[number];
type Certification = (typeof CERTIFICATIONS)[number];

interface ProductFormData {
  name: string;
  description: string;
  category: Category;
  specifications: {
    fatContent: string;
    proteinContent: string;
    shelfLife: string;
  };
  certifications: Certification[];
}

const Products: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Parse query params for highlighting a specific product
  const queryParams = new URLSearchParams(location.search);
  const highlightProductId = queryParams.get("highlight");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openNewProductDialog, setOpenNewProductDialog] = useState(false);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    certification: "",
    search: "",
  });
  const [newProduct, setNewProduct] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "milk",
    specifications: {
      fatContent: "",
      proteinContent: "",
      shelfLife: "",
    },
    certifications: [],
  });

  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    fetchProducts();
  }, []);

  // Effect to handle highlighted product from messages
  useEffect(() => {
    if (highlightProductId && products.length > 0) {
      const highlightedProduct = products.find(
        (p) => p._id === highlightProductId
      );
      if (highlightedProduct) {
        setSelectedProduct(highlightedProduct);
        setOpenDialog(true);
        // Remove the highlight parameter from URL
        navigate("/products", { replace: true });
      }
    }
  }, [highlightProductId, products, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;

      // If manufacturer, only fetch their products
      if (user?.role === "manufacturer") {
        data = await productService.getProductsByManufacturer(user._id);
      } else {
        // If importer, fetch all products
        data = await productService.getAllProducts();
      }

      console.log("Fetched products data:", data); // Debug log
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));

    let filtered = [...products];

    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    if (filters.certification) {
      filtered = filtered.filter((p) =>
        p.certifications.includes(filters.certification as Certification)
      );
    }

    if (filters.search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleNewProductChange = (field: string, value: string) => {
    if (field.startsWith("specifications.")) {
      const specField = field.split(".")[1];
      setNewProduct((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value,
        },
      }));
    } else {
      setNewProduct((prev) => ({ ...prev, [field]: value }));
    }

    // Clear validation error when field is updated
    if (validationErrors[field]) {
      const updatedErrors = { ...validationErrors };
      delete updatedErrors[field];
      setValidationErrors(updatedErrors);
    }
  };

  const handleSelectChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setNewProduct({
        ...newProduct,
        [name]: value,
      });

      // Clear validation error when field is updated
      if (validationErrors[name]) {
        const updatedErrors = { ...validationErrors };
        delete updatedErrors[name];
        setValidationErrors(updatedErrors);
      }
    }
  };

  const handleCertificationToggle = (certification: Certification) => {
    setNewProduct((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(certification)
        ? prev.certifications.filter((c) => c !== certification)
        : [...prev.certifications, certification],
    }));
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setNewProduct({
        ...newProduct,
        specifications: {
          ...newProduct.specifications,
          [specKey]: specValue,
        },
      });
      setSpecKey("");
      setSpecValue("");
    }
  };

  const removeSpecification = (key: keyof typeof newProduct.specifications) => {
    const updatedSpecs = { ...newProduct.specifications };
    delete updatedSpecs[key];
    setNewProduct({
      ...newProduct,
      specifications: updatedSpecs,
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!newProduct.name) errors["name"] = "Name is required";
    if (!newProduct.category) errors["category"] = "Category is required";
    if (!newProduct.description)
      errors["description"] = "Description is required";
    if (!newProduct.specifications.fatContent)
      errors["specifications.fatContent"] = "Fat Content is required";
    if (!newProduct.specifications.proteinContent)
      errors["specifications.proteinContent"] = "Protein Content is required";
    if (!newProduct.specifications.shelfLife)
      errors["specifications.shelfLife"] = "Shelf Life is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitNewProduct = async () => {
    if (!validateForm()) return;

    try {
      if (!user) {
        setError("You must be logged in to add a product");
        return;
      }

      const productData: Partial<Product> = {
        ...newProduct,
        manufacturer: user._id,
        price: {
          amount: 0, // Default price, can be updated later
          currency: "USD",
        },
        minimumOrderQuantity: 1, // Default minimum order quantity
        unit: "kg", // Default unit
        images: [], // Empty images array, can be updated later
      };

      await productService.createProduct(productData);
      setOpenNewProductDialog(false);
      fetchProducts();
      setNewProduct({
        name: "",
        description: "",
        category: "milk",
        specifications: {
          fatContent: "",
          proteinContent: "",
          shelfLife: "",
        },
        certifications: [],
      });
    } catch (err) {
      console.error("Error creating product:", err);
      setError("Failed to create product. Please try again.");
    }
  };

  const handleRequestProduct = async () => {
    if (!user || !selectedProduct) return;

    try {
      if (typeof selectedProduct.manufacturer === "string") {
        // If manufacturer is just an ID, we can't send a message
        setError("Unable to retrieve manufacturer details");
        return;
      }

      await messageService.sendMessage({
        recipient: selectedProduct.manufacturer._id,
        subject: `Product Request: ${selectedProduct.name}`,
        content: requestMessage,
        product: selectedProduct._id,
      });

      setRequestSuccess(true);
      setTimeout(() => {
        setOpenRequestDialog(false);
        setRequestSuccess(false);
        setRequestMessage("");
      }, 1500);
    } catch (err) {
      console.error("Error sending product request:", err);
      setError("Failed to send request. Please try again.");
    }
  };

  if (loading) {
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

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            {user?.role === "manufacturer" ? "My Products" : "All Products"}
          </Typography>
          {user?.role === "manufacturer" && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenNewProductDialog(true)}
            >
              Add New Product
            </Button>
          )}
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                name="search"
                label="Search Products"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value as Category)
                  }
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Certification</InputLabel>
                <Select
                  value={filters.certification}
                  label="Certification"
                  onChange={(e) =>
                    handleFilterChange(
                      "certification",
                      e.target.value as Certification
                    )
                  }
                >
                  <MenuItem value="">All Certifications</MenuItem>
                  {CERTIFICATIONS.map((cert) => (
                    <MenuItem key={cert} value={cert}>
                      {cert}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item key={product._id} xs={12} sm={6} md={4}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={
                      product.images[0] || "https://via.placeholder.com/300x200"
                    }
                    alt={product.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {product.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      {product.description.length > 100
                        ? `${product.description.substring(0, 100)}...`
                        : product.description}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${product.price.amount} / {product.unit}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Min Order: {product.minimumOrderQuantity} {product.unit}
                    </Typography>
                    <Box mb={2}>
                      <Chip
                        label={product.category}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      {product.certifications.map((cert) => (
                        <Chip
                          key={cert}
                          label={cert}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedProduct(product);
                        setOpenDialog(true);
                      }}
                    >
                      View Details
                    </Button>
                    {user?.role === "importer" && (
                      <Button
                        size="small"
                        color="primary"
                        startIcon={<RequestIcon />}
                        onClick={() => {
                          setSelectedProduct(product);
                          setOpenRequestDialog(true);
                        }}
                      >
                        Request Product
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: "center", my: 5 }}>
            <Typography variant="h6" color="text.secondary">
              No products found matching your criteria
            </Typography>
          </Box>
        )}

        {/* Product Details Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedProduct && (
            <>
              <DialogTitle>
                {selectedProduct.name}
                <IconButton
                  aria-label="close"
                  onClick={() => setOpenDialog(false)}
                  sx={{ position: "absolute", right: 8, top: 8 }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <img
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      style={{ width: "100%", borderRadius: "4px" }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" paragraph>
                      {selectedProduct.description}
                    </Typography>
                    <Typography variant="h6" color="primary" gutterBottom>
                      ${selectedProduct.price.amount} / {selectedProduct.unit}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Min Order: {selectedProduct.minimumOrderQuantity}{" "}
                      {selectedProduct.unit}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Manufacturer
                      </Typography>
                      <Typography variant="body2">
                        {typeof selectedProduct.manufacturer === "object"
                          ? selectedProduct.manufacturer.companyName
                          : "Unknown Company"}
                      </Typography>
                      <Typography variant="body2">
                        {typeof selectedProduct.manufacturer === "object"
                          ? selectedProduct.manufacturer.country
                          : "Unknown Country"}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Certifications
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap", gap: 0.5 }}
                      >
                        {selectedProduct.certifications.map((cert) => (
                          <Chip key={cert} label={cert} size="small" />
                        ))}
                      </Stack>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Specifications
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(selectedProduct.specifications).map(
                        ([key, value]) => (
                          <Grid item xs={6} md={4} key={key}>
                            <Typography variant="body2">
                              <strong>{key}:</strong> {value}
                            </Typography>
                          </Grid>
                        )
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)}>Close</Button>
                <Button variant="contained" color="primary">
                  Contact Supplier
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Add New Product Dialog */}
        <Dialog
          open={openNewProductDialog}
          onClose={() => setOpenNewProductDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Add New Product
            <IconButton
              aria-label="close"
              onClick={() => setOpenNewProductDialog(false)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={newProduct.name}
                  onChange={(e) =>
                    handleNewProductChange("name", e.target.value)
                  }
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={newProduct.description}
                  onChange={(e) =>
                    handleNewProductChange("description", e.target.value)
                  }
                  multiline
                  rows={3}
                  error={!!validationErrors.description}
                  helperText={validationErrors.description}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newProduct.category}
                    label="Category"
                    onChange={(e) =>
                      handleNewProductChange(
                        "category",
                        e.target.value as Category
                      )
                    }
                    required
                  >
                    {CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Specifications:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Fat Content"
                      name="specifications.fatContent"
                      value={newProduct.specifications.fatContent}
                      onChange={(e) =>
                        handleNewProductChange(
                          "specifications.fatContent",
                          e.target.value
                        )
                      }
                      error={!!validationErrors["specifications.fatContent"]}
                      helperText={validationErrors["specifications.fatContent"]}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Protein Content"
                      name="specifications.proteinContent"
                      value={newProduct.specifications.proteinContent}
                      onChange={(e) =>
                        handleNewProductChange(
                          "specifications.proteinContent",
                          e.target.value
                        )
                      }
                      error={
                        !!validationErrors["specifications.proteinContent"]
                      }
                      helperText={
                        validationErrors["specifications.proteinContent"]
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Shelf Life"
                      name="specifications.shelfLife"
                      value={newProduct.specifications.shelfLife}
                      onChange={(e) =>
                        handleNewProductChange(
                          "specifications.shelfLife",
                          e.target.value
                        )
                      }
                      error={!!validationErrors["specifications.shelfLife"]}
                      helperText={validationErrors["specifications.shelfLife"]}
                      required
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Certifications:
                </Typography>
                <FormGroup row>
                  {CERTIFICATIONS.map((cert) => (
                    <FormControlLabel
                      key={cert}
                      control={
                        <Checkbox
                          checked={newProduct.certifications.includes(cert)}
                          onChange={() => handleCertificationToggle(cert)}
                        />
                      }
                      label={cert}
                    />
                  ))}
                </FormGroup>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenNewProductDialog(false);
                setNewProduct({
                  name: "",
                  description: "",
                  category: "milk",
                  specifications: {
                    fatContent: "",
                    proteinContent: "",
                    shelfLife: "",
                  },
                  certifications: [],
                });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitNewProduct}
            >
              Add Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Product Request Dialog */}
        <Dialog
          open={openRequestDialog}
          onClose={() => {
            if (!requestSuccess) {
              setOpenRequestDialog(false);
              setRequestMessage("");
            }
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Request Product
            <IconButton
              aria-label="close"
              onClick={() => {
                if (!requestSuccess) {
                  setOpenRequestDialog(false);
                  setRequestMessage("");
                }
              }}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {requestSuccess ? (
              <Alert severity="success" sx={{ my: 2 }}>
                Request sent successfully!
              </Alert>
            ) : (
              <>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                {selectedProduct && (
                  <>
                    <Typography variant="subtitle1">
                      Requesting: {selectedProduct.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Manufacturer:{" "}
                      {typeof selectedProduct.manufacturer === "object"
                        ? selectedProduct.manufacturer.companyName
                        : "Unknown Company"}
                    </Typography>
                    <TextField
                      fullWidth
                      label="Message to Supplier"
                      multiline
                      rows={4}
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Introduce yourself and explain why you're interested in this product. Include details about your required quantity, timeline, etc."
                      sx={{ mt: 2 }}
                    />
                  </>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            {!requestSuccess && (
              <>
                <Button
                  onClick={() => {
                    setOpenRequestDialog(false);
                    setRequestMessage("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRequestProduct}
                  disabled={!requestMessage.trim()}
                >
                  Send Request
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Products;
