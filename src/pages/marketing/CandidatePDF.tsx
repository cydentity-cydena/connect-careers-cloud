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
      <div className="bg-gradient-to-r from-[hsl(189,97%,55%)] to-[hsl(263,70%,50%)] text-white p-12 print:p-8">
        <div className="max-w-4xl mx-auto">
          <img 
            src="/logos/cydena-main-logo.png" 
            alt="Cydena" 
            className="h-12 mb-6"
          />
          <h1 className="text-5xl font-bold mb-4 print:text-4xl">
            Accelerate Your Cybersecurity Career
          </h1>
          <p className="text-xl opacity-90 print:text-lg">
            Get verified, get noticed, get hired faster
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-12 print:p-8">
        
        {/* Problem Statement */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
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
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Why Top Cybersecurity Professionals Choose Cydena
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Get HR-Ready Verification
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Complete identity, right-to-work, and security clearance verification once. Employers see you're 
                  pre-vetted and ready to start, cutting hiring time from months to weeks.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Showcase Verified Credentials
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Your certifications, security clearances, and specialized training are verified and showcased with 
                  credibility. Stand out with CCRTS, CCSAS, OSCP, and other high-value credentials.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Build Your Skill Genome
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Validate your technical skills with hands-on assessments and AI-powered career insights. Get matched 
                  to roles that fit your expertise perfectly.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Join the Elite Community
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Connect with other verified cybersecurity professionals, share insights, and access exclusive training 
                  opportunities from industry partners.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
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
        <div className="bg-gray-50 rounded-lg p-8 mb-12 print:border print:border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What Our Members Say
          </h2>
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              <p className="text-gray-700 italic mb-2">
                "I was HR-Ready verified in 3 days and had my first employer interview within a week. 
                The pre-verification made all the difference."
              </p>
              <p className="text-sm text-gray-600 font-semibold">
                - Security Analyst, Founding 200 Member
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
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
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Get Started in 3 Simple Steps
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Create Your Profile</h3>
                <p className="text-gray-700">
                  Add your experience, certifications, and skills. Our AI helps optimize your profile for maximum visibility.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Get Verified</h3>
                <p className="text-gray-700">
                  Submit identity, right-to-work, and clearance verification. Our team reviews within 48 hours.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Get Discovered</h3>
                <p className="text-gray-700">
                  Employers search for verified candidates like you. Respond to opportunities or apply to curated roles.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[hsl(189,97%,55%)] to-[hsl(263,70%,50%)] text-white rounded-lg p-8 text-center print:bg-white print:text-gray-900 print:border-4 print:border-[hsl(189,97%,55%)] print:rounded-lg">
          <h2 className="text-3xl font-bold mb-4 print:text-2xl">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-xl mb-6 opacity-90 print:opacity-100 print:text-lg">
            Join hundreds of verified cybersecurity professionals getting hired faster
          </p>
          <div className="flex flex-col gap-3 justify-center items-center mb-6">
            <div className="text-lg font-semibold">
              👉 Visit: <span className="underline">cydena.com</span>
            </div>
            <div className="text-lg font-semibold">
              ✉️ Email: <span className="underline">contact@cydena.com</span>
            </div>
          </div>
          <p className="text-sm opacity-75 print:opacity-100">
            Free to join • Get verified in 48 hours • Start getting discovered
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 p-8 mt-12 print:border-t print:bg-white">
        <div className="max-w-4xl mx-auto text-center text-gray-600">
          <p className="mb-2 font-semibold">Cydena - The Verified Cybersecurity Talent Platform</p>
          <p className="text-sm">www.cydena.com | contact@cydena.com</p>
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
