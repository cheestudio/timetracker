import { supabase } from '@/lib/utils';
import { Button, Input, Switch, RadioGroup, Radio, Select, SelectItem } from '@nextui-org/react';
import { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PlayCircleIcon, PauseCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import parse from 'parse-duration'
import toast from 'react-hot-toast';

const SubmitTime = ({ client }: { client: string }) => {

  const timeInputRef = useRef('');
  const [date, setDate] = useState('');
  const [task, setTask] = useState('');
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timeTracked, setTimeTracked] = useState('0:00:00');
  const [timeMode, setTimeMode] = useState("entry");

  /* Time Conversions
  ========================================================= */

  function timeToSeconds(time:string) {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 3600) + (minutes * 60);
  }

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

  const formatTime = (time: string) => {
    const regexPattern = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?$/;
    const militaryTimePattern = /^([01]?\d|2[0-3]):([0-5]\d)$/;
    let match = time.match(regexPattern);

    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2] ? match[2] : '00';
      const ampm = match[3] ? match[3].toUpperCase() : (hours < 12 ? 'AM' : 'PM');
      if (hours === 12) {
        hours = ampm === 'AM' ? 0 : 12;
      } else if (ampm === 'PM') {
        hours += 12;
      }
      return `${hours % 12 || 12}:${minutes} ${ampm}`;
    }

    match = time.match(militaryTimePattern);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const ampm = hours >= 12 ? 'PM' : 'AM';

      return `${hours % 12 || 12}:${minutes} ${ampm}`;
    }
    return time;

  };


  const calculateElapsedTime = (startTime: string, endTime: string) => {
    const convertToMinutes = (timeStr: string) => {
      const [time, modifier] = timeStr.split(/(am|pm|AM|PM)/);
      let [hours, minutes] = time.split(':').map(Number);

      // Convert hours in PM to 24-hour format
      if ((modifier?.toLowerCase() === 'pm') && hours < 12) hours += 12;
      // Convert 12AM to 0 hours
      if ((modifier?.toLowerCase() === 'am') && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    const startMinutes = convertToMinutes(startTime);
    const endMinutes = convertToMinutes(endTime);

    let elapsedMinutes = endMinutes - startMinutes;

    // Handle overnight time spans
    if (elapsedMinutes < 0) elapsedMinutes += 24 * 60;

    // Format the elapsed time
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    const remainingMinutes = elapsedMinutes % 60;

    return `${elapsedHours}:${String(remainingMinutes).padStart(2, '0')}`;
  };

  const handleStartBlur = (e: any) => {
    setStartTime(formatTime(e.target.value));
    const elapsedTime = calculateElapsedTime(startTime, endTime);
    const totalSeconds = timeToSeconds(elapsedTime);
    console.log(totalSeconds);

  }

  const convertToTimeFormat = (input: string) => {
    const cleanInput = String(input).replace(/\D/g, '').replace(/^0+/, '');
    let
      hours: string | number = '0',
      minutes: string | number = '0',
      seconds: string | number = '00';

    if (cleanInput.length === 1 || cleanInput.length === 2) {
      minutes = cleanInput.padStart(2, '0');

      const totalMinutes = parseInt(cleanInput, 10);

      if (totalMinutes >= 0 && totalMinutes <= 99) {
        hours = Math.floor(totalMinutes / 60);
        minutes = totalMinutes % 60;
        minutes = minutes.toString().padStart(2, '0');
      }

    } else if (cleanInput.length === 3) {
      hours = cleanInput.substring(0, 1);
      minutes = cleanInput.substring(1, 3);
    } else if (cleanInput.length === 4) {
      hours = cleanInput.substring(0, 2);
      minutes = cleanInput.substring(2, 4);
    } else {
      hours = cleanInput.substring(0, cleanInput.length - 4);
      minutes = cleanInput.substring(cleanInput.length - 4, cleanInput.length - 2);
      seconds = cleanInput.substring(cleanInput.length - 2);
    }
    return `${hours}:${minutes}:${seconds}`;
  };

  /* Timer Controls
  ========================================================= */
  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  }

  const restartTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
    setTimeTracked('0:00:00');
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const formatAutoTime = () => {
      const hours = Math.floor(timerSeconds / 3600);
      const minutes = Math.floor((timerSeconds % 3600) / 60);
      const seconds = timerSeconds % 60;
      setTimeTracked(`${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };
    if (timerRunning) {
      setTimerRunning(true);
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
      formatAutoTime();
    }
    else {
      setTimerRunning(false);
    }
    return () => {
      clearInterval(interval);
    }
  }, [timerRunning, timerSeconds]);

  /* Timer Input
  
  ========================================================= */
  const handleTimerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!timerRunning) {
      setTimeTracked(e.target.value);
      const formattedTime = convertToTimeFormat(e.target.value);
      const [hours, minutes, seconds] = formattedTime.split(':').map(Number);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      setTimerSeconds(totalSeconds);
    }
  }

  const handleTimerFocus = (e: any) => {
    e.target.select();
    timeInputRef.current = e.target.value;
  };

  const handleTimerBlur = (e: any) => {
    const currentValue = e.target.value;
    if (currentValue === timeInputRef.current) {
      return;
    }
    const formattedTime = convertToTimeFormat(currentValue);
    setTimeTracked(formattedTime);
  };


  /* Supabase
  ========================================================= */

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
                  onBlur={handleStartBlur}
                  value={startTime ? startTime : getCurrentTimeFormatted()}
                />
              </div>
              <div className="flex-auto">
                <Input
                  isRequired
                  variant="bordered"
                  label="Start Time"
                  labelPlacement="outside"
                  placeholder="Enter valid time"
                  className="block w-full mb-5 text-white"
                  type="text"
                  id="end_time"
                  onChange={(e) => setEndTime(e.target.value)}
                  onBlur={(e: any) => setEndTime(formatTime(e.target.value))}
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
                      classNames={{
                        input: 'text-lg font-bold text-white',
                      }}
                      type="text"
                      id="end_time"
                      onChange={(e) => handleTimerInput(e)}
                      onFocus={handleTimerFocus}
                      onBlur={handleTimerBlur}
                      value={timeTracked}
                    />
                  </div>
                  <Button className="" variant="light" isIconOnly onPress={() => toggleTimer()}>
                    {timerRunning ? <PauseCircleIcon /> : <PlayCircleIcon />}
                  </Button>
                  <Button variant="light" isIconOnly onPress={() => restartTimer()}>
                    <ArrowPathIcon className="w-[30px]" />
                  </Button>
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