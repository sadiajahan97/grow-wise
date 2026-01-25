# services.py
from concurrent.futures import ThreadPoolExecutor
from apps.organization.models import JobDescription, CareerPath
from apps.recommendations.fetchers.thumbnails import extract_og_thumbnail
from .llm import extract_learning_intents
from .fetchers.articles import ArticleFetcher
from .fetchers.videos import VideoFetcher
from .fetchers.courses import CourseFetcher
from .validators import is_valid_url
from .models import Recommendation

# Fetcher instances
article_fetcher = ArticleFetcher()
video_fetcher = VideoFetcher()
course_fetcher = CourseFetcher()

# BUSINESS RULES
ARTICLE_LIMIT = 15
VIDEO_LIMIT = 5
COURSE_LIMIT = 4

ARTICLE_PER_INTENT = 2
VIDEO_PER_INTENT = 2
COURSE_PER_INTENT = 2


def generate_recommendations(employee):
    # Build role context
    current_role = employee.designation
    career = CareerPath.objects.filter(from_designation=current_role).first()
    if not career:
        return []

    next_role = career.to_designation

    current_jd = JobDescription.objects.filter(
        designation=current_role, is_active=True
    ).latest("version")

    next_jd = JobDescription.objects.filter(
        designation=next_role, is_active=True
    ).latest("version")

    context = f"""
    Current Role: {current_role.name}
    {current_jd.job_description}

    Next Role: {next_role.name}
    {next_jd.job_description}
    """

    intents = extract_learning_intents(context)["learning_intents"]

    Recommendation.objects.filter(employee=employee).delete()

    final_recs = []
    article_count = 0
    video_count = 0
    course_count = 0

    with ThreadPoolExecutor(max_workers=6) as executor:
        for intent in intents:
            futures = [
                executor.submit(
                    article_fetcher.search,
                    intent["search_queries"]["article"],
                    ARTICLE_PER_INTENT,
                ),
                executor.submit(
                    video_fetcher.search,
                    intent["search_queries"]["video"],
                    VIDEO_PER_INTENT,
                ),
                executor.submit(
                    course_fetcher.search,
                    intent["search_queries"]["course"],
                    COURSE_PER_INTENT,
                ),
            ]

            for future in futures:
                for item in future.result():
                    if not is_valid_url(item["url"]):
                        continue

                    if item["type"] == "article":
                        if article_count >= ARTICLE_LIMIT:
                            continue
                        article_count += 1

                    elif item["type"] == "video":
                        if video_count >= VIDEO_LIMIT:
                            continue
                        video_count += 1

                    elif item["type"] == "course":
                        if course_count >= COURSE_LIMIT:
                            continue
                        course_count += 1
                        
                    # -----------------------
                    # Resolve thumbnail
                    # -----------------------
                    thumbnail_url = None

                    if item["type"] == "video":
                        # YouTube thumbnail already provided
                        thumbnail_url = item.get("thumbnail_url")
                    elif item["type"] in ("article", "course"):
                        # Try OpenGraph thumbnail
                        thumbnail_url = extract_og_thumbnail(item["url"])

                    # -----------------------
                    # Create recommendation object
                    # -----------------------


                    final_recs.append(
                        Recommendation(
                            employee=employee,
                            title=item["title"],
                            url=item["url"],
                            thumbnail_url=thumbnail_url,
                            content_type=item["type"],
                            reason=intent["reason"],
                        )
                    )

                    # Hard stop if all caps reached
                    if (
                        article_count >= ARTICLE_LIMIT
                        and video_count >= VIDEO_LIMIT
                        and course_count >= COURSE_LIMIT
                    ):
                        break

    Recommendation.objects.bulk_create(final_recs)
    return final_recs
