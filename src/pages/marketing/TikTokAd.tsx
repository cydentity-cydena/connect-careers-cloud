import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Shield, Award, Users, Briefcase, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const slides = [
  {
    id: 1,
    title: "Ready to land your",
    highlight: "dream cybersecurity job?",
    icon: Shield,
    bgGradient: "from-cyan-900/80 via-slate-900 to-slate-950",
  },
  {
    id: 2,
    title: "Showcase your",
    highlight: "verified certifications",
    icon: Award,
    features: ["CISSP", "CISM", "CompTIA Security+", "CEH"],
    bgGradient: "from-emerald-900/80 via-slate-900 to-slate-950",
  },
  {
    id: 3,
    title: "Get discovered by",
    highlight: "top employers",
    icon: Briefcase,
    features: ["Fortune 500", "Startups", "Government", "Consulting"],
    bgGradient: "from-violet-900/80 via-slate-900 to-slate-950",
  },
  {
    id: 4,
    title: "Track your",
    highlight: "career growth",
    icon: TrendingUp,
    features: ["Skills Assessment", "AI Career Paths", "XP & Badges"],
    bgGradient: "from-amber-900/80 via-slate-900 to-slate-950",
  },
  {
    id: 5,
    title: "Join the",
    highlight: "community",
    icon: Users,
    features: ["Networking", "Mentorship", "Challenges"],
    bgGradient: "from-rose-900/80 via-slate-900 to-slate-950",
  },
  {
    id: 6,
    title: "Cydena",
    highlight: "Your cyber career starts here",
    icon: CheckCircle,
    cta: true,
    bgGradient: "from-cyan-900/80 via-slate-900 to-slate-950",
  },
];

const TikTokAd = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [likes, setLikes] = useState(24500);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <SEO 
        title="Cydena - Cybersecurity Talent Platform | TikTok"
        description="Join Cydena - The platform for cybersecurity professionals to showcase skills, get verified, and land dream jobs."
      />
      
      {/* Phone mockup container */}
      <div className="relative">
        {/* Phone frame */}
        <div className="relative w-[340px] h-[680px] bg-black rounded-[3rem] p-2 shadow-2xl shadow-cyan-500/20">
          {/* Screen */}
          <div className="relative w-full h-full bg-slate-900 rounded-[2.5rem] overflow-hidden">
            {/* Animated background */}
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 bg-gradient-to-b ${slide.bgGradient}`}
              />
            </AnimatePresence>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
                  initial={{ 
                    x: Math.random() * 340, 
                    y: Math.random() * 680,
                    opacity: 0 
                  }}
                  animate={{ 
                    y: [null, -100],
                    opacity: [0, 0.6, 0]
                  }}
                  transition={{
                    duration: 4 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center px-6 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="mx-auto w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center"
                  >
                    <Icon className="w-8 h-8 text-cyan-400" />
                  </motion.div>

                  {/* Title */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{slide.title}</h2>
                    <p className="text-2xl font-bold text-cyan-400">{slide.highlight}</p>
                  </div>

                  {/* Features */}
                  {slide.features && (
                    <motion.div 
                      className="flex flex-wrap justify-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {slide.features.map((feature, i) => (
                        <motion.span
                          key={feature}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/90"
                        >
                          {feature}
                        </motion.span>
                      ))}
                    </motion.div>
                  )}

                  {/* CTA on last slide */}
                  {slide.cta && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link to="/auth">
                        <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 text-lg rounded-full">
                          Join FREE ✨
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* TikTok-style UI overlay */}
            <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
              <button onClick={handleLike} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full ${isLiked ? 'bg-red-500' : 'bg-white/10'} flex items-center justify-center`}>
                  <Heart className={`w-5 h-5 ${isLiked ? 'text-white fill-white' : 'text-white'}`} />
                </div>
                <span className="text-white text-xs mt-1">{(likes / 1000).toFixed(1)}K</span>
              </button>
              
              <button className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-xs mt-1">1.2K</span>
              </button>
              
              <button className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-xs mt-1">Share</span>
              </button>
            </div>

            {/* Bottom bar */}
            <div className="absolute bottom-4 left-4 right-16">
              <p className="text-white font-semibold">@cydena</p>
              <p className="text-white/80 text-sm flex items-center gap-1">
                <Shield className="w-3 h-3" /> Cybersecurity talent platform
              </p>
            </div>

            {/* Progress dots */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentSlide ? 'bg-cyan-400 w-4' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA buttons below phone */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        <Link to="/auth">
          <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 rounded-full px-8">
            Try It FREE ✨
          </Button>
        </Link>
        <Link to="/">
          <Button size="lg" variant="outline" className="rounded-full px-8 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
            Learn More
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default TikTokAd;
