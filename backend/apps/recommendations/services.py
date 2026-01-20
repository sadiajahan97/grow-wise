# import json
# from apps.organization.models import JobDescription, CareerPath
# from .models import Recommendation
# from .llm import call_llm

# def build_prompt(current_role, current_jd, next_role, next_jd):
#     return f"""
# Current Role: {current_role.name}
# Job Description:
# {current_jd.job_description}

# Next Role: {next_role.name}
# Job Description:
# {next_jd.job_description}

# Tasks:
# 1. Identify responsibility gaps
# 2. Identify international-standard skills
# 3. Recommend learning resources

# Return STRICT JSON:
# {{
#   "recommendations": [
#     {{
#       "title": "...",
#       "type": "article | video | course",
#       "url": "...",
#       "reason": "..."
#     }}
#   ]
# }}
# """

# def generate_recommendations(employee):
#     current_role = employee.designation

#     career = CareerPath.objects.filter(
#         from_designation=current_role
#     ).first()

#     if not career:
#         return []

#     next_role = career.to_designation

#     current_jd = JobDescription.objects.filter(
#         designation=current_role, is_active=True
#     ).latest("version")

#     next_jd = JobDescription.objects.filter(
#         designation=next_role, is_active=True
#     ).latest("version")

#     prompt = build_prompt(current_role, current_jd, next_role, next_jd)
#     data = json.loads(call_llm(prompt))

#     Recommendation.objects.filter(employee=employee).delete()

#     recs = []
#     for r in data["recommendations"]:
#         recs.append(
#             Recommendation(
#                 employee=employee,
#                 title=r["title"],
#                 url=r["url"],
#                 content_type=r["type"],
#                 reason=r["reason"]
#             )
#         )

#     Recommendation.objects.bulk_create(recs)
#     return recs



from concurrent.futures import ThreadPoolExecutor
from apps.organization.models import JobDescription, CareerPath
from .llm import extract_learning_intents
from .fetchers.articles import ArticleFetcher
from .fetchers.videos import VideoFetcher
from .fetchers.courses import CourseFetcher
from .validators import is_valid_url
from .models import Recommendation

article_fetcher = ArticleFetcher()
video_fetcher = VideoFetcher()
course_fetcher = CourseFetcher()

def generate_recommendations(employee):
    # --- Build context ---
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

    # check intents
    print("Extracted Learning Intents:\n", intents)
    
    Recommendation.objects.filter(employee=employee).delete()
    final_recs = []

    with ThreadPoolExecutor(max_workers=6) as executor:
        for intent in intents:
            futures = [
                executor.submit(article_fetcher.search, intent["search_queries"]["article"]),
                executor.submit(video_fetcher.search, intent["search_queries"]["video"]),
                executor.submit(course_fetcher.search, intent["search_queries"]["course"]),
            ]

            for future in futures:
                for item in future.result():
                    if is_valid_url(item["url"]):
                        final_recs.append(
                            Recommendation(
                                employee=employee,
                                title=item["title"],
                                url=item["url"],
                                content_type=item["type"],
                                reason=intent["reason"]
                            )
                        )

    Recommendation.objects.bulk_create(final_recs)
    return final_recs
