import { supabase } from '@/lib/utils';
import { Button, Input } from '@nextui-org/react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import parse from 'parse-duration'
import toast from 'react-hot-toast';

const SubmitTime = ({ client, week }: { client: string, week: string }) => {

  const [date, setDate] = useState('');
  const [task, setTask] = useState('');
  const [timeTracked, setTimeTracked] = useState('');
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    const { data, error } = await supabase
      .from('TimeEntries')
      .insert([
        {
          date,
          task,
          time_tracked: parse(timeTracked, 'm'),
          entry_id: uuidv4(),
          week_id: week,
          client_id: client,
        }
      ]);
    if (error) {
      console.log('Error:', error);
    } else {
      toast.success('Time entry added');
      window.dispatchEvent(new CustomEvent('timeEntryAdded'));
      setTask('');
      setTimeTracked('');
    }
  };

  return (
    <div className="time-submit-form">
      <form className="flex items-center justify-center gap-10" onSubmit={handleSubmit}>
        <div>
          <Input
            isRequired
            label="Date"
            labelPlacement="outside"
            placeholder="Date"
            className="block mb-5 text-white"
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <Input
            isRequired
            label="Task"
            labelPlacement="outside"
            placeholder="Description"
            className="block mb-5 text-white"
            type="text"
            id="task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
        </div>
        <div>
          <Input
            isRequired
            label="Time Tracked"
            labelPlacement="outside"
            placeholder="e.g. 1h 30m or 1.5h or 90m"
            className="block mb-5 text-white"
            type="text"
            id="timeTracked"
            value={timeTracked}
            onChange={(e) => setTimeTracked(e.target.value)}
          />
        </div>

        <Button variant="flat" color="primary" type="submit">Add Time Entry</Button>
        
      </form>
    </div>
  )
}

export default SubmitTime