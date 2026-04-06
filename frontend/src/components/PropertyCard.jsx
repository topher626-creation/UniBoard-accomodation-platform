import { useNavigate } from "react-router-dom";

export default function PropertyCard({ property }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { id, name, price, location, room_type, total_beds, occupied_beds, available_beds, image, compound, landlord_name } = property;

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (!token) {
      navigate("/login");
    } else {
      navigate(`/property/${id}`);
    }
  };

  const handleWhatsApp = (e, phone) => {
    e.stopPropagation();
    window.open(`https://wa.me/${phone.replace(/[^\d]/g, "")}`, "_blank");
  };

  const handleCall = (e, phone) => {
    e.stopPropagation();
    window.open(`tel:${phone}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 h-64">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-500 text-6xl">
            🏠
          </div>
        )}

        {/* Location Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-semibold shadow-custom">
          {compound || location}
        </div>

        {/* Guest Preview Badge */}
        {!token && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-custom">
            👁️ Preview
          </div>
        )}

        {/* Price Overlay */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl shadow-custom">
          <p className="text-2xl font-bold text-blue-600">
            K{price}<span className="text-sm text-gray-600 font-normal">/month</span>
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {name}
        </h3>

        {/* Location and Room Type */}
        <div className="space-y-2 mb-4">
          <p className="text-gray-600 flex items-center text-sm">
            📍 <span className="ml-2">{location}</span>
          </p>
          <p className="text-gray-600 flex items-center text-sm">
            🏠 <span className="ml-2 capitalize">{room_type}</span>
          </p>
        </div>

        {/* Bed Availability */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Available beds: <span className="font-bold text-green-600">{available_beds}</span>
            </p>
            <div className="flex gap-1">
              {Array.from({ length: total_beds }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < available_beds ? 'bg-green-400' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Landlord */}
        {token && landlord_name && (
          <p className="text-sm text-gray-600 mb-4 flex items-center">
            👤 <span className="ml-2 font-medium">{landlord_name}</span>
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!token ? (
            <button
              onClick={handleViewDetails}
              className="flex-1 btn-primary text-sm py-3"
            >
              🔐 Login to View
            </button>
          ) : (
            <button
              onClick={handleViewDetails}
              className="flex-1 btn-primary text-sm py-3"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}