import { supabase } from "@/lib/utils";
import { getTodayRange, getWeekRange, getLastTwoWeeks, getThisMonthRange, getLastMonthRange, getYesterdayRange } from "@/lib/utils";
import moment from 'moment-timezone';

export async function POST(request: Request): Promise<Response> {

    const { client, selectedUser, customDateRange, selectedDateRange, searchQuery } = await request.json();

    try {

        let query = supabase
            .from('TimeEntries')
            .select(`
          *,
          Clients (
            client_name
          )
    `)
            .order('date', { ascending: true });

        if (parseInt(client) !== 0) {
            query = query
                .eq('client_id', client);
        }

        if (selectedUser !== 'all') {
            query = query
                .textSearch('owner', selectedUser);
        }

        if (searchQuery !== '') {
            query = query
                .ilike('task', `%${searchQuery}%`);
        }

        if (selectedDateRange !== 'all') {
            let range;
            switch (selectedDateRange) {
                case 'today':
                    range = getTodayRange();
                    break;
                case 'yesterday':
                    range = getYesterdayRange();
                    break;
                case 'this_week':
                    range = getWeekRange();
                    break;
                case 'last_week':
                    range = getWeekRange(true);
                    break;
                case 'two_weeks':
                    range = getLastTwoWeeks();
                    break;
                case 'last_month':
                    range = getLastMonthRange();
                    break;
                case 'this_month':
                    range = getThisMonthRange();
                    break;
                case 'custom':
                    const start = customDateRange?.from;
                    const end = customDateRange?.to;
                    // if (!start || !end) {
                    //     return;
                    // }
                    range = [start, end];
                    break;
                default:
                    range = undefined;
            }
            if (range) {
                const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const momentRangeStart = moment(range[0]);
                const momentRangeEnd = moment(range[1]);
                query = query
                    .gte('date', momentRangeStart.tz(userTimeZone).format('MM/DD/YYYY'))
                    .lte('date', momentRangeEnd.tz(userTimeZone).format('MM/DD/YYYY'));
            }
        }

        const { data, error } = await query;

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