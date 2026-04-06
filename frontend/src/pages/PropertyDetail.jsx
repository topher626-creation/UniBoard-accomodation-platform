import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // CHECK AUTH GATE FIRST
    checkAuthAndFetchDetails();
  }, [id]);

  const checkAuthAndFetchDetails = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    // REDIRECT to login if not authenticated
    if (!token || !userData) {
      navigate("/login");
      return;
    }

    // User is authenticated, fetch property details
    setUser(JSON.parse(userData));
    fetchPropertyDetails(token);
  };

  const fetchPropertyDetails = async (token) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`http://localhost:5000/api/properties/${id}`, { headers });
      setProperty(response.data);
    } catch (error) {
      console.error("Error fetching property details:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleContactLandlord = (type) => {
    if (type === "call") {
      window.open(`tel:${property.landlord.phone}`, "_blank");
    } else if (type === "whatsapp") {
      const message = encodeURIComponent(`Hi! I'm interested in your property: ${property.name}`);
      window.open(`https://wa.me/${property.landlord.whatsapp.replace(/[^\d]/g, "")}?text=${message}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 text-lg">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Property not found</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
          >
            ← Back to All Properties
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* PROPERTY HEADER */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-semibold mb-3">
                {property.room_type} • {property.compound}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                {property.name}
              </h1>
              <p className="text-gray-600 text-lg flex items-center gap-2">
                📍 {property.location}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl text-center min-w-[150px]">
              <p className="text-sm font-medium opacity-90">Monthly Price</p>
              <p className="text-4xl font-bold">K{property.price}</p>
            </div>
          </div>
        </div>

        {/* IMAGE GALLERY */}
        {property.images && property.images.length > 0 && (
          <div className="mb-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {property.images.slice(0, 8).map((image, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow h-64"
                >
                  <img
                    src={image}
                    alt={`Property ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2">
            {/* DESCRIPTION */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Property</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {property.description || "No description available"}
              </p>
            </div>

            {/* FEATURES */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities & Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg"
                    >
                      <span className="text-xl">✓</span>
                      <span className="text-gray-700 font-medium capitalize">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BED AVAILABILITY */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Bed Availability</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total beds:</span>
                  <span className="font-semibold">{property.total_beds}</span>
                </div>
                <div className="flex justify-between">
                  <span>Occupied beds:</span>
                  <span className="font-semibold">{property.occupied_beds}</span>
                </div>
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Available beds:</span>
                  <span>{property.available_beds}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR - CONTACT & DETAILS */}
          <div className="lg:col-span-1">
            {/* CONTACT CARD */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Landlord</h2>

              {property.landlord ? (
                <div className="space-y-3">
                  <div className="text-center mb-4">
                    <p className="text-gray-700 font-medium">{property.landlord.name}</p>
                  </div>
                  <button
                    onClick={() => handleContactLandlord("call")}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    📞 Call Now
                  </button>
                  <button
                    onClick={() => handleContactLandlord("whatsapp")}
                    className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                  >
                    💬 WhatsApp Message
                  </button>
                  <p className="text-xs text-gray-600 text-center mt-4">
                    Direct contact with landlord. They respond via WhatsApp or call.
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">Contact information not available</p>
              )}
            </div>

            {/* QUICK INFO CARD */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Property Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Compound</span>
                  <span className="font-semibold text-gray-900">{property.compound}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Building</span>
                  <span className="font-semibold text-gray-900">{property.building}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Room Type</span>
                  <span className="font-semibold text-gray-900 capitalize">{property.room_type}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold text-blue-600">K{property.price}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Beds</span>
                  <span className="font-semibold text-green-600">{property.available_beds}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}