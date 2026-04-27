from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "오늘응급 API"
    public_data_service_key: str = Field(
        default="",
        validation_alias=AliasChoices("ONEUL_EMERGENCY_PUBLIC_DATA_SERVICE_KEY", "PUBLIC_DATA_SERVICE_KEY"),
    )
    frontend_origin: str = ""

    model_config = SettingsConfigDict(
        env_file=("/home/ptec07/.hermes/.env", ".env"),
        env_prefix="ONEUL_EMERGENCY_",
        extra="ignore",
        populate_by_name=True,
    )
