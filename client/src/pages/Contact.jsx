import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Thank you for contacting us! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6 text-[#FF5A00]" />,
      title: 'Email',
      content: 'support@academiq.com',
      link: 'mailto:support@academiq.com'
    },
    {
      icon: <Phone className="w-6 h-6 text-[#FF5A00]" />,
      title: 'Phone',
      content: '+1 (555) 123-4567',
      link: 'tel:+15551234567'
    },
    {
      icon: <MapPin className="w-6 h-6 text-[#FF5A00]" />,
      title: 'Address',
      content: '123 Learning Street, Education City, EC 12345',
      link: null
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
            Get in <span className="text-[#FF5A00]">Touch</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </motion.p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 sm:py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-4">{info.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                {info.link ? (
                  <a href={info.link} className="text-sm text-gray-600 hover:text-[#FF5A00] transition-colors">
                    {info.content}
                  </a>
                ) : (
                  <p className="text-sm text-gray-600">{info.content}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12 sm:py-16 px-4 bg-[#F9FAFB]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent outline-none transition text-sm sm:text-base"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent outline-none transition text-sm sm:text-base"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent outline-none transition text-sm sm:text-base"
                  placeholder="How can we help you?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent outline-none transition resize-none text-sm sm:text-base"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-[#FF5A00] hover:bg-[#FFB088] text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Map Section (Optional) */}
      <section className="py-12 sm:py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8">Visit Our Office</h2>
          <div className="bg-gray-200 rounded-xl overflow-hidden h-64 sm:h-96 flex items-center justify-center">
            <p className="text-gray-500">Map integration placeholder</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
