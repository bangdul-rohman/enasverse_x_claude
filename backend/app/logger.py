import logging
from logtail import LogtailHandler

def setup_logger(source_token: str):
    logger = logging.getLogger("enasverse")
    logger.setLevel(logging.INFO)
    if source_token:
        handler = LogtailHandler(source_token=source_token)
        logger.addHandler(handler)
    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    logger.addHandler(console)
    return logger
