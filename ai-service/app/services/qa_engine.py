from openai import OpenAI
from app.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

def answer_question(text: str, question: str) -> dict:
    """Answers questions about the contract using OpenAI."""
    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful legal assistant. Answer questions based ONLY on the provided contract text."},
                    {"role": "user", "content": f"Contract Text:\n{text[:3000]}\n\nQuestion: {question}"}
                ],
                max_tokens=200
            )
            return {
                "answer": response.choices[0].message.content.strip(),
                "confidence": 0.9 # Mock confidence
            }
        except Exception as e:
            print(f"OpenAI error: {e}")
            pass
            
    return {
        "answer": "OpenAI API key not configured or unavailable. Unable to answer specific questions.",
        "confidence": 0.0
    }
