"""
Simple in-memory cache untuk query results.
Production: gunakan Redis.
"""
import time
from typing import Optional, Any
from collections import OrderedDict

class SimpleCache:
    def __init__(self, max_size: int = 500, ttl_seconds: int = 300):
        self.cache: OrderedDict = OrderedDict()
        self.timestamps: dict = {}
        self.max_size = max_size
        self.ttl = ttl_seconds

    def get(self, key: str) -> Optional[Any]:
        if key not in self.cache:
            return None
        if time.time() - self.timestamps[key] > self.ttl:
            del self.cache[key]
            del self.timestamps[key]
            return None
        # Move to end (LRU)
        self.cache.move_to_end(key)
        return self.cache[key]

    def set(self, key: str, value: Any) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        else:
            if len(self.cache) >= self.max_size:
                oldest = next(iter(self.cache))
                del self.cache[oldest]
                del self.timestamps[oldest]
        self.cache[key] = value
        self.timestamps[key] = time.time()

    def clear(self) -> int:
        count = len(self.cache)
        self.cache.clear()
        self.timestamps.clear()
        return count

    def stats(self) -> dict:
        return {
            "size": len(self.cache),
            "max_size": self.max_size,
            "ttl_seconds": self.ttl,
        }

# Global cache instance
query_cache = SimpleCache(max_size=500, ttl_seconds=300)
