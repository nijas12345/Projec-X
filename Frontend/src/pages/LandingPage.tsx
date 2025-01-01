import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left side with the image and centered project title */}
      <div className="lg:w-1/2 w-full h-1/2 lg:h-full bg-white-500 relative">
        <img
          src="/images/card.png"
          alt="landing"
          className="w-full h-full object-cover"
        />
        {/* Project title and sentences centered on the image */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
          {/* Project title */}
          <h1 className="font-mulish text-3xl sm:text-4xl font-medium text-white">
            Welcome to Project
          </h1>

          {/* Additional sentences below the title */}
          <p className="font-mulish text-lg sm:text-xl font-medium text-white mt-6 px-4">
            Let's streamline your workflow and elevate your productivity
            together
          </p>
        </div>
      </div>

      {/* Right side with image and button */}
      <div className="lg:w-1/2 w-full h-1/2 lg:h-full bg-white flex flex-col justify-center items-center p-4">
        {/* Image */}
        <img
          src="/images/landing-image.png"
          alt="Landing"
          className="w-3/4 mb-6"
        />

        {/* Button below the image */}
        <button
          onClick={handleGetStarted}
          className="bg-[#5453ab] text-white font-bold py-2 px-4 rounded flex items-center gap-2 hover:bg-[#4a4a9b] transition duration-300"
        >
          Get Started
          <ArrowRightIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
