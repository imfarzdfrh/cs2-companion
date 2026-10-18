from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./companion.db"
    faceit_api_key: str = ""
    steam_api_key: str = ""
    faceit_webhook_secret: str = ""
    app_base_url: str = "http://localhost:8000"
    mobile_url: str = "http://localhost:3000"
    secure_cookies: bool = False
    demo_mode: bool = True
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
