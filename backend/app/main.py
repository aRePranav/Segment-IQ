import os
import uuid

from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .database import init_db, insert_run, get_analytics, get_recent
from .segmentation_service import get_segmentation_service
from .core.segmentation import SegmentationError
from .schemas import (
    SegmentationResponse,
    SampleInfoResponse,
    AnalyticsResponse,
    HistoryItem,
)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="SegmentIQ AI API",
    description="Real-time customer segmentation — RFM + K-Means trained on the Online Retail dataset.",
    version="1.0.0",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = os.environ.get("SEGMENTIQ_ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()
    get_segmentation_service()  # warm the sample dataset into memory


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/sample-data", response_model=SampleInfoResponse)
def sample_data():
    service = get_segmentation_service()
    return SampleInfoResponse(
        dataset_name="Online Retail (UK e-commerce, Dec 2010 - Dec 2011)",
        customer_count=service.sample_customer_count(),
        description=(
            "~540,000 raw transactions from a UK-based online retailer, cleaned down to "
            f"{service.sample_customer_count():,} unique customers with valid purchase history."
        ),
        required_columns=["CustomerID", "InvoiceNo", "InvoiceDate", "Quantity", "UnitPrice"],
        preview_download_available=True,
    )


@app.get("/sample-data/template")
def sample_data_template():
    service = get_segmentation_service()
    path = service.sample_preview_path()
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Template not available.")
    return FileResponse(path, filename="segmentiq_upload_template.csv", media_type="text/csv")


@app.post("/segment", response_model=SegmentationResponse)
@limiter.limit("10/minute")
def segment(
    request: Request,
    file: UploadFile | None = File(None),
    use_sample: bool = Form(False),
):
    service = get_segmentation_service()
    run_id = str(uuid.uuid4())

    try:
        if use_sample or file is None:
            result, points, downsampled, dataset_name = service.run_sample()
            source = "sample"
        else:
            raw = file.file.read()
            if not raw:
                raise SegmentationError("Uploaded file is empty.")
            result, points, downsampled, dataset_name = service.run_upload(file.filename or "upload.csv", raw)
            source = "upload"
    except SegmentationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Couldn't process that file. Make sure it's a valid CSV with the required columns.",
        )

    segment_distribution = {p.segment: p.customer_count for p in result.profiles}
    insert_run(
        run_id=run_id,
        source=source,
        dataset_name=dataset_name,
        customer_count=result.customer_count,
        chosen_k=result.chosen_k,
        silhouette=result.silhouette,
        davies_bouldin=result.davies_bouldin,
        processing_seconds=result.processing_seconds,
        segment_distribution=segment_distribution,
    )

    return SegmentationResponse(
        run_id=run_id,
        source=source,
        dataset_name=dataset_name,
        customer_count=result.customer_count,
        chosen_k=result.chosen_k,
        optimal_k=result.optimal_k,
        silhouette=result.silhouette,
        davies_bouldin=result.davies_bouldin,
        n_iterations=result.n_iterations,
        processing_seconds=result.processing_seconds,
        profiles=[p.__dict__ for p in result.profiles],
        k_metrics=[m.__dict__ for m in result.k_metrics],
        points=points,
        points_downsampled=downsampled,
    )


@app.get("/analytics", response_model=AnalyticsResponse)
def analytics():
    return get_analytics()


@app.get("/history", response_model=list[HistoryItem])
def history(limit: int = 10):
    return get_recent(limit)
