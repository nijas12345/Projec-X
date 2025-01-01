import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Component() {
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState("#home");
  const [isVisible, setIsVisible] = useState(false); // State to track visibility of the section
  const sectionRef = useRef(null); // Ref for the "Time Management" section
  const [isSlideVisible, setIsSlideVisible] = useState(false); // Visibility state for the slide section
  const slideRef = useRef(null); // Ref for the slide section
  const contactRef = useRef<HTMLDivElement | null>(null);
  const aboutRef = useRef<HTMLDivElement | null>(null);

  const handleClick = (link: any) => {
    setActiveLink(link);
    if (link === "#contacts" && contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (link === "#about" && aboutRef.current) {
      aboutRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  const slides = [
    {
      title: "Schedule",
      description:
        "Prioritize your project, assign each task to team members based on their availability, and provide the deadline for each task",
      illustration: (
        <div className="relative w-48 h-48">
          <img src="/images/9784103.jpg" alt="" />
        </div>
      ),
    },
    {
      title: "Manage",
      description:
        "Communicate regularly through video call meetings for seamless interaction with team members, and chat with them to get updates easily",
      illustration: (
        <div className="relative w-48 h-48">
          <img src="images\2808319.jpg" alt="" />
        </div>
      ),
    },
    {
      title: "Analyze",
      description:
        "Analyze the project and task status based on the actions of team members, get updates easily, and provide feedback based on their work",
      illustration: (
        <div className="relative w-48 h-48">
          <img src="images/2792102.jpg" alt="" />
        </div>
      ),
    },
  ];
  useEffect(() => {
    // Intersection Observer to detect when the "Time Management" section enters the viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true); // Make the section visible when it enters the viewport
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsSlideVisible(true);
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the section is visible
    );

    if (slideRef.current) {
      observer.observe(slideRef.current);
    }

    return () => {
      if (slideRef.current) {
        observer.unobserve(slideRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold">
              Projec<span className="text-[#00A3FF]"></span>
              <span className="text-[#00A3FF]">-X</span>
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-12">
            <button
              className={`text-gray-600 hover:text-gray-900 transition-colors ${
                activeLink === "#premium" ? "border-b-2 border-blue-500" : ""
              }`}
              onClick={() => navigate("/premium")}
            >
              Premium
            </button>
            <Link
              to="#home"
              className={`text-gray-600 hover:text-gray-900 transition-colors ${
                activeLink === "#home" ? "border-b-2 border-blue-500" : ""
              }`}
              onClick={() => handleClick("#home")}
            >
              Home
            </Link>
            <a
              href="#about"
              className={`text-gray-600 hover:text-gray-900 transition-colors ${
                activeLink === "#about" ? "border-b-2 border-blue-500" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleClick("#about");
              }}
            >
              About
            </a>
            <a
              href="#contacts"
              className={`text-gray-600 hover:text-gray-900 transition-colors ${
                activeLink === "#contacts" ? "border-b-2 border-blue-500" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleClick("#contacts");
              }}
            >
              Contacts
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-20 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <p className="text-[#00A3FF]">
                This Website is mainly focused on Project Manager and Team
                members. Explore the power of projec-X
              </p>
              <h1 className="text-5xl md:text-6xl font-bold text-[#1E1E1E] leading-tight">
                Team Work Projects
                <br />
              </h1>
              <div className="flex items-center space-x-4 pt-4">
                <button
                  onClick={() => {
                    navigate("/admin/login");
                  }}
                  className="bg-[#00A3FF] hover:bg-[#0093e9] text-white px-8 py-4 rounded-md text-lg"
                >
                  Project Manager Sign In
                </button>
                <button
                  onClick={() => {
                    navigate("/login");
                  }}
                  className="text-gray-600 hover:text-gray-900 px-8 py-4 text-lg border border-gray-300 rounded-md"
                >
                  Members Sign In
                </button>
              </div>
            </div>
          </div>
          {/* Illustration */}
          <img src="/images/landing.jpeg" alt="Landing Illustration" />
        </div>
      </div>

      {/* Time Management Section (This will fade in on scroll) */}
      <div ref={aboutRef} className="container mx-auto ">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Illustration on the Left Side */}
          <div className="flex justify-center">
            <img
              src="/images/time.jpeg"
              alt="Time Management"
              className={`transition-opacity duration-1000 ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

          {/* Content on the Right Side */}
          <div
            ref={sectionRef}
            className={`space-y-8 ${
              isVisible
                ? "opacity-100 transition-opacity duration-1000"
                : "opacity-0"
            }`}
          >
            <div className="space-y-6">
              <p className="text-[#00A3FF]">
                Do what you can, with what you have, where you are.
              </p>
              <h1 className="text-5xl md:text-6xl font-bold text-[#1E1E1E] leading-tight relative">
                Time Management
                <br />
                <span className="absolute left-0 right-0 -bottom-4 h-1 bg-[#1E1E1E] mt-2"></span>
              </h1>
              <p className="text-lg text-gray-700">
                This app helps you track and optimize your time by enabling you
                to clock in when you start working and clock out when you
                finish. Stay productive and manage your time better, with
                real-time tracking of your work hours.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        ref={slideRef}
        className={`min-h-screen bg-white flex items-center justify-center p-4 transition-opacity duration-1000 ${
          isSlideVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-full max-w-5xl mx-auto bg-gray-300 rounded-2xl shadow-lg overflow-hidden">
          {/* Horizontal scrolling for small screens */}
          <div className="flex flex-row sm:flex-col md:flex-row justify-around items-center overflow-x-auto">
            {slides.map((slide, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full sm:w-auto md:w-1/3 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="mb-8">{slide.illustration}</div>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">
                  {slide.title}
                </h2>
                <p className="text-gray-600 mb-8 max-w-xs">
                  {slide.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div
        ref={contactRef}
        id="contacts"
        className="mt-10 bg-[#00A3FF] -mx-6 px-6 py-16"
      >
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white relative">
            {[
              {
                title: "About Us",
                content:
                  "We are a leading company providing innovative solutions in technology.",
              },
              {
                title: "Our Mission",
                content:
                  "Our mission is to deliver value and exceed client expectations.",
              },
              {
                title: "Contact Us",
                content: (
                  <span>
                    Reach us at{" "}
                    <a
                      href="mailto:nijasbinabbas@gmail.com"
                      className="text-blue-100 underline"
                    >
                      nijasbinabbas@gmail.com
                    </a>{" "}
                    or call us at +123456789.
                  </span>
                ),
              },
            ].map((detail, index) => (
              <div key={index} className={`p-8`}>
                <h3 className="font-bold text-xl mb-4">{detail.title}</h3>
                <p className="text-white/80">{detail.content}</p>
              </div>
            ))}
            <button
              disabled
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center"
            >
              ←
            </button>
            <button
              disabled
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
