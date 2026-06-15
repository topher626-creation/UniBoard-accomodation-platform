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

  // Bookings (Future implementation - placeholder)
  async getMyBookings() {
    return [];
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

  // Admin
  async getAdminStats() {
    return this.request("/admin/stats");
  }

  async getAdminUsers(role, status) {
    let query = "";
    if (role || status) {
      const params = new URLSearchParams();
      if (role) params.append("role", role);
      if (status) params.append("status", status);
      query = `?${params.toString()}`;
    }
    return this.request(`/admin/users${query}`);
  }

  async getPendingLandlords() {
    return this.request("/admin/landlords/pending");
  }

  async approveLandlord(id) {
    return this.request(`/admin/users/${id}/approve-landlord`, {
      method: "PATCH",
    });
  }

  async rejectLandlord(id, reason) {
    return this.request(`/admin/users/${id}/reject-landlord`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
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

  async getAdminProperties(approved) {
    const query = approved !== undefined ? `?approved=${approved}` : "";
    return this.request(`/admin/properties${query}`);
  }

  async getPendingProperties() {
    return this.request("/admin/properties/pending");
  }

  async approveProperty(id) {
    return this.request(`/admin/properties/${id}/approve`, {
      method: "PATCH",
    });
  }

  async rejectProperty(id, reason) {
    return this.request(`/admin/properties/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
  }

  async updateOccupancy(id, action) {
    return this.request(`/admin/properties/${id}/occupancy`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    });
  }

  // Reviews
  async getPropertyReviews(propertyId) {
    return this.request(`/reviews/property/${propertyId}`);
  }

  async createReview(data) {
    return this.request("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
