import asyncio
import os
import sys

# Add backend root to import path for local execution.
sys.path.append(os.getcwd())

from app.ai.client import get_gemini_model, get_groq_client
from app.core.config import settings


async def test_gemini() -> bool:
    print("\n=== Gemini Check ===")
    print(f"Model: {settings.gemini_model}")
    print(f"API Key present: {bool(settings.gemini_api_key)}")

    model = get_gemini_model()
    if not model:
        print("Result: FAIL (Gemini client unavailable)")
        return False

    try:
        response = model.generate_content("Say hello.")
        print(f"Result: PASS ({(response.text or '').strip()[:120]})")
        return True
    except Exception as exc:
        print(f"Result: FAIL ({exc})")
        return False


async def test_groq() -> bool:
    print("\n=== Groq Check ===")
    print(f"Model: {settings.groq_model}")
    print(f"API Key present: {bool(settings.groq_api_key)}")

    try:
        client = get_groq_client()
    except Exception as exc:
        print(f"Result: FAIL (Groq client init error: {exc})")
        return False

    if not client:
        print("Result: FAIL (Groq client unavailable)")
        return False

    try:
        completion = client.chat.completions.create(
            model=settings.groq_model,
            temperature=0,
            max_tokens=24,
            messages=[{"role": "user", "content": "Say hello."}],
        )
        text = completion.choices[0].message.content or ""
        print(f"Result: PASS ({text.strip()[:120]})")
        return True
    except Exception as exc:
        print(f"Result: FAIL ({exc})")
        return False


async def test() -> None:
    gemini_ok = await test_gemini()
    groq_ok = await test_groq()

    print("\n=== Summary ===")
    print(f"Gemini: {'VALID' if gemini_ok else 'INVALID'}")
    print(f"Groq: {'VALID' if groq_ok else 'INVALID'}")


if __name__ == "__main__":
    asyncio.run(test())
