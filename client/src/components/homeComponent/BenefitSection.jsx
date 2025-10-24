import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const benefits = [
  {
    number: '01',
    title: 'Flexible Learning Schedule',
    description:
      'Fit your coursework around your existing commitments and obligations.',
  },
  {
    number: '02',
    title: 'Expert Instruction',
    description:
      'Learn from industry experts who have hands-on experience in design and development.',
  },
  {
    number: '03',
    title: 'Diverse Course Offerings',
    description:
      'Explore a wide range of design and development courses covering various topics.',
  },
  {
    number: '04',
    title: 'Updated Curriculum',
    description:
      'Access courses with up-to-date content reflecting the latest trends and industry practices.',
  },
  {
    number: '05',
    title: 'Practical Projects and Assignments',
    description:
      'Develop a portfolio showcasing your skills and abilities to potential employers.',
  },
  {
    number: '06',
    title: 'Interactive Learning Environment',
    description:
      'Collaborate with fellow learners, exchanging ideas and feedback to enhance your understanding.',
  },
];

export default function BenefitsSection() {
  return (
    <section className="bg-[#F9FAFB] py-12 sm:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">Benefits</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-xl">
              Lorem ipsum dolor sit amet consectetur. Tempus tincidunt etiam
              eget elit id imperdiet et.
            </p>
          </div>
          <button className="bg-white hover:bg-gray-100 border border-gray-300 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded shadow-sm text-black whitespace-nowrap">
            View All
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow hover:shadow-md transition"
            >
              <div className="text-3xl font-bold text-black mb-4">
                {benefit.number}
              </div>
              <h3 className="font-semibold text-black text-lg mb-1">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                {benefit.description}
              </p>

              <button className="w-10 h-10 rounded-md border border-gray-200 flex items-center justify-center hover:bg-[#FF5A00]/10 transition">
                <ArrowUpRight className="h-4 w-4 text-[#FF5A00]" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
