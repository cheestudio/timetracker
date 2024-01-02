import { supabase } from "@/lib/utils";

export async function POST (request: Request) {
  
  const {week, client} = await request.json();

  try {
    const { data, error } = await supabase
    .from('TimeEntries')
    .select('*')
    .eq('week_id', week)
    .eq('client_id', client)
    .order('date', { ascending: true });
  if (error) {
    console.error('Error fetching data: ', error);
    return [];
  }
    return Response.json(data);
  } catch (error) {
    Response.json({ error: (error as Error).message },{status: 500});
  }
}