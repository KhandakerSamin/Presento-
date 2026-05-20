'use client';

import { FormEvent, useState, useEffect, useRef } from 'react';
import { Upload, Plus, X, CheckCircle, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { updatePresentation } from '@/lib/presentations/actions';
import { supabase } from '@/lib/supabase/client';
import type { Presentation } from '@/types';

interface EditPresentationFormProps {
  presentation: Presentation;
}

export function EditPresentationForm({ presentation }: EditPresentationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: presentation.title,
    description: presentation.description || '',
    courseCode: presentation.course_code || '',
    courseName: presentation.course_name || '',
    department: presentation.department || '',
    semester: presentation.semester || '',
    tags: presentation.tags || [],
  });

  const [tagInput, setTagInput] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [presentationFile, setPresentationFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const thumbnailRef = useRef<HTMLInputElement>(null);
  const presentationRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 10) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const validateFiles = () => {
    if (presentationFile) {
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (presentationFile.size > maxSize) {
        setError('Presentation file must be less than 100MB');
        return false;
      }

      const validFormats = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      if (!validFormats.includes(presentationFile.type)) {
        setError('Presentation must be a PDF or PPTX file');
        return false;
      }
    }

    if (thumbnail) {
      const maxThumbSize = 5 * 1024 * 1024; // 5MB
      if (thumbnail.size > maxThumbSize) {
        setError('Thumbnail must be less than 5MB');
        return false;
      }

      if (!thumbnail.type.startsWith('image/')) {
        setError('Thumbnail must be an image file');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateFiles()) {
      return;
    }

    setLoading(true);

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('Not authenticated');

      let thumbnailPath = presentation.thumbnail_path;

      // Upload new thumbnail if provided
      if (thumbnail) {
        const thumbnailExt = thumbnail.type === 'image/png' ? 'png' : 'jpg';
        const thumbnailName = `presentations/${userId}/thumbnails/${Date.now()}.${thumbnailExt}`;

        const { error: thumbError } = await supabase.storage
          .from('presentations')
          .upload(thumbnailName, thumbnail);

        if (thumbError) throw thumbError;

        const { data } = supabase.storage.from('presentations').getPublicUrl(thumbnailName);
        thumbnailPath = data?.publicUrl;
      }

      // Update presentation metadata
      await updatePresentation(presentation.id, {
        title: formData.title,
        description: formData.description || null,
        courseCode: formData.courseCode || null,
        courseName: formData.courseName || null,
        department: formData.department || null,
        semester: formData.semester || null,
        tags: formData.tags,
        thumbnailPath: thumbnailPath || null,
      });

      setSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push('/teacher/presentations');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
            <p className="text-sm text-green-700 dark:text-green-400">
              <CheckCircle className="w-5 h-5" /> Presentation updated successfully! Redirecting...
            </p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Presentation Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Introduction to React"
            required
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Brief description of your presentation..."
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Course Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Course Code
            </label>
            <input
              type="text"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleInputChange}
              placeholder="e.g., CS101"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Course Name
            </label>
            <input
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleInputChange}
              placeholder="e.g., Web Development"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Department & Semester */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="e.g., Computer Science"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Semester
            </label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select semester</option>
              <option value="Spring 2024">Spring 2024</option>
              <option value="Summer 2024">Summer 2024</option>
              <option value="Fall 2024">Fall 2024</option>
              <option value="Winter 2024">Winter 2024</option>
              <option value="Spring 2025">Spring 2025</option>
              <option value="Summer 2025">Summer 2025</option>
              <option value="Fall 2025">Fall 2025</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Add a tag and press Enter"
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={formData.tags.length >= 10}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Add
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {formData.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                >
                  <span className="text-sm">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="hover:opacity-70"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Thumbnail */}
        {presentation.thumbnail_path && (
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Current Thumbnail
            </label>
            <img
              src={presentation.thumbnail_path}
              alt="Current thumbnail"
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Update Thumbnail (Optional)
          </label>
          <div
            onClick={() => thumbnailRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <input
              ref={thumbnailRef}
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
              className="hidden"
            />
            {thumbnail ? (
              <div className="text-sm">
                <p className="font-medium text-slate-900 dark:text-white flex items-center justify-center gap-1">
                  <Check className="w-4 h-4" /> {thumbnail.name}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  {(thumbnail.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <Upload className="mx-auto mb-2 text-slate-400" size={32} />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  PNG, JPG (Max 5MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Note about file replacement */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <strong>Note:</strong> Presentation file replacement is not available in V1. To use a different file, please upload a new presentation and delete this one.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Upload size={20} />
                Save Changes
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
