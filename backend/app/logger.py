import logging
import requests
from datetime import datetime, timezone

class BetterstackHandler(logging.Handler):
    def __init__(self, source_token: str, ingesting_host: str):
        super().__init__()
        self.source_token = source_token
        self.ingesting_host = ingesting_host

    def emit(self, record):
        try:
            msg = self.format(record)
            requests.post(
                f"https://{self.ingesting_host}",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.source_token}"
                },
                json={
                    "dt": datetime.now(timezone.utc).isoformat(),
                    "message": msg,
                    "level": record.levelname
                },
                timeout=2
            )
        except Exception:
            pass

def setup_logger(source_token: str, ingesting_host: str = "s2444508.eu-fsn-3.betterstackdata.com"):
    if not source_token:
        return
    handler = BetterstackHandler(source_token, ingesting_host)
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(handler)
    logging.info("Betterstack logging initialized")
