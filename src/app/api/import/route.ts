const api_token = process.env.TOGGL_API_TOKEN;

export async function POST(request: Request): Promise<Response> {
  const { start_date, end_date } = await request.json();
console.log('dates',start_date,end_date);
  // Encode the parameters to be included in the URL
  const params = new URLSearchParams({
    start_date: start_date,
    end_date: end_date ? end_date : start_date
  });

  try {
    const url = `https://api.track.toggl.com/api/v9/me/time_entries?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Basic ${Buffer.from(`${api_token}:api_token`).toString('base64')}`
      }
    });
    const data = await response.json();
    if (!Array.isArray(data)) {
      return new Response(JSON.stringify({ error: 'Nothing found' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    else {
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}