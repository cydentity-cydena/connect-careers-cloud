import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Clock, Shield, Target, TrendingUp, Users, Zap } from "lucide-react";

const EmployerPDF = () => {
  return (
    <div className="min-h-screen bg-white print:bg-white">
      <SEO 
        title="Cydena for Employers - Hire Verified Cybersecurity Talent"
        description="Reduce time-to-hire by 60% with pre-verified, HR-ready cybersecurity professionals."
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
            Hire Verified Cybersecurity Talent 60% Faster
          </h1>
          <p className="text-xl opacity-90 print:text-lg">
            Pre-vetted, HR-ready candidates with verified credentials and security clearances
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-12 print:p-8">
        
        {/* Problem Statement */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            The Cost of Traditional Cybersecurity Hiring
          </h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6 print:border print:border-red-200">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>3-6 months</strong> average time-to-hire for security roles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>£50,000+</strong> cost per failed hire</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>200+ applications</strong> to manually screen per role</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>Weeks of delays</strong> waiting for background checks and clearance verification</span>
              </li>
            </ul>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            While you're stuck in lengthy hiring processes, competitors are securing top talent and your security 
            gaps remain unfilled. <strong>There's a better way.</strong>
          </p>
        </div>

        {/* Value Propositions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            The Cydena Advantage
          </h2>
          
          <div className="space-y-6">
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
        <div className="bg-blue-50 rounded-lg p-8 mb-12 print:border print:border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
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
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Trusted by Leading Organizations
          </h2>
          <div className="space-y-6">
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
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Transparent Pricing Plans
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">£99<span className="text-lg text-gray-600">/mo</span></div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• 10 unlocks per year</li>
                <li>• 1 team seat</li>
                <li>• Basic filters</li>
                <li>• Email support</li>
              </ul>
            </div>
            <div className="border-2 border-blue-600 rounded-lg p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Growth</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">£299<span className="text-lg text-gray-600">/mo</span></div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• 30 unlocks per year</li>
                <li>• 5 team seats</li>
                <li>• Advanced filters</li>
                <li>• Priority support</li>
                <li>• ATS integration</li>
              </ul>
            </div>
            <div className="border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Scale</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">£599<span className="text-lg text-gray-600">/mo</span></div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• 100 unlocks per year</li>
                <li>• 10 team seats</li>
                <li>• All features</li>
                <li>• Dedicated support</li>
                <li>• Custom assessments</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[hsl(189,97%,55%)] to-[hsl(263,70%,50%)] text-white rounded-lg p-8 text-center print:bg-white print:text-gray-900 print:border-4 print:border-[hsl(189,97%,55%)] print:rounded-lg">
          <h2 className="text-3xl font-bold mb-4 print:text-2xl">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl mb-6 opacity-90 print:opacity-100 print:text-lg">
            Book a demo and see how Cydena can reduce your time-to-hire by 60%
          </p>
          <div className="flex flex-col gap-3 justify-center items-center mb-6">
            <div className="text-lg font-semibold">
              👉 Visit: <span className="underline">cydena.com/employer-pitch</span>
            </div>
            <div className="text-lg font-semibold">
              ✉️ Email: <span className="underline">contact@cydena.com</span>
            </div>
          </div>
          <p className="text-sm opacity-75 print:opacity-100">
            No credit card required • 14-day free trial • ROI calculator included
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

export default EmployerPDF;
