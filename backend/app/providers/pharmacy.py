from __future__ import annotations

from xml.etree import ElementTree

PHARMACY_SOURCE = "국립중앙의료원_전국 약국 정보 조회 서비스"


def _text(item: ElementTree.Element, tag: str) -> str | None:
    value = item.findtext(tag)
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


def _float_or_none(value: str | None) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def _timestamp_or_none(value: str | None) -> str | None:
    if value is None or len(value) < 12:
        return None
    compact = value[:14].ljust(14, "0")
    if not compact.isdigit():
        return None
    return f"{compact[:4]}-{compact[4:6]}-{compact[6:8]}T{compact[8:10]}:{compact[10:12]}:{compact[12:14]}"


def _format_hhmm(value: str | None) -> str | None:
    if not value or len(value) != 4:
        return None
    return f"{value[:2]}:{value[2:]}"


def _today_hours(item: ElementTree.Element) -> str | None:
    start = _format_hhmm(_text(item, "dutyTime1s") or _text(item, "startTime"))
    close = _format_hhmm(_text(item, "dutyTime1c") or _text(item, "endTime"))
    if not start or not close:
        return None
    return f"{start}~{close}"


def parse_pharmacies_xml(xml_text: str) -> list[dict]:
    root = ElementTree.fromstring(xml_text)
    pharmacies: list[dict] = []
    for item in root.findall(".//item"):
        pharmacies.append(
            {
                "id": _text(item, "hpid") or "",
                "name": _text(item, "dutyName") or "",
                "address": _text(item, "dutyAddr") or "",
                "phone": _text(item, "dutyTel1"),
                "latitude": _float_or_none(_text(item, "wgs84Lat") or _text(item, "latitude")),
                "longitude": _float_or_none(_text(item, "wgs84Lon") or _text(item, "longitude")),
                "openStatus": "CALL_REQUIRED",
                "openStatusLabel": "전화 확인 필요",
                "todayHours": _today_hours(item),
                "source": PHARMACY_SOURCE,
                "updatedAt": _timestamp_or_none(_text(item, "hvidate")),
            }
        )
    return pharmacies
