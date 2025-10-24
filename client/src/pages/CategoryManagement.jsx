import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api, { courseAPI } from "../services/api";
import { categoriesAPI } from "../services/api";

import Breadcrumb from "../components/Breadcrumb";
import { useNotification } from "../context/NotificationContext";
import CategoryTable from "../components/category/CategoryTable.jsx";
import CategoryForm from "../components/category/CategoryForm.jsx";
import { PlusIcon } from "../components/category/CategoryIcons.jsx";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [tree, setTree] = useState([]);
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await categoriesAPI.list();
      setCategories(res.data.flat || []);
      setTree(res.data.tree || []);
    } catch (e) {
      console.error(e);
      showNotification({ type: "error", message: "Failed to load categories" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete category?")) return;
    setLoading(true);
    try {
      await categoriesAPI.delete(id);
      showNotification({ type: "success", message: "Category deleted" });
      await load();
    } catch (e) {
      console.error(e);
      showNotification({
        type: "error",
        message: e?.response?.data?.error || "Delete failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(!sidebarOpen); }} />

        <div className="flex flex-1 overflow-hidden">
          <div
            className="main-scroll flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Category Management</h2>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  {loading && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Loading...</span>
                    </div>
                  )}
                  <button
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm text-sm tap-target justify-center"
                    onClick={handleCreate}
                  >
                    <PlusIcon />
                    <span className="hidden sm:inline">Create Category</span>
                    <span className="sm:hidden">Create</span>
                  </button>
                </div>
              </div>

              <CategoryTable
                categories={categories}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>

        {openForm && (
          <CategoryForm
            category={editing}
            categories={categories}
            onClose={() => {
              setOpenForm(false);
              load();
            }}
          />
        )}
      </div>
    </div>
  );
};



export default CategoryManagement;
