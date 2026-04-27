from __future__ import annotations

from xml.etree import ElementTree

EMERGENCY_SOURCE = "국립중앙의료원_전국 응급의료기관 정보 조회 서비스"


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


def _int_or_none(value: str | None) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except ValueError:
        return None


def _timestamp_or_none(value: str | None) -> str | None:
    if value is None or len(value) < 12:
        return None
    compact = value[:14].ljust(14, "0")
    if not compact.isdigit():
        return None
    return f"{compact[:4]}-{compact[4:6]}-{compact[6:8]}T{compact[8:10]}:{compact[10:12]}:{compact[12:14]}"


def parse_emergency_rooms_xml(xml_text: str) -> list[dict]:
    root = ElementTree.fromstring(xml_text)
    rooms: list[dict] = []
    for item in root.findall(".//item"):
        rooms.append(
            {
                "id": _text(item, "hpid") or _text(item, "phpid") or "",
                "name": _text(item, "dutyName") or "",
                "category": _text(item, "dutyEmclsName"),
                "address": _text(item, "dutyAddr") or "",
                "phone": _text(item, "dutyTel1"),
                "emergencyPhone": _text(item, "dutyTel3"),
                "latitude": _float_or_none(_text(item, "wgs84Lat")),
                "longitude": _float_or_none(_text(item, "wgs84Lon")),
                "status": "CALL_REQUIRED",
                "statusLabel": "전화 확인 필요",
                "availableBeds": _int_or_none(_text(item, "hvec")),
                "source": EMERGENCY_SOURCE,
                "updatedAt": _timestamp_or_none(_text(item, "hvidate")),
            }
        )
    return rooms
