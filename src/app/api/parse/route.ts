import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const OPENCODE_ENDPOINT = 'https://opencode.ai/zen/go/v1/chat/completions';
const MODEL = 'mimo-v2.5-pro';

export async function POST(request: NextRequest) {
  try {
    const { input, clients } = await request.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Missing input' }, { status: 400 });
    }

    const apiKey = process.env.OPENCODE_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
      return NextResponse.json({ error: 'OPENCODE_API_KEY not configured' }, { status: 500 });
    }

    const clientList = clients
      ?.map((c: { id: number; name: string }) => `- ${c.name} (id: ${c.id})`)
      .join('\n') || 'No clients available';

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const today = new Date().toISOString().split('T')[0];

    const systemPrompt = `You are a time entry parser. Convert natural language into structured JSON.

CONTEXT
- Today's date: ${today}
- User timezone: ${userTimeZone}

KNOWN CLIENTS
${clientList}

OUTPUT SCHEMA (strict JSON, no markdown)
{
  "client": "exact client name from the list above, or null if not mentioned",
  "date": "YYYY-MM-DD format. Use today if not specified. Resolve relative dates like 'yesterday', 'last tuesday', '2 days ago' etc.",
  "task": "concise description of the work performed",
  "duration": "HH:MM:SS format (e.g. '02:00:00')"
}

RULES
- Match client names case-insensitively. If a partial name matches (e.g. "acme" matches "Acme Corp"), use the full name.
- If no client is found in the list, set client to null.
- If no date is mentioned, default to today.
- Parse durations from formats like: "2 hours", "90 minutes", "3h 30m", "2.5 hours", "1:30".
- If the user provides explicit start and end times (e.g. "9-11am", "from 2pm to 5pm"), calculate the duration between them and return it as HH:MM:SS.
- Extract the task description from what comes after time/client mentions. Keep it concise.
- If no duration or time range is found, set duration to null.
- Output ONLY valid JSON. No explanation, no markdown fences.`;

    const response = await fetch(OPENCODE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'x-opencode-session': crypto.randomUUID(),
        'User-Agent': 'chee-timetracker/1.0',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input },
        ],
        temperature: 0.1,
        max_tokens: 1500,
      }),
    });


    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenCode API error:', response.status, errorText);
      return NextResponse.json({ error: 'LLM API request failed' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'Empty response from LLM' }, { status: 502 });
    }

    // Parse JSON from the response — handle potential markdown fences
    let parsed;
    try {
      const cleaned = content.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse LLM JSON:', content);
      return NextResponse.json({ error: 'LLM returned invalid JSON' }, { status: 502 });
    }

    // Validate required fields
    if (!parsed.task) {
      return NextResponse.json({ error: 'Could not extract task from input' }, { status: 422 });
    }

    // Ensure date defaults to today
    if (!parsed.date) {
      parsed.date = today;
    }

    return NextResponse.json(parsed);

  } catch (error) {
    console.error('Parse route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
