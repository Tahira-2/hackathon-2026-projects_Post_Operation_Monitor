from __future__ import annotations

import argparse
import json
import random
from pathlib import Path


def _token_spans(text: str) -> list[tuple[str, int, int]]:
    spans: list[tuple[str, int, int]] = []
    cursor = 0
    for token in text.split():
        start = text.find(token, cursor)
        end = start + len(token)
        spans.append((token, start, end))
        cursor = end
    return spans


def _apply_entity_labels(tokens: list[tuple[str, int, int]], labels: list[str], start: int, end: int, entity_type: str) -> None:
    matched = False
    for index, (_, token_start, token_end) in enumerate(tokens):
        if token_end <= start:
            continue
        if token_start >= end:
            break
        labels[index] = f"B-{entity_type}" if not matched else f"I-{entity_type}"
        matched = True


def convert_doccano_jsonl(input_path: str | Path) -> list[dict[str, list[str]]]:
    input_file = Path(input_path)
    examples: list[dict[str, list[str]]] = []

    with input_file.open("r", encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            item = json.loads(line)
            text = item["text"]
            tokens = _token_spans(text)
            labels = ["O"] * len(tokens)

            for annotation in item.get("label", []):
                start, end, entity_type = annotation
                _apply_entity_labels(tokens, labels, int(start), int(end), str(entity_type))

            examples.append({
                "tokens": [token for token, _, _ in tokens],
                "ner_tags": labels,
            })

    return examples


def split_and_save(examples: list[dict[str, list[str]]], output_dir: str | Path, seed: int = 42) -> None:
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    shuffled = examples[:]
    random.Random(seed).shuffle(shuffled)

    total = len(shuffled)
    train_end = max(1, int(total * 0.8))
    val_end = max(train_end + 1, int(total * 0.9)) if total >= 3 else total

    splits = {
        "train": shuffled[:train_end],
        "val": shuffled[train_end:val_end],
        "test": shuffled[val_end:],
    }

    for split_name, split_data in splits.items():
        with (output_path / f"{split_name}.json").open("w", encoding="utf-8") as handle:
            json.dump(split_data, handle, indent=2, ensure_ascii=False)


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert Doccano JSONL exports to BIO JSON splits.")
    parser.add_argument("input", help="Path to a Doccano JSONL export")
    parser.add_argument("output_dir", help="Directory to write train.json, val.json, and test.json")
    args = parser.parse_args()

    examples = convert_doccano_jsonl(args.input)
    split_and_save(examples, args.output_dir)
    print(f"Saved {len(examples)} annotated examples to {args.output_dir}")


if __name__ == "__main__":
    main()
