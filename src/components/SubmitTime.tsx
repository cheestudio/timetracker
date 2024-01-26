import { supabase } from '@/lib/utils';
import { Button, Input, Switch, cn, Checkbox } from '@nextui-org/react';
import { useEffect, useState, useRef, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PlayCircleIcon, PauseCircleIcon, ArrowPathIcon, ClockIcon, CalendarDaysIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { timeToSeconds, timeToUTC, formatTimeInput, calculateElapsedTime, timerInputFormat, userTimeZone, today} from '@/lib/utils';
import moment from 'moment-timezone';
import toast from 'react-hot-toast';
import ClientSubmit from './ClientSubmit';

const SubmitTime = () => {

  /* State
  ========================================================= */
  const timeInputRef = useRef<string>('');
  const [client, setClient] = useState<string>('');
  const [date, setDate] = useState<string>(today);
  const [task, setTask] = useState<string>('');
  const [startTime, setStartTime] = useState<string>("0:00");
  const [endTime, setEndTime] = useState<string>("0:00");
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timeTracked, setTimeTracked] = useState<string>('0:00:00');
  const [timeMode, setTimeMode] = useState<string>("entry");
  const [toggleBar, setToggleBar] = useState<boolean>(false);
  const [billable, setBillable] = useState<boolean>(true);

  /* Handle Time Inputs
  ========================================================= */
  const timeEntryReducer = (state: any, action: any) => {
    switch (action.type) {
      case 'SET_START_TIME':
        return { ...state, startTime: timeToUTC(action.payload) };
      case 'SET_END_TIME':
        return { ...state, endTime: timeToUTC(action.payload) };
      default:
        return state;
    }
  }

  const [timeState, timeDispatch] = useReducer(timeEntryReducer, { startTime: '', endTime: '' });

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === 'startTime') {
      timeDispatch({ type: 'SET_START_TIME', payload: e.target.value });
      const formattedTime = formatTimeInput(startTime) || '0:00';
      setStartTime(formattedTime);
    } else if (e.target.id === 'endTime') {
      timeDispatch({ type: 'SET_END_TIME', payload: e.target.value });
      let formattedTime = formatTimeInput(endTime) || '0:00';
      if (!e.target.value.toLowerCase().includes('am') && !e.target.value.toLowerCase().includes('pm')) {
        if (startTime.includes('AM') || startTime.includes('PM')) {
          const amPm = startTime.slice(-2);
          formattedTime = `${formattedTime.split(' ')[0]} ${amPm}`;
        }
      }
      setEndTime(formattedTime);
    }
  }

  /* Timer Controls
  ========================================================= */

  const toggleTimer = () => {
    if (!timerRunning) {
      setTimerRunning(true);
      setStartTime(moment().format('h:mm A'));
    }
    else {
      setTimerRunning(false);
      setEndTime(moment().format('h:mm A'));
    }
  }

  const restartTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
    setTimeTracked('0:00:00');
    setStartTime('0:00');
    setEndTime('0:00');
  }
  
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined;
    if (timerRunning) {
      const start = performance.now(); 
      interval = setInterval(() => {
        const now = performance.now();
        const elapsedTime = now - start; 
        const hours = Math.floor(elapsedTime / 3600000);
        const minutes = Math.floor((elapsedTime % 3600000) / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        setTimeTracked(`${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        setTimerSeconds(Math.floor(elapsedTime / 1000)); 
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);
  

  const handleTimerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!timerRunning) {
      setTimeTracked(e.target.value);
      const formattedTime = timerInputFormat(e.target.value);
      const [hours, minutes, seconds] = formattedTime.split(':').map(Number);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      setTimerSeconds(totalSeconds);
    }
  }  

  const handleInputFocus = (e: any) => {
    e.target.select();
  };
  
  const handleTimerBlur = (e: any) => {
    const currentValue = e.target.value;
    if (currentValue === timeInputRef.current) {
      return;
    }
    const formattedTime = timerInputFormat(currentValue);
    setTimeTracked(formattedTime);
  };

  /* Supabase
  ========================================================= */

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let totalTime;
    let startTimeValue;
    let endTimeValue;
    if (timerSeconds > 0) {
      totalTime = timerSeconds;
    }
    else {
      const timeRange = calculateElapsedTime(startTime, endTime);
      totalTime = timeToSeconds(timeRange);
    }
    if (startTime != '0:00' && endTime != '0:00') {
      startTimeValue = timeToUTC(startTime);
      endTimeValue = timeToUTC(endTime);
    }
    else {
      startTimeValue = null;
      endTimeValue = null;
    }
    const { data: user, error: userError } = await supabase.auth.getSession()
    const { data, error } = await supabase
      .from('TimeEntries')
      .insert([
        {
          date: moment(date).tz(userTimeZone).utc().format(),
          task,
          time_tracked: totalTime,
          entry_id: uuidv4(),
          client_id: parseInt(client),
          billable: billable,
          owner: user?.session?.user.user_metadata.name.split(' ')[0],
          user_id: user.session?.user.id,
          start_time: startTimeValue,
          end_time: endTimeValue,
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
  
  const handleClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClient(e.target.value);
  }
  
  return (
    <div className={`fixed top-0 left-0 w-full py-5 px-5 bg-black/50 backdrop-blur-md ${timerRunning ? 'border-secondary' : 'border-[#333]'} border-b-1 time-submit-form z-[9999] transition-transform ${toggleBar ? 'translate-y-[-100%]' : 'translate-y-0'}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-start justify-between gap-x-5 gap-y-3">

          <div className="flex-[0_1_75px] self-center">
            <Switch
              color="primary"
              defaultSelected
              startContent={<CalendarDaysIcon />}
              endContent={<ClockIcon />}
              onChange={()=>setTimeMode(timeMode === 'timer' ? 'entry' : 'timer' )}
              classNames={{
                base: cn(
                  "inline-flex flex-row-reverse w-full items-center",
                  "justify-between cursor-pointer rounded-sm gap-4 p-2 border-1 border-content1 hover:border-primary bg-content1",
                ),
                wrapper: "bg-secondary"
              }}
            >
            </Switch>
          </div>
          <div className="flex-[0_1_100px] self-center">
            <Checkbox
              radius="none"
              onChange={(e) => setBillable(e.target.checked)}
            >
              Billable
            </Checkbox>
          </div>
          <div className="flex-[0_1_200px]">
            <ClientSubmit client={client} handleClient={handleClient}/>
          </div>
          <div className="flex-auto">
            <Input
              radius="sm"
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
              radius="sm"
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
              tabIndex={-1}
            />
          </div>

          {timeMode === 'entry' ?
            <>
              <div className="flex-[0_1_100px]">
                <Input
                  radius="sm"
                  isRequired
                  variant="bordered"
                  label="Start Time"
                  labelPlacement="outside"
                  placeholder="Enter valid time"
                  className="block w-full mb-5 text-white"
                  type="text"
                  id="startTime"
                  onFocus={handleInputFocus}
                  onChange={(e) => setStartTime(e.target.value)}
                  onBlur={(e: any) => handleManualInput(e)}
                  value={startTime}
                />

              </div>
              <div className="flex-[0_1_100px]">
                <Input
                  radius="sm"
                  isRequired
                  variant="bordered"
                  label="End Time"
                  labelPlacement="outside"
                  placeholder="Enter valid time"
                  className="block w-full mb-5 text-white"
                  type="text"
                  id="endTime"
                  onFocus={handleInputFocus}
                  onChange={(e) => setEndTime(e.target.value)}
                  onBlur={(e: any) => handleManualInput(e)}
                  value={endTime}
                />
              </div>
              <div className="flex-[0_1_80px]">
                <Input
                  radius="sm"
                  isDisabled
                  variant="underlined"
                  label="Duration"
                  labelPlacement="outside"
                  placeholder="00:00"
                  className=""
                  classNames={{
                    base: 'block w-full mb-5 text-xl font-bold text-white !opacity-100',
                    input: 'text-lg font-bold text-white',
                  }}
                  type="text"
                  value={calculateElapsedTime(startTime, endTime)}
                />

              </div>
            </>
            :
            <div className="flex-[0_1_250px] self-center">
              <div id="timer-toggle" className="flex items-center justify-center gap-5">
                <div className="timer-results min-w-[65px]">
                  <Input
                    radius="sm"
                    isRequired
                    variant="underlined"
                    label=""
                    labelPlacement="outside"
                    classNames={{
                      input: 'text-lg font-bold text-white',
                    }}
                    type="text"
                    id="timer_time"
                    onChange={(e) => handleTimerInput(e)}
                    onFocus={handleInputFocus}
                    onBlur={handleTimerBlur}
                    value={timeTracked}
                  />
                </div>
                <Button variant="light" isIconOnly onPress={() => toggleTimer()}>
                  {timerRunning ? <PauseCircleIcon /> : <PlayCircleIcon />}
                </Button>
                <Button variant="light" isIconOnly onPress={() => restartTimer()}>
                  <ArrowPathIcon className="w-[30px]" />
                </Button>
              </div>
            </div>
          }

        </div>

        <Button className="w-full max-w-[200px] mx-auto block bg-[#081D25]" variant="flat" color="primary" type="submit">Add Time Entry</Button>

      </form>
      {!timerRunning &&
        <Button
          className={`absolute bottom-0 right-5 min-w-[10px] ${toggleBar ? 'translate-y-[150%]' : 'translate-y-[-10px]'}`}
          isIconOnly
          onPress={() => setToggleBar(!toggleBar)}
        >
          {toggleBar ? <ChevronDownIcon className="w-[20px]" /> : <ChevronUpIcon className="w-[20px]" />}
        </Button>
      }
    </div>

  )
}

export default SubmitTime
