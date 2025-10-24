import React, { useEffect, useState } from "react";
import { categoriesAPI } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import CategoryParentSelector from "./CategoryParentSelector";

const CategoryForm = ({
  category = null,
  categories = [],
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState("");
  const [parent, setParent] = useState("All");
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    setName(category?.name || "");
    setParent(category?.parent?._id ?? category?.parent ?? "All");
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (category) {
        await categoriesAPI.update(category._id, { name, parent });
        showNotification({ type: "success", message: "Category updated" });
      } else {
        await categoriesAPI.create({ name, parent });
        showNotification({ type: "success", message: "Category created" });
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      showNotification({
        type: "error",
        message: err?.response?.data?.error || "Error saving category",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 transform transition-all">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {category ? "Edit Category" : "Create New Category"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {category ? "Update category details" : "Add a new category to organize your content"}
            </p>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose}
            aria-label="close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter category name"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Parent Category
            </label>
            <CategoryParentSelector
              categories={categories}
              selected={parent}
              onSelect={(v) => setParent(v)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="px-6 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {saving ? "Saving..." : category ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
