// REPLACE your entire /planner/stats/:yearMonth endpoint with this debug version
// This will show you EXACTLY what's happening

router.get("/planner/stats/:yearMonth", verifyToken, async (req, res) => {
  try {
    const { yearMonth } = req.params;
    const userRef = db.collection("users").doc(req.uid);

    // Get month planner
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    const doc = await plannerRef.get();

    // Get templates
    const templatesRef = userRef.collection("taskTemplates");
    const templatesSnapshot = await templatesRef.get();

    const monthData = doc.exists ? doc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
    const templates = [];
    templatesSnapshot.forEach(doc => {
      templates.push({ id: doc.id, ...doc.data() });
    });

    console.log('\n=== STATS ENDPOINT DEBUG ===');
    console.log('Total tasks in monthData:', monthData.tasks.length);
    console.log('Tasks with specificDate:', monthData.tasks.filter(t => t.specificDate).map(t => ({
      name: t.name,
      specificDate: t.specificDate
    })));

    // Calculate stats for each day
    const dailyStats = [];
    const [year, month] = yearMonth.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${yearMonth}-${String(day).padStart(2, '0')}`;

      // FILTER WITH DEBUG
      const dayTasks = monthData.tasks.filter(task => {
        const hasSpecificDate = !!task.specificDate;
        const matchesDate = task.specificDate === date;
        const shouldInclude = !hasSpecificDate || matchesDate;
        
        // Log for the specific task
        if (task.name === "Schedule time with new friends") {
          console.log(`Day ${day} (${date}):`, {
            taskName: task.name,
            hasSpecificDate,
            specificDate: task.specificDate,
            matchesDate,
            shouldInclude
          });
        }
        
        // Exclude tasks that have a specificDate and it's not today
        if (task.specificDate && task.specificDate !== date) {
          return false;
        }
        return true;
      });
      
      templates.forEach(template => {
        const applicableDates = getApplicableDates(template, yearMonth);
        if (applicableDates.includes(date)) {
          const exception = monthData.exceptions?.[template.id]?.[date];
          if (!exception || !exception.isDeleted) {
            dayTasks.push(template);
          }
        }
      });

      const completed = monthData.completions[date]?.length || 0;

      const totalEstimatedTime = dayTasks.reduce((sum, task) => {
        return sum + (task.timeEstimate || 0);
      }, 0);

      const completedTime = dayTasks
        .filter(task => monthData.completions[date]?.includes(task.id))
        .reduce((sum, task) => sum + (task.timeEstimate || 0), 0);

      dailyStats.push({
        date,
        day,
        planned: dayTasks.length,
        completed,
        totalEstimatedTime,
        completedTime
      });
    }

    console.log('=== END DEBUG ===\n');

    res.json({ dailyStats });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});
