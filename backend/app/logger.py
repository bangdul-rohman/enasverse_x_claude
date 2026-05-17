import logging
from logtail import LogtailHandler

def setup_logger(source_token: str):
    if not source_token:
        return
    handler = LogtailHandler(source_token=source_token)
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(handler)
    logging.info("Betterstack logging initialized")
