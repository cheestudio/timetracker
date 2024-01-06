import { supabase } from "@/lib/utils";

export async function DELETE(request: Request): Promise<Response> {
  
  try {
    const { entryIds } = await request.json();
    
    if (!entryIds || entryIds.length === 0) {
      return new Response(JSON.stringify({ error: 'No entryIds provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { error } = await supabase
      .from('TimeEntries')
      .delete()
      .in('entry_id', entryIds);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}