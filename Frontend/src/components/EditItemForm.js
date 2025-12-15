'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { itemsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { getItemMetadata, getImageUrl } from '@/utils/itemParser';

const CATEGORIES = [
  'Tops',
  'Bottoms',
  'Dresses',
  'Jackets',
  'Sweaters',
  'Shoes',
  'Accessories',
];

const LOCATIONS = [
  'San Francisco',
  'Berlin',
  'Buenos Aires',
  'Hyderabad',
  'Seoul',
  'Taipei',
  'Tokyo',
  'Other',
];

const CONDITIONS = ['Like New', 'Excellent', 'Good', 'Gently Used'];

export default function EditItemForm({ itemId, initialItem }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]); // Mix of existing (url) and new (file) images
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    size: '',
    location: '',
    condition: '',
    branded: 'No',
    credits: 1,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize form with existing item data
  useEffect(() => {
    if (initialItem) {
      const metadata = getItemMetadata(initialItem);
      
      // Pre-fill form data
      setFormData({
        title: initialItem.title || '',
        description: metadata.mainDescription || initialItem.description || '',
        category: initialItem.category || metadata.category || '',
        size: initialItem.size || metadata.size || '',
        location: initialItem.location || metadata.location || '',
        condition: initialItem.condition || metadata.condition || '',
        branded: initialItem.branded || (metadata.branded === 'Yes' ? 'Yes' : 'No'),
        credits: initialItem.credits || metadata.credits || 1,
      });

      // Pre-fill existing images (as URLs, not files)
      if (initialItem.images && initialItem.images.length > 0) {
        const existingImages = initialItem.images.map((img, index) => ({
          id: img.id || `existing-${index}`,
          url: getImageUrl(img),
          isExisting: true, // Flag to distinguish from new uploads
          preview: getImageUrl(img),
        }));
        setImages(existingImages);
      }

      setLoading(false);
    }
  }, [initialItem]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      isExisting: false, // New upload
    }));
    setImages([...images, ...newImages]);
  };

  const handleRemoveImage = (id) => {
    setImages(images.filter((img) => {
      if (img.id === id) {
        // Clean up object URLs for new images
        if (img.preview && !img.isExisting) {
          URL.revokeObjectURL(img.preview);
        }
      }
      return img.id !== id;
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      const newImages = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9),
        isExisting: false,
      }));
      setImages([...images, ...newImages]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleRadioChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.size.trim()) newErrors.size = 'Size is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.condition) newErrors.condition = 'Condition is required';
    if (images.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setErrors({ general: 'Please log in to edit an item' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare item data for backend
      if (!formData.title || !formData.title.trim()) {
        setErrors({ general: 'Title is required' });
        setIsSubmitting(false);
        return;
      }

      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        size: formData.size.trim(),
        location: formData.location,
        condition: formData.condition,
        branded: formData.branded,
        // Credits are not editable, keep existing value from initialItem
        credits: initialItem?.credits || getItemMetadata(initialItem)?.credits || 1,
      };

      // Extract only new image files (not existing ones)
      const newImageFiles = images
        .filter((img) => !img.isExisting && img.file)
        .map((img) => img.file);

      // Extract IDs of existing images to keep
      const keepImageIds = images
        .filter((img) => img.isExisting)
        .map((img) => img.id);

      // Log the data being sent for debugging
      console.log('Updating item:', {
        itemId,
        title: updateData.title,
        descriptionLength: updateData.description.length,
        newImageCount: newImageFiles.length,
        totalImages: images.length,
        keepImageIds,
      });

      // Update item - pass new images and IDs of images to keep
      const result = await itemsAPI.updateItem(itemId, updateData, newImageFiles, keepImageIds);
      
      // Redirect to product page after successful update
      router.push(`/product/${itemId}`);
    } catch (error) {
      console.error('Error updating item:', error);
      console.error('Error details:', error.data);
      
      // Extract error message
      let errorMessage = 'Failed to update item. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.data) {
        // Try to extract message from error data
        if (error.data.detail) {
          if (typeof error.data.detail === 'string') {
            errorMessage = error.data.detail;
          } else if (error.data.detail.message) {
            errorMessage = error.data.detail.message;
            if (error.data.detail.errors && Array.isArray(error.data.detail.errors)) {
              const validationErrors = error.data.detail.errors.join(', ');
              if (validationErrors) {
                errorMessage += `: ${validationErrors}`;
              }
            }
          }
        }
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/product/${itemId}`);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-swapcircle-secondary">Loading item data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="heading-primary text-3xl md:text-4xl font-bold mb-8">
        Edit your item
      </h1>

      {errors.general && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Zone */}
        <div>
          <label className="block text-sm font-medium mb-2 text-swapcircle-primary">
            Photos *
          </label>
          {images.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-swapcircle rounded-lg p-12 text-center cursor-pointer hover:bg-swapcircle-alt transition-colors"
            >
              <div className="text-4xl mb-4">📸</div>
              <h3 className="heading-primary text-lg font-semibold mb-2">
                Upload photos
              </h3>
              <p className="text-swapcircle-secondary">
                Drag and drop or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-swapcircle rounded-lg p-8 text-center cursor-pointer hover:bg-swapcircle-alt transition-colors"
              >
                <p className="text-swapcircle-secondary">
                  Click or drag to add more photos
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-square group">
                    <img
                      src={img.preview || img.url}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {img.isExisting && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                        Existing
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <svg
                        className="w-5 h-5 icon-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {errors.images && (
            <p className="text-sm text-red-500 mt-1">{errors.images}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2 text-swapcircle-primary">
            Item title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Vintage denim jacket"
            className={`input-swapcircle ${errors.title ? 'border-red-500' : ''}`}
            required
          />
          {errors.title && (
            <p className="text-sm text-red-500 mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2 text-swapcircle-primary">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the condition, style, and any details..."
            rows={4}
            className={`input-swapcircle ${errors.description ? 'border-red-500' : ''}`}
            required
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2 text-swapcircle-primary">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`input-swapcircle ${errors.category ? 'border-red-500' : ''}`}
            required
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-sm text-red-500 mt-1">{errors.category}</p>
          )}
        </div>

        {/* Size */}
        <div>
          <label htmlFor="size" className="block text-sm font-medium mb-2 text-swapcircle-primary">
            Size *
          </label>
          <input
            id="size"
            name="size"
            type="text"
            value={formData.size}
            onChange={handleInputChange}
            placeholder="e.g., M, 8, One size"
            className={`input-swapcircle ${errors.size ? 'border-red-500' : ''}`}
            required
          />
          {errors.size && (
            <p className="text-sm text-red-500 mt-1">{errors.size}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-2 text-swapcircle-primary">
            Location *
          </label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className={`input-swapcircle ${errors.location ? 'border-red-500' : ''}`}
            required
          >
            <option value="">Select your city</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          <p className="text-swapcircle-tertiary text-xs mt-1">
            Select the city where this item is available for pickup
          </p>
          {errors.location && (
            <p className="text-sm text-red-500 mt-1">{errors.location}</p>
          )}
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium mb-2 text-swapcircle-primary">
            Condition *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CONDITIONS.map((cond) => (
              <button
                key={cond}
                type="button"
                onClick={() => handleRadioChange('condition', cond)}
                className={`px-4 py-3 border-2 rounded-lg font-medium transition-colors ${
                  formData.condition === cond
                    ? 'border-swapcircle-primary bg-swapcircle-credit text-swapcircle-blue'
                    : 'border-swapcircle text-swapcircle-secondary hover:border-swapcircle-hover'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
          {errors.condition && (
            <p className="text-sm text-red-500 mt-1">{errors.condition}</p>
          )}
        </div>

        {/* Branded */}
        <div>
          <label className="block text-sm font-medium mb-2 text-swapcircle-primary">
            Branded?
          </label>
          <div className="flex gap-3">
            {['Yes', 'No'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleRadioChange('branded', option)}
                className={`px-6 py-3 border-2 rounded-lg font-medium transition-colors ${
                  formData.branded === option
                    ? 'border-swapcircle-primary bg-swapcircle-credit text-swapcircle-blue'
                    : 'border-swapcircle text-swapcircle-secondary hover:border-swapcircle-hover'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

