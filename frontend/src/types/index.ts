// Types for the application
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'landlord' | 'admin';
  avatar?: string;
  phone?: string;
  business_name?: string;
  status?: 'pending' | 'active' | 'disabled';
  isVerified?: boolean;
  createdAt: string;
}

export interface Property {
  id: string;
  name: string;
  location: string;
  compound?: string;
  price: number;
  description: string;
  images: string[];
  landlordId: string;
  landlord?: User;
  amenities: string[];
  capacity: number;
  rating?: number;
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  property?: Property;
  studentId: string;
  student?: User;
  checkInDate: string;
  checkOutDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  createdAt: string;
}

export interface Review {
  id: string;
  propertyId: string;
  studentId: string;
  student?: User;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  transactionId?: string;
  createdAt: string;
}

export interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}
