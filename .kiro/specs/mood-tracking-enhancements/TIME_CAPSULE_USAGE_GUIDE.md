# Time Capsule Feature - Usage Guide

## Accessing the Feature

### From Mood Dashboard
1. Navigate to the Mood Dashboard page
2. Scroll to the bottom of the page
3. Click the "🕰️ View Time Capsules" button

### Direct URL
Navigate to `/time-capsule` in your browser

## Creating a Time Capsule

### Step 1: Open Creation Modal
1. Click the "✨ Create Time Capsule" button on the Time Capsule page
2. The creation modal will appear

### Step 2: Write Your Message
1. Enter your message in the large text area
2. Write as if you're talking to your future self
3. Share your current thoughts, feelings, hopes, or concerns
4. Character count is displayed below the text area

### Step 3: Choose Unlock Period
Select when you want the capsule to unlock:
- **30 days** (1 month) - Short-term reflection
- **90 days** (3 months) - Quarterly check-in
- **365 days** (1 year) - Annual reflection

The exact unlock date is shown below the selector.

### Step 4: Set Current Mood
Click on one of the 5 mood options:
- 😢 Very Low
- 😕 Low
- 😐 Neutral
- 🙂 Good
- 😊 Great

### Step 5: Add Goals (Optional)
1. Enter your current goals in the input fields
2. Click "+ Add Goal" to add more (up to 5 goals)
3. Click the ✕ button to remove a goal
4. Goals help you track progress when the capsule unlocks

### Step 6: Lock the Capsule
1. Click "🔒 Lock Capsule" to save
2. The capsule is now locked and cannot be viewed until the unlock date
3. You'll be returned to the main Time Capsule page

## Viewing Locked Capsules

### Locked Capsule Card Shows:
- Creation date
- Unlock date
- Countdown timer (days/months/years remaining)
- Lock icon 🔒
- Encouraging message about the locked content

### What You Cannot Do:
- View the message content
- Edit the capsule
- Delete the capsule (feature not yet implemented)

## Viewing Unlocked Capsules

### When a Capsule Unlocks:
- It automatically moves from "Locked" to "Unlocked" section
- The unlock happens at midnight on the unlock date
- Backend marks it as unlocked when you first access it

### Unlocked Capsule Card Shows:
- Creation date
- Unlock date
- Message preview (first few lines)
- Goals preview (first 3 goals)
- Sparkle icon ✨

### Opening an Unlocked Capsule:
1. Click anywhere on the unlocked capsule card
2. The detail modal will open

## Using the Capsule Detail Modal

### What You'll See:
1. **Full Message** - Your complete message from the past
2. **Mood Comparison** - Side-by-side view of past and current mood
3. **Goals Progress** - Checklist of your original goals
4. **Reflection Prompt** - Encouragement to reflect on growth

### Setting Your Current Mood:
1. If you haven't set it yet, you'll see 5 mood buttons
2. Click your current mood
3. The comparison will automatically calculate the change
4. You'll see if your mood improved, declined, or stayed stable

### Tracking Goal Progress:
1. Each goal has a checkbox
2. Click a goal to mark it as achieved
3. Achieved goals show:
   - Green background
   - Strikethrough text
   - Checkmark ✓
4. Progress counter shows "X out of Y goals achieved"
5. Celebration message appears when you check goals

### Closing the Modal:
- Click the × button in the top right
- Click the "Close" button at the bottom
- Click outside the modal

## Tips for Best Experience

### Writing Effective Messages:
- Be honest about your current feelings
- Share specific challenges you're facing
- Include hopes and dreams for the future
- Ask questions to your future self
- Mention current events or circumstances

### Setting Meaningful Goals:
- Be specific (not "exercise more" but "exercise 3x per week")
- Make them measurable
- Keep them realistic
- Focus on 2-3 important goals rather than many small ones

### Choosing the Right Unlock Period:
- **30 days**: Good for short-term goals or immediate challenges
- **90 days**: Perfect for seasonal changes or quarterly goals
- **365 days**: Best for major life changes or annual reflection

### Making the Most of Unlocked Capsules:
- Take time to read your message slowly
- Reflect on how you've changed
- Celebrate progress, even small wins
- Be kind to yourself about unmet goals
- Consider creating a new capsule based on insights

## Common Questions

### Can I edit a locked capsule?
No, once locked, capsules cannot be edited. This is intentional to preserve your authentic thoughts from that moment.

### Can I unlock a capsule early?
No, capsules remain locked until the unlock date. This creates anticipation and ensures meaningful time has passed.

### What happens if I forget about a capsule?
The backend will send a notification when it unlocks (if notifications are enabled). You can also check the Time Capsule page anytime.

### Can I delete a capsule?
Currently, deletion is not implemented. This may be added in a future update.

### How many capsules can I create?
There's no limit! Create as many as you'd like for different time periods.

### Can others see my capsules?
No, time capsules are completely private and only visible to you.

## Troubleshooting

### "Failed to create time capsule"
- Check your internet connection
- Ensure you've written a message (required field)
- Try refreshing the page and creating again

### "Failed to load time capsules"
- Check your internet connection
- Ensure you're logged in
- Try refreshing the page

### Capsule shows as locked but date has passed
- Click on the capsule to trigger the unlock
- The backend will automatically mark it as unlocked
- Refresh the page if needed

### Modal won't close
- Try clicking the × button
- Try clicking outside the modal
- Refresh the page as a last resort

## Privacy & Security

- All capsules are stored securely in Firebase
- Only you can access your capsules
- Messages are encrypted in transit
- Locked capsules cannot be accessed even by you until unlock date
- No one else (including admins) can read your capsules

## Keyboard Shortcuts

Currently, there are no keyboard shortcuts, but these may be added in the future:
- Escape to close modals
- Enter to submit forms
- Tab navigation through form fields

## Mobile Experience

The Time Capsule feature is fully responsive:
- Touch-friendly buttons and cards
- Optimized text sizes for mobile
- Scrollable content areas
- Full-screen modals on small screens
- Gesture support for closing modals

## Accessibility

The feature includes:
- Semantic HTML for screen readers
- Keyboard navigation support
- High contrast mode compatibility
- Clear visual indicators for interactive elements
- Descriptive labels for all form fields

## Integration with Other Features

### Mood Dashboard
- Access Time Capsules from the Mood Dashboard
- Mood data is consistent across features
- Capsule moods contribute to overall mood tracking

### Future Integrations (Planned)
- Link capsules to journal entries
- Include capsules in data exports
- Reference capsules in AI Assistant conversations
- Display capsule milestones in Growth Garden

## Best Practices

1. **Regular Creation**: Create a capsule every month or quarter
2. **Varied Periods**: Mix short and long-term capsules
3. **Honest Reflection**: Be authentic in your messages
4. **Goal Setting**: Include 2-3 meaningful goals
5. **Timely Review**: Open unlocked capsules promptly
6. **Thoughtful Comparison**: Take time with mood/goal tracking
7. **Continuous Growth**: Use insights to create new capsules

## Support

If you encounter issues or have questions:
1. Check this usage guide
2. Review the troubleshooting section
3. Check the browser console for errors
4. Contact support with specific error messages
