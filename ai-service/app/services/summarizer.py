from openai import OpenAI
from app.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

def summarize_text(text: str) -> str:
    """Summarizes text using OpenAI or fallback rule-based method."""
    if not text:
        return ""

    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a legal contract assistant. Summarize the following contract concisely in 3-4 sentences."},
                    {"role": "user", "content": text[:4000]} # Limit context to avoid errors
                ],
                max_tokens=150
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI error: {e}")
            # Fallback
            pass
    
    # Fallback: First 500 characters
    return text[:500] + "..." if len(text) > 500 else text
