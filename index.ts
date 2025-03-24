export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'importer' | 'manufacturer';
    companyName: string;
    country: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
    };
    phone: string;
    website?: string;
    description?: string;
    products?: Product[];
    createdAt: string;
}

export interface Product {
    _id: string;
    name: string;
    description: string;
    category: "milk" | "cheese" | "yogurt" | "butter" | "ghee" | "whey" | "other";
    price: {
        amount: number;
        currency: string;
    };
    unit: string;
    minimumOrderQuantity: number;
    specifications: Record<string, string>;
    certifications: ("ISO" | "HACCP" | "Halal" | "Kosher" | "Organic" | "FSSAI")[];
    images: string[];
    manufacturer: string | User;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    _id: string;
    sender: string | User;
    recipient: string | User;
    subject: string;
    content: string;
    product?: string | Product;
    isRead: boolean;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    user: User;
} 