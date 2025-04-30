export const analyzeSentiment = async (comment: string): Promise<number> => {
  try {
    // Simple fallback sentiment analysis in case fetch fails
    const localSentimentAnalysis = (text: string): number => {
      // Simple keyword-based sentiment (same as server-side)
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
      // First try with the API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.score;
    } catch (fetchError) {
      console.error('Fetch error, using local fallback:', fetchError);
      console.log('Analyzing locally: ', comment);
      
      // Use local sentiment analysis as a final fallback
      return localSentimentAnalysis(comment);
    }
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    // Return a neutral score on error
    return 5;
  }
}; 