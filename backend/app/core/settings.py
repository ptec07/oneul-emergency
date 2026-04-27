from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "오늘응급 API"
    public_data_service_key: str = ""
    generic_public_data_service_key: str = Field(default="", validation_alias="PUBLIC_DATA_SERVICE_KEY")
    frontend_origin: str = ""

    @model_validator(mode="after")
    def prefer_project_specific_public_data_key(self) -> "Settings":
        if not self.public_data_service_key:
            self.public_data_service_key = self.generic_public_data_service_key
        return self

    model_config = SettingsConfigDict(
        env_file=("/home/ptec07/.hermes/.env", ".env"),
        env_prefix="ONEUL_EMERGENCY_",
        extra="ignore",
        populate_by_name=True,
    )
