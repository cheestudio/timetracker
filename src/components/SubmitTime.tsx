import { supabase } from '@/lib/utils';
import { Button, Input, Switch, RadioGroup, Radio, Select, SelectItem } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PlayCircleIcon, PauseCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import parse from 'parse-duration'
import toast from 'react-hot-toast';

const SubmitTime = ({ client }: { client: string }) => {

  const [date, setDate] = useState('');
  const [task, setTask] = useState('');
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [timerToggle, setTimerToggle] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timeTracked, setTimeTracked] = useState('');
  const [timeMode, setTimeMode] = useState("entry");

  function getCurrentTimeFormatted() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutesStr + ' ' + ampm;
  }


  const calculateElapsedTime = (startTime:number, endTime:number) => {
    const duration = endTime - startTime; // Duration in milliseconds
    return Math.floor(duration / 60000); // Convert to minutes
  };

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  }
  const restartTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      setTimerRunning(true);
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    else {
      setTimerRunning(false);
    }
    return () => {
      clearInterval(interval);
    }
    
  }, [timerRunning]);


  const formatTime = () => {
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const seconds = timerSeconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { data: user, error: userError } = await supabase.auth.getSession()
    const { data, error } = await supabase
      .from('TimeEntries')
      .insert([
        {
          date,
          task,
          time_tracked: parse(timeTracked, 'm'),
          entry_id: uuidv4(),
          client_id: client,
          owner: user?.session?.user.user_metadata.name.split(' ')[0],
          user_id: user.session?.user.id
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

        <div className="flex justify-center w-full">
          <RadioGroup
            label=""
            className="my-5"
            orientation="horizontal"
            value={timeMode}
            onValueChange={setTimeMode}
          >
            <Radio value="entry">Entry</Radio>
            <Radio value="timer">Timer</Radio>
          </RadioGroup>
        </div>

        <div className="flex items-center justify-between gap-x-5 gap-y-3">
          <div className="flex-auto">
            <Input
              isRequired
              variant="bordered"
              label="Task"
              labelPlacement="outside"
              placeholder="What did you work on?"
              className="block w-full mb-5 text-white"
              type="text"
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
          </div>
          <div className="flex-[0_1_100px]">
            <Input
              isRequired
              variant="bordered"
              label="Date"
              labelPlacement="outside"
              placeholder="Date"
              className="block w-full mb-5 text-white"
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          {timeMode === 'entry' ?
            <div className="flex items-center justify-between gap-x-2 gap-y-3">
              <div className="flex-auto">
                <Input
                  isRequired
                  variant="bordered"
                  label="Start Time"
                  labelPlacement="outside"
                  placeholder="Enter valid time"
                  className="block w-full mb-5 text-white"
                  type="text"
                  id="start_time"
                  onChange={(e) => setStartTime(e.target.value)}
                  value={startTime ? startTime : getCurrentTimeFormatted()}
                />
              </div>
              <div className="flex-auto">
                <Input
                  isRequired
                  variant="bordered"
                  label="End Time"
                  labelPlacement="outside"
                  placeholder="e.g. 1h 30m or 1.5h or 90m"
                  className="block w-full mb-5 text-white"
                  type="text"
                  id="end_time"
                  onChange={(e) => setEndTime(e.target.value)}
                  value={endTime ? endTime : getCurrentTimeFormatted()}
                />
              </div>
            </div>
            :
            <div className="flex-[0_1_250px]">
              <div className="">
                <div id="timer-toggle" className="flex items-center justify-center gap-5">
                  <div className="timer-results min-w-[65px]">
                    {/* <div>{timeTracked ? timeTracked : '00:00:00'}</div> */}
                   
                    <Input
                  isRequired
                  variant="underlined"
                  label=""
                  labelPlacement="outside"
                  // placeholder="e.g. 1h 30m or 1.5h or 90m"
                  // className="block w-full mb-5 text-xl font-bold text-white"
                  classNames={{
                    input: 'text-lg font-bold text-white',
                  }}
                  type="text"
                  id="end_time"
                  onChange={(e) => setEndTime(e.target.value)}
                  value={formatTime()}
                />
                  </div>
                  <Button className="" variant="light" isIconOnly onPress={() => toggleTimer()}>
                    {timerRunning ? <PauseCircleIcon/> : <PlayCircleIcon/>}
                  </Button>
                  {timerRunning &&
                  <Button  variant="light" isIconOnly onPress={() => restartTimer()}>
                    <ArrowPathIcon className="w-[30px]"/>
                  </Button>
                  }
                </div>
              </div>
            </div>
          }

        </div>

        <Button className="w-full max-w-[200px] mt-2 mx-auto block" variant="flat" color="primary" type="submit">Add Time Entry</Button>

      </form>
    </div>
  )
}

export default SubmitTime