from __future__ import annotations

import argparse
import json
from glob import glob
from pathlib import Path

import evaluate
import numpy as np
from datasets import Dataset
from transformers import (
    AutoModelForTokenClassification,
    AutoTokenizer,
    DataCollatorForTokenClassification,
    Trainer,
    TrainingArguments,
)


LABELS = [
    "O",
    "B-SYMPTOM",
    "I-SYMPTOM",
    "B-CONDITION",
    "I-CONDITION",
    "B-MEDICINE",
    "I-MEDICINE",
    "B-DOSAGE",
    "I-DOSAGE",
    "B-INSTRUCTION",
    "I-INSTRUCTION",
    "B-ADVICE",
    "I-ADVICE",
]

EXTERNAL_ENTITY_MAP = {
    "DISEASE": "CONDITION",
    "CONDITION": "CONDITION",
    "CHEMICAL": "MEDICINE",
    "DRUG": "MEDICINE",
    "MEDICINE": "MEDICINE",
    "SYMPTOM": "SYMPTOM",
    "DOSAGE": "DOSAGE",
    "INSTRUCTION": "INSTRUCTION",
    "ADVICE": "ADVICE",
}


def load_data(paths: list[str | Path]) -> Dataset:
    records = []
    for path in paths:
        resolved = Path(path)
        if resolved.is_dir():
            for json_path in sorted(resolved.glob("*.json")):
                with json_path.open("r", encoding="utf-8") as handle:
                    records.extend(json.load(handle))
        else:
            with resolved.open("r", encoding="utf-8") as handle:
                records.extend(json.load(handle))
    return Dataset.from_list(records)


def build_label_maps() -> tuple[dict[str, int], dict[int, str]]:
    label2id = {label: index for index, label in enumerate(LABELS)}
    id2label = {index: label for label, index in label2id.items()}
    return label2id, id2label


def normalize_tag(tag: str) -> str:
    clean = str(tag).strip()
    if clean == "O":
        return "O"

    if "-" in clean:
        prefix, entity = clean.split("-", 1)
    else:
        prefix, entity = "B", clean

    prefix = prefix.upper()
    entity = entity.upper()
    mapped_entity = EXTERNAL_ENTITY_MAP.get(entity)
    if not mapped_entity:
        return "O"
    if prefix not in {"B", "I"}:
        prefix = "B"
    return f"{prefix}-{mapped_entity}"


def tokenize_and_align_labels(examples, tokenizer, label2id):
    tokenized = tokenizer(examples["tokens"], truncation=True, is_split_into_words=True)
    aligned_labels = []

    for index, labels in enumerate(examples["ner_tags"]):
        normalized_labels = [normalize_tag(label) for label in labels]
        word_ids = tokenized.word_ids(batch_index=index)
        label_ids = []
        previous_word_id = None

        for word_id in word_ids:
            if word_id is None:
                label_ids.append(-100)
            elif word_id != previous_word_id:
                label_ids.append(label2id[normalized_labels[word_id]])
            else:
                label_ids.append(-100)
            previous_word_id = word_id

        aligned_labels.append(label_ids)

    tokenized["labels"] = aligned_labels
    return tokenized


def compute_metrics_factory(id2label):
    metric = evaluate.load("seqeval")

    def compute_metrics(eval_preds):
        logits, labels = eval_preds
        predictions = np.argmax(logits, axis=-1)

        true_predictions = []
        true_labels = []
        for prediction, label in zip(predictions, labels):
            pred_sequence = []
            label_sequence = []
            for predicted_id, label_id in zip(prediction, label):
                if label_id == -100:
                    continue
                pred_sequence.append(id2label[int(predicted_id)])
                label_sequence.append(id2label[int(label_id)])
            true_predictions.append(pred_sequence)
            true_labels.append(label_sequence)

        results = metric.compute(predictions=true_predictions, references=true_labels)
        return {
            "precision": results["overall_precision"],
            "recall": results["overall_recall"],
            "f1": results["overall_f1"],
        }

    return compute_metrics


def main() -> None:
    parser = argparse.ArgumentParser(description="Fine-tune a SciBERT NER model for medical extraction.")
    parser.add_argument("--train-files", nargs="+", default=["data/annotated/combined/train.json"])
    parser.add_argument("--val-files", nargs="+", default=["data/annotated/combined/val.json"])
    parser.add_argument("--model-name", default="allenai/scibert_scivocab_uncased")
    parser.add_argument("--output-dir", default="models/ner_model")
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--train-batch-size", type=int, default=16)
    parser.add_argument("--eval-batch-size", type=int, default=16)
    parser.add_argument("--max-train-samples", type=int, default=0)
    parser.add_argument("--max-val-samples", type=int, default=0)
    parser.add_argument("--fast", action="store_true", help="Quick demo mode: fewer samples, fewer epochs, less checkpointing")
    args = parser.parse_args()

    label2id, id2label = build_label_maps()
    tokenizer = AutoTokenizer.from_pretrained(args.model_name)

    train_dataset = load_data(args.train_files)
    val_dataset = load_data(args.val_files)

    if args.fast:
        if args.max_train_samples <= 0:
            args.max_train_samples = 3000
        if args.max_val_samples <= 0:
            args.max_val_samples = 600
        if args.epochs > 1:
            args.epochs = 1

    if args.max_train_samples > 0:
        train_dataset = train_dataset.select(range(min(args.max_train_samples, len(train_dataset))))
    if args.max_val_samples > 0:
        val_dataset = val_dataset.select(range(min(args.max_val_samples, len(val_dataset))))

    tokenized_train = train_dataset.map(
        lambda batch: tokenize_and_align_labels(batch, tokenizer, label2id),
        batched=True,
    )
    tokenized_val = val_dataset.map(
        lambda batch: tokenize_and_align_labels(batch, tokenizer, label2id),
        batched=True,
    )

    model = AutoModelForTokenClassification.from_pretrained(
        args.model_name,
        num_labels=len(LABELS),
        id2label=id2label,
        label2id=label2id,
    )

    training_args = TrainingArguments(
        output_dir=args.output_dir,
        learning_rate=2e-5,
        per_device_train_batch_size=args.train_batch_size,
        per_device_eval_batch_size=args.eval_batch_size,
        num_train_epochs=args.epochs,
        weight_decay=0.01,
        eval_strategy="no" if args.fast else "epoch",
        save_strategy="no" if args.fast else "epoch",
        load_best_model_at_end=False if args.fast else True,
        metric_for_best_model="f1",
        logging_dir="logs/ner",
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_train,
        eval_dataset=tokenized_val,
        data_collator=DataCollatorForTokenClassification(tokenizer),
        compute_metrics=compute_metrics_factory(id2label),
    )

    trainer.train()
    trainer.save_model(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)
    print(f"NER model saved to {args.output_dir}")


if __name__ == "__main__":
    main()
