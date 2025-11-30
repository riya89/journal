import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function MoodChart({ data, theme }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No mood data available
      </div>
    );
  }

  const chartData = {
    labels: data.map(entry => {
      const date = new Date(entry.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: "Mood",
        data: data.map(entry => entry.mood),
        borderColor: theme === "dark" ? "#d4a574" : "#7A916C",
        backgroundColor: theme === "dark" ? "rgba(212, 165, 116, 0.1)" : "rgba(122, 145, 108, 0.1)",
        pointBackgroundColor: theme === "dark" ? "#d4a574" : "#7A916C",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: theme === "dark" ? "#d4a574" : "#7A916C",
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.9)",
        titleColor: theme === "dark" ? "#F4E9D8" : "#2F3A24",
        bodyColor: theme === "dark" ? "#EBDDBF" : "#5C6F4C",
        borderColor: theme === "dark" ? "#d4a574" : "#7A916C",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Mood: ${context.parsed.y}/5`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme === "dark" ? "#EBDDBF" : "#6B7A59",
          font: {
            size: 11,
          }
        }
      },
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          color: theme === "dark" ? "#EBDDBF" : "#6B7A59",
          font: {
            size: 11,
          }
        },
        grid: {
          color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div className="w-full h-64">
      <Line data={chartData} options={options} />
    </div>
  );
}
