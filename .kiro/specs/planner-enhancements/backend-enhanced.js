// ==========================================
// 📋 ENHANCED MONTHLY PLANNER ENDPOINTS
// ==========================================

// Helper function to calculate applicable dates for recurring tasks
function getApplicableDates(task, yearMonth) {
  if (!task.isRecurring) {
    return [];
  }
  
  const [year, month] = yearMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const applicableDates = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const dateStr = `${yearMonth}-${String(day).padStart(2, '0')}`;
    
    if (task.recurrenceType === 'daily') {
      applicableDates.push(dateStr);
    } else if (task.recurrenceType === 'weekly') {
      if (task.recurrenceDays && task.recurrenceDays.includes(dayOfWeek)) {
        applicableDates.push(dateStr);
      }
    }
  }
  
  return applicableDates;
}

// Helper function to apply exceptions to recurring tasks
function applyExceptions(task, date, exceptions) {
  if (!exceptions || !exceptions[task.id] || !exceptions[task.id][date]) {
    return task;
  }
  
  const exception = exceptions[task.id][date];
  
  // If deleted, return null to filter out
  if (exception.isDeleted) {
    return null;
  }
  
  // Apply overrides
  return {
    ...task,
    name: exception.nameOverride || task.name,
    category: exception.categoryOverride || task.category,
    timeEstimate: exception.timeEstimateOverride !== undefined ? exception.timeEstimateOverride : task.timeEstimate
  };
}

// 1. Get planner data for a specific month (ENHANCED)
router.get("/planner/:yearMonth", verifyToken, async (req, res) => {
  try {
    const { yearMonth } = req.params;
    const userRef = db.collection("users").doc(req.uid);
    
    // Get month-specific planner
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    const doc = await plannerRef.get();
    
    // Get recurring task templates (stored separately)
    const templatesRef = userRef.collection("taskTemplates");
    const templatesSnapshot = await templatesRef.get();
    
    const monthData = doc.exists ? doc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
    const templates = [];
    
    templatesSnapshot.forEach(doc => {
      templates.push({ id: doc.id, ...doc.data() });
    });
    
    // Combine regular tasks and recurring tasks
    const allTasks = [...monthData.tasks];
    
    // Add recurring tasks with their applicable dates
    templates.forEach(template => {
      const applicableDates = getApplicableDates(template, yearMonth);
      
      // Filter out deleted dates from exceptions
      const filteredDates = applicableDates.filter(date => {
        const exception = monthData.exceptions?.[template.id]?.[date];
        return !exception || !exception.isDeleted;
      });
      
      if (filteredDates.length > 0) {
        allTasks.push({
          ...template,
          applicableDates: filteredDates
        });
      }
    });
    
    // Sort by sortOrder
    allTasks.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    
    res.json({
      yearMonth,
      tasks: allTasks,
      completions: monthData.completions || {},
      exceptions: monthData.exceptions || {}
    });
  } catch (err) {
    console.error("Error fetching planner:", err);
    res.status(500).json({ error: "Failed to fetch planner" });
  }
});

// 2. Add/Update task (ENHANCED)
router.post("/planner/task", verifyToken, async (req, res) => {
  try {
    const { 
      yearMonth, 
      name, 
      category,
      isRecurring = false,
      recurrenceType = 'none',
      recurrenceDays = [],
      timeEstimate = null,
      editScope = 'all',
      specificDate = null,
      taskId = null // For editing existing tasks
    } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Validate recurrence
    if (recurrenceType === 'weekly' && (!recurrenceDays || recurrenceDays.length === 0)) {
      return res.status(400).json({ error: "Weekly recurrence requires at least one day selected" });
    }
    
    const userRef = db.collection("users").doc(req.uid);
    
    // EDITING EXISTING TASK
    if (taskId) {
      // Check if it's a recurring task template
      const templateRef = userRef.collection("taskTemplates").doc(taskId);
      const templateDoc = await templateRef.get();
      
      if (templateDoc.exists) {
        // Editing recurring task
        if (editScope === 'single' && specificDate) {
          // Create exception for single occurrence
          const plannerRef = userRef.collection("planners").doc(yearMonth);
          const plannerDoc = await plannerRef.get();
          const plannerData = plannerDoc.exists ? plannerDoc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
          
          if (!plannerData.exceptions) plannerData.exceptions = {};
          if (!plannerData.exceptions[taskId]) plannerData.exceptions[taskId] = {};
          
          plannerData.exceptions[taskId][specificDate] = {
            nameOverride: name,
            categoryOverride: category,
            timeEstimateOverride: timeEstimate,
            isDeleted: false,
            updatedAt: new Date().toISOString()
          };
          
          await plannerRef.set(plannerData);
          
          res.json({ 
            success: true, 
            message: "Single occurrence updated",
            affectedDates: [specificDate]
          });
        } else {
          // Update template (affects all future occurrences)
          await templateRef.update({
            name,
            category,
            timeEstimate,
            recurrenceType,
            recurrenceDays,
            updatedAt: new Date().toISOString()
          });
          
          const affectedDates = getApplicableDates({
            isRecurring: true,
            recurrenceType,
            recurrenceDays
          }, yearMonth);
          
          res.json({ 
            success: true, 
            message: "Template updated",
            affectedDates
          });
        }
      } else {
        // Editing non-recurring task
        const plannerRef = userRef.collection("planners").doc(yearMonth);
        const doc = await plannerRef.get();
        
        if (!doc.exists) {
          return res.status(404).json({ error: "Planner not found" });
        }
        
        const data = doc.data();
        const taskIndex = data.tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
          return res.status(404).json({ error: "Task not found" });
        }
        
        data.tasks[taskIndex] = {
          ...data.tasks[taskIndex],
          name,
          category,
          timeEstimate,
          updatedAt: new Date().toISOString()
        };
        
        await plannerRef.set(data);
        
        res.json({ 
          success: true, 
          task: data.tasks[taskIndex]
        });
      }
    } 
    // CREATING NEW TASK
    else {
      if (isRecurring) {
        // Create recurring task template
        const templatesRef = userRef.collection("taskTemplates");
        const newTemplateRef = templatesRef.doc();
        
        // Get current max sortOrder
        const allTemplatesSnapshot = await templatesRef.get();
        const maxOrder = allTemplatesSnapshot.docs.reduce((max, doc) => {
          const order = doc.data().sortOrder || 0;
          return order > max ? order : max;
        }, -1);
        
        const newTemplate = {
          name,
          category,
          isRecurring: true,
          recurrenceType,
          recurrenceDays,
          timeEstimate,
          sortOrder: maxOrder + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await newTemplateRef.set(newTemplate);
        
        const affectedDates = getApplicableDates(newTemplate, yearMonth);
        
        res.json({ 
          success: true, 
          task: { id: newTemplateRef.id, ...newTemplate },
          affectedDates
        });
      } else {
        // Create regular non-recurring task
        if (!yearMonth) {
          return res.status(400).json({ error: "yearMonth required for non-recurring tasks" });
        }
        
        const plannerRef = userRef.collection("planners").doc(yearMonth);
        const doc = await plannerRef.get();
        const data = doc.exists ? doc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
        
        const newTask = {
          id: `task_${Date.now()}`,
          name,
          category,
          isRecurring: false,
          timeEstimate,
          sortOrder: data.tasks.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        data.tasks.push(newTask);
        await plannerRef.set(data);
        
        res.json({ success: true, task: newTask });
      }
    }
  } catch (err) {
    console.error("Error adding/updating task:", err);
    res.status(500).json({ error: "Failed to save task" });
  }
});

// 3. Delete task (ENHANCED)
router.delete("/planner/task/:yearMonth/:taskId", verifyToken, async (req, res) => {
  try {
    const { yearMonth, taskId } = req.params;
    const { scope = 'all', date = null } = req.query;
    
    const userRef = db.collection("users").doc(req.uid);
    
    // Check if it's a recurring task template
    const templateRef = userRef.collection("taskTemplates").doc(taskId);
    const templateDoc = await templateRef.get();
    
    if (templateDoc.exists) {
      // Deleting recurring task
      if (scope === 'single' && date) {
        // Mark single occurrence as deleted via exception
        const plannerRef = userRef.collection("planners").doc(yearMonth);
        const plannerDoc = await plannerRef.get();
        const plannerData = plannerDoc.exists ? plannerDoc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
        
        if (!plannerData.exceptions) plannerData.exceptions = {};
        if (!plannerData.exceptions[taskId]) plannerData.exceptions[taskId] = {};
        
        plannerData.exceptions[taskId][date] = {
          isDeleted: true,
          deletedAt: new Date().toISOString()
        };
        
        // Remove completion for this date
        if (plannerData.completions[date]) {
          plannerData.completions[date] = plannerData.completions[date].filter(id => id !== taskId);
        }
        
        await plannerRef.set(plannerData);
        
        res.json({ success: true, message: "Single occurrence deleted" });
      } else {
        // Delete entire template
        await templateRef.delete();
        
        // Remove all completions for this task across all months
        // (You might want to clean up old planners, but for now just current month)
        const plannerRef = userRef.collection("planners").doc(yearMonth);
        const plannerDoc = await plannerRef.get();
        
        if (plannerDoc.exists) {
          const plannerData = plannerDoc.data();
          
          // Remove completions
          Object.keys(plannerData.completions || {}).forEach(date => {
            plannerData.completions[date] = plannerData.completions[date].filter(id => id !== taskId);
          });
          
          // Remove exceptions
          if (plannerData.exceptions && plannerData.exceptions[taskId]) {
            delete plannerData.exceptions[taskId];
          }
          
          await plannerRef.set(plannerData);
        }
        
        res.json({ success: true, message: "Template and all occurrences deleted" });
      }
    } else {
      // Deleting non-recurring task
      const plannerRef = userRef.collection("planners").doc(yearMonth);
      const doc = await plannerRef.get();
      
      if (!doc.exists) {
        return res.status(404).json({ error: "Planner not found" });
      }
      
      const data = doc.data();
      data.tasks = data.tasks.filter(t => t.id !== taskId);
      
      // Remove completions for this task
      Object.keys(data.completions).forEach(date => {
        data.completions[date] = data.completions[date].filter(id => id !== taskId);
      });
      
      await plannerRef.set(data);
      res.json({ success: true });
    }
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// 4. Toggle task completion (UNCHANGED - works with both types)
router.post("/planner/toggle", verifyToken, async (req, res) => {
  try {
    const { yearMonth, taskId, date, completed } = req.body;
    
    if (!yearMonth || !taskId || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const userRef = db.collection("users").doc(req.uid);
    const plannerRef = userRef.collection("planners").doc(yearMonth);
    const doc = await plannerRef.get();
    
    const data = doc.exists ? doc.data() : { yearMonth, tasks: [], completions: {}, exceptions: {} };
    
    if (!data.completions[date]) {
      data.completions[date] = [];
    }
    
    if (completed) {
      if (!data.completions[date].includes(taskId)) {
        data.completions[date].push(taskId);
      }
    } else {
      data.completions[date] = data.completions[date].filter(id => id !== taskId);
    }
    
    await plannerRef.set(data);
    res.json({ success: true });
  } catch (err) {
    console.error("Error toggling task:", err);
    res.status(500).json({ error: "Failed to toggle task" });
  }
});

// 5. Get stats for dopamine graph (ENHANCED with time estimates)
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
    
    // Calculate stats for each day
    const dailyStats = [];
    const [year, month] = yearMonth.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${yearMonth}-${String(day).padStart(2, '0')}`;
      
      // Get all tasks for this day (regular + recurring)
      const dayTasks = [...monthData.tasks];
      
      templates.forEach(template => {
        const applicableDates = getApplicableDates(template, yearMonth);
        if (applicableDates.includes(date)) {
          // Check if not deleted via exception
          const exception = monthData.exceptions?.[template.id]?.[date];
          if (!exception || !exception.isDeleted) {
            dayTasks.push(template);
          }
        }
      });
      
      const completed = monthData.completions[date]?.length || 0;
      
      // Calculate time estimates
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
    
    res.json({ dailyStats });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// 6. NEW: Reorder tasks
router.put("/planner/task/reorder", verifyToken, async (req, res) => {
  try {
    const { yearMonth, taskOrders } = req.body;
    
    if (!taskOrders || !Array.isArray(taskOrders)) {
      return res.status(400).json({ error: "taskOrders array required" });
    }
    
    const userRef = db.collection("users").doc(req.uid);
    const batch = db.batch();
    
    // Update both regular tasks and templates
    for (const { taskId, sortOrder } of taskOrders) {
      // Check if it's a template
      const templateRef = userRef.collection("taskTemplates").doc(taskId);
      const templateDoc = await templateRef.get();
      
      if (templateDoc.exists) {
        batch.update(templateRef, { sortOrder });
      } else {
        // It's a regular task - update in planner document
        const plannerRef = userRef.collection("planners").doc(yearMonth);
        const plannerDoc = await plannerRef.get();
        
        if (plannerDoc.exists) {
          const data = plannerDoc.data();
          const taskIndex = data.tasks.findIndex(t => t.id === taskId);
          
          if (taskIndex !== -1) {
            data.tasks[taskIndex].sortOrder = sortOrder;
            batch.set(plannerRef, data);
          }
        }
      }
    }
    
    await batch.commit();
    res.json({ success: true });
  } catch (err) {
    console.error("Error reordering tasks:", err);
    res.status(500).json({ error: "Failed to reorder tasks" });
  }
});

// 7. NEW: Get all recurring task templates
router.get("/planner/templates", verifyToken, async (req, res) => {
  try {
    const userRef = db.collection("users").doc(req.uid);
    const templatesRef = userRef.collection("taskTemplates");
    const snapshot = await templatesRef.orderBy("sortOrder", "asc").get();
    
    const templates = [];
    snapshot.forEach(doc => {
      templates.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ templates });
  } catch (err) {
    console.error("Error fetching templates:", err);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

export default router;
