import { supabase } from "@/lib/utils";

export async function POST(request: Request): Promise<Response> {

  const {week, client} = await request.json();
  
    try {
        const { data, error } = await supabase
        .from('TimeEntries')
        .select('*')
        .eq('client_id', client)
        .order('date', { ascending: true });
        
        if (error) throw error;

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}