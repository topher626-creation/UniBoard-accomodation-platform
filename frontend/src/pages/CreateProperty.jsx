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
  const [touched, setTouched] = useState({});
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
    occupied_beds: 0,
    features: [],
    images: []
  });

  const availableFeatures = ["water", "electricity", "wifi", "security", "kitchen", "toilet"];
  const totalBedsNum = Number(formData.total_beds);
  const occupiedBedsNum = Number(formData.occupied_beds);
  const hasBedValidationError =
    Number.isNaN(totalBedsNum) ||
    Number.isNaN(occupiedBedsNum) ||
    totalBedsNum < 1 ||
    occupiedBedsNum < 0 ||
    occupiedBedsNum > totalBedsNum;
  const isFormValid =
    Boolean(formData.name.trim()) &&
    Boolean(formData.description.trim()) &&
    Boolean(formData.location.trim()) &&
    Boolean(formData.price) &&
    Boolean(formData.phone.trim()) &&
    Boolean(formData.whatsapp.trim()) &&
    Boolean(selectedBuilding) &&
    !hasBedValidationError;
  const showFieldError = (fieldKey, condition) => touched[fieldKey] && condition;

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
    setTouched({
      name: true,
      description: true,
      location: true,
      price: true,
      phone: true,
      whatsapp: true,
      building: true,
      total_beds: true,
      occupied_beds: true
    });
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const totalBeds = parseInt(formData.total_beds, 10);
      const occupiedBeds = parseInt(formData.occupied_beds, 10);

      if (!selectedBuilding) {
        setError("Please select a building before creating a listing.");
        setLoading(false);
        return;
      }

      if (Number.isNaN(totalBeds) || totalBeds < 1) {
        setError("Total beds must be at least 1.");
        setLoading(false);
        return;
      }

      if (Number.isNaN(occupiedBeds) || occupiedBeds < 0 || occupiedBeds > totalBeds) {
        setError("Occupied beds must be between 0 and total beds.");
        setLoading(false);
        return;
      }

      const propertyData = {
        ...formData,
        building_id: selectedBuilding,
        price: parseFloat(formData.price),
        total_beds: totalBeds,
        occupied_beds: occupiedBeds
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
          <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
          <p className="text-gray-600 mt-2">Add a building-linked listing with availability and contact details</p>
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
                      onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                      isInvalid={showFieldError("name", !formData.name.trim())}
                      errorMessage={showFieldError("name", !formData.name.trim()) ? "Listing name is required." : undefined}
                      required
                    />

                    <Textarea
                      label="Description"
                      placeholder="Describe the property..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
                      isInvalid={showFieldError("description", !formData.description.trim())}
                      errorMessage={showFieldError("description", !formData.description.trim()) ? "Description is required." : undefined}
                      required
                    />

                    <Input
                      label="Location"
                      placeholder="e.g., Near University"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      onBlur={() => setTouched((prev) => ({ ...prev, location: true }))}
                      isInvalid={showFieldError("location", !formData.location.trim())}
                      errorMessage={showFieldError("location", !formData.location.trim()) ? "Location is required." : undefined}
                      required
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        label="Price (K/month)"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        onBlur={() => setTouched((prev) => ({ ...prev, price: true }))}
                        isInvalid={showFieldError("price", !formData.price || Number(formData.price) < 0)}
                        errorMessage={showFieldError("price", !formData.price || Number(formData.price) < 0) ? "Enter a valid price." : undefined}
                        required
                      />

                      <Input
                        type="number"
                        label="Total Beds"
                        value={formData.total_beds}
                        onChange={(e) => setFormData(prev => ({ ...prev, total_beds: e.target.value }))}
                        onBlur={() => setTouched((prev) => ({ ...prev, total_beds: true }))}
                        isInvalid={showFieldError("total_beds", Number.isNaN(totalBedsNum) || totalBedsNum < 1)}
                        errorMessage={showFieldError("total_beds", Number.isNaN(totalBedsNum) || totalBedsNum < 1) ? "Total beds must be at least 1." : undefined}
                        min="1"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1">
                      <Input
                        type="number"
                        label="Occupied Beds"
                        value={formData.occupied_beds}
                        onChange={(e) => setFormData(prev => ({ ...prev, occupied_beds: e.target.value }))}
                        onBlur={() => setTouched((prev) => ({ ...prev, occupied_beds: true }))}
                        isInvalid={showFieldError("occupied_beds", Number.isNaN(occupiedBedsNum) || occupiedBedsNum < 0 || occupiedBedsNum > totalBedsNum)}
                        errorMessage={showFieldError("occupied_beds", Number.isNaN(occupiedBedsNum) || occupiedBedsNum < 0 || occupiedBedsNum > totalBedsNum) ? "Occupied beds must be between 0 and total beds." : undefined}
                        min="0"
                        required
                      />
                      <p className={`text-xs mt-2 ${hasBedValidationError ? "text-red-600" : "text-gray-500"}`}>
                        {hasBedValidationError
                          ? "Occupied beds must be between 0 and total beds."
                          : `Available beds will be ${Math.max(totalBedsNum - occupiedBedsNum, 0)} based on this input.`}
                      </p>
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
                      onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                      isInvalid={showFieldError("phone", !formData.phone.trim())}
                      errorMessage={showFieldError("phone", !formData.phone.trim()) ? "Phone number is required." : undefined}
                      required
                    />

                    <Input
                      label="WhatsApp Number"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      onBlur={() => setTouched((prev) => ({ ...prev, whatsapp: true }))}
                      isInvalid={showFieldError("whatsapp", !formData.whatsapp.trim())}
                      errorMessage={showFieldError("whatsapp", !formData.whatsapp.trim()) ? "WhatsApp number is required." : undefined}
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
                      <>
                        <Select
                          label="Select Building"
                          value={selectedBuilding}
                          onChange={(e) => setSelectedBuilding(e.target.value)}
                          onBlur={() => setTouched((prev) => ({ ...prev, building: true }))}
                          isRequired
                        >
                          {buildings.map(building => (
                            <SelectItem key={building.id} value={building.id}>
                              {building.name}
                            </SelectItem>
                          ))}
                        </Select>
                        {showFieldError("building", !selectedBuilding) && (
                          <p className="text-xs text-red-600 mt-2">Please select a building.</p>
                        )}
                      </>
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
                      Upload up to 8 images ({formData.images.length}/8 uploaded)
                    </p>
                    {uploadingImages && <p className="text-sm text-blue-600">Uploading images...</p>}
                    <p className="text-xs text-gray-500">
                      JPG, PNG, or WEBP only. Maximum size 5MB each.
                    </p>

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
              isDisabled={!isFormValid || uploadingImages}
            >
              Create Listing
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