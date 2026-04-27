from pathlib import Path

from app.providers.emergency import parse_emergency_rooms_xml


def test_parse_emergency_rooms_xml_normalizes_public_data_fields():
    xml_text = Path("tests/fixtures/emergency_rooms_sample.xml").read_text()

    rooms = parse_emergency_rooms_xml(xml_text)

    assert rooms == [
        {
            "id": "A1100010",
            "name": "서울OO병원",
            "category": "권역응급의료센터",
            "address": "서울특별시 중구 세종대로 1",
            "phone": "02-0000-0000",
            "emergencyPhone": "02-0000-0001",
            "latitude": 37.5665,
            "longitude": 126.978,
            "status": "CALL_REQUIRED",
            "statusLabel": "전화 확인 필요",
            "availableBeds": None,
            "source": "국립중앙의료원_전국 응급의료기관 정보 조회 서비스",
            "updatedAt": None,
        }
    ]


def test_parse_emergency_rooms_xml_handles_optional_live_status_fields():
    xml_text = """
    <response><body><items><item>
      <hpid>A1100020</hpid>
      <dutyName>서울응급센터</dutyName>
      <dutyAddr>서울특별시 강남구 테헤란로 1</dutyAddr>
      <dutyTel1>02-2222-3333</dutyTel1>
      <dutyTel3>02-2222-4444</dutyTel3>
      <wgs84Lat>37.4979</wgs84Lat>
      <wgs84Lon>127.0276</wgs84Lon>
      <hvec>3</hvec>
      <hvidate>20260427093000</hvidate>
    </item></items></body></response>
    """

    rooms = parse_emergency_rooms_xml(xml_text)

    assert rooms[0]["status"] == "CALL_REQUIRED"
    assert rooms[0]["statusLabel"] == "전화 확인 필요"
    assert rooms[0]["availableBeds"] == 3
    assert rooms[0]["updatedAt"] == "2026-04-27T09:30:00"


def test_parse_emergency_rooms_xml_does_not_crash_on_invalid_optional_numbers():
    xml_text = """
    <response><body><items><item>
      <hpid>A1100030</hpid>
      <dutyName>좌표확인병원</dutyName>
      <wgs84Lat></wgs84Lat>
      <wgs84Lon>not-a-number</wgs84Lon>
      <hvec>not-a-bed-count</hvec>
    </item></items></body></response>
    """

    rooms = parse_emergency_rooms_xml(xml_text)

    assert rooms[0]["latitude"] is None
    assert rooms[0]["longitude"] is None
    assert rooms[0]["availableBeds"] is None
