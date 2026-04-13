import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardBody, Button, Textarea, Rating } from "@nextui-org/react";
import { apiClient } from "../lib/api";
import { createReviewSchema, CreateReviewFormData } from "../lib/validations";
import { useAuthStore } from "../stores/authStore";

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    name: string;
  };
}

interface ReviewSectionProps {
  propertyId: number;
}

export default function ReviewSection({ propertyId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateReviewFormData>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  const rating = watch("rating");

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/reviews/listing/${propertyId}`);
      setReviews(response.reviews);
      setAverageRating(response.averageRating);
      setTotalReviews(response.totalReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CreateReviewFormData) => {
    try {
      setSubmitting(true);
      await apiClient.post("/reviews", {
        listingId: propertyId,
        rating: data.rating,
        comment: data.comment,
      });
      reset();
      setShowForm(false);
      fetchReviews();
    } catch (error: any) {
      console.error("Error creating review:", error);
      alert(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{averageRating}</div>
                <div className="flex justify-center mb-1">{renderStars(Math.round(averageRating))}</div>
                <div className="text-sm text-gray-600">{totalReviews} reviews</div>
              </div>
            </div>

            {user && (
              <Button
                color="primary"
                onClick={() => setShowForm(!showForm)}
                disabled={submitting}
              >
                {showForm ? "Cancel" : "Write Review"}
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Review Form */}
      {showForm && user && (
        <Card>
          <CardBody>
            <h3 className="text-xl font-bold mb-4">Write a Review</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setValue("rating", star)}
                      className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {errors.rating && (
                  <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Comment</label>
                <Textarea
                  {...register("comment")}
                  placeholder="Share your experience with this property..."
                  minRows={3}
                  errorMessage={errors.comment?.message}
                  isInvalid={!!errors.comment}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  color="primary"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </Button>
                <Button
                  type="button"
                  variant="flat"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-center text-gray-600 py-8">
                No reviews yet. {user ? "Be the first to leave a review!" : "Login to leave a review."}
              </p>
            </CardBody>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {review.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{review.user.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex">{renderStars(review.rating)}</div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}