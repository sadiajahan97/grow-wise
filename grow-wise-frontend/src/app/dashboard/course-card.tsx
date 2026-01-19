'use client';

interface CourseCardProps {
  imageUrl?: string;
  provider: string;
  title: string;
  skills: string[];
  rating: number;
  reviewCount: number;
  level: string;
  type: string;
  duration: string;
}

export default function CourseCard({
  imageUrl,
  provider,
  title,
  skills,
  rating,
  reviewCount,
  level,
  type,
  duration,
}: CourseCardProps) {
  return (
    <div className="card bg-base-100 shadow-xl border border-white overflow-hidden hover:shadow-2xl hover:translate-y-2 transition-all duration-300 cursor-pointer">
      {/* Image Section with Overlays */}
      <figure className="relative h-48 sm:h-56 bg-linear-to-br from-primary/20 to-secondary/20">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-4xl sm:text-5xl font-bold text-primary-content opacity-50">
              {title.charAt(0)}
            </span>
          </div>
        )}
      </figure>

      {/* Card Body */}
      <div className="card-body p-4 sm:p-6">
        {/* Provider and Title */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white text-xs sm:text-sm font-bold">
                {provider.charAt(0)}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-medium text-base-content/70">{provider}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-base-content line-clamp-2">
            {title}
          </h3>
        </div>

        {/* Skills Section */}
        <div className="mb-3">
          <p className="text-xs sm:text-sm font-medium text-base-content/70 mb-1.5">
            Skills you&apos;ll gain:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="badge badge-outline badge-sm text-xs"
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="badge badge-outline badge-sm text-xs">
                +{skills.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4 text-warning"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-base-content">{rating}</span>
          </div>
          <span className="text-xs sm:text-sm text-base-content/70">
            {reviewCount.toLocaleString()} reviews
          </span>
        </div>

        {/* Course Details */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
          <span>{level}</span>
          <span>·</span>
          <span>{type}</span>
          <span>·</span>
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
}

