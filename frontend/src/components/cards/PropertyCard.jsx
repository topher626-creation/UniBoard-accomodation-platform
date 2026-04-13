import { Link } from "react-router-dom";
import { MapPin, Building2, User } from "lucide-react";

const PLACEHOLDER_ROOM =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=75";

export function PropertyCard({ property, showLandlord = false }) {
  const getAvailabilityBadge = () => {
    const status = property.availability_status;
    if (status === "AVAILABLE") {
      return <span className="badge badge-availability badge-available">Available</span>;
    } else if (status === "LOW") {
      return <span className="badge badge-availability badge-low">Limited</span>;
    } else {
      return <span className="badge badge-availability badge-full">Full</span>;
    }
  };

  const getRoomTypeBadge = () => {
    const type = property.room_type;
    const labels = {
      "single": "Single",
      "bedsitter": "Bedsitter",
      "self-contained": "Self-contained",
    };
    return (
      <span className="badge bg-secondary">
        {labels[type] || type}
      </span>
    );
  };

  return (
    <Link to={`/property/${property.id}`} className="text-decoration-none">
      <div className="card property-card h-100">
        {/* Image */}
        <div className="position-relative overflow-hidden">
          <img
            src={property.image || PLACEHOLDER_ROOM}
            className="card-img-top"
            alt={property.name || "Property"}
            style={{ height: "200px", objectFit: "cover" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = PLACEHOLDER_ROOM;
            }}
          />
          
          {/* Badges */}
          <div className="position-absolute top-0 end-0 p-2 d-flex gap-1">
            {getRoomTypeBadge()}
          </div>
          
          {/* Availability Badge */}
          <div className="position-absolute bottom-0 start-0 p-2">
            {getAvailabilityBadge()}
          </div>
        </div>

        {/* Content */}
        <div className="card-body">
          <h5 className="card-title fw-bold mb-1 text-truncate">
            {property.name}
          </h5>
          
          <p className="card-text text-muted small mb-2 d-flex align-items-start gap-1">
            <MapPin size={14} className="flex-shrink-0 mt-1" aria-hidden />
            <span>{property.location || property.compound || "Location not specified"}</span>
          </p>

          {property.compound && (
            <p className="card-text text-muted small mb-2 d-flex align-items-start gap-1">
              <Building2 size={14} className="flex-shrink-0 mt-1" aria-hidden />
              <span>{property.compound}</span>
            </p>
          )}

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <span className="fw-bold text-primary fs-5">
                K{Number(property.price).toLocaleString()}
              </span>
              <span className="text-muted small">/month</span>
            </div>
            
            <div className="text-end">
              <small className="text-muted d-block">
                {property.available_beds} beds
              </small>
              <small className="text-muted">
                ({property.occupied_beds}/{property.total_beds} occupied)
              </small>
            </div>
          </div>

          {showLandlord && property.landlord_name && (
            <p className="card-text text-muted small mt-2 mb-0 d-flex align-items-center gap-1">
              <User size={14} aria-hidden /> Listed by {property.landlord_name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
