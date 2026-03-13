import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import {
  Download,
  Users,
  FileText,
  Megaphone,
  Zap,
  Globe,
  Smartphone,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import {
  VillageSceneSVG,
  PhoneAppMockup,
  AnimatedFeatureIcon,
  AnimatedDots,
  FloatingElements,
  StatisticCounter,
} from "@/components/HeroGraphics";

const VillageLandingPage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  usePageSEO({
    title: "VillageOrbit - Connecting Villages, Empowering Communities",
    description:
      "Access government services, schemes, announcements, and digital solutions for your village. Download the mobile app or register online.",
    keywords: ["villages", "gram panchayat", "village services", "government schemes", "digital village"],
    canonical: typeof window !== "undefined" ? window.location.href : "",
  });

  const features = [
    {
      icon: "📣",
      title: "गाव बातायचा व घुमणा",
      titleEn: "Village News & Updates",
      description: "गांव से संबंधित सभी खबरें",
    },
    {
      icon: "🌱",
      title: "गायच्या योजना घोषणा",
      titleEn: "Government Schemes",
      description: "सरकारी योजनाओं की जानकारी",
    },
    {
      icon: "🤝",
      title: "टोलकारी मारिते आपुलिया शिक्षणीय",
      titleEn: "Educational Resources",
      description: "शिक्षा की सामग्री",
    },
    {
      icon: "📚",
      title: "किंवा डिजिटल परीक्षा व शिक्षण",
      titleEn: "Online Education",
      description: "ऑनलाइन शिक्षा सेवाएं",
    },
  ];

  const benefits = [
    {
      number: "5000+",
      text: "गांवों को सेवा प्रदान",
      textEn: "Villages Served",
    },
    {
      number: "50000+",
      text: "सक्रिय उपयोगकर्ता",
      textEn: "Active Users",
    },
    {
      number: "24/7",
      text: "समर्थन उपलब्ध",
      textEn: "Support Available",
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-slide-down {
          animation: slideDown 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.8s ease-out;
        }
        .animate-fade-scale {
          animation: fadeInScale 0.8s ease-out;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}
      </style>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                VO
              </div>
              <h1 className="text-2xl font-bold text-green-600">VillageOrbit</h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="text-gray-700 hover:text-green-600 transition-colors">हिंदी</button>
              <Link to="/auth">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  लॉगिन करा
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  नोंदणी करा
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t">
              <div className="flex flex-col space-y-3 mt-4">
                <button className="text-gray-700 hover:text-green-600 transition-colors text-left">हिंदी</button>
                <Link to="/auth">
                  <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                    लॉगिन करा
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    नोंदणी करा
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-emerald-500 text-white overflow-hidden">
        {/* Floating Elements Background */}
        <div className="absolute inset-0 opacity-30">
          <FloatingElements className="w-full h-full" />
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
            <path d="M0,300 Q300,200 600,300 T1200,300 L1200,600 L0,600 Z" fill="rgba(255,255,255,0.05)"/>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-slide-down">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                आपल्या गावासाठी
                <br />
                डिजिटल प्लेटफॉर्म
              </h2>
              <p className="text-xl text-green-100 mb-2">शिक्षित गाव • डिजिटल गाव • प्रगत गाव</p>
              <p className="text-green-50 mb-8">गांव का विकास, डिजिटल होना आवश्यक है।</p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/auth">
                  <Button className="w-full sm:w-auto bg-white text-green-600 hover:bg-green-50 px-8 py-3 text-lg font-semibold rounded-lg transform hover:scale-105 transition-all shadow-lg">
                    नोंदणी करा
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white px-8 py-3 text-lg font-semibold rounded-lg transform hover:scale-105 transition-all shadow-lg">
                    लॉगिन करा
                  </Button>
                </Link>
              </div>

              {/* Info Box */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-all transform hover:scale-105">
                <p className="text-sm text-green-100 mb-3">
                  <span className="font-semibold">🌾 VillageOrbit Mobile App</span> अनलोड करा
                </p>
                <div className="flex items-center space-x-4 text-xs text-green-50">
                  <div className="flex items-center space-x-1 hover:text-white cursor-pointer transition-colors">
                    <span>📱</span>
                    <span>App अनलोड करा</span>
                  </div>
                  <div className="text-green-200">|</div>
                  <div className="flex items-center space-x-1 hover:text-white cursor-pointer transition-colors">
                    <span>🌐</span>
                    <span>बिना Browser वापरा</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image - Village Scene */}
            <div className="hidden md:flex justify-center animate-fade-scale">
              <div className="relative w-96 h-96">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-3xl"></div>
                <VillageSceneSVG className="filter drop-shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 px-4 bg-gradient-to-r from-green-600 to-emerald-500">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-white text-lg font-semibold mb-8">
            VillageOrbit के फायदेज्य सुजरत गेरा
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: "📣", title: "गाव बातायचा व घुमणा", text: "Village News & Updates" },
              { icon: "🌱", title: "गायच्या योजना घोषणा", text: "Government Schemes" },
              { icon: "🤝", title: "शिक्षणीय कार्यक्रम", text: "Educational Programs" },
              { icon: "📚", title: "डिजिटल परीक्षा व शिक्षण", text: "Online Education" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-6 text-center text-white hover:bg-opacity-30 transition-all transform hover:scale-105 animate-fade-scale border border-white border-opacity-10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl mb-3">{item.icon}</div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-xs opacity-90">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Features */}
            <div className="md:col-span-2">
              <h3 className="text-3xl font-bold text-gray-900 mb-8">
                Smart Village वनवणूकारिता VillageOrbit बापणे ही प्रत्येक नागरिकार्यार्या अपडेटरी राबे।
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all animate-fade-scale group border-l-4 border-green-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-5xl group-hover:animate-bounce">{feature.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2 text-lg">{feature.title}</h4>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                        <p className="text-green-600 text-xs mt-3 font-semibold flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" /> {feature.titleEn}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="hidden md:flex justify-center animate-float">
              <div className="relative w-48 h-80">
                <PhoneAppMockup className="filter drop-shadow-2xl" />
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-20 blur-2xl rounded-3xl"></div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Link to="/auth">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 text-lg rounded-lg transform hover:scale-105 transition-all shadow-lg font-semibold">
                नोंधणी करा दुर्दर्त !
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats and Trust Section with Animated Counters */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 py-20 px-4 text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            हमारी सफलता की कहानी
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex justify-center animate-fade-scale" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="w-40 h-40">
                  <StatisticCounter number={benefit.number} label={benefit.text} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">VillageOrbit</h3>
              <p className="text-sm">गांवों को डिजिटल समाधान प्रदान करना</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">About</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-green-400">About Us</a></li>
                <li><a href="#" className="hover:text-green-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Policy</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-green-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-green-400">Terms & Conditions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Follow Us</h4>
              <div className="flex space-x-4 text-sm">
                <a href="#" className="hover:text-green-400">Facebook</a>
                <a href="#" className="hover:text-green-400">Twitter</a>
                <a href="#" className="hover:text-green-400">Instagram</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} VillageOrbit. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VillageLandingPage;
