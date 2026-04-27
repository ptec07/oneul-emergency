from datetime import time

from app.services.open_status import pharmacy_open_status


def test_pharmacy_is_open_during_same_day_hours():
    assert pharmacy_open_status("09:00~22:00", time(21, 0)) == ("OPEN", "현재 운영 중")


def test_pharmacy_is_closed_after_same_day_hours():
    assert pharmacy_open_status("09:00~22:00", time(23, 0)) == ("CLOSED", "운영 종료")


def test_pharmacy_is_open_after_midnight_for_cross_midnight_hours():
    assert pharmacy_open_status("20:00~02:00", time(1, 0)) == ("OPEN", "현재 운영 중")


def test_pharmacy_requires_call_when_hours_missing():
    assert pharmacy_open_status(None, time(12, 0)) == ("CALL_REQUIRED", "전화 확인 필요")
