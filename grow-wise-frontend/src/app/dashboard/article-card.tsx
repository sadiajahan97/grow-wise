'use client';

interface ArticleCardProps {
  title: string;
  url: string;
  thumbnail_url: string;
}

export default function ArticleCard({
  title,
  url,
  thumbnail_url,
}: ArticleCardProps) {
  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Thumbnail Image */}
      <figure className="relative w-full aspect-video bg-linear-to-br from-primary/20 to-secondary/20">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          {thumbnail_url ? (
            <img
              src={thumbnail_url}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold text-primary-content opacity-50">
                {title.charAt(0)}
              </span>
            </div>
          )}
        </a>
      </figure>

      {/* Card Body with Title */}
      <div className="card-body p-4 sm:p-6">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer"
        >
          <h3 className="text-sm sm:text-base font-semibold text-base-content line-clamp-2 hover:text-primary transition-colors">
            {title}
          </h3>
        </a>
      </div>
    </div>
  );
}

