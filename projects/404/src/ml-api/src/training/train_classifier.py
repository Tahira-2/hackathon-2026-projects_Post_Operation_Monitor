from __future__ import annotations

import argparse
from pathlib import Path

import evaluate
import numpy as np
import pandas as pd
from datasets import Dataset
from transformers import AutoModelForSequenceClassification, AutoTokenizer, Trainer, TrainingArguments


LABELS = ["SYMPTOM_REPORT", "PRESCRIPTION", "ADVICE", "HISTORY", "OTHER"]


def main() -> None:
    parser = argparse.ArgumentParser(description="Fine-tune a DistilBERT intent classifier.")
    parser.add_argument("--train-files", nargs="+", default=["data/classifier/combined/train.csv"])
    parser.add_argument("--model-name", default="distilbert/distilbert-base-uncased")
    parser.add_argument("--output-dir", default="models/classifier_model")
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--train-batch-size", type=int, default=16)
    parser.add_argument("--eval-batch-size", type=int, default=16)
    parser.add_argument("--max-samples", type=int, default=0)
    parser.add_argument("--fast", action="store_true", help="Quick demo mode: smaller sample and fewer epochs")
    args = parser.parse_args()

    label2id = {label: index for index, label in enumerate(LABELS)}
    id2label = {index: label for label, index in label2id.items()}

    frames = []
    for file_path in args.train_files:
        frame = pd.read_csv(Path(file_path))
        if "sentence" not in frame.columns or "label" not in frame.columns:
            raise ValueError("Classifier data must have 'sentence' and 'label' columns.")
        frames.append(frame[["sentence", "label"]])

    frame = pd.concat(frames, ignore_index=True).dropna(subset=["sentence", "label"])

    if args.fast:
        if args.max_samples <= 0:
            args.max_samples = 3000
        if args.epochs > 1:
            args.epochs = 1

    if args.max_samples > 0:
        frame = frame.head(min(args.max_samples, len(frame)))

    frame["label"] = frame["label"].map(label2id)
    dataset = Dataset.from_pandas(frame[["sentence", "label"]])
    split = dataset.train_test_split(test_size=0.2, seed=42)

    tokenizer = AutoTokenizer.from_pretrained(args.model_name)

    def preprocess(examples):
        return tokenizer(examples["sentence"], truncation=True, padding="max_length", max_length=128)

    tokenized = split.map(preprocess, batched=True)

    model = AutoModelForSequenceClassification.from_pretrained(
        args.model_name,
        num_labels=len(LABELS),
        id2label=id2label,
        label2id=label2id,
    )

    accuracy = evaluate.load("accuracy")

    def compute_metrics(eval_pred):
        logits, labels = eval_pred
        predictions = np.argmax(logits, axis=-1)
        return accuracy.compute(predictions=predictions, references=labels)

    training_args = TrainingArguments(
        output_dir=args.output_dir,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.train_batch_size,
        per_device_eval_batch_size=args.eval_batch_size,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized["train"],
        eval_dataset=tokenized["test"],
        compute_metrics=compute_metrics,
    )

    trainer.train()
    model.save_pretrained(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)
    print(f"Classifier saved to {args.output_dir}")


if __name__ == "__main__":
    main()
