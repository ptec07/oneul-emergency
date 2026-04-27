from pathlib import Path

from app.providers.pharmacy import parse_pharmacies_xml


def test_parse_pharmacies_xml_normalizes_public_data_fields():
    xml_text = Path("tests/fixtures/pharmacies_sample.xml").read_text()

    pharmacies = parse_pharmacies_xml(xml_text)

    assert pharmacies == [
        {
            "id": "PHARM001",
            "name": "OO온누리약국",
            "address": "서울특별시 중구 세종대로 2",
            "phone": "02-1111-2222",
            "latitude": 37.5651,
            "longitude": 126.9895,
            "openStatus": "CALL_REQUIRED",
            "openStatusLabel": "전화 확인 필요",
            "todayHours": "09:00~22:00",
            "source": "국립중앙의료원_전국 약국 정보 조회 서비스",
            "updatedAt": None,
        }
    ]


def test_parse_pharmacies_xml_uses_weekday_hours_and_updated_at():
    xml_text = """
    <response><body><items><item>
      <hpid>PHARM002</hpid>
      <dutyName>강남심야약국</dutyName>
      <dutyAddr>서울특별시 강남구 테헤란로 2</dutyAddr>
      <dutyTel1>02-3333-4444</dutyTel1>
      <wgs84Lat>37.4979</wgs84Lat>
      <wgs84Lon>127.0276</wgs84Lon>
      <dutyTime1s>1800</dutyTime1s>
      <dutyTime1c>0130</dutyTime1c>
      <hvidate>20260427094500</hvidate>
    </item></items></body></response>
    """

    pharmacies = parse_pharmacies_xml(xml_text)

    assert pharmacies[0]["todayHours"] == "18:00~01:30"
    assert pharmacies[0]["updatedAt"] == "2026-04-27T09:45:00"


def test_parse_pharmacies_xml_does_not_crash_on_invalid_coordinates():
    xml_text = """
    <response><body><items><item>
      <hpid>PHARM003</hpid>
      <dutyName>좌표확인약국</dutyName>
      <wgs84Lat>invalid</wgs84Lat>
      <wgs84Lon></wgs84Lon>
    </item></items></body></response>
    """

    pharmacies = parse_pharmacies_xml(xml_text)

    assert pharmacies[0]["latitude"] is None
    assert pharmacies[0]["longitude"] is None
