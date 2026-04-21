export type UserRole = 'user' | 'creator' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  balance?: number;
  totalSales?: number;
  totalRevenue?: number;
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface CreatorApplication {
  id?: string;
  userId: string;
  userEmail: string;
  portfolioUrl: string;
  experience: string;
  status: ApplicationStatus;
  benefitsAccepted: boolean;
  createdAt: string;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  creatorId: string;
  creatorName: string;
  fileUrl: string;
  imageUrl: string;
  createdAt: string;
  slug: string;
}

export const PRODUCT_CATEGORIES = [
  'Scripts',
  'UI Kits',
  '3D Models',
  'VFX & Particles',
  'Maps & Environments',
  'Animations',
  'Plugins',
  'Buildings',
  'GUI & HUD',
  'Sounds & Music',
  'Tools',
  'Starter Packs',
  'Clothing & UGC',
  'Game passes',
  'Shaders & Lightning',
  'AI Solutions',
  'Security Modules',
  'Automation Bots'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export type WithdrawalStatus = 'pending' | 'completed' | 'rejected';

export interface Withdrawal {
  id?: string;
  userId: string;
  userEmail: string;
  amount: number;
  status: WithdrawalStatus;
  createdAt: any;
  method: string;
  details: string;
}

export interface Purchase {
  id?: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  fileUrl: string;
  price: number;
  creatorId: string;
  createdAt: any;
}
