const testimonials = [
  {
    text: 'The web design course provided a solid foundation for me. The instructors were knowledgeable and supportive, and the interactive learning environment was engaging. I highly recommend it!',
    name: 'Sarah L',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    text: "The UI/UX design course exceeded my expectations. The instructor's expertise and practical assignments helped me improve my design skills. I feel more confident in my career now. Thank you!",
    name: 'Jason M',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    text: "The mobile app development course was fantastic! The step-by-step tutorials and hands-on projects helped me grasp the concepts easily. I'm now building my own app. Great course!",
    name: 'Emily R',
    image: 'https://randomuser.me/api/portraits/women/55.jpg',
  },
  {
    text: "I enrolled in the graphic design course as a beginner, and it was the perfect starting point. The instructor’s guidance and feedback improved my design abilities significantly. I'm grateful for this course!",
    name: 'Michael K',
    image: 'https://randomuser.me/api/portraits/men/12.jpg',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-gray-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Our Testimonials
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-xl">
              Lorem ipsum dolor sit amet consectetur. Tempus tincidunt et, Cras
              eu sit dignissim lorem nibh.
            </p>
          </div>
          <button className="bg-white border border-gray-300 text-gray-700 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded shadow-sm hover:bg-gray-100 whitespace-nowrap">
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
            >
              <p className="text-sm sm:text-base text-gray-800 mb-4 sm:mb-6">{t.text}</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200 gap-3">
                <div className="flex items-center">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <span className="font-semibold text-sm sm:text-base text-gray-800">{t.name}</span>
                </div>
                <button className="bg-gray-100 text-gray-800 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium hover:bg-gray-200 w-full sm:w-auto">
                  Read Full Story
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
