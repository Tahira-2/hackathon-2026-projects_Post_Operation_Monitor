from __future__ import annotations

from pathlib import Path


class NerPredictor:
    def __init__(self, model_path: str | Path):
        self.model_path = Path(model_path)
        self._pipeline = None

    def is_available(self) -> bool:
        return self.model_path.exists()

    def predict(self, text: str) -> list[dict]:
        if not self.is_available():
            return []

        from transformers import AutoModelForTokenClassification, AutoTokenizer, pipeline

        if self._pipeline is None:
            tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            model = AutoModelForTokenClassification.from_pretrained(self.model_path)
            self._pipeline = pipeline("ner", model=model, tokenizer=tokenizer, aggregation_strategy="simple")

        return self._pipeline(text)
