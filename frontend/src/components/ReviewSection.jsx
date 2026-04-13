import { useState } from "react";
import { api } from "../services/api";
import { useAuthStore } from "../stores/authStore";

export function ReviewSection({ propertyId, reviews = [], averageRating = 0, reviewCount = 0, onReviewAdded }) {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.createReview({
        listingId: propertyId,
        rating,
        comment,
      });
      setShowForm(false);
      setComment("");
      setRating(5);
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value, interactive = false, onChange = null) => {
    return (
      <div className="d-flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "span"}
            className={`btn btn-sm p-0 ${interactive ? "btn-link" : ""}`}
            onClick={() => interactive && onChange && onChange(star)}
            disabled={!interactive}
            style={{ color: star <= value ? "#f59e0b" : "#d1d5db" }}
          >
            <span style={{ fontSize: interactive ? "1.5rem" : "1rem" }}>★</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Reviews & Ratings</h4>
          <div className="d-flex align-items-center gap-2">
            <span className="fs-4 fw-bold text-warning">{Number(averageRating).toFixed(1)}</span>
            {renderStars(Math.round(averageRating))}
            <span className="text-muted">({reviewCount} reviews)</span>
          </div>
        </div>
        {user && !showForm && (
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowForm(true)}
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="card mb-4 p-3">
          <h5 className="fw-bold mb-3">Write Your Review</h5>
          {error && (
            <div className="alert alert-danger py-2">{error}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Rating</label>
              <div>
                {renderStars(rating, true, setRating)}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Your Review</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Share your experience with this property..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                minLength={10}
                maxLength={500}
              />
              <small className="text-muted">{comment.length}/500 characters</small>
            </div>
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  "Submit Review"
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {reviews.map((review) => (
            <div key={review.id} className="card p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <strong>{review.user?.name || "Anonymous"}</strong>
                  <div className="small text-muted">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  {renderStars(review.rating)}
                </div>
              </div>
              <p className="mb-0">{review.comment}</p>
              {review.verified && (
                <span className="badge bg-success mt-2">✓ Verified Stay</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
