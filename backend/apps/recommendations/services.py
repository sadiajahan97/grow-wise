# services.py
from concurrent.futures import ThreadPoolExecutor
from apps.recommendations.fetchers.thumbnails import extract_og_thumbnail
from .fetchers.articles import ArticleFetcher
from .fetchers.videos import VideoFetcher
from .fetchers.courses import CourseFetcher
from .validators import is_valid_url
from .models import Recommendation
from .llm import generate_recommendation_reasons, suggest_agents

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
    # Build context from employee profession
    profession_name = employee.profession.name if employee.profession else "General"

    Recommendation.objects.filter(employee=employee).delete()

    final_recs = []
    article_count = 0
    video_count = 0
    course_count = 0

    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = [
            executor.submit(
                article_fetcher.search,
                profession_name,
                ARTICLE_LIMIT,
            ),
            executor.submit(
                video_fetcher.search,
                profession_name,
                VIDEO_LIMIT,
            ),
            executor.submit(
                course_fetcher.search,
                profession_name,
                COURSE_LIMIT,
            ),
            executor.submit(
                suggest_agents,
                profession_name,
            ),
        ]

        # Separate futures for fetchers and suggest_agents
        fetcher_futures = futures[:3]
        agents_future = futures[3]

        # Process fetcher results
        for future in fetcher_futures:
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
                        reason="",
                    )
                )

                # Hard stop if all caps reached
                if (
                    article_count >= ARTICLE_LIMIT
                    and video_count >= VIDEO_LIMIT
                    and course_count >= COURSE_LIMIT
                ):
                    break

        # Retrieve agents suggestion result (runs in parallel with fetchers)
        try:
            suggested_agents = agents_future.result()
            # Store agents result if needed (currently not used in recommendations)
            # suggested_agents contains list of dicts with 'name' and 'system_prompt'
        except Exception as e:
            # If suggest_agents fails, continue without it
            suggested_agents = []

    # Generate summary explanation for all recommendations
    if final_recs:
        summary = generate_recommendation_reasons(final_recs, profession_name)
        # Set the same summary as reason for all recommendations
        for rec in final_recs:
            rec.reason = summary

    Recommendation.objects.bulk_create(final_recs)
    return {
        "recommendations": final_recs,
        "suggested_agents": suggested_agents
    }
