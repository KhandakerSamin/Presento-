# Topic Assignment System - User Guide

## Overview
The Topic Assignment System provides 4 flexible modes for assigning presentation topics to student groups. Teachers can choose and switch between modes easily with a checkbox toggle.

---

## ✅ Getting Started

### 1. Navigate to Section Details
- Go to your section dashboard
- Click on a section to open the section detail page
- Scroll to the **"🎯 Assigned Topic"** section at the top

### 2. Enable Topic Assignment
- Check the **"Assigned Topic"** checkbox
- The 4 mode options will appear below

### 3. Select a Mode
- Click on the desired option to activate it
- The mode will be saved automatically to both local storage and database

---

## 📌 Mode 1: Manual Assignment

**Best for:** Complete control over topic distribution

### How It Works:
- All groups get an **"Add Topic"** button
- Teachers manually assign one topic per group
- Topics can be edited anytime

### Usage Steps:
1. Check the **"Assigned Topic"** checkbox
2. Select **"📌 Option 1: Manual Assignment"**
3. Groups section appears showing all groups
4. Click **"+ Add Topic"** or **"✓ {Topic}"** button on each group
5. Enter the topic name in the modal dialog
6. Click **"Save Topic"**

### When to Use:
- Small number of groups (< 10)
- Want to balance topics carefully
- Need full control over assignments

---

## 🎲 Mode 2: Serial Add & Random Distribution

**Best for:** Large number of groups with many topics

### How It Works:
- Add topics one by one using an input field
- Once all topics are added, click a button to distribute
- Automatically assigns random topics to up to 10 groups
- Each group gets one random topic

### Usage Steps:
1. Check the **"Assigned Topic"** checkbox
2. Select **"🎲 Option 2: Serial Add & Random"**
3. In the "Add Topics" section:
   - Type a topic name
   - Press Enter or click **"Add"**
   - Repeat for each topic
4. Click **"🎲 Give All Groups Randomly"** button
5. System will randomly assign topics to unassigned groups (max 10)

### Features:
- ✓ Remove topics by clicking the ✕ on topic tags
- ✓ See total topic count
- ✓ See how many groups are waiting for assignment
- ✓ Topics recycle if there are more groups than topics

### When to Use:
- Many topics to distribute
- Want randomization to be fair
- Quick bulk assignment needed

---

## 👥 Mode 3: Student Selection

**Best for:** Student autonomy with teacher control

### How It Works:
- Teacher provides list of topics
- Students select from dropdown when their group is complete
- Can be configured for single or multiple selections
- Provides student autonomy while maintaining teacher oversight

### Usage Steps:

#### Teacher Setup:
1. Check the **"Assigned Topic"** checkbox
2. Select **"👥 Option 3: Student Selection"**
3. Add topics one by one in the "Add Available Topics" section
4. Choose **"Allow Multiple Selections"** option:
   - ✓ Checked: Multiple groups can select same topic, one group can have multiple
   - ✗ Unchecked: Topics get marked "(Taken)" after first selection, one topic per group
5. Click **"✓ Set Topics for Student Selection"**

#### Student Flow:
1. Student joins a group (reaches required group size)
2. A dropdown appears: "Select Topic"
3. Students select from available topics
4. Selection is confirmed immediately

### Configuration Options:
- **Single Selection (Default):** Each group picks one topic; topics marked as "(Taken)" when picked
- **Multiple Selection:** Multiple groups can select same topic; one group can have multiple topics

### When to Use:
- Want to give students choice
- Prefer distributed decision-making
- Topics aren't limited resources
- Want to avoid teacher bottleneck

---

## 💡 Mode 4: Review Proposals

**Best for:** Student creativity and teacher review

### How It Works:
- Students propose their own topics after group is formed
- Students provide reason for their topic choice (optional)
- Teachers review all proposals and approve/reject
- Rejected proposals can be resubmitted

### Usage Steps:

#### Teacher Setup:
1. Check the **"Assigned Topic"** checkbox
2. Select **"💡 Option 4: Review Proposals"**
3. System is ready; no additional configuration needed
4. Wait for students to submit proposals

#### Student Flow:
1. Group formation is complete
2. **"Submit Topic Proposal"** form appears
3. Enter topic name
4. (Optional) Explain why they chose this topic
5. Click **"Submit Proposal"**
6. Status shows: "Topic proposal pending"

#### Teacher Review:
1. Check **"💡 Option 4"** in the Assigned Topic section
2. See pending proposals count
3. For each proposal:
   - View group number and members
   - See proposed topic
   - See student's reasoning
   - Click **"✓ Approve"** or **"✕ Reject"**
4. Rejected proposals show as rejected to students
5. Students can resubmit new proposals

### Features:
- ✓ See proposal statistics (Total, Pending, Approved)
- ✓ View student reasoning
- ✓ Quick approve/reject buttons
- ✓ Feedback on proposal status

### When to Use:
- Students have creative autonomy
- Want to review topics before approval
- Need to ensure topic quality/relevance
- Want to see student reasoning

---

## 🔄 Switching Between Modes

### Important Notes:
- Topics and settings are preserved when switching modes
- Previously assigned topics remain in groups
- Student selections are remembered
- No data is lost when changing modes

### Example Switch:
1. Started with Mode 1 (Manual)
2. Realized it's taking too long
3. Uncheck and recheck "Assigned Topic"
4. Select Mode 2 (Random)
5. Previously manually assigned topics are kept
6. New topics can be added and randomly assigned to remaining groups

---

## 📊 Dashboard Overview

### Stats Displayed:
- **Total Groups:** All groups in the section
- **Groups Without Topics:** Groups pending topic assignment
- **Approved:** Topics that have been approved
- **Pending:** Topics waiting for teacher review (Mode 4)

### Quick Access:
- All modes have different color themes for easy identification
- Mode 1: Blue (📌)
- Mode 2: Purple (🎲)
- Mode 3: Cyan (👥)
- Mode 4: Green (💡)

---

## ⚙️ Configuration Tips

### Choosing Topics:
- **Mode 1-2:** Any number of topics (1+)
- **Mode 3:** 5-20 topics recommended
- **Mode 4:** No predefined topics needed

### Group Size Considerations:
- All modes wait for group to reach full size before allowing topic assignment
- Check section settings for group size

### Timing:
- Mode 1-2: Can assign anytime
- Mode 3: Assignment happens when group reaches full size
- Mode 4: Proposals come after group formation

---

## 🐛 Troubleshooting

### Checkbox Won't Check
- Refresh the page
- Check browser cache/localStorage
- Verify user permissions

### Topics Not Saving
- Ensure internet connection
- Check Supabase database connectivity
- Reload page if stuck

### Students Can't Select
- Verify group is at full size
- Check that Mode 3 is properly saved
- Ensure topics were added before activation

### Mode Switch Issues
- Uncheck and recheck the main checkbox
- Wait a moment for sync to complete
- Try refreshing page

---

## 🎯 Best Practices

1. **Plan Ahead:** Decide on mode before section starts
2. **Clear Instructions:** Tell students which mode you're using
3. **Test First:** Try with one group before full rollout
4. **Monitor Progress:** Check dashboard regularly
5. **Communicate:** Update section status if switching modes
6. **Review Settings:** Double-check mode configuration before students access

---

## 🔐 Security Notes

- Only teachers can configure modes
- Students can only access their group's assignment interface
- Teacher can reject/modify proposals anytime
- All changes are logged in database

---

## 📝 Examples

### Scenario 1: 30 Groups, Limited Time
- **Mode:** 2 (Serial Add & Random)
- **Process:** Add 10-15 topics → Random assign to 10 groups at a time
- **Benefit:** Quick, fair distribution without manual effort

### Scenario 2: 10 Groups, Want Fairness
- **Mode:** 1 (Manual)
- **Process:** Manually verify each group → Assign balanced topics
- **Benefit:** Full control, can balance workload

### Scenario 3: 15 Groups, Student Preference
- **Mode:** 3 (Student Selection)
- **Topics:** Add 8-10 topics → Allow selection with single selection mode
- **Benefit:** Students get choice, topics auto-managed

### Scenario 4: 20 Groups, Academic Evaluation
- **Mode:** 4 (Proposals)
- **Process:** Wait for proposals → Review quality → Approve/Reject
- **Benefit:** Ensures topic relevance, evaluates student judgment
