from app.services.qa_engine import get_gemini_model, get_openai_client

def summarize_text(text: str) -> str:
    """Summarizes text using Gemini, OpenAI or fallback rule-based method."""
    if not text:
        return ""

    # Try Gemini
    model = get_gemini_model()
    if model:
        try:
            prompt = f"Summarize this contract concisely in 3-4 sentences:\n\n{text[:10000]}"
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Gemini Summarize Error: {e}")

    # Try OpenAI
    client = get_openai_client()
    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a legal assistant. Summarize the contract."},
                    {"role": "user", "content": text[:4000]}
                ],
                max_tokens=200
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI Summarize Error: {e}")
    
    # Fallback: First 500 characters
    return text[:500] + "..." if len(text) > 500 else text
