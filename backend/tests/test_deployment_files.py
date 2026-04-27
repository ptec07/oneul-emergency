from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = PROJECT_ROOT / "backend"


def test_render_and_docker_deployment_files_exist_and_point_to_fastapi_app():
    dockerfile = BACKEND_ROOT / "Dockerfile"
    procfile = BACKEND_ROOT / "Procfile"
    backend_render = BACKEND_ROOT / "render.yaml"
    root_render = PROJECT_ROOT / "render.yaml"

    assert dockerfile.exists()
    assert procfile.exists()
    assert backend_render.exists()
    assert root_render.exists()

    dockerfile_content = dockerfile.read_text(encoding="utf-8")
    assert "uvicorn app.main:app" in dockerfile_content
    assert "COPY tests/fixtures ./tests/fixtures" in dockerfile_content
    assert "uvicorn app.main:app" in procfile.read_text(encoding="utf-8")
    assert "healthCheckPath: /api/health" in backend_render.read_text(encoding="utf-8")
    assert "dockerfilePath: ./backend/Dockerfile" in root_render.read_text(encoding="utf-8")


def test_backend_env_example_documents_deployment_variables():
    env_example = (BACKEND_ROOT / ".env.example").read_text(encoding="utf-8")

    assert "ONEUL_EMERGENCY_PUBLIC_DATA_SERVICE_KEY" in env_example
    assert "ONEUL_EMERGENCY_FRONTEND_ORIGIN" in env_example
    assert "PORT" in env_example
