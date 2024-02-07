import { TimeEntryProps } from "@/lib/types";
import { convertTime, convertDecimalTime } from "@/lib/utils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import moment from "moment-timezone";

const BarChart = ({ items }: { items: TimeEntryProps[] }) => {

  /* Plugins
  ========================================================= */
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
  );

  /* Process Data
  ========================================================= */
  function processData(items: any) {
    const dateMap = new Map();
    items.forEach((item: any) => {
      const { date, time_tracked } = item;
      if (!dateMap.has(date)) {
        dateMap.set(date, Math.ceil(time_tracked));
      } else {
        dateMap.set(date, dateMap.get(date) + Math.ceil(time_tracked));
      }
    });

    const uniqueDates = Array.from(dateMap.keys());
    const totalTimeTracked = Array.from(dateMap.values());
    return { uniqueDates, totalTimeTracked };
  }
  const result = processData(items);
  const hoursTracked = result.totalTimeTracked.map(t => t / 3600);
  /* Data
  ========================================================= */
  const data = {
    labels: result.uniqueDates,
    datasets: [{
      label: 'Total',
      data: hoursTracked,
      backgroundColor: '#2496b9',
      hoverBackgroundColor: '#33add7',
      borderRadius: 5,
      maxBarThickness: 150
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#333',
          borderColor: '#333',
          drawBorder: true,
          drawOnChartArea: true,
        },
        ticks: {
          stepSize: 2,
          color: '#333',
          autoSkip: false,
        }
      },
      x: {
        grid: {
          display: true,
        },
        ticks: {
          color: '#fff',
          font: {
            size: 11,
            family: '__Inter_e66fe9',
          },
          callback: (value: Date, index: number) => {
            const dateLabels = data.labels;
            if (dateLabels && dateLabels.length > index) {
              const dateStr = dateLabels[index];
              return moment(dateStr).format('ddd M/DD');
            }
            return value;
          }
        }
      }
    },
    plugins: {
      legend: false,
      title: {
        display: false
      },
      datalabels: {
        color: '#fff',
        anchor: 'end',
        align: 'top',
        formatter: (value: number, context: any) => {
          return convertDecimalTime(value);
        },
        font: {
          size: 13,
          family: '__Inter_e66fe9',
        }
      },
      tooltip: {
        enabled: false,
        label: false,
        mode: 'index',
        intersect: true,
        displayColors: false,
        callbacks: {
          title: (tooltipItems: any) => {
            const tooltipDate = new Date(tooltipItems[0].label);
            return moment(tooltipItems[0].label).format('dddd, MMMM Do');
          }
        },
        titleFont: {
          size: 13,
          family: '__Inter_e66fe9',
        },
        bodyFont: {
          size: 13,
          family: '__Inter_e66fe9',
        },
        padding: 15,
        animation: {
          duration: 200
        },
        xAlign: 'center',
        yAlign: 'bottom'
      }
    },
    animation: {
      duration: 0,
      y: {
        type: 'number',
        duration: 200,
        easing: 'easeOutCubic',
      }
    }
  };


  return (
    <>
      <div className="py-5" style={{ height: '350px' }}>
        <Bar
          /*
         // @ts-ignore */
          options={options}
          data={data} />
      </div>
    </>
  );
}

export default BarChart;