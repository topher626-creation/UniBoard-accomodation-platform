import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Building2 } from "lucide-react";
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

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.location) params.append("location", filters.location);
      if (filters.room_type) params.append("room_type", filters.room_type);
      if (filters.price_min) params.append("price_min", filters.price_min);
      if (filters.price_max) params.append("price_max", filters.price_max);
      if (filters.available_only) params.append("available_only", "true");

      const response = await api.getProperties(params);
      setProperties(response.properties || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

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
  };

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section
        className="ub-hero ub-hero--photo text-white py-5 mb-4 relative overflow-hidden"
        style={{ paddingBottom: "150px" }}
      >
        <div className="container py-3 relative z-10">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="badge rounded-pill mb-3" style={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: "0.8rem" }}>
                Zambia's trusted student housing platform
              </span>
              <h1 className="display-4 fw-bold mb-3" style={{ lineHeight: "1.15" }}>
                Find student accommodation<br />fast & secure
              </h1>
              <p className="lead mb-3" style={{ opacity: "0.85" }}>
                Discover verified off-campus accommodation near your university.
                Connect directly with trusted landlords and agents.
              </p>

              {/* Hero Search */}
              <form onSubmit={handleSearch} className="w-100">
                <div className="row g-2 g-lg-3">
                  <div className="col-12 col-sm-6 col-lg-4">
                    <input
                      type="text"
                      name="search"
                      className="form-control form-control-lg rounded-pill w-100"
                      placeholder="Search properties..."
                      value={filters.search}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="col-12 col-sm-6 col-lg-3">
                    <select
                      name="location"
                      className="form-select form-select-lg rounded-pill w-100"
                      value={filters.location}
                      onChange={handleFilterChange}
                    >
                      <option value="">Any university</option>
                      <option value="Kitwe">Copperbelt University</option>
                      <option value="Lusaka">University of Zambia</option>
                      <option value="Ndola">Mulungushi University</option>
                      <option value="Kitwe">Mukuba University</option>
                      <option value="near campus">Near Campus</option>
                    </select>
                  </div>
                  <div className="col-12 col-sm-6 col-lg-2">
                    <input
                      type="number"
                      name="price_max"
                      className="form-control form-control-lg rounded-pill w-100"
                      placeholder="Max K"
                      value={filters.price_max}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="col-12 col-sm-6 col-lg-3 d-flex">
                    <button
                      type="submit"
                      className="btn btn-light btn-lg w-100 fw-semibold text-primary rounded-pill d-inline-flex align-items-center justify-content-center gap-2"
                    >
                      <Search size={20} aria-hidden /> Search
                    </button>
                  </div>
                </div>
              </form>

              {/* Stats */}
              <div className="d-flex gap-4 mt-4 flex-wrap">
                <div>
                  <div className="fw-bold fs-5">500+</div>
                  <div className="small" style={{ opacity: 0.75 }}>Verified Listings</div>
                </div>
                <div>
                  <div className="fw-bold fs-5">3 Cities</div>
                  <div className="small" style={{ opacity: 0.75 }}>Across Zambia</div>
                </div>
                <div>
                  <div className="fw-bold fs-5">1,000+</div>
                  <div className="small" style={{ opacity: 0.75 }}>Students Helped</div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-flex justify-content-end position-relative">
              <img
                src="/uniboard-logo.png"
                alt=""
                className="position-absolute"
                style={{
                  top: "-40px",
                  right: "-40px",
                  width: "min(420px, 42vw)",
                  height: "auto",
                  opacity: 0.12,
                  zIndex: 1,
                  pointerEvents: "none",
                }}
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Filters */}
      <section className="container mb-4">
        <div className="d-flex gap-2 flex-wrap justify-content-center">
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              setFilters((prev) => ({ ...prev, room_type: "single" }));
              fetchProperties();
            }}
          >
            Single Room
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              setFilters((prev) => ({ ...prev, room_type: "bedsitter" }));
              fetchProperties();
            }}
          >
            Bedsitter
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              setFilters((prev) => ({ ...prev, room_type: "self-contained" }));
              fetchProperties();
            }}
          >
            Self-contained
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              setFilters((prev) => ({ ...prev, available_only: true }));
              fetchProperties();
            }}
          >
            Available Now
          </button>
        </div>
      </section>

      {/* Properties */}
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
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-primary mb-2" style={{ width: 72, height: 72 }}>
              <Building2 size={36} aria-hidden />
            </div>
            <h4 className="mt-3">No properties found</h4>
            <p className="text-muted">
              Try adjusting your search or check back later.
            </p>
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear All
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

      {/* CTA */}
      <section className="bg-light py-5 mt-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-3">List Your Property</h2>
          <p className="text-muted mb-4">
            Reach students searching for accom near campus.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started as Landlord
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;

