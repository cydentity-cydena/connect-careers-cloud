import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, MessageSquare, Repeat2, Send, Shield, Award, Users, Briefcase, TrendingUp, CheckCircle, MoreHorizontal, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const slides = [
  {
    id: 1,
    title: "Ready to land your",
    highlight: "dream cybersecurity job?",
    icon: Shield,
    bgGradient: "from-cyan-600 via-blue-700 to-slate-800",
  },
  {
    id: 2,
    title: "Showcase your",
    highlight: "verified certifications",
    icon: Award,
    features: ["CISSP", "CISM", "CompTIA Security+", "CEH"],
    bgGradient: "from-emerald-600 via-teal-700 to-slate-800",
  },
  {
    id: 3,
    title: "Get discovered by",
    highlight: "top employers",
    icon: Briefcase,
    features: ["Fortune 500", "Startups", "Government", "Consulting"],
    bgGradient: "from-violet-600 via-purple-700 to-slate-800",
  },
  {
    id: 4,
    title: "Track your",
    highlight: "career growth",
    icon: TrendingUp,
    features: ["Skills Assessment", "AI Career Paths", "XP & Badges"],
    bgGradient: "from-amber-500 via-orange-600 to-slate-800",
  },
  {
    id: 5,
    title: "Join the",
    highlight: "community",
    icon: Users,
    features: ["Networking", "Mentorship", "Challenges"],
    bgGradient: "from-rose-500 via-pink-600 to-slate-800",
  },
  {
    id: 6,
    title: "Cydena",
    highlight: "Your cyber career starts here",
    icon: CheckCircle,
    cta: true,
    bgGradient: "from-cyan-600 via-blue-700 to-slate-800",
  },
];

const LinkedInAd = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [likes, setLikes] = useState(2847);
  const [isLiked, setIsLiked] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleReaction = (type: string) => {
    if (reaction === type) {
      setReaction(null);
      setLikes(prev => prev - 1);
    } else {
      if (!reaction) setLikes(prev => prev + 1);
      setReaction(type);
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-[#f4f2ee] flex items-center justify-center p-4">
      <SEO 
        title="Cydena - Cybersecurity Talent Platform | LinkedIn"
        description="Join Cydena - The platform for cybersecurity professionals to showcase skills, get verified, and land dream jobs."
      />
      
      {/* LinkedIn Post Card */}
      <div className="w-full max-w-[550px] bg-white rounded-lg shadow-md overflow-hidden">
        {/* Post Header */}
        <div className="p-4 flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-[#000000e6] hover:text-[#0a66c2] hover:underline cursor-pointer">Cydena</span>
              <span className="text-[#00000099] text-sm">• 1st</span>
            </div>
            <p className="text-[#00000099] text-sm truncate">Cybersecurity Talent Platform | Connecting verified professionals with top employers</p>
            <div className="flex items-center gap-1 text-[#00000099] text-xs">
              <span>2h</span>
              <span>•</span>
              <Globe className="w-3 h-3" />
            </div>
          </div>
          <button className="p-2 hover:bg-black/5 rounded-full">
            <MoreHorizontal className="w-5 h-5 text-[#00000099]" />
          </button>
        </div>

        {/* Post Text */}
        <div className="px-4 pb-3">
          <p className="text-[#000000e6] text-sm leading-relaxed">
            🚀 <span className="font-semibold">Tired of the cybersecurity job hunt?</span>
            <br /><br />
            We built Cydena to solve this. Get your certifications verified, showcase your real skills, and let employers find YOU.
            <br /><br />
            ✅ Verified credentials<br />
            ✅ Skills assessments<br />
            ✅ Direct employer access<br />
            ✅ AI-powered career guidance
            <br /><br />
            <span className="text-[#0a66c2] hover:underline cursor-pointer">#Cybersecurity</span> <span className="text-[#0a66c2] hover:underline cursor-pointer">#InfoSec</span> <span className="text-[#0a66c2] hover:underline cursor-pointer">#CareerGrowth</span> <span className="text-[#0a66c2] hover:underline cursor-pointer">#Hiring</span>
          </p>
        </div>

        {/* Video/Carousel Content */}
        <div className="relative aspect-square bg-slate-900 overflow-hidden">
          {/* Animated background */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient}`}
            />
          </AnimatePresence>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 bg-white/20 rounded-full"
                initial={{ 
                  x: Math.random() * 550, 
                  y: Math.random() * 550,
                  opacity: 0 
                }}
                animate={{ 
                  y: [null, -80],
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: 5 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center items-center px-8 text-center">
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
                  className="mx-auto w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20"
                >
                  <Icon className="w-10 h-10 text-white" />
                </motion.div>

                {/* Title */}
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{slide.title}</h2>
                  <p className="text-3xl font-bold text-cyan-300">{slide.highlight}</p>
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
                        className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm text-white border border-white/20"
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
                      <Button className="bg-white text-slate-900 hover:bg-white/90 px-8 py-3 text-lg rounded-full font-semibold">
                        Get Started Free →
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSlide ? 'bg-white w-6' : 'bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Cydena watermark */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">cydena.com</span>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-[#00000014]">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="w-5 h-5 rounded-full bg-[#0a66c2] flex items-center justify-center">
                <ThumbsUp className="w-3 h-3 text-white fill-white" />
              </div>
              <div className="w-5 h-5 rounded-full bg-[#df704d] flex items-center justify-center text-xs">❤️</div>
              <div className="w-5 h-5 rounded-full bg-[#6dae4f] flex items-center justify-center text-xs">👏</div>
            </div>
            <span className="text-[#00000099] text-sm ml-1">{likes.toLocaleString()}</span>
          </div>
          <div className="text-[#00000099] text-sm">
            <span>847 comments</span>
            <span className="mx-1">•</span>
            <span>234 reposts</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-2 py-1 flex items-center justify-around border-b border-[#00000014]">
          <button 
            onClick={() => handleReaction('like')}
            className={`flex items-center gap-2 px-4 py-3 rounded hover:bg-black/5 transition-colors ${reaction ? 'text-[#0a66c2]' : 'text-[#00000099]'}`}
          >
            <ThumbsUp className={`w-5 h-5 ${reaction ? 'fill-[#0a66c2]' : ''}`} />
            <span className="font-medium text-sm">{reaction ? 'Liked' : 'Like'}</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-3 rounded hover:bg-black/5 transition-colors text-[#00000099]">
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium text-sm">Comment</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-3 rounded hover:bg-black/5 transition-colors text-[#00000099]">
            <Repeat2 className="w-5 h-5" />
            <span className="font-medium text-sm">Repost</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-3 rounded hover:bg-black/5 transition-colors text-[#00000099]">
            <Send className="w-5 h-5" />
            <span className="font-medium text-sm">Send</span>
          </button>
        </div>

        {/* CTA Banner */}
        <div className="p-4 bg-gradient-to-r from-[#0a66c2] to-[#004182]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Start your cybersecurity career journey</p>
              <p className="text-white/80 text-sm">Join thousands of verified professionals</p>
            </div>
            <Link to="/auth">
              <Button className="bg-white text-[#0a66c2] hover:bg-white/90 font-semibold">
                Join Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInAd;
