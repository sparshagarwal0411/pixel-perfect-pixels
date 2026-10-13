"""Sync publicly listed Delhi events from Unstop into Supabase.

This intentionally uses public HTML pages only. It does not authenticate,
call private APIs, bypass bot protection, or scrape registration pages.
Run periodically from a trusted scheduler, never from the browser.
"""

from __future__ import annotations

import hashlib
import os
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from dateutil import parser as date_parser

def load_local_env() -> None:
    """Load simple KEY=VALUE entries from the project-root .env if present."""
    env_file = Path(__file__).resolve().parents[1] / ".env"
    if not env_file.is_file():
        return

    for raw_line in env_file.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


load_local_env()

SOURCE_URL = os.getenv("UNSTOP_LISTINGS_URL", "https://unstop.com/competitions")
API_URL = os.getenv(
    "UNSTOP_API_URL",
    "https://unstop.com/api/public/opportunity/search-result",
)
MAX_API_PAGES = int(os.getenv("UNSTOP_MAX_API_PAGES", "3"))
API_PAGE_SIZE = min(int(os.getenv("UNSTOP_API_PAGE_SIZE", "100")), 100)
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
USER_AGENT = os.getenv(
    "UNSTOP_USER_AGENT",
    "AvsarMarg event indexer/1.0 (+https://github.com/sparshagarwal0411/pixel-perfect-pixels)",
)

# Only events with a known campus are published because the map needs a
# trustworthy coordinate. Add a campus here after verifying its location.
CAMPUS_ALIASES = {
    "iit delhi": "iitd",
    "iitd": "iitd",
    "dtu": "dtu",
    "delhi technological university": "dtu",
    "nsut": "nsut",
    "netaji subhas": "nsut",
    "iiit delhi": "iiitd",
    "iiitd": "iiitd",
    "jamia": "jmi",
    "jmi": "jmi",
    "university of delhi": "du",
    "delhi university": "du",
    "new delhi": "du",
    "delhi": "du",
    "gurugram": "amity",
    "gurgaon": "amity",
    "noida": "amity",
    "amity noida": "amity",
    "bpit": "bpit",
    "bvcoe": "bpit",
}


def require_environment() -> None:
    missing = [
        name
        for name, value in (
            ("SUPABASE_URL", SUPABASE_URL),
            ("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_ROLE_KEY),
        )
        if not value
    ]
    if missing:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")


def parse_date(value: str | None, fallback_days: int = 30) -> str:
    if value:
        try:
            parsed = date_parser.parse(value, dayfirst=True)
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return parsed.astimezone(timezone.utc).isoformat()
        except (ValueError, OverflowError):
            pass
    return (datetime.now(timezone.utc) + timedelta(days=fallback_days)).isoformat()


def find_college(text: str) -> str | None:
    normalized = re.sub(r"\s+", " ", text.lower())
    for alias, college_id in sorted(CAMPUS_ALIASES.items(), key=lambda item: -len(item[0])):
        if alias in normalized:
            return college_id
    return None


def first_date(text: str) -> str | None:
    """Extract the first human-readable event date from an HTML description."""
    plain_text = BeautifulSoup(text, "html.parser").get_text(" ", strip=True)
    match = re.search(
        r"\b\d{1,2}(?:st|nd|rd|th)?\s+"
        r"(?:January|February|March|April|May|June|July|August|September|October|"
        r"November|December)\s+\d{4}\b",
        plain_text,
        re.IGNORECASE,
    )
    return match.group(0) if match else None


def category_for(title: str, raw: str) -> str:
    text = f"{title} {raw}".lower()
    if "hackathon" in text:
        return "Hackathon"
    if "workshop" in text:
        return "Workshop"
    if "conference" in text or "summit" in text:
        return "Conference"
    if "fest" in text or "festival" in text:
        return "Fest"
    return "Competition"


def make_event(item: dict[str, Any]) -> dict[str, Any] | None:
    title = str(item.get("title") or "").strip()
    public_url = str(item.get("public_url") or "").strip()
    source_url = urljoin("https://unstop.com/", public_url)
    description_html = str(item.get("details") or "")
    description = BeautifulSoup(description_html, "html.parser").get_text(" ", strip=True)
    address = item.get("address_with_country_logo") or {}
    if not isinstance(address, dict):
        address = {}
    organisation = item.get("organisation") or {}
    if not isinstance(organisation, dict):
        organisation = {}
    location_text = " ".join(
        str(value)
        for value in (
            address.get("address"),
            address.get("city"),
            address.get("state"),
            organisation.get("name"),
            item.get("locations"),
        )
        if value
    )
    college_id = find_college(f"{title} {description} {location_text}")
    if not title or not public_url or not college_id:
        return None

    event_date = first_date(description)
    start_at = parse_date(event_date or str(item.get("end_date") or ""))
    end_at = parse_date(event_date or str(item.get("end_date") or ""), fallback_days=31)
    deadline_at = parse_date(str(item.get("end_date") or ""), fallback_days=14)
    digest = hashlib.sha256(source_url.encode("utf-8")).hexdigest()[:16]
    return {
        "id": f"unstop_{digest}",
        "source": "unstop",
        "source_url": source_url,
        "title": title,
        "category": category_for(title, description),
        "college_id": college_id,
        "organizer": str(organisation.get("name") or "Unstop organizer"),
        "start_at": start_at,
        "end_at": end_at,
        "deadline_at": deadline_at,
        "fee": 0,
        "eligibility": "See event page for eligibility",
        "tags": [],
        "description": description[:2000],
        "quality": 0,
        "reviews": [],
        "prize": None,
    }


def collect_events() -> list[dict[str, Any]]:
    """Fetch current public opportunities from Unstop's structured endpoint."""
    events: list[dict[str, Any]] = []
    skipped = 0
    for opportunity in ("hackathons", "competitions"):
        for page in range(1, MAX_API_PAGES + 1):
            response = requests.get(
                API_URL,
                params={
                    "opportunity": opportunity,
                    "oppstatus": "open",
                    "page": page,
                    "per_page": API_PAGE_SIZE,
                },
                headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
                timeout=30,
            )
            response.raise_for_status()
            payload = response.json()
            page_data = payload.get("data", {})
            records = page_data.get("data", []) if isinstance(page_data, dict) else []
            if not records:
                break
            for record in records:
                event = make_event(record)
                if event:
                    events.append(event)
                else:
                    skipped += 1
            if page >= int(page_data.get("last_page", page)):
                break

    print(f"Fetched {len(events) + skipped} public opportunities; skipped {skipped} without a Delhi/NCR location.")
    return list({event["source_url"]: event for event in events}.values())


def upsert_events(events: list[dict[str, Any]]) -> None:
    endpoint = f"{SUPABASE_URL}/rest/v1/events?on_conflict=source_url"
    response = requests.post(
        endpoint,
        headers={
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
        json=events,
        timeout=30,
    )
    response.raise_for_status()


def main() -> int:
    require_environment()
    events = collect_events()
    if not events:
        print("No Delhi/NCR events were found in the public Unstop API response.", file=sys.stderr)
        return 1
    upsert_events(events)
    print(f"Synced {len(events)} Unstop events to Supabase.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
