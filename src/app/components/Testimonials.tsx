'use client';

import { useState } from 'react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
  skills?: string[];
}

const testimonialData: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Founder & CEO",
    company: "DecentraHub",
    content: "Cryptonique transformed our community from 50K to 150K members in just 12 months. Their strategic approach to engagement and crisis management was instrumental in maintaining community trust during volatile market periods. Exceptional expertise across Discord moderation, community analytics, and content strategy.",
    avatar: "SC",
    rating: 4.3,
    skills: ["Discord Moderation", "Analytics", "Content Strategy", "Leadership"]
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "Head of Operations",
    company: "CryptoSphere",
    content: "Outstanding project manager. Delivered all our major protocol upgrades on time and 40% faster than expected. Their ability to coordinate cross-functional teams and communicate clearly is exceptional.",
    avatar: "MR",
    rating: 5
  },
  {
    id: 3,
    name: "Alex Thompson",
    role: "Community Lead",
    company: "BlockchainVentures",
    content: "The educational content series created by Cryptonique went viral with 2M+ views. Their understanding of community dynamics and ability to create engaging narratives is truly impressive.",
    avatar: "AT",
    rating: 5
  },
  {
    id: 4,
    name: "Elena Vasquez",
    role: "Marketing Director",
    company: "TechWeb3 Labs",
    content: "One of the best community strategists I've worked with. They implemented data-driven engagement strategies that increased our community participation rate from 15% to 45% within 6 months.",
    avatar: "EV",
    rating: 5
  },
  {
    id: 5,
    name: "James Liu",
    role: "CTO",
    company: "Protocol Finance",
    content: "Cryptonique's ability to bridge the gap between technical teams and the community is invaluable. They reduced support response times from 24 hours to just 2 hours while maintaining quality.",
    avatar: "JL",
    rating: 5
  },
  {
    id: 6,
    name: "Priya Patel",
    role: "Business Development",
    company: "Blockchain Ventures",
    content: "Exceptional at building relationships and managing stakeholder expectations. Their ambassador program grew to 100+ active members and created a strong advocacy network for our projects.",
    avatar: "PP",
    rating: 5
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonialData.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex - 1 + testimonialData.length) % testimonialData.length
    );
  };

  const visibleTestimonials = [
    testimonialData[currentIndex],
    testimonialData[(currentIndex + 1) % testimonialData.length],
    testimonialData[(currentIndex + 2) % testimonialData.length]
  ];

  return (
    <div className="w-full">
      {/* Desktop Grid View */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {visibleTestimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="card bg-bg-light/5 backdrop-blur-sm p-6 rounded-xl border border-primary/10 hover:border-primary/20 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary">{testimonial.name}</h4>
                  <p className="text-xs text-text-secondary">{testimonial.role}</p>
                  <p className="text-xs text-primary/70">{testimonial.company}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-1 mb-4 items-center">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => {
                  const isFilled = i < Math.floor(testimonial.rating);
                  const isHalf = i === Math.floor(testimonial.rating) && testimonial.rating % 1 !== 0;
                  
                  return (
                    <svg
                      key={i}
                      className={`w-4 h-4 fill-current transition-colors ${
                        isFilled 
                          ? 'text-yellow-400' 
                          : isHalf 
                          ? 'text-yellow-300' 
                          : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  );
                })}
              </div>
              <span className="text-xs text-text-secondary ml-2 font-medium">{testimonial.rating}</span>
            </div>

            <p className="text-text-secondary leading-relaxed text-sm">
              "{testimonial.content}"
            </p>

            {testimonial.skills && (
              <div className="mt-4 pt-4 border-t border-primary/10">
                <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">Key Skills</p>
                <div className="flex flex-wrap gap-2">
                  {testimonial.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-2.5 py-1 text-xs rounded-full bg-primary/15 text-primary/80 font-medium hover:bg-primary/20 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Single View */}
      <div className="md:hidden mb-6">
        <div className="card bg-bg-light/5 backdrop-blur-sm p-6 rounded-xl border border-primary/10">
          <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
              {testimonialData[currentIndex].avatar}
            </div>
            <div>
              <h4 className="font-semibold text-text-primary">{testimonialData[currentIndex].name}</h4>
              <p className="text-xs text-text-secondary">{testimonialData[currentIndex].role}</p>
              <p className="text-xs text-primary/70">{testimonialData[currentIndex].company}</p>
            </div>
          </div>

          <div className="flex gap-1 mb-4 items-center">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => {
                const isFilled = i < Math.floor(testimonialData[currentIndex].rating);
                const isHalf = i === Math.floor(testimonialData[currentIndex].rating) && testimonialData[currentIndex].rating % 1 !== 0;
                
                return (
                  <svg
                    key={i}
                    className={`w-4 h-4 fill-current transition-colors ${
                      isFilled 
                        ? 'text-yellow-400' 
                        : isHalf 
                        ? 'text-yellow-300' 
                        : 'text-gray-300'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                );
              })}
            </div>
            <span className="text-xs text-text-secondary ml-2 font-medium">{testimonialData[currentIndex].rating}</span>
          </div>

          <p className="text-text-secondary leading-relaxed">
            "{testimonialData[currentIndex].content}"
          </p>

          {testimonialData[currentIndex].skills && (
            <div className="mt-4 pt-4 border-t border-primary/10">
              <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">Key Skills</p>
              <div className="flex flex-wrap gap-2">
                {testimonialData[currentIndex].skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2.5 py-1 text-xs rounded-full bg-primary/15 text-primary/80 font-medium hover:bg-primary/20 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Carousel Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={prevTestimonial}
          className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
          aria-label="Previous testimonial"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="flex gap-2">
          {testimonialData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary w-8'
                  : 'bg-primary/30 hover:bg-primary/50'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextTestimonial}
          className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
          aria-label="Next testimonial"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Indicators */}
      <p className="text-center text-sm text-text-secondary mt-2 mb-0">
        Testimonial {currentIndex + 1} of {testimonialData.length}
      </p>
    </div>
  );
};

export default Testimonials;
