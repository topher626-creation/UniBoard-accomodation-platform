const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.baseUrl = API_URL;
  }

  getToken() {
    return localStorage.getItem("token");
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  }

  // Auth
  async login(email, password) {
    const data = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  }

  async register(userData) {
    const data = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  }

  async getCurrentUser() {
    return this.request("/auth/me");
  }

  // Properties
  async getProperties(params = {}) {
    let queryString = "";
    if (params instanceof URLSearchParams) {
      queryString = params.toString();
    } else if (typeof params === "string") {
      queryString = params.replace(/^\?/, "");
    } else {
      queryString = new URLSearchParams(params).toString();
    }
    return this.request(`/properties${queryString ? `?${queryString}` : ""}`);
  }

  async getProperty(id) {
    return this.request(`/properties/${id}`);
  }

  async createProperty(data) {
    return this.request("/properties", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProperty(id, data) {
    return this.request(`/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProperty(id) {
    return this.request(`/properties/${id}`, {
      method: "DELETE",
    });
  }

  async getMyProperties() {
    return this.request("/properties/mine");
  }

  // Bookings
  async getMyBookings(status) {
    const query = status ? `?status=${status}` : "";
    return this.request(`/bookings/my-bookings${query}`);
  }

  async createBooking(data) {
    return this.request("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async cancelBooking(id) {
    return this.request(`/bookings/${id}/cancel`, {
      method: "PATCH",
    });
  }

  async getLandlordBookings(status) {
    const query = status ? `?status=${status}` : "";
    return this.request(`/bookings/landlord/bookings${query}`);
  }

  async confirmBooking(id) {
    return this.request(`/bookings/${id}/confirm`, {
      method: "PATCH",
    });
  }

  async rejectBooking(id, reason) {
    return this.request(`/bookings/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ rejection_reason: reason }),
    });
  }

  // Favorites
  async getFavorites() {
    return this.request("/favorites");
  }

  async addFavorite(propertyId) {
    return this.request("/favorites", {
      method: "POST",
      body: JSON.stringify({ property_id: propertyId }),
    });
  }

  async removeFavorite(propertyId) {
    return this.request(`/favorites/${propertyId}`, {
      method: "DELETE",
    });
  }

  async checkFavorite(propertyId) {
    return this.request(`/favorites/check/${propertyId}`);
  }

  // Users
  async getProfile() {
    return this.request("/users/profile");
  }

  async updateProfile(data) {
    return this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request("/users/password", {
      method: "PUT",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  }

  // Admin
  async getAdminStats() {
    return this.request("/admin/stats");
  }

  async getAdminUsers() {
    return this.request("/admin/users");
  }

  async updateUserRole(id, role) {
    return this.request(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
  }

  /** Update admin-managed user fields (role and/or status). */
  async updateAdminUser(id, body) {
    return this.request(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async approveLandlord(id) {
    return this.request(`/admin/users/${id}/approve-landlord`, {
      method: "PATCH",
    });
  }

  async banUser(id, banned) {
    return this.request(`/admin/users/${id}/ban`, {
      method: "PATCH",
      body: JSON.stringify({ banned }),
    });
  }

  async deleteUser(id) {
    return this.request(`/admin/users/${id}`, {
      method: "DELETE",
    });
  }

  async getAdminProperties() {
    return this.request("/admin/properties");
  }

  async approveProperty(id, approved) {
    return this.request(`/admin/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify({ approved }),
    });
  }

  async deletePropertyAdmin(id) {
    return this.request(`/admin/properties/${id}`, {
      method: "DELETE",
    });
  }

  // Reviews
  async getPropertyReviews(propertyId) {
    return this.request(`/reviews/listing/${propertyId}`);
  }

  async createReview(data) {
    return this.request("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Compounds
  async getCompounds() {
    return this.request("/compounds");
  }

  async createCompound(data) {
    return this.request("/compounds", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Buildings
  async getBuildings(compoundId) {
    const query = compoundId ? `?compound_id=${compoundId}` : "";
    return this.request(`/buildings${query}`);
  }

  async createBuilding(data) {
    return this.request("/buildings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
