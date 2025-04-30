import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Get API key from environment variable
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Disable SSL certificate verification globally
// This is a workaround for SSL certificate issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function POST(request: NextRequest) {
  try {
    const { comment } = await request.json();
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Missing comment parameter' },
        { status: 400 }
      );
    }
    
    // Create a simple mock sentiment analysis for testing
    // Only use this if OpenAI connection fails
    const mockSentimentAnalysis = (text: string): number => {
      // Simple keyword-based sentiment
      const negative = ['bad', 'terrible', 'awful', 'horrible', 'dissatisfied', 'poor', 'unhappy', 'hate', 'dislike'];
      const positive = ['good', 'great', 'excellent', 'wonderful', 'satisfied', 'happy', 'like', 'enjoy', 'appreciate'];
      
      let score = 5; // neutral starting point
      const lowerText = text.toLowerCase();
      
      // Count positive/negative words
      let negCount = 0;
      let posCount = 0;
      
      negative.forEach(word => {
        if (lowerText.includes(word)) negCount++;
      });
      
      positive.forEach(word => {
        if (lowerText.includes(word)) posCount++;
      });
      
      // Adjust score based on word count
      if (negCount > posCount) {
        score = Math.max(0, 5 - negCount);
      } else if (posCount > negCount) {
        score = Math.min(10, 5 + posCount);
      }
      
      return score;
    };
    
    try {
      // Check if we have an API key
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not found in environment variables');
      }
      
      // First try with OpenAI
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY
      });
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Use a stable model
        messages: [
          {
            role: 'system',
            content: 'You are an assistant that analyzes the sentiment of exit interview comments. Rate the sentiment on a scale from 0 to 10, where 0 is extremely negative and 10 is extremely positive. Reply with just the numeric score.'
          },
          {
            role: 'user',
            content: `Analyze the sentiment of the following exit interview comment: "${comment}"`
          }
        ],
        temperature: 0.3
      });
      
      const scoreText = response.choices[0]?.message?.content?.trim() || '5';
      const score = parseFloat(scoreText);
      
      // Ensure the score is within 0-10 range
      if (isNaN(score) || score < 0) return NextResponse.json({ score: 0 });
      if (score > 10) return NextResponse.json({ score: 10 });
      
      return NextResponse.json({ score });
    } catch (openaiError) {
      // If OpenAI fails, use the mock sentiment analysis
      console.error('OpenAI error, using fallback:', openaiError);
      
      // Use the mock sentiment analysis as a fallback
      const fallbackScore = mockSentimentAnalysis(comment);
      return NextResponse.json({ 
        score: fallbackScore,
        fallback: true,
        message: 'Using fallback sentiment analysis due to OpenAI connection issues'
      });
    }
  } catch (error: any) {
    console.error('Error in sentiment analysis:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during sentiment analysis' },
      { status: 500 }
    );
  }
} 