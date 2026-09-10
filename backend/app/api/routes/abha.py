from fastapi import APIRouter
from pydantic import BaseModel
import re

router = APIRouter(
    prefix="/api/abha",
    tags=["ABHA"]
)


class AbhaVerifyRequest(BaseModel):
    abhaId: str


class AbhaVerifyResponse(BaseModel):
    success: bool
    isSandbox: bool
    patientName: str | None = None
    error: str | None = None


def validate_abha_format(abha_id: str):
    cleaned = re.sub(r"[\s-]", "", abha_id)

    if re.fullmatch(r"\d{14}", cleaned):
        return True

    if re.fullmatch(r"[a-zA-Z0-9._]{4,}@(abdm|sbx)", abha_id.strip(), re.IGNORECASE):
        return True

    return False


@router.post("/verify", response_model=AbhaVerifyResponse)
def verify_abha(data: AbhaVerifyRequest):

    if not validate_abha_format(data.abhaId):
        return {
            "success": False,
            "isSandbox": True,
            "patientName": None,
            "error": (
                "Please enter a valid 14-digit ABHA Number "
                "(e.g. 91-4521-8890-3321) or ABHA Address "
                "(e.g. ananya@abdm)."
            )
        }

    # Sandbox verification for now.
    # Real ABDM integration will replace this section later.
    return {
        "success": True,
        "isSandbox": True,
        "patientName": "Ananya Sharma",
        "error": None
    }