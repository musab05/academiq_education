import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Mail, MessageCircle } from "lucide-react";

const faqData = [
  {
    question: "Can I enroll in multiple courses at once?",
    answer:
      "Absolutely! You can enroll in multiple courses simultaneously and access them at your convenience. Our platform allows you to learn at your own pace across different subjects.",
  },
  {
    question: "What kind of support can I expect from instructors?",
    answer:
      "Our instructors are dedicated to your success. You can expect prompt responses to your questions, detailed feedback on assignments, and regular office hours for one-on-one guidance.",
  },
  {
    question:
      "Are the courses self-paced or do they have specific start and end dates?",
    answer:
      "Most of our courses are self-paced, allowing you to learn whenever it suits you. Some live classroom sessions may have scheduled times, but recordings are always available.",
  },
  {
    question: "Are there any prerequisites for the courses?",
    answer:
      "Prerequisites vary by course. Each course page clearly lists any required knowledge or skills. Many of our beginner courses have no prerequisites at all.",
  },
  {
    question: "Can I download the course materials for offline access?",
    answer:
      "Yes! Most course materials including videos, PDFs, and resources can be downloaded for offline learning. This feature is available on our mobile apps as well.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleIndex = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-16 sm:py-20 px-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-50/40 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 p-6 sm:p-10 border border-gray-100">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 text-sm font-semibold rounded-full mb-4">
                FAQ
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked{" "}
                <span className="text-orange-500">Questions</span>
              </h2>
              <p className="text-gray-600 mb-6">
                Still have questions? Contact our Team via our support channels.
              </p>

              <div className="space-y-3">
                <a
                  href="mailto:support@academiq.com"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                    <Mail className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email us at</p>
                    <p className="text-sm font-semibold text-gray-900">
                      support@academiq.com
                    </p>
                  </div>
                </a>

                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">Start Live Chat</span>
                </button>
              </div>
            </motion.div>

            {/* Right Side - FAQ Accordion */}
            <div className="md:col-span-2 space-y-3">
              {faqData.map((item, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                      isOpen
                        ? "border-orange-200 bg-gradient-to-br from-orange-50/50 to-white shadow-lg shadow-orange-100/30"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <button
                      onClick={() => toggleIndex(idx)}
                      className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4"
                    >
                      <span
                        className={`font-semibold text-sm sm:text-base ${isOpen ? "text-orange-600" : "text-gray-900"}`}
                      >
                        {item.question}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isOpen
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-gray-600 text-sm sm:text-base leading-relaxed">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
