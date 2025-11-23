import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Shield, Award, TrendingUp, Users, Lock, CheckCircle } from "lucide-react";

const CandidatePDF = () => {
  return (
    <div className="min-h-screen bg-white print:bg-white">
      <SEO 
        title="Cydena for Candidates - Your Career Acceleration Platform"
        description="Transform your cybersecurity career with verified credentials, skill validation, and direct access to top employers."
      />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-8 print:p-6">
        <div className="max-w-4xl mx-auto">
          <img 
            src="/logos/cydena-main-logo.png" 
            alt="Cydena" 
            className="h-12 mb-6"
          />
          <h1 className="text-4xl font-bold mb-3 text-gray-900 print:text-3xl">
            Accelerate Your Cybersecurity Career
          </h1>
          <p className="text-lg text-gray-600">
            Get verified, get noticed, get hired faster
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-6">
        
        {/* Problem Statement */}
        <div className="mb-10 print:mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 print:text-xl">
            Are You Invisible to Employers?
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            In today's competitive cybersecurity market, having the right certifications and experience isn't enough. 
            You need to <strong>prove your qualifications</strong> and <strong>stand out from hundreds of applicants</strong>.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Traditional job boards make you just another resume in a pile. Cydena makes you a <strong>verified, 
            HR-ready professional</strong> that employers actively seek out.
          </p>
        </div>

        {/* Value Propositions */}
        <div className="mb-10 print:mb-8 print:break-inside-avoid">
          <h2 className="text-2xl font-bold text-gray-900 mb-5 print:text-xl">
            Why Top Cybersecurity Professionals Choose Cydena
          </h2>
          
          <div className="space-y-5 print:space-y-4">
            <div className="flex gap-4 print:break-inside-avoid">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[hsl(189,97%,55%)]/10 rounded-lg flex items-center justify-center print:w-8 print:h-8">
                  <Shield className="w-5 h-5 text-[hsl(189,97%,55%)] print:w-4 print:h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 print:text-base print:mb-1">
                  Get HR-Ready Verification
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Complete identity, right-to-work, and security clearance verification once. Employers see you're 
                  pre-vetted and ready to start, cutting hiring time from months to weeks.
                </p>
              </div>
            </div>

            <div className="flex gap-4 print:break-inside-avoid">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[hsl(189,97%,55%)]/10 rounded-lg flex items-center justify-center print:w-8 print:h-8">
                  <Award className="w-5 h-5 text-[hsl(189,97%,55%)] print:w-4 print:h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 print:text-base print:mb-1">
                  Showcase Verified Credentials
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Your certifications, security clearances, and specialized training are verified and showcased with 
                  credibility. Stand out with CCRTS, CCSAS, OSCP, and other high-value credentials.
                </p>
              </div>
            </div>

            <div className="flex gap-4 print:break-inside-avoid">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[hsl(189,97%,55%)]/10 rounded-lg flex items-center justify-center print:w-8 print:h-8">
                  <TrendingUp className="w-5 h-5 text-[hsl(189,97%,55%)] print:w-4 print:h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 print:text-base print:mb-1">
                  Build Your Skill Genome
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Validate your technical skills with hands-on assessments and AI-powered career insights. Get matched 
                  to roles that fit your expertise perfectly.
                </p>
              </div>
            </div>

            <div className="flex gap-4 print:break-inside-avoid">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[hsl(189,97%,55%)]/10 rounded-lg flex items-center justify-center print:w-8 print:h-8">
                  <Users className="w-5 h-5 text-[hsl(189,97%,55%)] print:w-4 print:h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 print:text-base print:mb-1">
                  Join the Elite Community
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Connect with other verified cybersecurity professionals, share insights, and access exclusive training 
                  opportunities from industry partners.
                </p>
              </div>
            </div>

            <div className="flex gap-4 print:break-inside-avoid">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[hsl(189,97%,55%)]/10 rounded-lg flex items-center justify-center print:w-8 print:h-8">
                  <Lock className="w-5 h-5 text-[hsl(189,97%,55%)] print:w-4 print:h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 print:text-base print:mb-1">
                  Control Your Privacy
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  You decide who sees your profile and when. Employers can view your verified status without accessing 
                  sensitive documents until you authorize it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 print:p-5 print:mb-6 print:border print:border-gray-200 print:break-inside-avoid">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center print:text-lg print:mb-3">
            What Our Members Say
          </h2>
          <div className="space-y-4 print:space-y-3">
            <div className="border-l-4 border-[hsl(189,97%,55%)] pl-4 print:pl-3">
              <p className="text-gray-700 italic mb-2">
                "I was HR-Ready verified in less than 48 hours and had my first employer interview within a week. 
                The pre-verification made all the difference."
              </p>
              <p className="text-sm text-gray-600 font-semibold">
                - Security Analyst, Founding 200 Member
              </p>
            </div>
            <div className="border-l-4 border-[hsl(189,97%,55%)] pl-4 print:pl-3">
              <p className="text-gray-700 italic mb-2">
                "Instead of applying to hundreds of jobs, employers found me. Being verified gave them 
                confidence to reach out directly."
              </p>
              <p className="text-sm text-gray-600 font-semibold">
                - Penetration Tester, 5+ years experience
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-8 print:mb-6 print:break-before-page">
          <h2 className="text-2xl font-bold text-gray-900 mb-5 print:text-xl print:mb-4">
            Get Started in 3 Simple Steps
          </h2>
          
          <div className="space-y-4 print:space-y-3">
            <div className="flex items-start gap-4 print:break-inside-avoid">
              <div className="flex-shrink-0 w-8 h-8 bg-[hsl(189,97%,55%)] text-white rounded-full flex items-center justify-center font-bold text-sm print:w-7 print:h-7 print:text-xs">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 print:text-sm">Create Your Profile</h3>
                <p className="text-gray-700">
                  Add your experience, certifications, and skills. Our AI helps optimize your profile for maximum visibility.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 print:break-inside-avoid">
              <div className="flex-shrink-0 w-8 h-8 bg-[hsl(189,97%,55%)] text-white rounded-full flex items-center justify-center font-bold text-sm print:w-7 print:h-7 print:text-xs">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 print:text-sm">Get Verified</h3>
                <p className="text-gray-700">
                  Submit identity, right-to-work, and clearance verification. Our team reviews within 48 hours.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 print:break-inside-avoid">
              <div className="flex-shrink-0 w-8 h-8 bg-[hsl(189,97%,55%)] text-white rounded-full flex items-center justify-center font-bold text-sm print:w-7 print:h-7 print:text-xs">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 print:text-sm">Get Discovered</h3>
                <p className="text-gray-700">
                  Employers search for verified candidates like you. Respond to opportunities or apply to curated roles.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[hsl(189,97%,55%)] to-[hsl(263,70%,50%)] text-white rounded-lg p-8 text-center print:bg-white print:text-gray-900 print:border-4 print:border-[hsl(189,97%,55%)] print:p-6 print:break-inside-avoid">
          <h2 className="text-2xl font-bold mb-3 print:text-xl print:mb-2">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-lg mb-5 opacity-90 print:opacity-100 print:text-base print:mb-4">
            Join hundreds of verified cybersecurity professionals getting hired faster
          </p>
          <div className="flex flex-col gap-2 justify-center items-center mb-4 print:gap-1.5 print:mb-3">
            <div className="text-base font-semibold print:text-sm">
              👉 Visit: <a href="https://cydena.com" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">cydena.com</a>
            </div>
            <div className="text-base font-semibold print:text-sm">
              ✉️ Email: <a href="mailto:contact@cydena.com" className="underline hover:opacity-80">contact@cydena.com</a>
            </div>
          </div>
          <p className="text-sm opacity-75 print:opacity-100 print:text-xs">
            Free to join • Get verified in 48 hours • Start getting discovered
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 p-6 mt-8 print:border-t print:bg-white print:p-4 print:mt-6">
        <div className="max-w-4xl mx-auto text-center text-gray-600">
          <p className="mb-1 font-semibold text-sm print:text-xs">Cydena - The Verified Cybersecurity Talent Platform</p>
          <p className="text-xs print:text-[10px]">www.cydena.com | contact@cydena.com</p>
        </div>
      </div>

      {/* Print Button */}
      <div className="print:hidden fixed bottom-8 right-8">
        <Button 
          size="lg"
          onClick={() => window.print()}
          className="shadow-lg"
        >
          Download as PDF
        </Button>
      </div>
    </div>
  );
};

export default CandidatePDF;
