import { supabase } from '@/lib/utils';
import { Button, Input, Select, SelectItem } from '@nextui-org/react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import parse from 'parse-duration'
import toast from 'react-hot-toast';

const SubmitTime = ({ client, week }: { client: string, week: string }) => {

  const [date, setDate] = useState('');
  const [task, setTask] = useState('');
  const [owner, setOwner] = useState('');
  const [timeTracked, setTimeTracked] = useState('');

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setOwner(event.target.value);
  }

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
          owner: owner,
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
      <form onSubmit={handleSubmit}>
        <div className="grid items-center justify-center grid-cols-2 gap-x-10 gap-y-3">
          <div>
            <Input
              isRequired
              variant="bordered"
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
              variant="bordered"
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
              variant="bordered"
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
          <div className="mt-[-20px]">
            <Select
              isRequired
              variant="bordered"
              label="Owner"
              labelPlacement="outside"
              placeholder="Select"
              onChange={handleSelect}
              popoverProps={{
                classNames: {
                  content: "bg-[#27272A]",
                },
              }}
            >
              <SelectItem key="Matt" value="Matt">Matt</SelectItem>
              <SelectItem key="Lars" value="Lars">Lars</SelectItem>
            </Select>
          </div>
        </div>

        <Button className="w-full max-w-[200px] mt-2 mx-auto block" variant="flat" color="primary" type="submit">Add Time Entry</Button>

      </form>
    </div>
  )
}

export default SubmitTime