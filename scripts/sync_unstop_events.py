"""Sync publicly listed Delhi events from Unstop into Supabase.

This intentionally uses public HTML pages only. It does not authenticate,
call private APIs, bypass bot protection, or scrape registration pages.
Run periodically from a trusted scheduler, never from the browser.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import time
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from dateutil import parser as date_parser

SOURCE_URL = os.getenv("UNSTOP_LISTINGS_URL", "https://unstop.com/competitions")
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


def fetch_listing_page() -> str:
    response = requests.get(
        SOURCE_URL,
        headers={"User-Agent": USER_AGENT, "Accept": "text/html"},
        timeout=30,
    )
    response.raise_for_status()
    return response.text


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
    title = str(item.get("name") or item.get("headline") or "").strip()
    source_url = urljoin(SOURCE_URL, str(item.get("url") or "").strip())
    description = BeautifulSoup(str(item.get("description") or ""), "html.parser").get_text(" ", strip=True)
    location = item.get("location") or {}
    if isinstance(location, dict):
        location_text = " ".join(str(value) for value in location.values())
    else:
        location_text = str(location)
    college_id = find_college(f"{title} {description} {location_text}")
    if not title or not source_url or not college_id:
        return None

    start_at = parse_date(str(item.get("startDate") or ""))
    end_at = parse_date(str(item.get("endDate") or ""), fallback_days=31)
    deadline_at = parse_date(str(item.get("registrationDeadline") or item.get("endDate") or ""), fallback_days=14)
    digest = hashlib.sha256(source_url.encode("utf-8")).hexdigest()[:16]
    return {
        "id": f"unstop_{digest}",
        "source": "unstop",
        "source_url": source_url,
        "title": title,
        "category": category_for(title, description),
        "college_id": college_id,
        "organizer": str(item.get("organizer") or "Unstop organizer"),
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


def extract_json_ld(html: str) -> list[dict[str, Any]]:
    soup = BeautifulSoup(html, "html.parser")
    records: list[dict[str, Any]] = []
    for script in soup.select('script[type="application/ld+json"]'):
        try:
            payload = json.loads(script.string or script.get_text())
        except json.JSONDecodeError:
            continue
        values = payload if isinstance(payload, list) else [payload]
        for value in values:
            if not isinstance(value, dict):
                continue
            if value.get("@type") == "ItemList":
                records.extend(
                    entry.get("item", entry)
                    for entry in value.get("itemListElement", [])
                    if isinstance(entry, dict)
                )
            else:
                records.append(value)
    return records


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
    html = fetch_listing_page()
    events = [event for record in extract_json_ld(html) if (event := make_event(record))]
    if not events:
        print("No known-campus events were found in the public JSON-LD listing.", file=sys.stderr)
        return 1
    upsert_events(events)
    print(f"Synced {len(events)} Unstop events to Supabase.")
    time.sleep(1)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
