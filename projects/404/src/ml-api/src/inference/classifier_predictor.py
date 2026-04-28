from __future__ import annotations

from pathlib import Path


class ClassifierPredictor:
    def __init__(self, model_path: str | Path):
        self.model_path = Path(model_path)
        self._pipeline = None

    def is_available(self) -> bool:
        return self.model_path.exists()

    def predict(self, text: str) -> str:
        if not self.is_available():
            return "OTHER"

        from transformers import pipeline

        if self._pipeline is None:
            self._pipeline = pipeline("text-classification", model=self.model_path)

        result = self._pipeline(text)
        if isinstance(result, list) and result:
            return result[0]["label"]
        return "OTHER"
