import React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Clock,
  Users,
  Layers,
  TrendingUp,
  FolderOpen,
  MessageCircle,
} from "lucide-react";

const benefits = [
  {
    number: "01",
    title: "Flexible Learning Schedule",
    description:
      "Fit your coursework around your existing commitments and obligations.",
    icon: <Clock className="w-6 h-6" />,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    title: "Expert Instruction",
    description:
      "Learn from industry experts who have hands-on experience in design and development.",
    icon: <Users className="w-6 h-6" />,
    gradient: "from-orange-500 to-red-500",
  },
  {
    number: "03",
    title: "Diverse Course Offerings",
    description:
      "Explore a wide range of design and development courses covering various topics.",
    icon: <Layers className="w-6 h-6" />,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    number: "04",
    title: "Updated Curriculum",
    description:
      "Access courses with up-to-date content reflecting the latest trends and industry practices.",
    icon: <TrendingUp className="w-6 h-6" />,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    number: "05",
    title: "Practical Projects",
    description:
      "Develop a portfolio showcasing your skills and abilities to potential employers.",
    icon: <FolderOpen className="w-6 h-6" />,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    number: "06",
    title: "Interactive Learning",
    description:
      "Collaborate with fellow learners, exchanging ideas and feedback to enhance your understanding.",
    icon: <MessageCircle className="w-6 h-6" />,
    gradient: "from-indigo-500 to-purple-500",
  },
];

export default function BenefitsSection() {
  return (
    <section className="bg-white py-16 sm:py-20 px-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-100/50 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-50/50 to-transparent rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 sm:mb-14 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 text-sm font-semibold rounded-full mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Benefits of Learning with{" "}
              <span className="text-orange-500">Academiq</span>
            </h2>
            <p className="text-gray-600 max-w-xl">
              Discover the advantages that set our learning platform apart and
              help you achieve your goals.
            </p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-900 hover:bg-gray-800 text-white text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap"
          >
            View All Benefits
          </motion.button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 sm:p-8 border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300"
            >
              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.gradient} text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {benefit.icon}
              </div>

              {/* Number Badge */}
              <div className="absolute top-6 right-6 text-5xl font-bold text-gray-100 group-hover:text-orange-100 transition-colors duration-300">
                {benefit.number}
              </div>

              <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-3 relative">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 relative">
                {benefit.description}
              </p>

              <button className="inline-flex items-center gap-2 text-orange-500 font-medium text-sm group-hover:gap-3 transition-all duration-300">
                Learn More
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
