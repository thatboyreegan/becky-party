import { Link } from "react-router";
import type { Route } from "./+types/home";
import { useState, useEffect, useRef } from "react";
import { Left, Right } from "~/assets/icons";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Becky's Birthday App" },
    { name: "description", content: "Welcome to Becky's Special Day!" },
  ];
}

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const carouselRef = useRef(null);

  const features = [
    {
      id: 1,
      icon: "fa-envelope-open-text",
      title: "Beautiful Invites",
      description:
        "Design stunning digital invitations that your guests will love. Customize with themes, colors, and all the party details.",
      color: "bg-purple-600",
    },
    {
      id: 2,
      icon: "fa-music",
      title: "Collaborative Playlists",
      description:
        "Let your guests contribute to the party vibe. Create a shared playlist where everyone can add their favorite tracks.",
      color: "bg-pink-500",
    },
    {
      id: 3,
      icon: "fa-palette",
      title: "Personal Moodboards",
      description:
        "Each guest gets their own space to share inspiration, photos, and ideas for the perfect party atmosphere.",
      color: "bg-teal-400",
    },
  ];

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, features.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden w-full min-h-[85vh] md:min-h-[75vh] max-h-[800px] flex flex-col relative">
          <div className="absolute w-48 h-48 md:w-72 md:h-72 bg-gradient-to-br from-purple-600 to-transparent rounded-full -top-12 -right-12 md:-top-24 md:-right-24 opacity-20 z-0"></div>
          <div className="absolute w-36 h-36 md:w-56 md:h-56 bg-gradient-to-br from-pink-500 to-transparent rounded-full bottom-12 -left-12 md:bottom-16 md:-left-24 opacity-20 z-0"></div>
          <div className="absolute w-24 h-24 md:w-40 md:h-40 bg-gradient-to-br from-teal-400 to-transparent rounded-full bottom-40 right-1/4 opacity-20 z-0"></div>

          <div className="px-6 py-8 md:px-8 md:py-12 text-center bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent z-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              Welcome to the World of Parties!
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Create unforgettable experiences with custom invites,
              collaborative playlists, and personalized moodboards
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 md:px-8 md:py-12 z-10">
            {/* Mobile Carousel */}
            <div
              ref={carouselRef}
              className="md:hidden w-full max-w-sm"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative overflow-hidden rounded-2xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {features.map((feature) => (
                    <div key={feature.id} className="w-full flex-shrink-0 px-2">
                      <div className="group bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100 transition-all duration-300">
                        <div className="flex flex-col items-center text-center">
                          <div
                            className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                          >
                            <i
                              className={`fas ${feature.icon} text-white text-2xl`}
                            ></i>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-3">
                            {feature.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-28 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all duration-200"
                >
                  {""}
                  <i className="fas fa-chevron-left text-gray-700"></i>
                  <Left />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-28 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all duration-200"
                >
                  {""}
                  <Right />
                  <i className="fas fa-chevron-right text-gray-700"></i>
                </button>

                {/* Dots Indicator */}
                <div className="flex justify-center space-x-2 mt-6">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "bg-purple-600 scale-125"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:flex flex-col md:flex-row justify-center items-stretch gap-6 w-full">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="group bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex-1 max-w-sm"
                >
                  <div className="flex flex-col items-center text-center h-full">
                    <div
                      className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <i
                        className={`fas ${feature.icon} text-white text-2xl`}
                      ></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed flex-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Section */}
          <div className="bg-gray-50/80 border-t border-gray-100 px-6 py-6 md:px-8 md:py-8 z-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-center text-gray-800 mb-4">
              What are you up to?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/"
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-w-[200px] text-center"
              >
                <i className="fas fa-check-circle"></i>
                Validating an Invite
              </Link>
              <Link
                to="/host/setup"
                className="flex items-center justify-center gap-2 bg-teal-400 hover:bg-teal-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-w-[200px] text-center"
              >
                <i className="fas fa-plus-circle"></i>
                Creating an Invite
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
