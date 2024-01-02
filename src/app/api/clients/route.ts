import { supabase } from "@/lib/utils";

export async function POST (request: Request) {
  
  try {
    const { data, error } = await supabase
    .from('Clients')
    .select('*')
    .order('client_name', { ascending: true });
  if (error) {
    console.error('Error fetching data: ', error);
    return [];
  }
    return Response.json(data);
  } catch (error) {
    Response.json({ error: (error as Error).message },{status: 500});
  }
}