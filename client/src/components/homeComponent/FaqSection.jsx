import React, { useState } from 'react';
import { ChevronRight, X, Plus } from 'lucide-react';

const faqData = [
  {
    question: 'Can I enroll in multiple courses at once?',
    answer:
      'Absolutely! You can enroll in multiple courses simultaneously and access them at your convenience.',
    cta: 'Enrollment Process for Different Courses',
  },
  {
    question: 'What kind of support can I expect from instructors?',
    answer: '',
  },
  {
    question:
      'Are the courses self-paced or do they have specific start and end dates?',
    answer: '',
  },
  {
    question: 'Are there any prerequisites for the courses?',
    answer: '',
  },
  {
    question: 'Can I download the course materials for offline access?',
    answer: '',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleIndex = index => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <section className="bg-gray-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg sm:rounded-xl p-4 sm:p-8 shadow-sm">
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Side */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Still you have any questions? Contact our Team via{' '}
              <a href="mailto:support@skillbridge.com" className="underline break-all">
                support@skillbridge.com
              </a>
            </p>
            <button className="mt-4 sm:mt-6 bg-white border border-gray-300 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm text-gray-700 hover:bg-gray-100">
              See All FAQ’s
            </button>
          </div>

          {/* Right Side - FAQ Accordion */}
          <div className="md:col-span-2 space-y-3 sm:space-y-4">
            {faqData.map((item, idx) => (
              <div
                key={idx}
                className="border border-gray-100 rounded-xl bg-white shadow-sm"
              >
                <button
                  onClick={() => toggleIndex(idx)}
                  className="w-full text-left px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2"
                >
                  <span className="font-medium text-sm sm:text-base text-gray-900">
                    {item.question}
                  </span>
                  {openIndex === idx ? (
                    <X className="bg-[#FFF4E5] p-1 rounded cursor-pointer text-gray-500 w-5 h-5" />
                  ) : (
                    <Plus className="bg-[#FFF4E5] p-1 rounded cursor-pointer text-gray-500 w-5 h-5" />
                  )}
                </button>

                {openIndex === idx && item.answer && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 text-gray-700 text-xs sm:text-sm space-y-4">
                    <p>{item.answer}</p>
                    {item.cta && (
                      <button className="w-full flex items-center justify-between bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 rounded text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-200">
                        {item.cta}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
