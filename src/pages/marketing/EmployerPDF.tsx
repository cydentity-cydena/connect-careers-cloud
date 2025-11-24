import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Clock, Shield, Target, TrendingUp, Users, Zap } from "lucide-react";
import { MailchimpSignup } from "@/components/marketing/MailchimpSignup";

const EmployerPDF = () => {
  return (
    <div className="min-h-screen bg-white print:bg-white">
      <style>{`
        @media print {
          .print-gradient {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
      <SEO 
        title="Cydena for Employers - Hire Verified Cybersecurity Talent"
        description="Reduce time-to-hire by 60% with pre-verified, HR-ready cybersecurity professionals."
      />
      
      {/* Header */}
      <div className="print-gradient bg-gradient-to-r from-[hsl(189,97%,55%)] to-[hsl(263,70%,50%)] text-white p-8 print:p-6 print:text-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block bg-white/95 px-4 py-2 rounded-lg mb-6 print:mb-4">
            <img 
              src="/logos/cydena-main-logo.png" 
              alt="Cydena" 
              className="h-10 print:h-8"
            />
          </div>
          <h1 className="text-4xl font-bold mb-3 print:text-3xl print:mb-2">
            Hire with Confidence: Verified Cybersecurity Talent
          </h1>
          <p className="text-lg opacity-90 print:text-base">
            Pre-verified, HR-ready candidates who can prove their capabilities
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 print:p-5">
        
        {/* Problem Statement */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 print:text-xl">
            The Challenge of Hiring Cybersecurity Talent
          </h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6 print:border print:border-red-200">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>Unverified credentials</strong> - candidates claim certifications they don't have</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>No proof of capabilities</strong> - resumes don't show what candidates can actually do</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>Lengthy verification</strong> - waiting weeks or months to verify credentials and clearances</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>Compliance risks</strong> - hiring mistakes can lead to security breaches and regulatory issues</span>
              </li>
            </ul>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            When you can't verify what candidates claim, every hire becomes a risk. <strong>Cydena gives you the confidence to hire.</strong>
          </p>
        </div>

        {/* Value Propositions */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 print:text-xl">
            The Cydena Advantage
          </h2>
          
          <div className="space-y-5 print:space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Pre-Verified, HR-Ready Candidates
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Every candidate on Cydena has completed identity verification, right-to-work checks, and security 
                  clearance validation. Start interviews knowing they're legitimate and ready to onboard.
                </p>
                <p className="text-sm text-blue-600 font-semibold mt-2">
                  → Reduce pre-employment screening time from 4-6 weeks to days
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Advanced Filtering & Matching
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Search by specific certifications (CCRTS, CCSAS, OSCP), active security clearances, specialized 
                  skills, and verified work history. Our AI matches you with candidates who meet your exact requirements.
                </p>
                <p className="text-sm text-blue-600 font-semibold mt-2">
                  → Find qualified candidates 10x faster than traditional job boards
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Skills-Validated Talent
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Candidates have completed hands-on technical assessments and maintain active profiles with verified 
                  training completion. See proof of skills, not just claims on a resume.
                </p>
                <p className="text-sm text-blue-600 font-semibold mt-2">
                  → Reduce bad hires and increase team performance
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Streamlined Hiring Workflow
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Manage your entire hiring pipeline in one place. Track applications, schedule interviews, collaborate 
                  with your team, and integrate with your existing ATS.
                </p>
                <p className="text-sm text-blue-600 font-semibold mt-2">
                  → Save 15+ hours per hire on administrative tasks
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Flexible Pricing That Scales
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Pay only for what you need with transparent, predictable pricing. From startups hiring their first 
                  security engineer to enterprises building large teams.
                </p>
                <p className="text-sm text-blue-600 font-semibold mt-2">
                  → 70% lower cost than traditional recruitment agencies
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8 print:p-5 print:mb-6 print:border print:border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center print:text-lg">
            Calculate Your Savings
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">60%</div>
              <p className="text-gray-700">Faster Time-to-Hire</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">70%</div>
              <p className="text-gray-700">Lower Recruitment Costs</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">85%</div>
              <p className="text-gray-700">Candidate Quality Match</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">40%</div>
              <p className="text-gray-700">Reduction in Failed Hires</p>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-6 text-sm">
            * Based on average metrics from employers using Cydena vs traditional hiring methods
          </p>
        </div>

        {/* Social Proof */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center print:text-lg">
            Trusted by Leading Organizations
          </h2>
          <div className="space-y-5 print:space-y-4">
            <div className="border-l-4 border-blue-600 pl-4">
              <p className="text-gray-700 italic mb-2">
                "We reduced our time-to-hire for senior security roles from 4 months to 6 weeks. The pre-verification 
                was a game-changer for our compliance requirements."
              </p>
              <p className="text-sm text-gray-600 font-semibold">
                - CISO, Financial Services Company
              </p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <p className="text-gray-700 italic mb-2">
                "Finding candidates with active SC clearance used to take months. With Cydena, we identified 
                three qualified candidates in the first week."
              </p>
              <p className="text-sm text-gray-600 font-semibold">
                - Talent Acquisition Manager, Defence Contractor
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Overview */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 print:text-xl">
            Simple Subscription Pricing
          </h2>
          <p className="text-gray-600 mb-6">Choose the tier that matches your hiring volume</p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border-2 border-gray-200 rounded-lg p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Starter</h3>
              <div className="text-3xl font-bold text-blue-600 mb-3">£99<span className="text-base text-gray-600">/mo</span></div>
              <ul className="space-y-1.5 text-sm text-gray-700">
                <li>• 10 unlocks/year</li>
                <li>• 1 team seat</li>
                <li>• Basic filters</li>
                <li>• Email support</li>
              </ul>
            </div>
            
            <div className="border-2 border-blue-600 rounded-lg p-5 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                MOST POPULAR
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Growth</h3>
              <div className="text-3xl font-bold text-blue-600 mb-3">£299<span className="text-base text-gray-600">/mo</span></div>
              <ul className="space-y-1.5 text-sm text-gray-700">
                <li>• 30 unlocks/year</li>
                <li>• 5 team seats</li>
                <li>• Advanced filters</li>
                <li>• Priority support</li>
                <li>• ATS integration</li>
              </ul>
            </div>
            
            <div className="border-2 border-gray-200 rounded-lg p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Scale</h3>
              <div className="text-3xl font-bold text-blue-600 mb-3">£599<span className="text-base text-gray-600">/mo</span></div>
              <ul className="space-y-1.5 text-sm text-gray-700">
                <li>• 100 unlocks/year</li>
                <li>• 10 team seats</li>
                <li>• All features</li>
                <li>• Dedicated support</li>
                <li>• Custom assessments</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-700 text-center">
              <strong>Additional unlocks:</strong> £8 each after your annual allocation is used • 
              <strong> Enterprise:</strong> Custom pricing for high-volume needs
            </p>
          </div>
        </div>

        {/* Expert Assist Add-On */}
        <div className="mb-6 print:mb-5">
          <div className="border border-orange-300 rounded-lg p-5 bg-orange-50">
            <div className="text-center mb-3">
              <div className="inline-block bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-1">
                OPTIONAL ADD-ON
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Expert Assist Service</h3>
              <p className="text-xs text-gray-600">
                Need specialist help with a complex or urgent role?
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h4 className="font-semibold text-xs text-gray-900 mb-1.5">When You Need It:</h4>
                <ul className="space-y-0.5 text-xs text-gray-700">
                  <li>• Executive roles (CISO, Director)</li>
                  <li>• Niche specializations</li>
                  <li>• Urgent critical hires</li>
                  <li>• First-time security hiring</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-xs text-gray-900 mb-1.5">What We Do:</h4>
                <ul className="space-y-0.5 text-xs text-gray-700 mb-2">
                  <li>• Candidate shortlisting</li>
                  <li>• Technical assessment</li>
                  <li>• Interview coordination</li>
                  <li>• Offer negotiation</li>
                </ul>
                <div className="bg-white rounded p-2 border border-orange-200">
                  <div className="text-xl font-bold text-orange-600">8-10%</div>
                  <p className="text-xs text-gray-600">success fee</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recruiter Partnership */}
        <div className="mb-8 print:mb-6">
          <div className="border-2 border-purple-600 rounded-lg p-6 bg-purple-50">
            <div className="text-center mb-4">
              <div className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-2">
                FOR RECRUITERS
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Partner With Cydena</h3>
              <p className="text-sm text-gray-600">
                Access our verified candidate pool for your placements
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-2">What You Get:</h4>
                <ul className="space-y-1 text-xs text-gray-700">
                  <li>• Pre-verified candidate pool</li>
                  <li>• Client management tools</li>
                  <li>• Placement tracking</li>
                  <li>• No verification overhead</li>
                </ul>
              </div>
              <div className="bg-white rounded p-3 border border-purple-200">
                <p className="text-xs text-gray-600 mb-2">Partnership Model:</p>
                <div className="text-2xl font-bold text-purple-600 mb-1">2-3%</div>
                <p className="text-xs text-gray-600">platform fee on placements</p>
                <p className="text-xs text-purple-600 font-semibold mt-1">You keep 97-98%</p>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 text-center">
              Contact us to discuss partnership opportunities
            </p>
          </div>
        </div>

        {/* Email Signup Section */}
        <div className="mb-6 print:hidden">
          <MailchimpSignup 
            userType="employer"
            title="Get a Demo"
            description="See how Cydena's verification platform builds hiring confidence. Schedule a consultation with our team."
          />
        </div>

        {/* CTA */}
        <div className="print-gradient bg-gradient-to-r from-[hsl(189,97%,55%)] to-[hsl(263,70%,50%)] text-white rounded-lg p-8 text-center print:text-white print:p-6 print:break-inside-avoid">
          <h2 className="text-3xl font-bold mb-4 print:text-2xl">
            Ready to Hire with Confidence?
          </h2>
          <p className="text-xl mb-6 opacity-90 print:opacity-100 print:text-lg">
            Book a demo and discover how verification builds hiring confidence
          </p>
          <div className="flex flex-col gap-3 justify-center items-center mb-6">
            <div className="text-lg font-semibold">
              👉 Visit: <a href="https://cydena.com/employer-pitch" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">cydena.com/employer-pitch</a>
            </div>
            <div className="text-lg font-semibold">
              ✉️ Email: <a href="mailto:contact@cydena.com" className="underline hover:opacity-80">contact@cydena.com</a>
            </div>
          </div>
          <p className="text-sm opacity-75 print:opacity-100">
            No credit card required • 14-day free trial • ROI calculator included
          </p>
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

export default EmployerPDF;
