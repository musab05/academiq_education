import React from 'react';

export default function VideoPreviewSection() {
  return (
    <section className="flex justify-center py-8 sm:py-12 px-4 bg-[#F9FAFB]">
      <div className="max-w-4xl w-full rounded-lg sm:rounded-xl overflow-hidden shadow-lg aspect-video">
        <iframe
          className="w-full h-full"
          src="https://www.youtube.com/embed/ezbJwaLmOeM?si=_Err7CnOy8ht6YvD&amp;rel=0"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
    </section>
  );
}
