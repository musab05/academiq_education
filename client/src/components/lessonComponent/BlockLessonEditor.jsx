import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import Header from "../Header";
import { lessonAPI } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import BlockSidebar from "./block/BlockSidebar";
import BlockCard from "./block/BlockCard";
import LessonSettingsModal from "./LessonSettingsModal";

const BLOCK_TYPES = [
  { type: "heading", label: "Heading", defaultContent: "New Heading" },
  {
    type: "paragraph",
    label: "Text",
    defaultContent: "Start writing your content here...",
  },
  { type: "video", label: "Video", defaultContent: "" },
  {
    type: "image",
    label: "Image",
    defaultContent: "https://picsum.photos/600/300",
  },
  { type: "list", label: "List", defaultContent: "Item 1\nItem 2\nItem 3" },
  {
    type: "code",
    label: "Code",
    defaultContent: 'console.log("Hello World");',
  },
  { type: "quote", label: "Quote", defaultContent: "This is a quote block" },
];

const BlockLessonEditor = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [lessonTitle, setLessonTitle] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [savedBlocks, setSavedBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const debounceRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (
        blocks.length > 0 &&
        JSON.stringify(blocks) !== JSON.stringify(savedBlocks)
      ) {
        saveDraft();
      }
    }, 1000);
  }, [blocks]);

  const fetchLesson = async () => {
    try {
      const response = await lessonAPI.getBlockActivity(lessonId);
      setLessonTitle(response.data.lesson.title);
      const activity = response.data.activity || {};
      const loadedBlocks = activity.blocks || [];
      setBlocks(loadedBlocks);
      setSavedBlocks(loadedBlocks);
      setAttachments(response.data.lesson.attachments || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      showNotification({
        type: 'error',
        message: 'Failed to load lesson data'
      });
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    try {
      await lessonAPI.updateBlockActivity(lessonId, {
        blocks: blocks,
        isDraft: true,
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      showNotification({
        type: 'error',
        message: 'Failed to auto-save draft'
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await lessonAPI.updateBlockActivity(lessonId, {
        blocks: blocks,
        isDraft: false,
      });
      setSavedBlocks([...blocks]);
      showNotification({
        type: 'success',
        message: 'Block lesson saved successfully!'
      });
    } catch (error) {
      console.error("Error saving lesson:", error);
      showNotification({
        type: 'error',
        message: 'Failed to save lesson. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    setBlocks([...savedBlocks]);
  };

  const handleTitleChange = async (newTitle) => {
    setLessonTitle(newTitle);
    try {
      await lessonAPI.updateLesson(lessonId, { title: newTitle });
    } catch (error) {
      console.error("Error updating title:", error);
      showNotification({
        type: 'error',
        message: 'Failed to update lesson title'
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const addBlock = (blockType) => {
    const blockTemplate = BLOCK_TYPES.find((bt) => bt.type === blockType);
    const newBlock = {
      id: Date.now().toString(),
      type: blockType,
      content: blockType === "video" ? "" : blockTemplate.defaultContent,
      order: blocks.length,
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (blockId, updates) => {
    setBlocks(
      blocks.map((block) =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
  };

  const deleteBlock = (blockId) => {
    setBlocks(blocks.filter((block) => block.id !== blockId));
  };

  const handleVideoUpload = async (file, blockId) => {
    if (!file) return;

    console.log("Uploading file:", file.name, file.type, file.size);

    try {
      const formData = new FormData();
      formData.append("video", file);

      console.log("FormData created, making request...");
      const response = await lessonAPI.uploadVideo(formData);
      console.log("Upload successful:", response.data);
      updateBlock(blockId, { content: response.data.videoUrl });
      showNotification({
        type: 'success',
        message: 'Video uploaded successfully!'
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      console.error("Error response:", error.response?.data);
      const errorMsg = error.response?.data?.error || "Error uploading video";
      showNotification({
        type: 'error',
        message: errorMsg
      });
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header
        mode="lesson-edit"
        lessonTitle={lessonTitle}
        onLessonTitleChange={handleTitleChange}
        onSave={handleSave}
        saving={saving}
        onRevert={handleRevert}
        onBack={handleBack}
        onSettingsClick={() => setShowSettings(true)}
      />

      <LessonSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        lessonId={lessonId}
        attachments={attachments}
        onAttachmentsUpdate={setAttachments}
      />

      <div className="flex-1 flex bg-gray-50 overflow-hidden">
        <BlockSidebar onAddBlock={addBlock} />

        {/* Editor */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {blocks.length === 0 ? (
              <div className="text-center py-12">
                <Plus className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No blocks yet
                </h3>
                <p className="text-gray-500">
                  Add blocks from the sidebar to start building your lesson
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map((block) => block.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {blocks.map((block) => (
                    <BlockCard
                      key={block.id}
                      block={block}
                      onUpdate={updateBlock}
                      onDelete={deleteBlock}
                      onVideoUpload={handleVideoUpload}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockLessonEditor;
