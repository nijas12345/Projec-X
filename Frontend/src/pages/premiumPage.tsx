import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { ProjectorIcon, Lock } from "lucide-react";
import api from "../utils/axiosInstance";
import { RootState } from "../redux/RootState/RootState";
import { AdminData } from "../apiTypes/apiTypes";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const PremiumPage: React.FC = () => {
  const navigate = useNavigate();
  const adminInfo = useSelector(
    (state: RootState): AdminData | null => state.adminAuth.adminInfo
  );
  const contactRef = useRef<HTMLDivElement | null>(null);
  const featureRef = useRef<HTMLDivElement | null>(null);
  const [monthlySubscription, setMonthlySubscription] =
    useState<string>("base");
  const [yearlySubscription, setYearlySubscription] = useState<string>("pro");
  const [activeLink, setActiveLink] = useState("#premium");

  useEffect(() => {
    if (!adminInfo) {
      navigate("/");
    }
  });
  const handlePaymentMonthly = async () => {
    try {
      const response = await api.post("/admin/payment", {
        subscription: monthlySubscription,
      });
      if (response.status == 200) {
        window.location.href = response.data;
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      }
    }
  };
  const handlePaymentYearly = async () => {
    try {
      const response = await api.post("/admin/payment", {
        subscription: yearlySubscription,
        email: adminInfo?.email,
      });
      if (response.status == 200) {
        window.location.href = response.data;
      }
    } catch (error: any) {
      console.log(error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      }
    }
  };

  const handleClick = (link: any) => {
    setActiveLink(link);
    if (link === "#contacts" && contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (link === "#feature" && featureRef.current) {
      featureRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  const features = [
    {
      icon: <ProjectorIcon className="w-6 h-6 text-gray-700" />,
      title: "Multiple Projects",
      description: (
        <>
          Unlock elaborate premium video solutions like{" "}
          <a href="#" className="text-blue-500 hover:underline">
            this
          </a>
          Company can create more than 2 projects and assign unlimited tasks
        </>
      ),
    },
    {
      icon: <Lock className="w-6 h-6 text-gray-700" />,
      title: "Access to Premium Content",
      description:
        "The admin can add more than 10 members to a project for seamless interaction between the members",
    },
  ];
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
            <Link
              to="#premium"
              className={`text-gray-600 hover:text-gray-900 transition-colors ${
                activeLink === "#premium" ? "border-b-2 border-blue-500" : ""
              }`}
              onClick={() => handleClick("#premium")}
            >
              Premium
            </Link>
            <button
              className={`text-gray-600 hover:text-gray-900 transition-colors ${
                activeLink === "#home" ? "border-b-2 border-blue-500" : ""
              }`}
              onClick={() => navigate("/")}
            >
              Home
            </button>
            <Link
              to="#feature"
              className={`text-gray-600 hover:text-gray-900 transition-colors ${
                activeLink === "#about" ? "border-b-2 border-blue-500" : ""
              }`}
              onClick={() => handleClick("#feature")}
            >
              features
            </Link>
            <a
              href="#feature"
              className={`text-gray-600 hover:text-gray-900 transition-colors ${
                activeLink === "#contacts" ? "border-b-2 border-blue-500" : ""
              }`}
              onClick={() => handleClick("#contacts")}
            >
              Contacts
            </a>
          </div>
        </div>
      </nav>

      <div className="w-full  mx-auto px-4 py-16 bg-gray-100">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Premium</h1>
          <p className="text-xl text-gray-600">
            Get started with a Projec-X Subscription that works for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="relative bg-gray-50 p-6 rounded-lg shadow-md ">
            <div className="space-y-1 mb-4">
              <h2 className="text-2xl font-bold">Monthly</h2>
              <p className="text-gray-500">billed monthly</p>
            </div>
            <div className="space-y-4 mb-4">
              <div className="space-y-2">
                <p className="text-gray-500">Down from $39/month.</p>
                <p className="text-gray-600">
                  Our monthly plan grants access to{" "}
                  <span className="font-medium">all premium features</span>, the
                  best plan for short-term subscribers.
                </p>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">$20</span>
                <span className="text-gray-500 ml-2">/mo</span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <button
                onClick={handlePaymentMonthly}
                className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
              >
                Subscribe
              </button>
              <p className="text-sm text-gray-500">Prices are marked in USD</p>
            </div>
          </div>

          <div className="relative bg-orange-50 border border-orange-100 p-6 rounded-lg shadow-md ">
            <div className="absolute top-0 right-0 px-3 py-1 bg-orange-100 rounded-bl-lg rounded-tr-lg flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Most popular</span>
            </div>
            <div className="space-y-1 mb-4">
              <h2 className="text-2xl font-bold">Yearly</h2>
              <p className="text-gray-500">billed yearly ($159)</p>
            </div>
            <div className="space-y-4 mb-4">
              <div className="space-y-2">
                <p className="text-gray-600">
                  Our <span className="font-medium">most popular</span> plan
                  previously sold for $299 and is now only $13.25/month.
                </p>
                <p className="text-gray-600">
                  This plan{" "}
                  <span className="font-medium">saves you over 60%</span> in
                  comparison to the monthly plan.
                </p>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">$13.25</span>
                <span className="text-gray-500 ml-2">/mo</span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <button
                onClick={handlePaymentYearly}
                className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
              >
                Subscribe
              </button>
              <p className="text-sm text-gray-500">Prices are marked in USD</p>
            </div>
          </div>
        </div>
      </div>

      <div ref={featureRef} className="max-w-6xl mx-auto p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 mt-1">{feature.icon}</div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div ref={contactRef} className="mt-10 bg-[#00A3FF] -mx-6 px-6 py-16">
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
};
export default PremiumPage;
