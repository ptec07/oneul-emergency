from app.core.settings import Settings


def test_settings_reads_public_data_service_key():
    settings = Settings(public_data_service_key="test-key")

    assert settings.public_data_service_key == "test-key"


def test_settings_reads_global_public_data_service_key_alias(monkeypatch):
    monkeypatch.setenv("PUBLIC_DATA_SERVICE_KEY", "global-test-key")

    settings = Settings()

    assert settings.public_data_service_key == "global-test-key"


def test_settings_reads_frontend_origin_for_cors(monkeypatch):
    monkeypatch.setenv("ONEUL_EMERGENCY_FRONTEND_ORIGIN", "https://oneul-emergency.vercel.app")

    settings = Settings()

    assert settings.frontend_origin == "https://oneul-emergency.vercel.app"


def test_settings_has_safe_default_app_name():
    settings = Settings(public_data_service_key="test-key")

    assert settings.app_name == "오늘응급 API"
