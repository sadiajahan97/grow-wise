from abc import ABC, abstractmethod

class BaseFetcher(ABC):
    @abstractmethod
    def search(self, query: str, limit: int = 3) -> list:
        """
        Returns:
        [
          { "title": "", "url": "", "source": "", "type": "" }
        ]
        """
        pass
