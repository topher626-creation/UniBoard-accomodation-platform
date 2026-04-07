import { useState, useEffect } from "react";
import { Button, Card, CardBody, Input } from "@nextui-org/react";
import PropertyCard from "../components/PropertyCard";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.ts";
import { apiClient } from "../lib/api.ts";

const AREAS = ["Garneton", "Zambia Compound", "Halawa", "Pathfinder", "Big Brothers"];

export default function Home() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, searchTerm]);

  const fetchProperties = async (area = "") => {
    try {
      setLoading(true);
      let url = "/properties";
      if (area) {
        url += `?search=${encodeURIComponent(area)}`;
      }

      const response = await apiClient.get(url);
      setProperties(response);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!searchTerm.trim()) {
      setFilteredProperties(properties);
      return;
    }

    // Client-side filtering as backup (server-side is primary)
    const filtered = properties.filter(property =>
      property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.compound?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProperties(filtered);
  };

  const handleSearch = () => {
    fetchProperties(searchTerm);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchProperties();
  };

  const handlePropertyClick = (propertyId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/property/${propertyId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
        }}
      ></div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-12">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Find Your Perfect <span className="text-blue-600">Student Room</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Affordable, verified accommodation near Lusaka's top universities.
                Connect with trusted landlords and secure your ideal living space.
              </p>

              {/* Guest Mode Banner */}
              {!user && (
                <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-full px-6 py-3 mb-8">
                  <span className="text-2xl">🔒</span>
                  <span className="text-blue-800 font-medium">
                    Guest Mode - Login to see landlord contacts and request bookings
                  </span>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="text-3xl mb-2">🏢</div>
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-gray-600">Properties Listed</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="text-3xl mb-2">🎓</div>
                <div className="text-2xl font-bold text-gray-900">10K+</div>
                <div className="text-gray-600">Happy Students</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="text-3xl mb-2">⭐</div>
                <div className="text-2xl font-bold text-gray-900">4.8</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardBody className="p-4 sm:p-8 md:p-12">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
                    Search Properties
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-lg">
                    Find your ideal accommodation in seconds
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder="Search location, compound..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-lg"
                      size="lg"
                      startContent={<span className="text-gray-400 text-lg">🔍</span>}
                    />
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-lg"
                    size="lg"
                    onClick={handleSearch}
                  >
                    Search
                  </Button>
                </div>

                {searchTerm && (
                  <div className="text-center mb-4 sm:mb-6">
                    <button
                      onClick={handleClearSearch}
                      className="text-blue-600 hover:text-blue-700 font-medium underline transition-colors text-xs sm:text-sm"
                    >
                      ✕ Clear search
                    </button>
                  </div>
                )}

                {/* Popular Searches */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                    <span className="text-blue-600">💡</span>
                    <span className="font-semibold text-gray-700 text-sm sm:text-base">Popular searches:</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["Kitwe", "Lusaka", "Mbachi", "Jilafu", "Garneton", "Pathfinder"].map((location) => (
                      <button
                        key={location}
                        onClick={() => {
                          setSearchTerm(location);
                          fetchProperties(location);
                        }}
                        className="bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border border-gray-200 hover:border-blue-300"
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Results Section */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {searchTerm ? `Results for "${searchTerm}"` : "All Properties"}
                </h2>
                <p className="text-gray-600 text-sm sm:text-lg">
                  {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"} found
                </p>
              </div>

              {user?.role === 'landlord' && (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
                  onClick={() => navigate("/create-listing")}
                >
                  <span className="mr-2">➕</span>
                  Add Property
                </Button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin">
                  <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
                <p className="text-gray-600 text-xl mt-6 font-medium">Finding your perfect room...</p>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-20">
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-3xl max-w-2xl mx-auto">
                  <CardBody className="p-12">
                    <div className="text-8xl mb-6">🏠</div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      {searchTerm ? `No properties found for "${searchTerm}"` : "No properties listed yet"}
                    </h3>
                    <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                      {searchTerm
                        ? "Try adjusting your search terms or browse all available properties."
                        : "Be the first to list a property and help students find their perfect accommodation!"
                      }
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {searchTerm && (
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200"
                          onClick={handleClearSearch}
                        >
                          View All Properties
                        </Button>
                      )}
                      {user?.role === 'landlord' && (
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200"
                          onClick={() => navigate("/create-listing")}
                        >
                          <span className="mr-2">🏠</span>
                          List Your Property
                        </Button>
                      )}
                      {!user && (
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200"
                          onClick={() => navigate("/register")}
                        >
                          Join as Landlord
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {filteredProperties.map((property) => (
                  <div
                    key={property.id}
                    onClick={() => handlePropertyClick(property.id)}
                    className="cursor-pointer transform transition-all duration-300 hover:scale-105"
                  >
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}