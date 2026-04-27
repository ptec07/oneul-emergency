from __future__ import annotations

from datetime import time


def _parse_time(value: str) -> time:
    hour, minute = value.split(":", 1)
    return time(int(hour), int(minute))


def pharmacy_open_status(today_hours: str | None, current_time: time) -> tuple[str, str]:
    if not today_hours or "~" not in today_hours:
        return "CALL_REQUIRED", "전화 확인 필요"

    start_text, close_text = today_hours.split("~", 1)
    start = _parse_time(start_text)
    close = _parse_time(close_text)

    if start <= close:
        is_open = start <= current_time <= close
    else:
        is_open = current_time >= start or current_time <= close

    if is_open:
        return "OPEN", "현재 운영 중"
    return "CLOSED", "운영 종료"
