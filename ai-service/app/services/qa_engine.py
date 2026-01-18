from openai import OpenAI
from app.config import settings
import re

# Initialize client with API key
client = None
api_key_valid = False

if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your-api-key-here":
    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        api_key_valid = True
        print("✅ OpenAI client initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize OpenAI client: {e}")
else:
    print("⚠️  OPENAI_API_KEY not configured or using placeholder. Please set a valid API key in .env file.")

def _extract_answer_from_text(text: str, question: str) -> str:
    """Fallback method to extract answer from contract text using intelligent pattern matching."""
    if not text or not question:
        return "Unable to process the contract or question."
    
    # Convert to lowercase for case-insensitive search
    text_lower = text.lower()
    question_lower = question.lower()
    
    # Extract meaningful keywords from question (filter out common words)
    common_words = {'what', 'is', 'the', 'are', 'a', 'an', 'and', 'or', 'in', 'of', 'to', 'for', 'by', 'with', 'from', 'as', 'at', 'be', 'this', 'that', 'does', 'do', 'can', 'will', 'should', 'may', 'must', 'how', 'when', 'where', 'why', 'who', 'which'}
    keywords = [word for word in question_lower.split() if len(word) > 2 and word not in common_words]
    
    if not keywords:
        keywords = [word for word in question_lower.split() if len(word) > 1]
    
    # Split text into sentences
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    # Find sentences containing keywords
    relevant_sentences = []
    for sentence in sentences:
        sentence_lower = sentence.lower()
        keyword_matches = sum(1 for keyword in keywords if keyword in sentence_lower)
        if keyword_matches > 0:
            relevant_sentences.append((sentence, keyword_matches))
    
    # Sort by relevance (number of keyword matches)
    relevant_sentences.sort(key=lambda x: x[1], reverse=True)
    
    if relevant_sentences:
        # Return top 2-3 most relevant sentences
        result = " ".join([s[0] for s in relevant_sentences[:3]])
        return result if len(result) > 20 else result + " (Limited information available)"
    
    # If no relevant sentences found, return first few sentences
    if sentences:
        return " ".join(sentences[:2])
    
    return "No relevant information found in the contract."

def answer_question(text: str, question: str) -> dict:
    """Answers questions about the contract using OpenAI or fallback method."""
    
    # Try OpenAI API first
    if client and api_key_valid:
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
                "confidence": 0.95,
                "method": "Gemini"
            }
        except Exception as e:
            error_str = str(e)
            print(f"⚠️  Gemini API error: {error_str}")
            
            # Check for quota/billing errors
            if "insufficient_quota" in error_str or "429" in error_str or "billing" in error_str.lower():
                print("⚠️  Gemini quota exceeded or billing issue. Using fallback method.")
                fallback_answer = _extract_answer_from_text(text, question)
                return {
                    "answer": fallback_answer,
                    "confidence": 0.65,
                    "method": "fallback"
                }
            else:
                return {
                    "answer": f"Error: {error_str}",
                    "confidence": 0.0,
                    "method": "error"
                }
    
    # Fallback: Use pattern matching on contract text
    print("⚠️  Gemini is not available. Using fallback text analysis method.")
    fallback_answer = _extract_answer_from_text(text, question)
    return {
        "answer": fallback_answer,
        "confidence": 0.65,
        "method": "fallback"
    }
