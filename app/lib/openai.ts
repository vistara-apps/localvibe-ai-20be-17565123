
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

export interface LocalRecommendationRequest {
  location?: string;
  vibes?: string[];
  type?: string;
  budget?: string;
}

export interface LocalRecommendationResponse {
  recommendations: {
    name: string;
    address: string;
    type: string;
    description: string;
    vibes: string[];
    reasoning: string;
  }[];
  confidence: number;
}

export async function generateLocalRecommendations(request: LocalRecommendationRequest): Promise<LocalRecommendationResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'system',
          content: `You are LocalVibe AI, an expert local discovery agent. Your job is to recommend trending restaurants, bars, cafes, and events based on user preferences. Focus on authentic, popular spots that locals love.

Response format should be JSON with:
{
  "recommendations": [
    {
      "name": "venue name",
      "address": "realistic address",
      "type": "restaurant|bar|cafe|event",
      "description": "brief description highlighting what makes it special",
      "vibes": ["tag1", "tag2", "tag3"],
      "reasoning": "why this matches the user's request"
    }
  ],
  "confidence": 0.85
}`
        },
        {
          role: 'user',
          content: `Find local recommendations for: ${JSON.stringify(request)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content');
    }

    try {
      return JSON.parse(content);
    } catch {
      // Fallback response if parsing fails
      return {
        recommendations: [
          {
            name: "AI-Generated Recommendation",
            address: request.location || "Near you",
            type: request.type || "restaurant",
            description: "Based on your preferences, this spot offers great vibes and quality.",
            vibes: request.vibes || ["trending", "popular"],
            reasoning: "Generated based on your request preferences"
          }
        ],
        confidence: 0.7
      };
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Return fallback recommendations
    return {
      recommendations: [
        {
          name: "Local Favorite",
          address: request.location || "Downtown",
          type: request.type || "restaurant",
          description: "A popular local spot known for great atmosphere and quality.",
          vibes: request.vibes || ["trending"],
          reasoning: "Fallback recommendation due to API limitations"
        }
      ],
      confidence: 0.5
    };
  }
}
