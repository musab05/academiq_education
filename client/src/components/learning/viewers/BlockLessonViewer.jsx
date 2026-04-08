import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { lessonAPI, progressAPI } from "../../../services/api";
import LessonNavigation from "../LessonNavigation";

const BlockLessonViewer = ({
  lesson,
  onNextLesson,
  onPreviousLesson,
  hasNext,
  hasPrevious,
}) => {
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedBlocks, setCompletedBlocks] = useState([]);
  const videoRefs = useRef({});

  useEffect(() => {
    if (lesson?._id) {
      // Reset state when lesson changes
      setLessonData(null);
      setLoading(true);
      setIsCompleted(false);
      setCompletedBlocks([]);
      fetchLessonData();
    }
  }, [lesson?._id]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      const response = await lessonAPI.getBlockActivity(lesson._id);
      setLessonData(response.data.activity);

      // Check existing progress
      const progressResponse = await progressAPI.getBlockLessonProgress(
        lesson._id,
      );
      const existingCompleted = progressResponse.data?.completedBlocks || [];
      setCompletedBlocks(existingCompleted);
      setIsCompleted(progressResponse.data?.isCompleted || false);

      // Mark non-video blocks as complete immediately
      if (response.data.activity?.blocks) {
        const nonVideoBlocks = response.data.activity.blocks
          .filter((b) => b.type !== "video")
          .map((b) => b.id);

        console.log("Total blocks:", response.data.activity.blocks.length);
        console.log("Non-video blocks to mark complete:", nonVideoBlocks);
        console.log("Already completed blocks:", existingCompleted);

        // Only mark blocks that aren't already completed
        const newBlocks = nonVideoBlocks.filter(
          (id) => !existingCompleted.includes(id),
        );
        if (newBlocks.length > 0) {
          console.log("Marking new blocks as complete:", newBlocks);
          await markBlocksComplete([...existingCompleted, ...newBlocks]);
        }
      }
    } catch (error) {
      console.error("Error fetching block lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  const markBlocksComplete = async (blockIds) => {
    try {
      const newCompleted = [...new Set(blockIds)];
      console.log("Updating backend with completed blocks:", newCompleted);
      setCompletedBlocks(newCompleted);

      const response = await progressAPI.updateBlockProgress(lesson._id, {
        completedBlocks: newCompleted,
      });

      console.log("Backend response:", response.data);

      if (response.data && response.data.isCompleted && !isCompleted) {
        setIsCompleted(true);
        window.dispatchEvent(new Event("lessonCompleted"));
      }
    } catch (error) {
      console.error("Error updating block progress:", error);
    }
  };

  const handleVideoEnd = (blockId, video) => {
    const watchedTime = video.currentTime || 0;
    const duration = video.duration || 0;
    if (watchedTime >= duration * 0.8) {
      markBlocksComplete([blockId]);
    }
  };

  const renderBlock = (block) => {
    switch (block.type) {
      case "heading":
        return (
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {block.content}
          </h2>
        );
      case "paragraph":
        return (
          <p className="text-gray-700 leading-relaxed mb-4">{block.content}</p>
        );
      case "video":
        return (
          <div className="mb-6">
            <video
              ref={(el) => (videoRefs.current[block.id] = el)}
              className="w-full rounded-lg"
              controls
              src={block.content}
              onEnded={(e) => handleVideoEnd(block.id, e.target)}
              onTimeUpdate={(e) => {
                const video = e.target;
                if (
                  video.currentTime >= video.duration * 0.8 &&
                  !completedBlocks.includes(block.id)
                ) {
                  handleVideoEnd(block.id, video);
                }
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case "image":
        return (
          <div className="mb-6">
            <img
              src={block.content}
              alt="Lesson content"
              className="w-full rounded-lg"
            />
          </div>
        );
      default:
        return <div className="mb-4 text-gray-700">{block.content}</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 lg:p-8"
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
          {isCompleted && (
            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              ✓ Completed
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Block Lesson
          </span>
          <span>{lessonData?.blocks?.length || 0} blocks</span>
          {isCompleted && (
            <span className="flex items-center gap-1 text-orange-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Completed
            </span>
          )}
          {lessonData?.blocks && (
            <span className="text-orange-600">
              {completedBlocks.length}/{lessonData.blocks.length} blocks
            </span>
          )}
        </div>
      </div>

      <div className="prose prose-lg max-w-none">
        {lessonData?.blocks && lessonData.blocks.length > 0 ? (
          <div className="space-y-6">
            {lessonData.blocks
              .sort((a, b) => a.order - b.order)
              .map((block, index) => (
                <div key={block.id || index}>{renderBlock(block)}</div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No content available
            </h3>
            <p className="text-gray-500">
              This lesson doesn't have any blocks yet.
            </p>
          </div>
        )}
      </div>

      <LessonNavigation
        onNextLesson={onNextLesson}
        onPreviousLesson={onPreviousLesson}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      />
    </motion.div>
  );
};

export default BlockLessonViewer;
