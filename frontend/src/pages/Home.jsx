import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PropertyCard } from "../components/cards/PropertyCard";
import { api } from "../services/api";

function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    room_type: "",
    price_min: "",
    price_max: "",
    available_only: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.location) params.append("location", filters.location);
      if (filters.room_type) params.append("room_type", filters.room_type);
      if (filters.price_min) params.append("price_min", filters.price_min);
      if (filters.price_max) params.append("price_max", filters.price_max);
      if (filters.available_only) params.append("available_only", "true");

      const response = await api.getProperties(params.toString() ? `?${params.toString()}` : "");
      setProperties(response.properties || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      location: "",
      room_type: "",
      price_min: "",
      price_max: "",
      available_only: false,
    });
    setTimeout(fetchProperties, 0);
  };

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="bg-primary text-white py-5 mb-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1 className="display-4 fw-bold mb-3">
                Find Your Perfect Student Bedspace
              </h1>
              <p className="lead mb-4 opacity-75">
                Discover verified off-campus accommodation near your university.
                Connect directly with trusted landlords and agents.
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="d-flex gap-2 flex-wrap">
                <div className="flex-grow-1">
                  <input
                    type="text"
                    name="search"
                    className="form-control form-control-lg"
                    placeholder="Search by name, location..."
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </div>
                <button type="submit" className="btn btn-light btn-lg px-4">
                  🔍 Search
                </button>
              </form>
            </div>
            <div className="col-lg-5 d-none d-lg-block text-center">
              <div style={{ fontSize: "8rem" }}>🏠</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Filter Buttons */}
      <section className="container mb-4">
        <div className="d-flex gap-2 flex-wrap justify-content-center">
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              setFilters((prev) => ({ ...prev, room_type: "single" }));
              setTimeout(fetchProperties, 0);
            }}
          >
            Single Room
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              setFilters((prev) => ({ ...prev, room_type: "bedsitter" }));
              setTimeout(fetchProperties, 0);
            }}
          >
            Bedsitter
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              setFilters((prev) => ({ ...prev, room_type: "self-contained" }));
              setTimeout(fetchProperties, 0);
            }}
          >
            Self-contained
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              setFilters((prev) => ({ ...prev, available_only: true }));
              setTimeout(fetchProperties, 0);
            }}
          >
            Available Now
          </button>
          <button
            className="btn btn-link"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "More Filters"} →
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="card mt-3 p-3">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  placeholder="e.g., Kitwe"
                  value={filters.location}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Room Type</label>
                <select
                  name="room_type"
                  className="form-select"
                  value={filters.room_type}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="single">Single</option>
                  <option value="bedsitter">Bedsitter</option>
                  <option value="self-contained">Self-contained</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Min Price (K)</label>
                <input
                  type="number"
                  name="price_min"
                  className="form-control"
                  placeholder="0"
                  value={filters.price_min}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Max Price (K)</label>
                <input
                  type="number"
                  name="price_max"
                  className="form-control"
                  placeholder="Any"
                  value={filters.price_max}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="available_only"
                    className="form-check-input"
                    id="available_only"
                    checked={filters.available_only}
                    onChange={handleFilterChange}
                  />
                  <label className="form-check-label" htmlFor="available_only">
                    Available only
                  </label>
                </div>
              </div>
              <div className="col-12 d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={clearFilters}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={fetchProperties}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Listings Section */}
      <section className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">Available Bedspaces</h2>
          <span className="text-muted">{properties.length} listings</span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: "4rem" }}>🏚️</div>
            <h4 className="mt-3">No Properties Found</h4>
            <p className="text-muted">
              Try adjusting your filters or check back later.
            </p>
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {properties.map((property) => (
              <div key={property.id} className="col-md-6 col-lg-4">
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-light py-5 mt-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-3">List Your Property on UniBoard</h2>
          <p className="text-muted mb-4">
            Reach students actively searching for accommodation near campus.
            Simple listing process, powerful management tools.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started as Provider
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
