import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Award, Target } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  const stats = [
    { label: 'Active Students', value: '10,000+' },
    { label: 'Expert Instructors', value: '500+' },
    { label: 'Courses Available', value: '1,000+' },
    { label: 'Success Rate', value: '95%' }
  ];

  const values = [
    {
      icon: <BookOpen className="w-8 h-8 text-[#FF5A00]" />,
      title: 'Quality Education',
      description: 'We provide top-notch courses designed by industry experts to ensure the best learning experience.'
    },
    {
      icon: <Users className="w-8 h-8 text-[#FF5A00]" />,
      title: 'Community Driven',
      description: 'Join a vibrant community of learners and instructors who support each other\'s growth.'
    },
    {
      icon: <Award className="w-8 h-8 text-[#FF5A00]" />,
      title: 'Certified Learning',
      description: 'Earn recognized certificates upon course completion to boost your career prospects.'
    },
    {
      icon: <Target className="w-8 h-8 text-[#FF5A00]" />,
      title: 'Goal Oriented',
      description: 'Our structured learning paths help you achieve your professional and personal goals.'
    }
  ];

  return (
    <div>
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-[#F9FAFB] py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            About <span className="text-[#FF5A00]">Academiq</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Empowering learners worldwide with quality education and innovative learning solutions.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4 sm:p-6 bg-gray-50 rounded-xl"
              >
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#FF5A00] mb-2">{stat.value}</h3>
                <p className="text-sm sm:text-base text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 px-4 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                At Academiq, we believe that education should be accessible to everyone, everywhere. Our mission is to democratize learning by providing high-quality courses that help individuals achieve their personal and professional goals.
              </p>
              <p className="text-gray-600 text-sm sm:text-base">
                We partner with industry experts and leading institutions to create engaging, practical courses that prepare learners for real-world challenges.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#FF5A00] to-[#FFB088] rounded-xl p-8 sm:p-12 text-white"
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Why Choose Us?</h3>
              <ul className="space-y-3 text-sm sm:text-base">
                <li className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>Learn at your own pace with flexible schedules</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>Access to expert instructors and mentors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>Interactive learning with hands-on projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>Lifetime access to course materials</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">Our Core Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
