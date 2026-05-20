# Developer Quick Reference

## Component API Reference

### AssignedTopicSection

```tsx
<AssignedTopicSection 
  section={section}      // Section object with assignment settings
  groups={groups || []}  // Array of Group objects
/>
```

**Props:**
- `section: Section` - Current section with topic assignment config
- `groups: Group[]` - All groups in the section

**State:**
- `enabled: boolean` - Feature toggle state
- `mode: string | null` - Current mode (manual, serial_random, student_select, proposal)

**Key Functions:**
- `toggleEnabled()` - Toggle feature on/off
- `useEffect()` - Auto-save with debounce

---

### GroupTopicButton

```tsx
<GroupTopicButton 
  group={group}
  isTeacher={true}
/>
```

**Props:**
- `group: Group` - Group object with optional topic
- `isTeacher?: boolean` - Show teacher UI (default: true)

**Features:**
- Modal dialog for topic input
- Displays group members
- Shows topic status with colors
- Auto-refreshes on save

---

### GroupList

```tsx
<GroupList 
  groups={groups}
  section={section}
/>
```

**Props:**
- `groups: Group[]` - Array of groups
- `section: Section` - Section object (for checking mode)

**Displays:**
- Only renders when `section.topic_assignment_mode === "manual"`
- Shows group cards with member lists
- Includes GroupTopicButton for each group

---

## Database Schema

### Sections Table (New Columns)

```sql
topic_assignment_enabled BOOLEAN -- Toggle feature
topic_assignment_mode VARCHAR(20) -- Current mode
  -- Values: 'manual', 'serial_random', 'student_select', 'proposal'
topics JSONB -- Array of topic strings
allow_multiple_selection BOOLEAN -- For mode 3
```

### Groups Table (New Columns)

```sql
topic_proposal_reason TEXT -- Student's reasoning for proposal (mode 4)
```

---

## Mode Implementation Details

### Mode 1: Manual (ManualAssignmentUI)

```tsx
// Renders:
- Stats card (total groups, without topics)
- Activate button

// Flow:
1. User clicks "Activate Manual Assignment"
2. Mode set to "manual"
3. GroupList component displays
4. Each group shows GroupTopicButton
5. Teacher clicks button and enters topic
6. Database updates, page refreshes
```

### Mode 2: Serial Random (SerialRandomUI)

```tsx
// Renders:
- Input field + "Add" button
- Topic pills with remove button
- Stats showing topics count
- "Give All Groups Randomly" button

// Flow:
1. Teacher enters topic name
2. Press Enter or click "Add"
3. Topic appears as pill
4. Repeat for multiple topics
5. Click "Random Assign" button
6. System picks random topic for each group (up to 10)
7. Assignments saved to database
```

### Mode 3: Student Selection (StudentSelectionUI)

```tsx
// Renders:
- Topic input + "Add" button
- Topic pills
- "Allow Multiple Selections" checkbox
- "Set Topics for Student Selection" button

// Flow:
1. Teacher adds available topics
2. Toggles multiple selection option
3. Clicks "Set Topics" button
4. Mode saved to database
5. When group reaches full size:
   - Student sees dropdown with topics
   - Selects topic from list
   - Auto-approved (if not multiple) or pending (if multiple)
```

### Mode 4: Proposal Review (ProposalReviewUI)

```tsx
// Renders:
- Stats cards (total, pending, approved)
- Pending proposals list
- For each proposal:
  - Group info
  - Proposed topic
  - Student reasoning
  - Approve/Reject buttons

// Flow:
1. Mode saved as "proposal"
2. When group is full:
   - Student sees proposal form
   - Enters topic + reasoning
   - Status: "pending"
3. Teacher clicks "Review Proposals"
4. Views all pending proposals
5. Approves or rejects
6. Status updates in real-time
```

---

## Client-Side State Flow

```
User toggles checkbox
        ↓
toggleEnabled() called
        ↓
State updated (enabled, mode)
        ↓
useEffect() triggered
        ↓
Debounce timer (500ms)
        ↓
Supabase update()
        ↓
localStorage.setItem()
        ↓
router.refresh()
        ↓
UI Updates
```

---

## Student Experience Flow

### Mode 3: Student Selection

```
Student joins group
        ↓
Group reaches max members
        ↓
Page auto-detects section.topic_assignment_mode === 'student_select'
        ↓
Topic selection form appears
        ↓
Student clicks dropdown
        ↓
See available topics (with "Taken" label if taken)
        ↓
Select topic
        ↓
Click "Confirm Selection"
        ↓
Topic auto-approved
        ↓
Group now has topic
```

### Mode 4: Proposal

```
Student joins group
        ↓
Group reaches max members
        ↓
Page auto-detects section.topic_assignment_mode === 'proposal'
        ↓
Topic proposal form appears
        ↓
Enter topic + reasoning
        ↓
Click "Submit Proposal"
        ↓
Status: "Topic proposal pending"
        ↓
Teacher reviews
        ↓
Teacher approves/rejects
        ↓
Student notified of decision
        ↓
If rejected: Can resubmit
```

---

## Error Handling

### Validation

```tsx
// Before saving topic
if (!topic.trim()) {
  alert("Please enter a topic");
  return;
}

// Before random assign
if (topics.length === 0) {
  alert("Please add at least one topic first");
  return;
}

// Duplicate topic check
if (topics.includes(trimmed)) {
  alert("Topic already exists");
  return;
}
```

### Database Error Handling

```tsx
const { error } = await supabase.from("sections").update(data).eq("id", id);
if (error) {
  console.error("Error saving:", error);
  alert("Failed to save: " + error.message);
  return;
}
```

### Loading States

```tsx
const [loading, setLoading] = useState(false);

// While saving
setLoading(true);
// ... database operation
setLoading(false);

// In UI
disabled={loading}
className="...disabled:opacity-50"
```

---

## Styling Conventions

### Colors by Mode

- **Mode 1 (Manual):** Blue (`bg-blue-*`, `text-blue-*`)
- **Mode 2 (Random):** Purple (`bg-purple-*`, `text-purple-*`)
- **Mode 3 (Selection):** Cyan (`bg-cyan-*`, `text-cyan-*`)
- **Mode 4 (Proposal):** Green (`bg-green-*`, `text-green-*`)

### Status Badges

```tsx
// Pending: Amber
bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300

// Approved: Green
bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300

// Rejected: Red
bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300
```

### Modal Pattern

```tsx
{showModal && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800 w-full max-w-md">
      {/* Header, content, footer */}
    </div>
  </div>
)}
```

---

## Key Files to Modify

### Adding New Feature
1. Update `src/types/index.ts` - Add new fields
2. Create component in `src/components/teacher/`
3. Update `src/app/teacher/sections/[id]/page.tsx` - Import and display
4. Update `src/app/section/[code]/ClientSectionView.tsx` - Student view

### Bug Fixes
1. Check console logs in browser
2. Verify Supabase queries in Network tab
3. Check component re-renders (React DevTools)
4. Validate form inputs

### Performance
1. Check rendering with React DevTools Profiler
2. Monitor database queries (Supabase dashboard)
3. Profile large datasets (groups > 100)
4. Optimize topic lists with memoization

---

## Testing Helper Code

```tsx
// Mock section for testing
const mockSection = {
  id: "123",
  section_code: "CS101-A",
  topic_assignment_enabled: true,
  topic_assignment_mode: "manual",
  topics: ["AI", "Web Dev", "Mobile"],
  allow_multiple_selection: false
};

// Mock groups
const mockGroups = [
  {
    id: "g1",
    group_number: 1,
    topic: "AI",
    topic_status: "approved",
    students: [
      { id: "s1", name: "John", student_id: "001" }
    ]
  }
];
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Mode not saving | Network error | Check internet, refresh |
| Topic not appearing | DB sync delayed | Wait 500ms, refresh |
| Dropdown empty | Topics not added | Add topics first |
| Student form missing | Group not full | Wait for full group |
| Modal won't close | onClick handler missing | Check modal close button |
| Dark mode broken | Tailwind config issue | Verify dark: prefix |

---

## Deployment Checklist

- [ ] Database migrations run
- [ ] New fields exist in tables
- [ ] Component imports work
- [ ] Types compile correctly
- [ ] No console errors
- [ ] Test all 4 modes
- [ ] Test switching modes
- [ ] Test dark mode
- [ ] Test mobile view
- [ ] Verify performance
- [ ] Monitor error rates
