import httpx

from app.providers.public_data_client import fetch_emergency_rooms_xml, fetch_pharmacies_xml


def test_fetch_emergency_rooms_xml_calls_public_data_endpoint_with_coordinates():
    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        return httpx.Response(200, text="<response><body><items /></body></response>")

    client = httpx.Client(transport=httpx.MockTransport(handler))

    xml_text = fetch_emergency_rooms_xml(client, service_key="test-key", lat=37.5665, lng=126.978, num_rows=20)

    assert xml_text.startswith("<response>")
    assert len(requests) == 1
    request = requests[0]
    assert request.url.path.endswith("/B552657/ErmctInfoInqireService/getEgytListInfoInqire")
    assert request.url.params["serviceKey"] == "test-key"
    assert request.url.params["WGS84_LAT"] == "37.5665"
    assert request.url.params["WGS84_LON"] == "126.978"
    assert request.url.params["numOfRows"] == "20"


def test_fetch_pharmacies_xml_calls_public_data_endpoint_with_coordinates():
    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        return httpx.Response(200, text="<response><body><items /></body></response>")

    client = httpx.Client(transport=httpx.MockTransport(handler))

    xml_text = fetch_pharmacies_xml(client, service_key="test-key", lat=37.4979, lng=127.0276, num_rows=30)

    assert xml_text.startswith("<response>")
    assert len(requests) == 1
    request = requests[0]
    assert request.url.path.endswith("/B552657/ErmctInsttInfoInqireService/getParmacyListInfoInqire")
    assert request.url.params["serviceKey"] == "test-key"
    assert request.url.params["WGS84_LAT"] == "37.4979"
    assert request.url.params["WGS84_LON"] == "127.0276"
    assert request.url.params["numOfRows"] == "30"


def test_public_data_client_raises_for_upstream_failure():
    client = httpx.Client(transport=httpx.MockTransport(lambda _request: httpx.Response(503, text="busy")))

    try:
        fetch_emergency_rooms_xml(client, service_key="test-key", lat=37.5665, lng=126.978)
    except httpx.HTTPStatusError as exc:
        assert exc.response.status_code == 503
    else:
        raise AssertionError("expected HTTPStatusError")
