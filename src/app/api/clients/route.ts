import { supabase } from "@/lib/utils";

export async function POST(request: Request): Promise<Response> {
    try {
        const { data, error } = await supabase
            .from('Clients')
            .select('*')
            .order('client_name', { ascending: true });
        
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