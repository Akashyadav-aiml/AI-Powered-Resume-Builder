"""
Simple LLM helper to replace emergentintegrations
"""
import os
from openai import OpenAI
import google.generativeai as genai


async def enhance_with_openai(text: str) -> str:
    """Enhance resume using OpenAI GPT-4"""
    try:
        api_key = os.environ.get('OPENAI_API_KEY') or os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            print("Warning: No OpenAI API key found, returning original text")
            return text
            
        client = OpenAI(api_key=api_key)
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert resume writer. Enhance the given resume content to be more ATS-friendly while maintaining accuracy. Focus on clear, concise language, strong action verbs, and quantifiable achievements."},
                {"role": "user", "content": f"Enhance this resume content for ATS optimization:\n\n{text}"}
            ]
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI enhancement error: {e}")
        return text


async def enhance_with_gemini(text: str) -> str:
    """Enhance resume using Google Gemini"""
    try:
        api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            print("Warning: No Gemini API key found, returning original text")
            return text
            
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""You are an expert career coach and resume optimizer. Improve the given resume content with industry-specific keywords, better formatting, and professional language.

Optimize this resume content for better ATS compatibility:

{text}"""
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini enhancement error: {e}")
        return text
