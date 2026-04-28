from __future__ import annotations

from functools import lru_cache
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query

from .config import Settings, get_settings
from .llm import (
    HuggingFaceClient,
    MockRuleBasedClient,
    RecommendationContext,
    RecommendationResult,
    RecommendationService,
)
from .metrics import (
    DailyMetricSummary,
    MetricsIngestRequest,
    MetricsIngestResponse,
    MetricsRepository,
    MetricsService,
)
from .ml import build_facial_fatigue_pipeline, build_mock_scan_frames
from .ml.photo_scan import (
    PhotoScanAnalysisResponse,
    PhotoScanRequest,
    infer_scan_profile,
    map_facial_result_payload,
)
from .scoring import BurnoutScoreResult, NoScorableDataError, calculate_burnout_score


@lru_cache(maxsize=1)
def get_metrics_service() -> MetricsService:
    settings: Settings = get_settings()
    repository = MetricsRepository(settings.sqlite_db_path)
    return MetricsService(repository)


@lru_cache(maxsize=1)
def get_recommendation_service() -> RecommendationService:
    settings: Settings = get_settings()
    fallback_client = MockRuleBasedClient()

    if settings.llm_provider.lower() == "huggingface":
        primary_client = HuggingFaceClient(
            api_token=settings.hf_api_token,
            model=settings.llm_model,
            api_base_url=settings.hf_api_base_url,
            timeout_seconds=settings.llm_timeout_seconds,
        )
    else:
        primary_client = fallback_client

    return RecommendationService(primary_client=primary_client, fallback_client=fallback_client)


app = FastAPI(
    title=get_settings().app_name,
    version=get_settings().app_version,
)


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/metrics/ingest", response_model=MetricsIngestResponse)
def ingest_metrics(
    request: MetricsIngestRequest,
    service: MetricsService = Depends(get_metrics_service),
) -> MetricsIngestResponse:
    summaries = service.ingest_summaries(request.summaries)
    return MetricsIngestResponse(ingested_count=len(summaries), summaries=summaries)


@app.get("/metrics/daily-summaries", response_model=list[DailyMetricSummary])
def get_daily_summaries(
    worker_id: str = Query(min_length=1),
    start_date: str = Query(pattern=r"^\d{4}-\d{2}-\d{2}$"),
    end_date: str = Query(pattern=r"^\d{4}-\d{2}-\d{2}$"),
    service: MetricsService = Depends(get_metrics_service),
):
    return service.list_daily_summaries(worker_id=worker_id, start_date=start_date, end_date=end_date)


@app.get("/scoring/burnout", response_model=BurnoutScoreResult)
def get_burnout_score(
    worker_id: str = Query(min_length=1),
    start_date: str = Query(pattern=r"^\d{4}-\d{2}-\d{2}$"),
    end_date: str = Query(pattern=r"^\d{4}-\d{2}-\d{2}$"),
    facial_fatigue_score: Annotated[float | None, Query(ge=0, le=100)] = None,
    service: MetricsService = Depends(get_metrics_service),
) -> BurnoutScoreResult:
    summaries = service.list_daily_summaries(
        worker_id=worker_id,
        start_date=start_date,
        end_date=end_date,
    )
    try:
        return calculate_burnout_score(
            worker_id=worker_id,
            start_date=start_date,
            end_date=end_date,
            summaries=summaries,
            facial_fatigue_score=facial_fatigue_score,
        )
    except NoScorableDataError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@app.post("/ml/facial-fatigue/analyze-photo", response_model=PhotoScanAnalysisResponse)
def analyze_facial_fatigue_photo(
    request: PhotoScanRequest,
    service: MetricsService = Depends(get_metrics_service),
) -> PhotoScanAnalysisResponse:
    profile = request.profile_hint or infer_scan_profile(
        width=request.width,
        height=request.height,
        file_size_bytes=request.file_size_bytes,
    )
    facial_result = build_facial_fatigue_pipeline().analyze(build_mock_scan_frames(profile))
    facial_payload = map_facial_result_payload(facial_result)
    summaries = service.list_daily_summaries(
        worker_id=request.worker_id,
        start_date=request.start_date,
        end_date=request.end_date,
    )
    burnout_score = calculate_burnout_score(
        worker_id=request.worker_id,
        start_date=request.start_date,
        end_date=request.end_date,
        summaries=summaries,
        facial_fatigue_score=facial_payload.score,
    )

    return PhotoScanAnalysisResponse(
        profile_used=profile,
        facial_fatigue=facial_payload,
        burnout_score=burnout_score,
    )


@app.post("/recommendations/generate", response_model=RecommendationResult)
def generate_recommendations(
    context: RecommendationContext,
    service: RecommendationService = Depends(get_recommendation_service),
) -> RecommendationResult:
    return service.generate(context)
