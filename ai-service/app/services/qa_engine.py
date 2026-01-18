from openai import OpenAI
try:
    import google.generativeai as genai
except ImportError:
    genai = None

from app.config import settings
import re

# Initialize clients
openai_client = None
gemini_model = None

def get_gemini_model():
    global gemini_model
    if gemini_model: return gemini_model
    if not settings.GEMINI_API_KEY: return None
    
    try:
        if genai:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            # Try a few common model names
            for model_name in ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-2.0-flash']:
                try:
                    m = genai.GenerativeModel(model_name)
                    # Test if model exists by listing it or just trying to use it
                    # Here we just set it and return
                    gemini_model = m
                    print(f"✅ Using Gemini model: {model_name}")
                    return gemini_model
                except Exception:
                    continue
            
            # Final fallback: just use the first one from list_models
            try:
                available = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
                if available:
                    gemini_model = genai.GenerativeModel(available[0])
                    print(f"✅ Using Gemini model: {available[0]}")
                    return gemini_model
            except Exception: pass
    except Exception as e:
        print(f"❌ Gemini setup failed: {e}")
    return None

def get_openai_client():
    global openai_client
    if openai_client: return openai_client
    if not settings.OPENAI_API_KEY: return None
    try:
        openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        return openai_client
    except Exception: return None

def _extract_answer_from_text(text: str, question: str) -> str:
    """Fallback method to extract answer from contract text using intelligent pattern matching."""
    if not text or not question:
        return "Unable to process the contract or question."
    
    text_lower = text.lower()
    question_lower = question.lower()
    
    common_words = {'what', 'is', 'the', 'are', 'a', 'an', 'and', 'or', 'in', 'of', 'to', 'for', 'by', 'with', 'from', 'as', 'at', 'be', 'this', 'that', 'does', 'do', 'can', 'will', 'should', 'may', 'must', 'how', 'when', 'where', 'why', 'who', 'which'}
    keywords = [word for word in question_lower.split() if len(word) > 2 and word not in common_words]
    
    if not keywords:
        keywords = [word for word in question_lower.split() if len(word) > 1]
    
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    relevant_sentences = []
    for sentence in sentences:
        sentence_lower = sentence.lower()
        keyword_matches = sum(1 for keyword in keywords if keyword in sentence_lower)
        if keyword_matches > 0:
            relevant_sentences.append((sentence, keyword_matches))
    
    relevant_sentences.sort(key=lambda x: x[1], reverse=True)
    
    if relevant_sentences:
        result = " ".join([s[0] for s in relevant_sentences[:3]])
        return result if len(result) > 20 else result + " (Limited information available)"
    
    if sentences:
        return " ".join(sentences[:2])
    
    return "No relevant information found in the contract."

def answer_question(text: str, question: str) -> dict:
    """Answers questions about the contract using Gemini, OpenAI or fallback method."""
    
    # Try Gemini first
    model = get_gemini_model()
    if model:
        try:
            # Use a larger context window for Gemini
            context = text[:15000] if text else "No text found in contract."
            prompt = f"You are a legal assistant. Answer based ONLY on this text:\n\n{context}\n\nQuestion: {question}"
            response = model.generate_content(prompt)
            return {
                "answer": response.text.strip(),
                "confidence": 0.95,
                "method": "Gemini"
            }
        except Exception as e:
            print(f"⚠️ Gemini Chat Error: {e}")

    # Try OpenAI
    client = get_openai_client()
    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a legal assistant. Answer based on contract text."},
                    {"role": "user", "content": f"Text:\n{text[:4000]}\nQuestion: {question}"}
                ],
                max_tokens=300
            )
            return {
                "answer": response.choices[0].message.content.strip(),
                "confidence": 0.95,
                "method": "OpenAI"
            }
        except Exception as e:
            print(f"⚠️ OpenAI Chat Error: {e}")
    
    # Final Fallback
    fallback_answer = _extract_answer_from_text(text, question)
    return {
        "answer": fallback_answer,
        "confidence": 0.65,
        "method": "fallback"
    }
