# Teacher Dashboard - Architecture & Reference

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            React Client Components                      │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ TeacherLayout + DashboardSidebar              │   │   │
│  │  │  - Navigation                                 │   │   │
│  │  │  - Responsive sidebar                         │   │   │
│  │  │  - Layout wrapper                             │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ Page Components                                │   │   │
│  │  │  - Dashboard (stats)                          │   │   │
│  │  │  - Presentations list                         │   │   │
│  │  │  - Upload form                                │   │   │
│  │  │  - Edit form                                  │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ Feature Components                             │   │   │
│  │  │  - DashboardStats                             │   │   │
│  │  │  - PresentationsGrid                          │   │   │
│  │  │  - UploadPresentationForm                     │   │   │
│  │  │  - EditPresentationForm                       │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ Hooks (Data Fetching)                          │   │   │
│  │  │  - useTeacherSections                         │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                       │
│                   API Calls (Supabase)                           │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS SERVER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Server Actions (lib/presentations/actions.ts)          │   │
│  │  - createPresentation()                                │   │
│  │  - updatePresentation()                                │   │
│  │  - deletePresentation()                                │   │
│  │  - getPresentation()                                   │   │
│  │  - getAllPresentations()                               │   │
│  │  - getDashboardStats()                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Page Rendering (SSR/SSG)                               │   │
│  │  - dashboard/page.tsx                                  │   │
│  │  - presentations/page.tsx                              │   │
│  │  - presentations/upload/page.tsx                       │   │
│  │  - presentations/[id]/edit/page.tsx                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                       │
│                   Supabase REST API                              │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────┐  ┌─────────────────────────┐ │
│  │   PostgreSQL Database        │  │   Storage Bucket        │ │
│  │  ┌──────────────────────────┐│  │ (presentations)         │ │
│  │  │ presentations table      ││  │                         │ │
│  │  │  - id (UUID)             ││  │ File Structure:         │ │
│  │  │  - teacher_id (FK)       ││  │  presentations/         │ │
│  │  │  - title (VARCHAR)       ││  │  └── {user_id}/         │ │
│  │  │  - description (TEXT)    ││  │      ├── thumbnails/    │ │
│  │  │  - course_code           ││  │      └── {filename}.pdf │ │
│  │  │  - course_name           ││  │                         │ │
│  │  │  - department            ││  └─────────────────────────┘ │
│  │  │  - semester              ││                             │ │
│  │  │  - tags (ARRAY)          ││                             │ │
│  │  │  - file_path             ││                             │ │
│  │  │  - file_size (BIGINT)    ││                             │ │
│  │  │  - file_format           ││                             │ │
│  │  │  - thumbnail_path        ││                             │ │
│  │  │  - views (INTEGER)       ││                             │ │
│  │  │  - downloads (INTEGER)   ││                             │ │
│  │  │  - is_published          ││                             │ │
│  │  │  - created_at            ││                             │ │
│  │  │  - updated_at            ││                             │ │
│  │  └──────────────────────────┘│                             │ │
│  │  Indexes:                     │                             │ │
│  │  - idx_presentations_teacher  │                             │ │
│  │  - idx_presentations_created  │                             │ │
│  └──────────────────────────────┘                             │ │
│  ┌──────────────────────────────┐                             │ │
│  │   Row Level Security (RLS)   │                             │ │
│  │  - Teachers can see own      │                             │ │
│  │  - Public can see published  │                             │ │
│  │  - No cross-teacher access   │                             │ │
│  └──────────────────────────────┘                             │ │
│  ┌──────────────────────────────┐                             │ │
│  │   Authentication (auth.users)│                             │ │
│  │  - User sessions             │                             │ │
│  │  - JWT tokens                │                             │ │
│  │  - User metadata             │                             │ │
│  └──────────────────────────────┘                             │ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Upload Presentation Flow

```
User fills form
      ↓
Validate inputs (client-side)
      ↓
Upload thumbnail to Storage
      ↓
Upload presentation file to Storage
      ↓
Call createPresentation() server action
      ↓
Server inserts record in database
      ↓
RLS policy validates teacher_id
      ↓
Return success
      ↓
Show toast notification
      ↓
Redirect to presentations list
```

### View Presentations Flow

```
Visit /teacher/presentations
      ↓
Server-side page rendering
      ↓
Fetch user from Supabase auth
      ↓
Query presentations where teacher_id = user.id
      ↓
RLS policy allows (matches teacher_id)
      ↓
Pass data to <PresentationsGrid>
      ↓
Client renders grid with data
      ↓
User can edit/delete presentations
```

### Edit Presentation Flow

```
Click edit button
      ↓
Navigate to /teacher/presentations/[id]/edit
      ↓
Server fetches presentation by ID
      ↓
RLS policy validates ownership
      ↓
Render EditPresentationForm with data
      ↓
User updates form fields
      ↓
Submit form
      ↓
Call updatePresentation() server action
      ↓
Server updates database record
      ↓
RLS policy validates teacher_id
      ↓
Return success
      ↓
Redirect to presentations list
```

---

## Component Hierarchy

```
TeacherLayout
├── DashboardSidebar
│   ├── Logo Section
│   ├── Navigation Menu
│   │   ├── Dashboard Link
│   │   ├── Presentations Link
│   │   └── Upload Link
│   └── Footer
└── Main Content Area
    └── Page Content
        ├── Dashboard Page
        │   ├── Header
        │   ├── DashboardStats
        │   │   ├── StatCard (uploads)
        │   │   ├── StatCard (views)
        │   │   ├── StatCard (downloads)
        │   │   └── StatCard (recent)
        │   └── Quick Actions
        │
        ├── Presentations Page
        │   ├── Header + Upload Button
        │   └── PresentationsGrid
        │       └── PresentationCard (repeating)
        │           ├── Thumbnail
        │           ├── Title/Metadata
        │           ├── Stats (views/downloads/date)
        │           └── Actions (edit/delete)
        │
        ├── Upload Page
        │   ├── Header
        │   └── UploadPresentationForm
        │       ├── Title Input
        │       ├── Description TextArea
        │       ├── Course Fields
        │       ├── Department/Semester
        │       ├── Tags Manager
        │       ├── Thumbnail Upload
        │       ├── File Upload
        │       └── Submit Button
        │
        └── Edit Page
            ├── Header
            └── EditPresentationForm
                ├── Title Input
                ├── Description TextArea
                ├── Course Fields
                ├── Department/Semester
                ├── Tags Manager
                ├── Current Thumbnail Display
                ├── Thumbnail Upload
                └── Save Button
```

---

## State Management

### Client-Side State (React Hooks)

```
useTeacherSections()
├── presentations: Presentation[]
├── stats: DashboardStats
├── loading: boolean
├── error: Error | null
└── refetch: () => Promise<void>

Component-Local State
├── Form Data (formData object)
├── Loading (boolean)
├── Error (string)
├── Success (boolean)
├── File uploads (File objects)
└── Tag input (string)
```

### Server-Side State (Database)

```
Presentations Table
├── Metadata (title, description, course, etc.)
├── File References (file_path, thumbnail_path)
├── Statistics (views, downloads)
├── Timestamps (created_at, updated_at)
└── User Association (teacher_id)
```

---

## Type Definitions

```typescript
type Presentation = {
  id: string;                    // UUID
  teacher_id: string;            // FK to auth.users
  title: string;                 // Presentation name
  description?: string | null;   // Optional description
  course_code?: string | null;   // e.g., CS101
  course_name?: string | null;   // e.g., Web Dev
  department?: string | null;    // e.g., Computer Science
  semester?: string | null;      // e.g., Spring 2024
  tags?: string[];               // Array of tags
  file_path: string;             // Storage path
  file_size: number;             // Bytes
  file_format: string;           // pdf, pptx, ppt
  thumbnail_path?: string | null;// Storage URL
  views: number;                 // View count
  downloads: number;             // Download count
  is_published: boolean;         // Visibility
  created_at: string;            // ISO timestamp
  updated_at: string;            // ISO timestamp
}

type DashboardStats = {
  totalUploads: number;          // Total presentations
  totalViews: number;            // Sum of all views
  totalDownloads: number;        // Sum of all downloads
  recentUploads: number;         // Uploads in last 30 days
}
```

---

## API/Server Action Methods

### Presentation CRUD

```typescript
// Create
createPresentation(input: CreatePresentationInput): Promise<Presentation>

// Read
getPresentation(id: string): Promise<Presentation>
getAllPresentations(): Promise<Presentation[]>

// Update
updatePresentation(id: string, input: UpdatePresentationInput): Promise<Presentation>

// Delete
deletePresentation(id: string): Promise<void>

// Stats
getDashboardStats(): Promise<DashboardStats>
```

---

## File Size & Format Requirements

### Presentation Files
- **Formats**: PDF, PPTX (PowerPoint)
- **Max Size**: 100 MB
- **Accepted MIME Types**:
  - `application/pdf`
  - `application/vnd.openxmlformats-officedocument.presentationml.presentation`

### Thumbnail Images
- **Formats**: JPG, PNG
- **Max Size**: 5 MB
- **Accepted MIME Types**: `image/*`
- **Recommended**: 16:9 aspect ratio, 500x300px or larger

---

## Database Queries

### Get All Presentations for Teacher

```sql
SELECT * 
FROM presentations 
WHERE teacher_id = $1 
ORDER BY created_at DESC;
```

### Get Dashboard Statistics

```sql
SELECT 
  COUNT(*) as total_uploads,
  SUM(views) as total_views,
  SUM(downloads) as total_downloads,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_uploads
FROM presentations 
WHERE teacher_id = $1;
```

### Get Single Presentation

```sql
SELECT * 
FROM presentations 
WHERE id = $1 AND teacher_id = $2;
```

---

## Security & Permissions

### Row Level Security Policies

```sql
-- Teachers can view their own presentations
CREATE POLICY "Teachers can view own presentations" ON presentations
  FOR SELECT USING (auth.uid() = teacher_id);

-- Teachers can create presentations
CREATE POLICY "Teachers can insert presentations" ON presentations
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

-- Teachers can edit their own presentations
CREATE POLICY "Teachers can update own presentations" ON presentations
  FOR UPDATE USING (auth.uid() = teacher_id);

-- Teachers can delete their own presentations
CREATE POLICY "Teachers can delete own presentations" ON presentations
  FOR DELETE USING (auth.uid() = teacher_id);

-- Public can view published presentations
CREATE POLICY "Everyone can view published presentations" ON presentations
  FOR SELECT USING (is_published = true);
```

### Authentication Flow

```
1. User visits /teacher/login
2. Supabase Auth provides login form
3. JWT token generated and stored
4. User redirected to /teacher/dashboard
5. Every request includes auth token
6. Server validates token
7. RLS policies enforced on queries
8. Only teacher's data returned
```

---

## Performance Optimizations

### Database
- ✅ Indexes on `teacher_id` and `created_at`
- ✅ Pagination-ready queries
- ✅ Efficient filtering with RLS

### Frontend
- ✅ Skeleton loaders for UX
- ✅ Lazy loading images
- ✅ Memoized components
- ✅ Debounced search
- ✅ Optimistic updates

### Caching
- ✅ Next.js page caching
- ✅ Browser caching for static assets
- ✅ Supabase response caching

---

## Error Handling

### Client-Side
```typescript
try {
  // Operation
} catch (err) {
  // Show error message
  setError(err.message)
  // Optionally log to service
}
```

### Server-Side
```typescript
// Validation errors
// Authentication errors (redirects)
// Database errors (caught and rethrown)
// Storage errors (caught and rethrown)
```

### User Feedback
- ✅ Toast notifications for success
- ✅ Toast notifications for errors
- ✅ Error message display in forms
- ✅ Loading states during operations

---

## Testing Scenarios

### Happy Path
1. Login as teacher
2. Upload presentation with valid data
3. See it in presentations list
4. View statistics on dashboard
5. Edit presentation metadata
6. Delete presentation

### Error Cases
1. File too large (100MB+)
2. Wrong file format
3. Missing required fields
4. Network error during upload
5. Invalid data on update

### Edge Cases
1. Very long file names
2. Special characters in title
3. Maximum tags (10)
4. Very large view/download numbers
5. Simultaneous edits

---

## Development Tips

### Local Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run seed script
npm run seed

# Check types
npm run type-check

# Format code
npm run format
```

### Debugging
```typescript
// Server actions
console.log('Debug message') // Appears in terminal

// Client components
console.log('Debug message') // Appears in browser console

// Database queries
// Check Supabase SQL Editor logs
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check authentication, login required |
| 403 Forbidden | RLS policy mismatch, verify teacher_id |
| 404 Not Found | Presentation not found, check ID |
| File upload fails | Check file size, format, storage bucket |
| Styles don't apply | Clear .next folder, rebuild |
| Data not syncing | Check RLS policies, network tab |

---

## Scalability Considerations

### Current (V1)
- Single teacher per session
- Presentations in single table
- File storage in Supabase
- In-memory stats calculation

### Future (V2+)
- Batch operations
- Full-text search with indexes
- Caching layer (Redis)
- File CDN integration
- Pagination/infinite scroll
- Advanced analytics
- Presentation templates
- Collaboration features

---

## Deployment Checklist

- [ ] Environment variables set (SUPABASE_URL, ANON_KEY)
- [ ] Database migrations run
- [ ] Storage bucket created
- [ ] RLS policies configured
- [ ] Next.js build successful
- [ ] No TypeScript errors
- [ ] All routes tested
- [ ] Dark mode tested
- [ ] Mobile responsive checked
- [ ] Performance acceptable

---

## License & Credits

Built with:
- **Next.js 16** - App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend
- **React** - UI library

---

This document provides a comprehensive overview of the Teacher Dashboard architecture. Reference this when developing new features or troubleshooting issues.
