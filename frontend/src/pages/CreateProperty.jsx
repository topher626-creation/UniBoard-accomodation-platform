import { useState, useEffect } from "react";
import { Input, Button, Textarea, Select, SelectItem, Card, CardBody, Checkbox } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../lib/api.ts";
import { useAuthStore } from "../stores/authStore.ts";

export default function CreateProperty() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const [compounds, setCompounds] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [selectedCompound, setSelectedCompound] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    price: "",
    phone: "",
    whatsapp: "",
    room_type: "single",
    total_beds: 1,
    features: [],
    images: []
  });

  const availableFeatures = ["water", "electricity", "wifi", "security", "kitchen", "toilet"];

  useEffect(() => {
    checkAuth();
    fetchCompounds();
  }, []);

  useEffect(() => {
    if (selectedCompound) {
      fetchBuildings(selectedCompound);
    }
  }, [selectedCompound]);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      navigate("/login");
      return;
    }

    if (user.role !== "landlord" && user.role !== "admin") {
      setError("Only landlords can create properties");
      return;
    }
  };

  const fetchCompounds = async () => {
    try {
      const response = await apiClient.get("/compounds");
      setCompounds(response);
    } catch (error) {
      console.error("Error fetching compounds:", error);
    }
  };

  const fetchBuildings = async (compoundId) => {
    try {
      const response = await apiClient.get(`/buildings/compound/${compoundId}`);
      setBuildings(response);
    } catch (error) {
      console.error("Error fetching buildings:", error);
    }
  };

  const handleFeatureChange = (feature, checked) => {
    setFormData(prev => ({
      ...prev,
      features: checked
        ? [...prev.features, feature]
        : prev.features.filter(f => f !== feature)
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const currentImageCount = formData.images.length;
    const newImageCount = files.length;

    if (currentImageCount + newImageCount > 8) {
      setError("Maximum 8 images allowed per property");
      return;
    }

    try {
      setUploadingImages(true);
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const body = new FormData();
          body.append("image", file);

          const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/upload`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body
          });

          if (!response.ok) {
            throw new Error("Failed to upload one or more images");
          }

          const data = await response.json();
          return data.url;
        })
      );

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (uploadError) {
      setError(uploadError?.message || "Image upload failed");
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const propertyData = {
        ...formData,
        building_id: selectedBuilding,
        price: parseFloat(formData.price),
        total_beds: parseInt(formData.total_beds)
      };

      await apiClient.post("/properties", propertyData);

      setSuccess("Property created successfully!");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Error creating property");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Property</h1>
          <p className="text-gray-600 mt-2">Add a new property to your portfolio</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <Card>
                <CardBody>
                  <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

                  <div className="space-y-4">
                    <Input
                      label="Property Name"
                      placeholder="e.g., Room 101"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />

                    <Textarea
                      label="Description"
                      placeholder="Describe the property..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />

                    <Input
                      label="Location"
                      placeholder="e.g., Near University"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      required
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        label="Price (K/month)"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        required
                      />

                      <Input
                        type="number"
                        label="Total Beds"
                        value={formData.total_beds}
                        onChange={(e) => setFormData(prev => ({ ...prev, total_beds: e.target.value }))}
                        min="1"
                        required
                      />
                    </div>

                    <Select
                      label="Room Type"
                      value={formData.room_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, room_type: e.target.value }))}
                    >
                      <SelectItem value="single">Single Room</SelectItem>
                      <SelectItem value="bedsitter">Bedsitter</SelectItem>
                      <SelectItem value="self-contained">Self-contained</SelectItem>
                    </Select>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

                  <div className="space-y-4">
                    <Input
                      label="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />

                    <Input
                      label="WhatsApp Number"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      required
                    />
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Card>
                <CardBody>
                  <h2 className="text-xl font-semibold mb-4">Compound & Building</h2>

                  <div className="space-y-4">
                    <Select
                      label="Select Compound"
                      value={selectedCompound}
                      onChange={(e) => {
                        setSelectedCompound(e.target.value);
                        setSelectedBuilding("");
                      }}
                    >
                      {compounds.map(compound => (
                        <SelectItem key={compound.id} value={compound.id}>
                          {compound.name}
                        </SelectItem>
                      ))}
                    </Select>

                    {selectedCompound && (
                      <Select
                        label="Select Building"
                        value={selectedBuilding}
                        onChange={(e) => setSelectedBuilding(e.target.value)}
                      >
                        {buildings.map(building => (
                          <SelectItem key={building.id} value={building.id}>
                            {building.name}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h2 className="text-xl font-semibold mb-4">Features</h2>

                  <div className="grid grid-cols-2 gap-3">
                    {availableFeatures.map(feature => (
                      <Checkbox
                        key={feature}
                        isSelected={formData.features.includes(feature)}
                        onChange={(checked) => handleFeatureChange(feature, checked)}
                      >
                        {feature.charAt(0).toUpperCase() + feature.slice(1)}
                      </Checkbox>
                    ))}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h2 className="text-xl font-semibold mb-4">Images</h2>

                  <div className="space-y-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full"
                      disabled={formData.images.length >= 8 || uploadingImages}
                    />
                    <p className="text-sm text-gray-600">
                      Upload up to 8 images ({formData.images.length}/8 selected)
                    </p>
                    {uploadingImages && <p className="text-sm text-blue-600">Uploading images...</p>}

                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-20 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== index)
                                }));
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 flex justify-end gap-4">
            <Button
              type="button"
              variant="bordered"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              isLoading={loading}
            >
              Create Property
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600">{success}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}