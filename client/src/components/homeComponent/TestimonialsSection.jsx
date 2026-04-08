import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star, ArrowRight } from 'lucide-react';

const testimonials = [
  {
    text: 'The web design course provided a solid foundation for me. The instructors were knowledgeable and supportive, and the interactive learning environment was engaging. I highly recommend it!',
    name: 'Sarah L.',
    role: 'UI/UX Designer',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
  },
  {
    text: "The UI/UX design course exceeded my expectations. The instructor's expertise and practical assignments helped me improve my design skills. I feel more confident in my career now.",
    name: 'Jason M.',
    role: 'Product Designer',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
  },
  {
    text: "The mobile app development course was fantastic! The step-by-step tutorials and hands-on projects helped me grasp the concepts easily. I'm now building my own app.",
    name: 'Emily R.',
    role: 'Mobile Developer',
    image: 'https://randomuser.me/api/portraits/women/55.jpg',
    rating: 5,
  },
  {
    text: "I enrolled in the graphic design course as a beginner, and it was the perfect starting point. The instructor's guidance improved my design abilities significantly.",
    name: 'Michael K.',
    role: 'Graphic Designer',
    image: 'https://randomuser.me/api/portraits/men/12.jpg',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-20 px-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-orange-50/40 rounded-full blur-3xl" />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 sm:mb-14 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 text-sm font-semibold rounded-full mb-4">
              Student Success
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              What Our <span className="text-orange-500">Students</span> Say
            </h2>
            <p className="text-gray-600 max-w-xl">
              Hear from our community of learners who have transformed their careers with Academiq.
            </p>
          </motion.div>
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group inline-flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-orange-300 text-gray-700 hover:text-orange-600 text-sm px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap"
          >
            View All Reviews
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="group bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Quote className="w-5 h-5 text-white" />
                </div>
                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>

              {/* Quote Text */}
              <p className="text-gray-700 leading-relaxed mb-6">{t.text}</p>

              {/* Author */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-orange-200 transition-all"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
                <button className="text-orange-500 hover:text-orange-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Read More
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
