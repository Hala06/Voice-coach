import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Support both env var names (user expects GOOGLE_GEMINI_API_KEY)
const GOOGLE_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CoachResponse {
  response: string;
  corrections?: string[];
  encouragement?: string;
  nextSteps?: string;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        {
          error: 'Gemini API key not configured',
          hint: 'Set GOOGLE_GEMINI_API_KEY (or GOOGLE_AI_API_KEY) in .env.local and restart the dev server.',
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const userMessage = typeof body?.message === 'string' ? body.message.trim() : '';
    const conversationHistory = Array.isArray(body?.history) ? body.history : [];
    const userGoal = typeof body?.goal === 'string' ? body.goal : 'language';

    if (!userMessage) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

    // Try a few common model names (Google changes availability across API versions).
    // If one 404s, we try the next.
    const candidateModels = ['gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-1.0-pro', 'gemini-pro'];

    // Build context-aware prompt
    const goalContextMap: Record<string, string> = {
      language: 'learning a new language from basics',
      pronunciation: 'improving pronunciation and accent',
      presentation: 'practicing public speaking and presentations',
      conversation: 'having natural casual conversations',
    };
    
    const goalContext = goalContextMap[userGoal] || 'improving speaking skills';

    const systemPrompt = `You are an enthusiastic, supportive voice coach helping someone with ${goalContext}. 

Your role:
- Listen carefully to what they say
- Provide specific, actionable pronunciation or speaking feedback
- Encourage them warmly and build confidence
- Adapt difficulty to their level
- Keep responses conversational and natural (2-3 sentences max)
- Point out what they did well before corrections

Response format (JSON):
{
  "response": "Your main conversational reply",
  "corrections": ["specific pronunciation tips if needed"],
  "encouragement": "positive reinforcement",
  "nextSteps": "optional suggestion for what to practice next"
}`;

    // Build conversation context
    const conversationContext = conversationHistory
      .slice(-6)
      .map((msg: Message) => `${msg.role === 'user' ? 'Student' : 'Coach'}: ${msg.content}`)
      .join('\n');

    const prompt = `${systemPrompt}

Recent conversation:
${conversationContext}

Student just said: "${userMessage}"

Provide your coaching response as JSON:`;

    let lastError: unknown = null;
    let result: any = null;
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        break;
      } catch (e) {
        lastError = e;
        continue;
      }
    }

    if (!result) {
      console.error('Gemini API call failed for all model candidates:', lastError);
      return NextResponse.json(
        {
          error: 'Gemini failed to generate a response',
          hint: 'Your GOOGLE_GEMINI_API_KEY may be invalid, restricted, or the Generative Language API is not enabled for it.',
        },
        { status: 502 }
      );
    }

    const responseText = result.response.text();

    // Parse JSON response
    let coachResponse: CoachResponse;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
      coachResponse = JSON.parse(jsonText);
    } catch {
      // Fallback if JSON parsing fails
      coachResponse = {
        response: responseText.trim(),
        encouragement: "Keep practicing!",
      };
    }

    return NextResponse.json({
      message: coachResponse.response || 'Great job! Keep going.',
      corrections: coachResponse.corrections || [],
      encouragement: coachResponse.encouragement || "You're doing well!",
      nextSteps: coachResponse.nextSteps || null,
    });
  } catch (error: any) {
    console.error('AI coach error:', error?.message || error);
    return NextResponse.json({ error: 'AI coach server error' }, { status: 500 });
  }
}
