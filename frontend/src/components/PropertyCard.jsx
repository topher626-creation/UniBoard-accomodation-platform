import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.ts";

export default function PropertyCard({ property }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = Boolean(user);
  const { id, name, price, location, room_type, total_beds, available_beds, image, compound, landlord_name } = property;
  const availabilityStatus = available_beds <= 0 ? "FULL" : available_beds <= 5 ? "LOW" : "AVAILABLE";
  const availabilityClass =
    availabilityStatus === "FULL"
      ? "text-red-600"
      : availabilityStatus === "LOW"
      ? "text-amber-600"
      : "text-green-600";

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate(`/property/${id}`);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 h-40 sm:h-64">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-500 text-4xl sm:text-6xl">
            🏠
          </div>
        )}

        {/* Location Badge */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/90 dark:bg-slate-900/85 backdrop-blur-sm text-gray-900 dark:text-slate-100 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-custom">
          {compound || location}
        </div>

        {/* Guest Preview Badge */}
        {!isAuthenticated && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-custom">
            👁️ Preview
          </div>
        )}

        {/* Price Overlay */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-white/95 dark:bg-slate-900/85 backdrop-blur-sm text-gray-900 dark:text-slate-100 px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl shadow-custom">
          <p className="text-lg sm:text-2xl font-bold text-blue-600">
            K{price}<span className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 font-normal">/mo</span>
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-3 sm:p-6">
        {/* Title */}
        <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {name}
        </h3>

        {/* Location and Room Type */}
        <div className="space-y-1 mb-3 sm:mb-4">
          <p className="text-gray-600 dark:text-slate-300 flex items-center text-xs sm:text-sm">
            📍 <span className="ml-1 sm:ml-2 truncate">{location}</span>
          </p>
          <p className="text-gray-600 dark:text-slate-300 flex items-center text-xs sm:text-sm">
            🏠 <span className="ml-1 sm:ml-2 capitalize">{room_type}</span>
          </p>
        </div>

        {/* Bed Availability */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-200">
              Available: <span className={`font-bold ${availabilityClass}`}>{available_beds}</span>
            </p>
            <span className={`text-[10px] sm:text-xs font-semibold ${availabilityClass}`}>
              {availabilityStatus}
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: total_beds }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                    i < available_beds ? 'bg-green-400' : 'bg-gray-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Landlord */}
        {isAuthenticated && landlord_name && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 mb-3 sm:mb-4 flex items-center truncate">
            👤 <span className="ml-1 sm:ml-2 font-medium truncate">{landlord_name}</span>
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3">
          {!isAuthenticated ? (
            <button
              onClick={handleViewDetails}
              className="flex-1 btn-primary text-xs sm:text-sm py-2 sm:py-3"
            >
              Login to View
            </button>
          ) : (
            <button
              onClick={handleViewDetails}
              className="flex-1 btn-primary text-xs sm:text-sm py-2 sm:py-3"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}