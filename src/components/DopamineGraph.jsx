export default function DopamineGraph({ dailyStats, theme }) {
  if (!dailyStats || dailyStats.length === 0) {
    return (
      <div className="text-center py-12 opacity-60">
        Complete some tasks to see your progress!
      </div>
    );
  }

  // Find max value for Y-axis
  const maxPlanned = Math.max(...dailyStats.map((s) => s.planned), 1);
  const graphHeight = 300;
  const graphWidth = dailyStats.length * 30;

  // Calculate points for the line
  const points = dailyStats.map((stat, index) => {
    const x = index * 30 + 15;
    const y = graphHeight - (stat.completed / maxPlanned) * (graphHeight - 40);
    return { x, y, ...stat };
  });

  return (
    <div
      className={`p-6 rounded-lg ${
        theme === "dark" ? "bg-[#2b241c]" : "bg-white"
      }`}
    >
      <h2 className="text-2xl font-bold mb-4">📊 Dopamine Tracker</h2>
      <p className="text-sm opacity-70 mb-6">
        Track your daily task completion and build momentum!
      </p>

      <div className="overflow-x-auto">
        <svg
          width={Math.max(graphWidth, 800)}
          height={graphHeight + 60}
          className="mx-auto"
        >
          {/* Y-axis labels */}
          {Array.from({ length: maxPlanned + 1 }, (_, i) => {
            const y = graphHeight - (i / maxPlanned) * (graphHeight - 40);
            return (
              <g key={i}>
                <line
                  x1="30"
                  y1={y}
                  x2={graphWidth + 30}
                  y2={y}
                  stroke={theme === "dark" ? "#3a2e20" : "#E6F0D1"}
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text
                  x="15"
                  y={y + 5}
                  fill={theme === "dark" ? "#EBDDBF" : "#7A916C"}
                  fontSize="12"
                  textAnchor="end"
                >
                  {i}
                </text>
              </g>
            );
          })}

          {/* Line graph */}
          <polyline
            points={points.map((p) => `${p.x + 30},${p.y}`).join(" ")}
            fill="none"
            stroke={theme === "dark" ? "#EBDDBF" : "#7A916C"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x + 30}
                cy={point.y}
                r="6"
                fill={theme === "dark" ? "#EBDDBF" : "#7A916C"}
                className="cursor-pointer hover:r-8 transition-all"
              />
              
              {/* Tooltip on hover */}
              <title>
                Day {point.day}: {point.completed}/{point.planned} tasks completed
              </title>

              {/* X-axis labels (every 5 days) */}
              {index % 5 === 0 && (
                <text
                  x={point.x + 30}
                  y={graphHeight + 20}
                  fill={theme === "dark" ? "#EBDDBF" : "#7A916C"}
                  fontSize="12"
                  textAnchor="middle"
                >
                  {point.day}
                </text>
              )}
            </g>
          ))}

          {/* X-axis line */}
          <line
            x1="30"
            y1={graphHeight}
            x2={graphWidth + 30}
            y2={graphHeight}
            stroke={theme === "dark" ? "#EBDDBF" : "#7A916C"}
            strokeWidth="2"
          />

          {/* Y-axis line */}
          <line
            x1="30"
            y1="20"
            x2="30"
            y2={graphHeight}
            stroke={theme === "dark" ? "#EBDDBF" : "#7A916C"}
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">
            {dailyStats.reduce((sum, s) => sum + s.completed, 0)}
          </div>
          <div className="text-sm opacity-70">Total Completed</div>
        </div>
        <div>
          <div className="text-2xl font-bold">
            {dailyStats.filter((s) => s.completed === s.planned && s.planned > 0).length}
          </div>
          <div className="text-sm opacity-70">Perfect Days</div>
        </div>
        <div>
          <div className="text-2xl font-bold">
            {dailyStats.filter((s) => s.completed > 0).length}
          </div>
          <div className="text-sm opacity-70">Active Days</div>
        </div>
      </div>
    </div>
  );
}
