from app.core.settings import Settings


def test_settings_reads_public_data_service_key():
    settings = Settings(public_data_service_key="test-key")

    assert settings.public_data_service_key == "test-key"


def test_settings_reads_global_public_data_service_key_alias(monkeypatch):
    monkeypatch.setenv("PUBLIC_DATA_SERVICE_KEY", "global-test-key")

    settings = Settings(_env_file=None)

    assert settings.public_data_service_key == "global-test-key"


def test_settings_prefers_today_emergency_key_over_generic_key(tmp_path):
    shared_env = tmp_path / "shared.env"
    project_env = tmp_path / "project.env"
    shared_env.write_text("PUBLIC_DATA_SERVICE_KEY=generic-key\n")
    project_env.write_text("ONEUL_EMERGENCY_PUBLIC_DATA_SERVICE_KEY=today-key\n")

    settings = Settings(_env_file=(shared_env, project_env))

    assert settings.public_data_service_key == "today-key"


def test_settings_reads_frontend_origin_for_cors(monkeypatch):
    monkeypatch.setenv("ONEUL_EMERGENCY_FRONTEND_ORIGIN", "https://oneul-emergency.vercel.app")

    settings = Settings()

    assert settings.frontend_origin == "https://oneul-emergency.vercel.app"


def test_settings_has_safe_default_app_name():
    settings = Settings(public_data_service_key="test-key")

    assert settings.app_name == "오늘응급 API"
