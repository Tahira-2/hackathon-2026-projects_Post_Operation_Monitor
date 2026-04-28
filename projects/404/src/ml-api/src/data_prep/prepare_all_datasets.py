from __future__ import annotations

import argparse
import csv
import json
import random
import re
from pathlib import Path
from typing import Iterable

import pandas as pd


SYMPTOM_KEYWORDS = (
    "headache",
    "headaches",
    "dizzy",
    "dizziness",
    "chest pain",
    "fatigue",
    "fever",
    "nausea",
    "cough",
    "pain",
    "shortness of breath",
)

CONDITION_KEYWORDS = (
    "hypertension",
    "diabetes",
    "asthma",
    "migraine",
    "infection",
    "anemia",
)

ADVICE_KEYWORDS = (
    "reduce salt",
    "walk",
    "exercise",
    "hydrate",
    "follow up",
    "rest",
    "avoid",
    "return in",
)

INSTRUCTION_KEYWORDS = (
    "morning",
    "evening",
    "night",
    "daily",
    "twice daily",
    "with food",
    "before meals",
    "after meals",
    "at bedtime",
)

MEDICINE_PATTERN = re.compile(r"\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\b")
DOSAGE_PATTERN = re.compile(r"\b\d+(?:\.\d+)?\s?(?:mg|mcg|g|ml|units|tablet(?:s)?|capsule(?:s)?|pills?|drops?)\b", re.IGNORECASE)
SECTION_PATTERN = re.compile(r"^([A-Z][A-Z0-9 /&-]{2,}):\s*(.*)$")
SPEAKER_PATTERN = re.compile(r"^(Doctor|Patient)\s*:\s*(.*)$", re.IGNORECASE)
BC5CDR_TAG_MAP = {
    0: "O",
    1: "B-MEDICINE",
    2: "B-CONDITION",
    3: "I-CONDITION",
    4: "I-MEDICINE",
}


def _token_spans(text: str) -> list[tuple[str, int, int]]:
    spans: list[tuple[str, int, int]] = []
    cursor = 0
    for token in text.split():
        start = text.find(token, cursor)
        if start < 0:
            continue
        end = start + len(token)
        spans.append((token, start, end))
        cursor = end
    return spans


def _mark_phrase(tokens: list[tuple[str, int, int]], labels: list[str], phrase: str, entity_type: str) -> None:
    if not phrase:
        return

    lowered_text = " ".join(token.lower() for token, _, _ in tokens)
    lowered_phrase = phrase.lower().strip()
    if not lowered_phrase:
        return

    # Map phrase matches back onto token spans by char offset.
    original_text = " ".join(token for token, _, _ in tokens)
    search_start = 0
    while True:
        index = original_text.lower().find(lowered_phrase, search_start)
        if index < 0:
            break
        end_index = index + len(lowered_phrase)
        matched = False
        for token_index, (_, token_start, token_end) in enumerate(tokens):
            if labels[token_index] != "O":
                continue
            if token_end <= index:
                continue
            if token_start >= end_index:
                break
            labels[token_index] = f"B-{entity_type}" if not matched else f"I-{entity_type}"
            matched = True
        search_start = end_index


def _dedupe(items: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        cleaned = item.strip()
        lowered = cleaned.lower()
        if cleaned and lowered not in seen:
            seen.add(lowered)
            result.append(cleaned)
    return result


def _split_sentences(text: str) -> list[str]:
    parts = re.split(r"[\n\r]+|(?<=[.!?])\s+", text)
    return [part.strip() for part in parts if part.strip()]


def _classify_sentence(sentence: str, context: str = "") -> str:
    lowered = f"{context} {sentence}".lower()

    if any(keyword in lowered for keyword in ("history", "hpi", "past medical history", "family history", "hx")):
        return "HISTORY"
    if any(keyword in lowered for keyword in ("plan", "impression", "assessment", "discharge", "follow up", "return", "recommend")):
        return "ADVICE"
    if any(keyword in lowered for keyword in ("prescribe", "prescribed", "take", "add", "increase", "mg", "tablet", "capsule", "medicine", "medication")):
        return "PRESCRIPTION"
    if any(keyword in lowered for keyword in SYMPTOM_KEYWORDS):
        return "SYMPTOM_REPORT"
    return "OTHER"


def _label_text_to_bio(text: str) -> dict[str, list[str]]:
    tokens = _token_spans(text)
    labels = ["O"] * len(tokens)

    for keyword in sorted(CONDITION_KEYWORDS, key=len, reverse=True):
        _mark_phrase(tokens, labels, keyword, "CONDITION")
    for keyword in sorted(SYMPTOM_KEYWORDS, key=len, reverse=True):
        _mark_phrase(tokens, labels, keyword, "SYMPTOM")
    for keyword in sorted(ADVICE_KEYWORDS, key=len, reverse=True):
        _mark_phrase(tokens, labels, keyword, "ADVICE")
    for keyword in sorted(INSTRUCTION_KEYWORDS, key=len, reverse=True):
        _mark_phrase(tokens, labels, keyword, "INSTRUCTION")

    for match in DOSAGE_PATTERN.findall(text):
        _mark_phrase(tokens, labels, match, "DOSAGE")

    for match in MEDICINE_PATTERN.findall(text):
        lower = match.lower()
        if lower in {"doctor", "patient", "please", "take", "prescribed", "add", "increase", "medications"}:
            continue
        if len(match) < 3:
            continue
        _mark_phrase(tokens, labels, match, "MEDICINE")

    return {
        "tokens": [token for token, _, _ in tokens],
        "ner_tags": labels,
    }


def _write_jsonl(path: Path, rows: Iterable[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")


def _write_csv(path: Path, rows: Iterable[tuple[str, str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["sentence", "label", "source"])
        writer.writerows(rows)


def _load_json_records(path: Path) -> list[dict]:
    if not path.exists():
        raise FileNotFoundError(f"JSON file not found: {path}")
    with path.open("r", encoding="utf-8") as handle:
        content = handle.read().strip()

    if not content:
        return []

    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        records: list[dict] = []
        for line in content.splitlines():
            stripped = line.strip()
            if not stripped:
                continue
            item = json.loads(stripped)
            if isinstance(item, dict):
                records.append(dict(item))
        return records

    if isinstance(data, list):
        return [dict(item) for item in data if isinstance(item, dict)]
    if isinstance(data, dict):
        return [dict(data)]
    raise ValueError(f"Expected JSON object(s) in {path}")


def _load_conll_examples(path: Path) -> list[dict[str, list[str]]]:
    if not path.exists():
        raise FileNotFoundError(f"CoNLL file not found: {path}")

    examples: list[dict[str, list[str]]] = []
    tokens: list[str] = []
    tags: list[str] = []

    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            stripped = line.strip()
            if not stripped:
                if tokens:
                    examples.append({"tokens": tokens, "ner_tags": tags})
                    tokens = []
                    tags = []
                continue

            parts = stripped.split("\t")
            if len(parts) < 2:
                continue
            tokens.append(parts[0])
            tags.append(parts[-1])

    if tokens:
        examples.append({"tokens": tokens, "ner_tags": tags})

    return examples


def _load_bc5cdr_examples(path: Path) -> list[dict[str, list[str]]]:
    raw_rows = _load_json_records(path)
    examples: list[dict[str, list[str]]] = []

    for row in raw_rows:
        tokens = row.get("tokens")
        tags = row.get("tags") or row.get("ner_tags")
        if not isinstance(tokens, list) or not isinstance(tags, list):
            continue

        mapped_tags: list[str] = []
        for tag in tags:
            if isinstance(tag, int):
                mapped_tags.append(BC5CDR_TAG_MAP.get(tag, "O"))
            else:
                mapped_tags.append(str(tag))

        if len(tokens) == len(mapped_tags):
            examples.append({"tokens": [str(token) for token in tokens], "ner_tags": mapped_tags})

    return examples


def _load_mtsamples(csv_path: Path) -> pd.DataFrame:
    if not csv_path.exists():
        raise FileNotFoundError(f"MTSamples file not found: {csv_path}")
    return pd.read_csv(csv_path)


def _meddialog_text_from_row(row: dict) -> str:
    for key in ("dialogue", "conversation", "transcript", "text", "utterances"):
        value = row.get(key)
        if isinstance(value, str) and value.strip():
            return value
        if isinstance(value, list) and value:
            if all(isinstance(item, str) for item in value):
                return "\n".join(value)
            if all(isinstance(item, dict) for item in value):
                pieces: list[str] = []
                for item in value:
                    speaker = item.get("speaker") or item.get("role") or ""
                    text = item.get("text") or item.get("utterance") or item.get("content") or ""
                    if text:
                        pieces.append(f"{speaker}: {text}".strip(": "))
                if pieces:
                    return "\n".join(pieces)
    for value in row.values():
        if isinstance(value, str) and value.strip() and len(value.split()) > 5:
            return value
    return ""


def _iter_sentence_examples_from_text(text: str, source: str) -> Iterable[dict[str, str]]:
    current_context = ""
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue

        section_match = SECTION_PATTERN.match(stripped)
        if section_match:
            current_context = section_match.group(1)
            remainder = section_match.group(2).strip()
            if remainder:
                stripped = remainder

        speaker_match = SPEAKER_PATTERN.match(stripped)
        if speaker_match:
            current_context = speaker_match.group(1).upper()
            stripped = speaker_match.group(2).strip()

        for sentence in _split_sentences(stripped):
            label = _classify_sentence(sentence, current_context)
            yield {"sentence": sentence, "label": label, "source": source}


def _build_classifier_examples_from_mtsamples(csv_path: Path) -> list[tuple[str, str, str]]:
    frame = _load_mtsamples(csv_path)
    if "transcription" not in frame.columns:
        raise ValueError("MTSamples CSV must contain a 'transcription' column.")

    rows: list[tuple[str, str, str]] = []
    for _, record in frame.iterrows():
        transcription = str(record.get("transcription", "")).strip()
        if not transcription:
            continue
        for example in _iter_sentence_examples_from_text(transcription, "mtsamples"):
            rows.append((example["sentence"], example["label"], example["source"]))
    return rows


def _build_classifier_examples_from_meddialog(raw_root: Path) -> list[tuple[str, str, str]]:
    rows: list[tuple[str, str, str]] = []
    meddialog_dir = raw_root / "medical_dialog" / "processed.en"

    for split_name in ("train", "validation", "test"):
        split_path = meddialog_dir / f"{split_name}.json"
        if not split_path.exists():
            continue
        for row in _load_json_records(split_path):
            text = _meddialog_text_from_row(row)
            if not text:
                continue
            for example in _iter_sentence_examples_from_text(text, f"meddialog:{split_name}"):
                rows.append((example["sentence"], example["label"], example["source"]))
    return rows


def _build_ner_examples_from_mtsamples(csv_path: Path) -> list[dict[str, list[str]]]:
    frame = _load_mtsamples(csv_path)
    if "transcription" not in frame.columns:
        raise ValueError("MTSamples CSV must contain a 'transcription' column.")

    examples: list[dict[str, list[str]]] = []
    for _, record in frame.iterrows():
        transcription = str(record.get("transcription", "")).strip()
        if not transcription:
            continue
        for sentence in _split_sentences(transcription):
            labeled = _label_text_to_bio(sentence)
            if any(tag != "O" for tag in labeled["ner_tags"]):
                examples.append(labeled)
    return examples


def _build_ner_examples_from_meddialog(raw_root: Path) -> list[dict[str, list[str]]]:
    examples: list[dict[str, list[str]]] = []
    meddialog_dir = raw_root / "medical_dialog" / "processed.en"

    for split_name in ("train", "validation", "test"):
        split_path = meddialog_dir / f"{split_name}.json"
        if not split_path.exists():
            continue
        for row in _load_json_records(split_path):
            text = _meddialog_text_from_row(row)
            if not text:
                continue
            for sentence in _split_sentences(text):
                labeled = _label_text_to_bio(sentence)
                if any(tag != "O" for tag in labeled["ner_tags"]):
                    examples.append(labeled)
    return examples


def _build_ner_examples_from_ncbi(raw_root: Path) -> list[dict[str, list[str]]]:
    ncbi_dir = raw_root / "ncbi_disease"
    examples: list[dict[str, list[str]]] = []

    for split_name in ("train", "validation", "test"):
        split_path = ncbi_dir / f"{split_name}.tsv"
        if not split_path.exists():
            continue
        for example in _load_conll_examples(split_path):
            example["source"] = f"ncbi:{split_name}"
            examples.append(example)

    return examples


def _build_ner_examples_from_bc5cdr(raw_root: Path) -> list[dict[str, list[str]]]:
    bc5cdr_dir = raw_root / "bc5cdr"
    examples: list[dict[str, list[str]]] = []

    for split_name in ("train", "validation", "test"):
        split_path = bc5cdr_dir / f"{split_name}.json"
        if not split_path.exists():
            continue
        for example in _load_bc5cdr_examples(split_path):
            example["source"] = f"bc5cdr:{split_name}"
            examples.append(example)

    return examples


def _split_examples(examples: list, seed: int = 42) -> tuple[list, list, list]:
    shuffled = examples[:]
    random.Random(seed).shuffle(shuffled)
    total = len(shuffled)
    train_end = max(1, int(total * 0.8))
    val_end = max(train_end + 1, int(total * 0.9)) if total >= 3 else total
    return shuffled[:train_end], shuffled[train_end:val_end], shuffled[val_end:]


def _maybe_build_maccrobat_examples(maccrobat_path: Path | None) -> list[dict[str, list[str]]]:
    if not maccrobat_path:
        return []
    if not maccrobat_path.exists():
        return []

    examples: list[dict[str, list[str]]] = []
    for jsonl_path in maccrobat_path.rglob("*.jsonl"):
        with jsonl_path.open("r", encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                item = json.loads(line)
                text = item.get("text", "")
                if not isinstance(text, str) or not text.strip():
                    continue
                examples.append(_label_text_to_bio(text))
    return examples


def main() -> None:
    parser = argparse.ArgumentParser(description="Build training and annotation assets from all available datasets.")
    parser.add_argument("--mtsamples-file", default="datasets/mtsamples.csv")
    parser.add_argument("--maccrobat-dir", default="")
    parser.add_argument("--raw-root", default="data/raw")
    parser.add_argument("--output-root", default="data")
    args = parser.parse_args()

    raw_root = Path(args.raw_root)
    output_root = Path(args.output_root)
    annotation_queue_dir = output_root / "annotation_queue"
    classifier_auto_dir = output_root / "classifier" / "auto"
    classifier_combined_dir = output_root / "classifier" / "combined"
    annotated_auto_dir = output_root / "annotated" / "auto"
    annotated_combined_dir = output_root / "annotated" / "combined"

    output_root.mkdir(parents=True, exist_ok=True)
    classifier_combined_dir.mkdir(parents=True, exist_ok=True)
    annotated_combined_dir.mkdir(parents=True, exist_ok=True)

    mtsamples_path = Path(args.mtsamples_file)
    maccrobat_path = Path(args.maccrobat_dir) if args.maccrobat_dir else None

    meddialog_classifier_rows = _build_classifier_examples_from_meddialog(raw_root)
    mtsamples_classifier_rows = _build_classifier_examples_from_mtsamples(mtsamples_path)
    classifier_rows = meddialog_classifier_rows + mtsamples_classifier_rows

    meddialog_ner_examples = _build_ner_examples_from_meddialog(raw_root)
    mtsamples_ner_examples = _build_ner_examples_from_mtsamples(mtsamples_path)
    ncbi_ner_examples = _build_ner_examples_from_ncbi(raw_root)
    bc5cdr_ner_examples = _build_ner_examples_from_bc5cdr(raw_root)
    maccrobat_ner_examples = _maybe_build_maccrobat_examples(maccrobat_path)

    # Annotation queues for manual labeling if you want to extend the data.
    _write_jsonl(annotation_queue_dir / "meddialog.jsonl", (
        {"text": example[0], "source": example[2], "suggested_label": example[1]}
        for example in meddialog_classifier_rows
    ))
    _write_jsonl(annotation_queue_dir / "mtsamples.jsonl", (
        {"text": example[0], "source": example[2], "suggested_label": example[1]}
        for example in mtsamples_classifier_rows
    ))

    _write_csv(classifier_auto_dir / "meddialog.csv", meddialog_classifier_rows)
    _write_csv(classifier_auto_dir / "mtsamples.csv", mtsamples_classifier_rows)

    public_ner_examples = ncbi_ner_examples + bc5cdr_ner_examples + maccrobat_ner_examples
    weak_ner_examples = meddialog_ner_examples + mtsamples_ner_examples
    all_ner_examples = public_ner_examples + weak_ner_examples

    _write_jsonl(annotated_auto_dir / "ncbi.jsonl", ncbi_ner_examples)
    _write_jsonl(annotated_auto_dir / "bc5cdr.jsonl", bc5cdr_ner_examples)
    if maccrobat_ner_examples:
        _write_jsonl(annotated_auto_dir / "maccrobat.jsonl", maccrobat_ner_examples)
    _write_jsonl(annotated_auto_dir / "meddialog.jsonl", meddialog_ner_examples)
    _write_jsonl(annotated_auto_dir / "mtsamples.jsonl", mtsamples_ner_examples)

    ner_train, ner_val, ner_test = _split_examples(all_ner_examples)
    for split_name, split_examples in (("train", ner_train), ("val", ner_val), ("test", ner_test)):
        with (annotated_combined_dir / f"{split_name}.json").open("w", encoding="utf-8") as handle:
            json.dump(split_examples, handle, indent=2, ensure_ascii=False)

    classifier_train, classifier_val, classifier_test = _split_examples(classifier_rows)
    classifier_splits = {
        "train": classifier_train,
        "val": classifier_val,
        "test": classifier_test,
    }
    for split_name, split_rows in classifier_splits.items():
        with (classifier_combined_dir / f"{split_name}.csv").open("w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(["sentence", "label", "source"])
            writer.writerows(split_rows)

    print("Prepared multi-source dataset assets:")
    print(f"- NER examples: {len(all_ner_examples)}")
    print(f"- Classifier examples: {len(classifier_rows)}")
    print(f"- Annotation queue: {annotation_queue_dir}")


if __name__ == "__main__":
    main()
