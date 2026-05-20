// "use client";

// import React, { useState } from "react";
// import { Button } from "../ui/button";
// import { ChevronDown, MessageSquare, Star, X } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import Image from "next/image";
// import { Product } from "@/lib/types/product.types";
// import { apiService } from "@/lib/services/apiService";

// interface ProductReviewProps {
//   product: Product;
// }
// const ProductReview = ({ product }: ProductReviewProps) => {
//   const [showAllReviews, setShowAllReviews] = useState(false);
//   const [showReviewForm, setShowReviewForm] = useState(false);
//   const [reviewRating, setReviewRating] = useState(0);
//   const [reviewComment, setReviewComment] = useState("");
//   const [hoveredStar, setHoveredStar] = useState(0);
//   const [reviews, setReviews] = useState(product.product_reviews || []);
//   const { user } = useAuth();

//   const handleSubmitReview = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!reviewRating || !reviewComment.trim()) return;

//     try {
//       const response = await apiService.post(
//         `/inventory/products/${product.id}/reviews/`,
//         { rating: reviewRating, comment: reviewComment }
//       );

//       // Update review list instantly
//       setReviews((prev) => [response, ...prev]);
//       setReviewRating(0);
//       setReviewComment("");
//       setShowReviewForm(false);
//     } catch (error) {
//       console.error("Error submitting review:", error);
//     }
//   };

//   const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

//   return (
//     <div className="mt-8 sm:mt-12 border-t border-border pt-6 sm:pt-8">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
//         <div>
//           <h2 className="text-xl sm:text-2xl font-bold">Customer Reviews</h2>
//           <p className="text-sm mt-1">
//             {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
//           </p>
//         </div>
//         {user && (
//           <Button onClick={() => setShowReviewForm(!showReviewForm)}>
//             <MessageSquare size={18} className="mr-2" />
//             Write a Review
//           </Button>
//         )}
//       </div>

//       {/* Review Form */}
//       {showReviewForm && (
//         <div className="bg-card p-4 rounded-lg mb-6 relative">
//           <button
//             onClick={() => setShowReviewForm(false)}
//             className="absolute top-3 right-3 p-1 hover:bg-background rounded-full transition-colors"
//           >
//             <X size={20} />
//           </button>

//           <h3 className="font-semibold text-lg mb-4">Write Your Review</h3>
//           <form onSubmit={handleSubmitReview} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">Rating</label>
//               <div className="flex gap-2">
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <button
//                     key={star}
//                     type="button"
//                     onClick={() => setReviewRating(star)}
//                     onMouseEnter={() => setHoveredStar(star)}
//                     onMouseLeave={() => setHoveredStar(0)}
//                     className="transition-transform hover:scale-110"
//                   >
//                     <Star
//                       size={32}
//                       className={
//                         star <= (hoveredStar || reviewRating)
//                           ? "fill-yellow-400 text-yellow-400"
//                           : "text-gray-300"
//                       }
//                     />
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Your Review
//               </label>
//               <textarea
//                 value={reviewComment}
//                 onChange={(e) => setReviewComment(e.target.value)}
//                 placeholder="Share your experience with this product..."
//                 className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 rows={4}
//                 required
//               />
//             </div>

//             <div className="flex gap-3">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => setShowReviewForm(false)}
//                 className=""
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" className="flex-1 ">
//                 Submit Review
//               </Button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Reviews List */}
//       <div className="space-y-4">
//         {displayedReviews.length > 0 ? (
//           <>
//             {displayedReviews.map((review: any) => (
//               <div key={review.id} className="bg-card p-4 sm:p-6 rounded-lg">
//                 <div className="flex items-start gap-3 sm:gap-4">
//                   <Image
//                     src={review.avatar || "/default_avatar.png"}
//                     width={48}
//                     height={48}
//                     alt="user avatar"
//                     className="rounded-full object-cover w-10 h-10 sm:w-12 sm:h-12"
//                   />
//                   <div className="flex-1 min-w-0">
//                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
//                       <div className="">
//                         <div className="flex font-semibold gap-1 text-sm sm:text-base">
//                           <p>{review.first_name}</p>
//                           <p>{review.last_name || "Anonymous"}</p>
//                         </div>
//                         <div className="flex items-center gap-2 mt-1">
//                           <div className="flex">
//                             {[...Array(5)].map((_, i) => (
//                               <Star
//                                 key={i}
//                                 size={14}
//                                 className={
//                                   i < Math.floor(review.rating)
//                                     ? "fill-yellow-400 text-yellow-400"
//                                     : "text-gray-300"
//                                 }
//                               />
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                       <span className="text-xs sm:text-sm text-secondary">
//                         {new Date(review.created_at).toLocaleDateString()}
//                       </span>
//                     </div>
//                     <p className="text-sm sm:text-base text-primary mt-2">
//                       {review.comment}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))}

//             {reviews.length > 3 && (
//               <Button
//                 variant="outline"
//                 onClick={() => setShowAllReviews(!showAllReviews)}
//                 className="w-full mt-4"
//               >
//                 {showAllReviews
//                   ? "Show Less"
//                   : `View All ${reviews.length} Reviews`}
//                 <ChevronDown
//                   size={18}
//                   className={`ml-2 transition-transform ${
//                     showAllReviews ? "rotate-180" : ""
//                   }`}
//                 />
//               </Button>
//             )}
//           </>
//         ) : (
//           <div className="text-center py-8 text-primary">
//             <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
//             <p>No reviews yet. Be the first to review this product!</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductReview;

import React from "react";

const ProductReviews = () => {
  return <div>ProductReviews</div>;
};

export default ProductReviews;
