# Fix: PostJournalCheckModal Not Showing

## Problem
The `PostJournalCheckModal` component exists and the backend endpoint `/post-save-check` works, but the modal never shows after saving a journal entry.

## Solution
Add state and logic to trigger the modal after journal save completes.

---

## Changes Needed in `src/pages/Home.jsx`

### 1. Add Import
At the top of the file, add:
```javascript
import PostJournalCheckModal from "../components/PostJournalCheckModal";
```

### 2. Add State
Add this state near the other useState declarations:
```javascript
const [showPostJournalCheck, setShowPostJournalCheck] = useState(false);
const [postJournalDate, setPostJournalDate] = useState(null);
```

### 3. Add Handler Function
Add this function to handle when journal save completes:
```javascript
const handleJournalSaved = (date) => {
  console.log("📝 Journal saved for date:", date);
  setPostJournalDate(date);
  setShowPostJournalCheck(true);
};
```

### 4. Update JournalModal
Change the JournalModal component to pass the onSaved callback:
```javascript
{showModal && (
  <JournalModal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    theme={theme}
    selectedDate={selectedDate}
    user={user}
    onSaved={handleJournalSaved}  // ← ADD THIS
  />
)}
```

### 5. Add PostJournalCheckModal
Add this right after the JournalModal (before StreakRecoveryModal):
```javascript
{/* 📋 Post-Journal Task Check Modal */}
{showPostJournalCheck && postJournalDate && (
  <PostJournalCheckModal
    date={postJournalDate}
    onClose={() => {
      setShowPostJournalCheck(false);
      setPostJournalDate(null);
    }}
    theme={theme}
    user={user}
  />
)}
```

---

## Changes Needed in `src/components/JournalModal.jsx`

### 1. Add onSaved Prop
Update the component function signature to accept `onSaved`:
```javascript
export default function JournalModal({ 
  isOpen, 
  onClose, 
  theme, 
  selectedDate, 
  user,
  onSaved  // ← ADD THIS
}) {
```

### 2. Call onSaved After Successful Save
Find the `handleSave` function (or wherever journal save happens) and after successful save, call:
```javascript
const handleSave = async () => {
  // ... existing save logic ...
  
  try {
    const res = await fetch(`${API_BASE_URL}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        content,
        mood,
        answers,
        prompts,
        date: selectedDate,
        photoURL,
      }),
    });
    
    await res.json();
    setSaving(false);
    setSaved(true);
    
    // ✨ ADD THIS: Trigger post-journal check
    if (onSaved) {
      onSaved(selectedDate);
    }
    
    setTimeout(() => {
      setSaved(false);
      onClose(); // Close journal modal
    }, 1500);
    
  } catch (err) {
    console.error("❌ Failed to save journal:", err);
    alert("Could not save entry. Please try again.");
    setSaving(false);
  }
};
```

---

## Flow After Implementation

1. User writes journal entry
2. User clicks "Save"
3. Journal saves to backend
4. JournalModal calls `onSaved(date)`
5. Home.jsx sets `showPostJournalCheck = true`
6. PostJournalCheckModal appears
7. Modal fetches tasks for that date from `/post-save-check`
8. If tasks exist and some are incomplete, modal shows them
9. User can mark tasks as complete
10. Modal closes

---

## Testing

1. **Create some tasks** in Monthly Planner for today
2. **Write a journal entry** for today
3. **Save the journal**
4. **Expected:** PostJournalCheckModal should appear asking if you completed your tasks
5. **If no tasks:** Modal won't show (this is correct behavior)

---

## Debug

If modal still doesn't show, check:

1. **Console logs:** Look for "📝 Journal saved for date: YYYY-MM-DD"
2. **Backend logs:** Check if `/post-save-check` is being called
3. **Tasks exist:** Make sure you have tasks planned for today in the planner
4. **Tasks incomplete:** Modal only shows if there are incomplete tasks

---

This completes the integration! The modal will now show after journal save to remind users about their planned tasks. 📋✅
