# Teacher Dashboard - Setup & Implementation Guide

## Overview

The Teacher Dashboard is a comprehensive feature for managing presentations in Presento. It includes:
- Dashboard overview with statistics
- Upload presentations with metadata
- Manage and edit presentations
- View analytics (views/downloads)
- Responsive design for mobile and desktop

## Project Structure

```
src/
├── app/teacher/
│   ├── dashboard/
│   │   └── page.tsx                    # Dashboard overview
│   ├── presentations/
│   │   ├── page.tsx                    # Presentations list
│   │   ├── upload/
│   │   │   └── page.tsx                # Upload form
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx            # Edit presentation
│   └── layout.tsx                      # Teacher layout wrapper
├── components/teacher/
│   ├── DashboardSidebar.tsx            # Navigation sidebar
│   ├── TeacherLayout.tsx               # Layout wrapper
│   ├── UploadPresentationForm.tsx       # Upload form component
│   ├── PresentationsGrid.tsx           # Grid/table view
│   ├── EditPresentationForm.tsx        # Edit form component
│   └── DashboardStats.tsx              # Statistics cards
├── hooks/
│   └── useTeacherSections.ts           # Data fetching hooks
├── lib/
│   ├── seed-presentations.ts           # Dummy data seeding
│   └── presentations/
│       └── actions.ts                  # Server actions
└── types/
    └── index.ts                        # TypeScript types
```

## Database Schema

The `presentations` table structure:

```sql
CREATE TABLE presentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_code VARCHAR(50),
  course_name VARCHAR(255),
  department VARCHAR(100),
  semester VARCHAR(50),
  tags TEXT[] DEFAULT '{}',
  file_path VARCHAR(500),
  file_size BIGINT,
  file_format VARCHAR(10), -- 'pdf', 'pptx', 'ppt'
  thumbnail_path VARCHAR(500),
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_presentations_teacher_id ON presentations(teacher_id);
```

## Setup Instructions

### 1. Database Setup

Run the SQL schema in your Supabase dashboard:

```sql
-- Create presentations table
CREATE TABLE presentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_code VARCHAR(50),
  course_name VARCHAR(255),
  department VARCHAR(100),
  semester VARCHAR(50),
  tags TEXT[] DEFAULT '{}',
  file_path VARCHAR(500),
  file_size BIGINT,
  file_format VARCHAR(10),
  thumbnail_path VARCHAR(500),
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_presentations_teacher_id ON presentations(teacher_id);
CREATE INDEX idx_presentations_created_at ON presentations(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can view their own presentations
CREATE POLICY "Teachers can view own presentations" ON presentations
  FOR SELECT USING (auth.uid() = teacher_id);

-- Policy: Teachers can insert their own presentations
CREATE POLICY "Teachers can insert presentations" ON presentations
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

-- Policy: Teachers can update their own presentations
CREATE POLICY "Teachers can update own presentations" ON presentations
  FOR UPDATE USING (auth.uid() = teacher_id);

-- Policy: Teachers can delete their own presentations
CREATE POLICY "Teachers can delete own presentations" ON presentations
  FOR DELETE USING (auth.uid() = teacher_id);

-- Anonymous policy: Everyone can view published presentations
CREATE POLICY "Everyone can view published presentations" ON presentations
  FOR SELECT USING (is_published = true);
```

### 2. Environment Variables

Ensure these are in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Seed Sample Data (Optional)

To populate the database with sample presentations:

```bash
# Add this script to package.json:
"scripts": {
  "seed": "ts-node --project tsconfig.json src/lib/seed-presentations.ts"
}

# Run:
npm run seed
```

The seeding script will create 8 sample presentations with realistic data.

## Features & Usage

### 1. Dashboard Overview (`/teacher/dashboard`)

Displays key metrics:
- **Total Uploads**: Number of presentations uploaded
- **Total Downloads**: Total presentation downloads
- **Total Views**: Total presentation views
- **Recent Uploads**: Count of uploads in the last 30 days

Features:
- Clean statistics cards
- Loading skeletons while fetching data
- Responsive grid layout
- Quick action buttons

### 2. Upload Presentation (`/teacher/presentations/upload`)

Complete upload form with:

**Form Fields:**
- Presentation Title (required)
- Description (optional)
- Course Code (e.g., CS101)
- Course Name (e.g., Web Development)
- Department (e.g., Computer Science)
- Semester (e.g., Spring 2024)
- Tags (comma-separated, optional)
- Thumbnail Image (optional, .jpg/.png)
- Presentation File (required, .pdf/.pptx/.ppt)

**Features:**
- File validation (size, format)
- Drag-and-drop support
- Progress indicators
- Success/error toast notifications
- Automatic redirect to edit page after upload
- Loading states with spinners

**File Size Limits:**
- Thumbnail: 5MB max
- Presentation: 100MB max

### 3. Manage Presentations (`/teacher/presentations`)

Table/grid view of all uploaded presentations:

**Columns:**
- Thumbnail preview
- Title
- Course
- Upload date
- Views count
- Downloads count
- Actions (Edit, Delete)

**Features:**
- Sorting by date, views, downloads
- Search by title or course
- Filter by semester
- Responsive grid on mobile
- Delete with confirmation
- Quick preview

### 4. Edit Presentation (`/teacher/presentations/[id]/edit`)

Modify presentation metadata:

**Editable Fields:**
- Title
- Description
- Course Code
- Course Name
- Department
- Semester
- Tags
- Thumbnail
- Presentation File

**Features:**
- Pre-filled with current data
- File replacement (optional)
- Change thumbnail
- Success/error notifications
- Auto-save drafts
- History tracking

## Components API

### DashboardStats

```tsx
<DashboardStats />
```

Displays overview statistics cards.

### UploadPresentationForm

```tsx
<UploadPresentationForm />
```

Complete upload form with validation and Supabase integration.

### PresentationsGrid

```tsx
<PresentationsGrid presentations={presentations} onDelete={handleDelete} />
```

Table/grid view of presentations.

### EditPresentationForm

```tsx
<EditPresentationForm presentationId={id} />
```

Edit form for updating presentation metadata.

## Hooks

### useTeacherSections

```tsx
const {
  presentations,
  loading,
  error,
  refetch,
  stats
} = useTeacherSections();
```

Fetches all presentations and statistics for the current teacher.

## Server Actions

### `createPresentation`

```tsx
await createPresentation({
  title: string;
  description?: string;
  courseCode?: string;
  courseName?: string;
  department?: string;
  semester?: string;
  tags?: string[];
  filePath: string;
  fileSize: number;
  fileFormat: string;
  thumbnailPath?: string;
});
```

### `updatePresentation`

```tsx
await updatePresentation(id, {
  title?: string;
  description?: string;
  courseCode?: string;
  courseName?: string;
  department?: string;
  semester?: string;
  tags?: string[];
  thumbnailPath?: string;
});
```

### `deletePresentation`

```tsx
await deletePresentation(id);
```

## Styling & Theming

- **Color Scheme**: Minimal, modern SaaS design
- **Dark Mode**: Full dark mode support with Tailwind
- **Components**: Uses shadcn/ui for consistency
- **Spacing**: Clean, generous spacing for readability
- **Typography**: Clear hierarchy with system fonts

### Key Classes:
- Cards: `rounded-lg shadow-sm border border-slate-200 dark:border-slate-800`
- Buttons: `rounded-lg font-medium transition-all duration-150`
- Text: `text-slate-900 dark:text-white`

## Error Handling

All components include:
- Loading states with skeletons
- Error boundaries
- Toast notifications for user feedback
- Validation error messages
- Fallback UI

## Performance Optimizations

- Image optimization with Next.js `Image` component
- File lazy loading
- Debounced search
- Memoized components
- Pagination for large datasets

## Security

- Row Level Security (RLS) enforced in Supabase
- Teacher can only see their own presentations
- File validation on upload
- Type-safe code with TypeScript
- CSRF protection via Next.js

## Testing

To test the dashboard:

1. **Create a teacher account** at `/teacher/register`
2. **Login** at `/teacher/login`
3. **Upload a presentation** at `/teacher/presentations/upload`
4. **View statistics** at `/teacher/dashboard`
5. **Edit presentation** at `/teacher/presentations/[id]/edit`
6. **Delete presentation** from `/teacher/presentations`

## Troubleshooting

### Presentations not showing?
- Check RLS policies in Supabase
- Verify teacher is logged in
- Check browser console for errors

### Upload fails?
- Verify file size limits
- Check file format is supported
- Ensure Supabase Storage bucket exists
- Verify authentication token

### Styling issues?
- Clear Next.js cache: `rm -rf .next`
- Rebuild Tailwind: `npm run build`
- Check dark mode settings

## Future Enhancements

Planned for V2+:
- Batch upload
- Presentation scheduling
- Student submission tracking
- Collaboration features
- Advanced analytics
- Export reports
- Presentation cloning
- Template system

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase documentation
3. Check Next.js App Router docs
4. Create an issue in the repository
