import { supabase } from '@/lib/utils';
import { Button, Input, Switch, cn, RadioGroup, Radio, Select, SelectItem } from '@nextui-org/react';
import { useEffect, useState, useRef, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PlayCircleIcon, PauseCircleIcon, ArrowPathIcon, ClockIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import moment from 'moment-timezone';
import parse from 'parse-duration';
import toast from 'react-hot-toast';

const SubmitTime = ({ client }: { client: string }) => {

  const timeInputRef = useRef('');
  const [date, setDate] = useState('');
  const [task, setTask] = useState('');
  const [startTime, setStartTime] = useState<string>("0:00");
  const [endTime, setEndTime] = useState<string>("0:00");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timeTracked, setTimeTracked] = useState<string>('0:00:00');
  const [timeElapsed, setTimeElapsed] = useState<string>('0:00:00');
  const [timeMode, setTimeMode] = useState("entry");
  const [switchSelected, setSwitchSelected] = useState(true);

  /* Time Conversions
  ========================================================= */
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function timeToSeconds(time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 3600) + (minutes * 60);
  }

  /* Convert Time Input to UTC
  ========================================================= */
  const formatTime = (time: string) => {
    const regexPattern = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?$/;
    const militaryTimePattern = /^([01]\d|2[0-3]):?([0-5]\d)$/;
    const conciseTimePattern = /^(\d{1,2})(\d{2})(am|pm|AM|PM)?$/;
    let match = time.match(regexPattern);
    let formattedTime;

    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2] ? match[2] : '00';
      const ampm = match[3] ? match[3].toUpperCase() : (hours < 12 ? 'AM' : 'PM');
      if (hours === 12) {
        hours = ampm === 'AM' ? 0 : 12;
      } else if (ampm === 'PM') {
        hours += 12;
      }
      formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;
    } else {
      match = time.match(militaryTimePattern);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;
      } else {
        match = time.match(conciseTimePattern);
        if (match) {
          let hours = parseInt(match[1], 10);
          let minutes = match[2];
          // let ampm = match[3] ? match[3].toUpperCase() : 'AM';
          let ampm = match[3] ? match[3].toUpperCase() : (hours < 12 ? 'AM' : 'PM');
          formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;
        }
      }
    }
    return formattedTime;
  };


  const timeToUTC = (time: string) => {
    const currentDate = moment().format('YYYY-MM-DD');
    const formattedTime = formatTime(time);
    const localTime = moment.tz(`${currentDate} ${formattedTime}`, 'YYYY-MM-DD h:mm A', userTimeZone);
    return localTime;
  };

  const formatTimeInput = (time: string) => {
    const formattedTime = formatTime(time);
    return formattedTime;
  };


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
      const formattedTime = formatTimeInput(startTime) || '0:00:00';
      setStartTime(formattedTime);
    } else if (e.target.id === 'endTime') {
      timeDispatch({ type: 'SET_END_TIME', payload: e.target.value });
      let formattedTime = formatTimeInput(endTime) || '0:00:00';
      if (!e.target.value.toLowerCase().includes('am') && !e.target.value.toLowerCase().includes('pm')) {
        if (startTime.includes('AM') || startTime.includes('PM')) {
          const amPm = startTime.slice(-2);
          formattedTime = `${formattedTime.split(' ')[0]} ${amPm}`;
        }
      }
      setEndTime(formattedTime);
    }
  }

  /* Time Difference
  ========================================================= */

  const calculateElapsedTime = (startTime: string | undefined, endTime: string | undefined) => {

    if (startTime === '0:00:00' || endTime === '0:00:00') {
      return '0:00';
    }

    const format = 'h:mm A';
    const startMoment = moment(startTime, format);
    const endMoment = moment(endTime, format);

    if (endMoment.isBefore(startMoment)) {
      endMoment.add(1, 'day');
    }

    const duration = moment.duration(endMoment.diff(startMoment));
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return '0:00';
    }

    return `${hours}:${String(minutes).padStart(2, '0')}`;
  };


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

  const timerInputFormat = (input: string) => {
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

  const handleTimerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!timerRunning) {
      setTimeTracked(e.target.value);
      const formattedTime = timerInputFormat(e.target.value);
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
          date,
          task,
          time_tracked: totalTime,
          entry_id: uuidv4(),
          client_id: client,
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

  const handleTimeMode = () => {
    setSwitchSelected(!switchSelected);
    if (switchSelected) {
      setTimeMode('timer');
    } else {
      setTimeMode('entry');
    }
  }

  return (
    <div className="time-submit-form">
      <form onSubmit={handleSubmit}>

        <div className="flex justify-center w-full mb-10">
          <Switch
            color="primary"
            defaultSelected
            startContent={<CalendarDaysIcon />}
            endContent={<ClockIcon />}
            onChange={handleTimeMode}
            classNames={{
              base: cn(
                "inline-flex flex-row-reverse w-4xl max-w-md items-center",
                "justify-between cursor-pointer rounded-lg gap-4 p-3 border-1 border-content1 hover:border-primary bg-content1",
              ),
              wrapper: "bg-primary"
            }}
          >
            {switchSelected ? 'Entry' : 'Timer'}
          </Switch>
          {/* <RadioGroup
            label=""
            className="my-5"
            orientation="horizontal"
            value={timeMode}
            onValueChange={setTimeMode}
          >
            <Radio value="entry">Entry</Radio>
            <Radio value="timer">Timer</Radio>
          </RadioGroup> */}
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
                  id="startTime"
                  onChange={(e) => setStartTime(e.target.value)}
                  onBlur={(e: any) => handleManualInput(e)}
                  value={startTime}
                />

              </div>
              <div className="flex-auto">
                <Input
                  isRequired
                  variant="bordered"
                  label="End Time"
                  labelPlacement="outside"
                  placeholder="Enter valid time"
                  className="block w-full mb-5 text-white"
                  type="text"
                  id="endTime"
                  onChange={(e) => setEndTime(e.target.value)}
                  onBlur={(e: any) => handleManualInput(e)}
                  value={endTime}
                />
              </div>
              <div className="flex-[0_1_100px]">
                <Input
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
                      id="timer_time"
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
