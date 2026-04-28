from __future__ import annotations

import shutil
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import requests
from huggingface_hub import hf_hub_download


RAW_DIR = Path("data/raw")

MEDDIALOG_URLS = {
    "train": "https://drive.google.com/uc?export=download&id=1ria4E6IdTIPsikL4Glm3uy1tFKJKw0W8",
    "validation": "https://drive.google.com/uc?export=download&id=1KAZneuwdfEVQQM6euCX4pMDP-9DQpiB5",
    "test": "https://drive.google.com/uc?export=download&id=10izqL71kcgnteYsf87Vh6j_mZ8sZM2Rc",
}

NCBI_URLS = {
    "train": "https://github.com/spyysalo/ncbi-disease/raw/master/conll/train.tsv",
    "validation": "https://github.com/spyysalo/ncbi-disease/raw/master/conll/devel.tsv",
    "test": "https://github.com/spyysalo/ncbi-disease/raw/master/conll/test.tsv",
}

BC5CDR_FILES = {
    "train": "dataset/train.json",
    "validation": "dataset/valid.json",
    "test": "dataset/test.json",
    "labels": "dataset/label.json",
}


def _download_http(url: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with requests.get(url, stream=True, timeout=120) as response:
        response.raise_for_status()
        with destination.open("wb") as handle:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    handle.write(chunk)


def _download_google_drive(url: str, destination: Path) -> None:
    parsed = urlparse(url)
    file_id = parse_qs(parsed.query).get("id", [None])[0]
    if not file_id:
        raise ValueError(f"Could not determine Google Drive file id from {url}")

    destination.parent.mkdir(parents=True, exist_ok=True)
    session = requests.Session()
    base_url = "https://drive.google.com/uc?export=download"

    response = session.get(base_url, params={"id": file_id}, stream=True, timeout=120)
    confirm_token = None
    for cookie_name, cookie_value in response.cookies.items():
        if cookie_name.startswith("download_warning"):
            confirm_token = cookie_value
            break

    if confirm_token:
        response = session.get(
            base_url,
            params={"id": file_id, "confirm": confirm_token},
            stream=True,
            timeout=120,
        )

    response.raise_for_status()
    with destination.open("wb") as handle:
        for chunk in response.iter_content(chunk_size=1024 * 1024):
            if chunk:
                handle.write(chunk)


def _download_hf_file(repo_id: str, filename: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    cached_path = hf_hub_download(repo_id=repo_id, filename=filename, repo_type="dataset")
    shutil.copyfile(cached_path, destination)


def download_medical_dialog() -> None:
    for split_name, url in MEDDIALOG_URLS.items():
        _download_google_drive(url, RAW_DIR / "medical_dialog" / "processed.en" / f"{split_name}.json")


def download_ncbi_disease() -> None:
    for split_name, url in NCBI_URLS.items():
        _download_http(url, RAW_DIR / "ncbi_disease" / f"{split_name}.tsv")


def download_bc5cdr() -> None:
    for split_name, filename in BC5CDR_FILES.items():
        _download_hf_file("tner/bc5cdr", filename, RAW_DIR / "bc5cdr" / f"{split_name}.json")


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    download_medical_dialog()
    download_ncbi_disease()
    download_bc5cdr()
    print(f"Downloaded datasets to {RAW_DIR}")


if __name__ == "__main__":
    main()
