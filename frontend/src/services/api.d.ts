/** JSDoc types for `api.js` (ApiService instance). */
export declare const api: {
  getToken: () => string | null;
  request: (endpoint: string, options?: RequestInit) => Promise<unknown>;
  login: (email: string, password: string) => Promise<unknown>;
  register: (userData: Record<string, unknown>) => Promise<unknown>;
  getCurrentUser: () => Promise<unknown>;
  getProperties: (
    params?: Record<string, string | number | boolean | undefined> | URLSearchParams | string
  ) => Promise<unknown>;
  getProperty: (id: string | number) => Promise<unknown>;
  createProperty: (data: Record<string, unknown>) => Promise<unknown>;
  updateProperty: (id: string | number, data: Record<string, unknown>) => Promise<unknown>;
  deleteProperty: (id: string | number) => Promise<unknown>;
  getMyProperties: () => Promise<unknown>;
  getMyBookings: (status?: string) => Promise<unknown>;
  createBooking: (data: Record<string, unknown>) => Promise<unknown>;
  cancelBooking: (id: string | number) => Promise<unknown>;
  getLandlordBookings: (status?: string) => Promise<unknown>;
  confirmBooking: (id: string | number) => Promise<unknown>;
  rejectBooking: (id: string | number, reason: string) => Promise<unknown>;
  getFavorites: () => Promise<unknown>;
  addFavorite: (propertyId: string | number) => Promise<unknown>;
  removeFavorite: (propertyId: string | number) => Promise<unknown>;
  checkFavorite: (propertyId: string | number) => Promise<unknown>;
  getProfile: () => Promise<unknown>;
  updateProfile: (data: Record<string, unknown>) => Promise<unknown>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<unknown>;
  getAdminStats: () => Promise<unknown>;
  getAdminUsers: () => Promise<unknown>;
  updateUserRole: (id: string | number, role: string) => Promise<unknown>;
  updateAdminUser: (
    id: string | number,
    body: { role?: string; status?: "pending" | "active" | "disabled" }
  ) => Promise<unknown>;
  approveLandlord: (id: string | number) => Promise<unknown>;
  banUser: (id: string | number, banned: boolean) => Promise<unknown>;
  deleteUser: (id: string | number) => Promise<unknown>;
  getAdminProperties: () => Promise<unknown>;
  approveProperty: (id: string | number, approved: boolean) => Promise<unknown>;
  deletePropertyAdmin: (id: string | number) => Promise<unknown>;
  getPropertyReviews: (propertyId: string | number) => Promise<unknown>;
  createReview: (data: Record<string, unknown>) => Promise<unknown>;
  getCompounds: () => Promise<unknown>;
  createCompound: (data: Record<string, unknown>) => Promise<unknown>;
  getBuildings: (compoundId?: string | number) => Promise<unknown>;
  createBuilding: (data: Record<string, unknown>) => Promise<unknown>;
};
