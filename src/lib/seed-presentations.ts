/**
 * Seed Script for Presentations
 * 
 * Usage:
 * npx ts-node src/lib/seed-presentations.ts
 * 
 * Or add to package.json:
 * "seed": "ts-node src/lib/seed-presentations.ts"
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Sample presentation data
const samplePresentations = [
  {
    title: 'Introduction to React Hooks',
    description: 'Learn the basics of React Hooks including useState, useEffect, and custom hooks. Perfect for beginners.',
    courseCode: 'CS101',
    courseName: 'Web Development Fundamentals',
    department: 'Computer Science',
    semester: 'Spring 2024',
    tags: ['React', 'JavaScript', 'Web Development', 'Hooks'],
    fileSize: 5242880, // 5MB
    fileFormat: 'pptx',
    views: 245,
    downloads: 32,
  },
  {
    title: 'Advanced TypeScript Patterns',
    description: 'Deep dive into advanced TypeScript features including generics, utility types, and decorators.',
    courseCode: 'CS301',
    courseName: 'Advanced Programming',
    department: 'Computer Science',
    semester: 'Spring 2024',
    tags: ['TypeScript', 'Programming', 'Design Patterns', 'Advanced'],
    fileSize: 3145728, // 3MB
    fileFormat: 'pptx',
    views: 412,
    downloads: 67,
  },
  {
    title: 'Database Design Best Practices',
    description: 'Comprehensive guide to relational and non-relational database design, normalization, and optimization.',
    courseCode: 'CS201',
    courseName: 'Database Systems',
    department: 'Computer Science',
    semester: 'Spring 2024',
    tags: ['Databases', 'SQL', 'Design', 'Optimization'],
    fileSize: 4194304, // 4MB
    fileFormat: 'pdf',
    views: 328,
    downloads: 45,
  },
  {
    title: 'Machine Learning Fundamentals',
    description: 'Introduction to machine learning concepts, algorithms, and applications using Python and scikit-learn.',
    courseCode: 'CS401',
    courseName: 'Machine Learning',
    department: 'Computer Science',
    semester: 'Fall 2024',
    tags: ['Machine Learning', 'Python', 'AI', 'Data Science'],
    fileSize: 7340032, // 7MB
    fileFormat: 'pptx',
    views: 567,
    downloads: 98,
  },
  {
    title: 'Cloud Architecture with AWS',
    description: 'Practical guide to designing scalable cloud architectures on AWS. Covers EC2, S3, RDS, and Lambda.',
    courseCode: 'CS321',
    courseName: 'Cloud Computing',
    department: 'Computer Science',
    semester: 'Fall 2024',
    tags: ['AWS', 'Cloud', 'Infrastructure', 'DevOps'],
    fileSize: 6291456, // 6MB
    fileFormat: 'pptx',
    views: 423,
    downloads: 71,
  },
  {
    title: 'Web Security and OWASP Top 10',
    description: 'Essential web security concepts and common vulnerabilities. Learn how to build secure applications.',
    courseCode: 'CS221',
    courseName: 'Cybersecurity Basics',
    department: 'Computer Science',
    semester: 'Spring 2024',
    tags: ['Security', 'Web Development', 'OWASP', 'Best Practices'],
    fileSize: 2097152, // 2MB
    fileFormat: 'pdf',
    views: 289,
    downloads: 54,
  },
  {
    title: 'DevOps and CI/CD Pipelines',
    description: 'Automate your deployments with CI/CD pipelines. Covers GitHub Actions, Jenkins, and Docker.',
    courseCode: 'CS341',
    courseName: 'DevOps Engineering',
    department: 'Computer Science',
    semester: 'Fall 2024',
    tags: ['DevOps', 'CI/CD', 'Docker', 'Automation'],
    fileSize: 5767168, // 5.5MB
    fileFormat: 'pptx',
    views: 312,
    downloads: 48,
  },
  {
    title: 'Responsive Web Design with Tailwind CSS',
    description: 'Master modern CSS with Tailwind. Learn utility-first CSS, responsive design, and component patterns.',
    courseCode: 'CS111',
    courseName: 'Frontend Development',
    department: 'Computer Science',
    semester: 'Spring 2024',
    tags: ['CSS', 'Tailwind', 'Responsive Design', 'Frontend'],
    fileSize: 3670016, // 3.5MB
    fileFormat: 'pptx',
    views: 634,
    downloads: 112,
  },
];

async function seedPresentations() {
  try {
    console.log('🌱 Starting presentation seeding...\n');

    // Get current user (teacher)
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError || !users || users.length === 0) {
      console.error('❌ No users found. Please create a teacher account first.');
      process.exit(1);
    }

    const teacherId = users[0].id;
    console.log(`✅ Using teacher ID: ${teacherId}\n`);

    // Insert presentations
    console.log(`📝 Inserting ${samplePresentations.length} sample presentations...\n`);

    for (const presentation of samplePresentations) {
      const { data, error } = await supabase
        .from('presentations')
        .insert({
          teacher_id: teacherId,
          title: presentation.title,
          description: presentation.description,
          course_code: presentation.courseCode,
          course_name: presentation.courseName,
          department: presentation.department,
          semester: presentation.semester,
          tags: presentation.tags,
          file_size: presentation.fileSize,
          file_format: presentation.fileFormat,
          file_path: `presentations/${teacherId}/${presentation.courseCode}/${Date.now()}-${presentation.title.replace(/\s+/g, '-').toLowerCase()}.${presentation.fileFormat === 'pdf' ? 'pdf' : 'pptx'}`,
          thumbnail_path: null,
          views: presentation.views,
          downloads: presentation.downloads,
          is_published: true,
          created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 90 days
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error(`❌ Error inserting "${presentation.title}":`, error);
      } else {
        console.log(`✅ Created: "${presentation.title}"`);
      }
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${samplePresentations.length} presentations created`);
    console.log(`   - Total views: ${samplePresentations.reduce((sum, p) => sum + p.views, 0)}`);
    console.log(`   - Total downloads: ${samplePresentations.reduce((sum, p) => sum + p.downloads, 0)}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seedPresentations();
