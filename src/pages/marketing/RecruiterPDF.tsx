import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Clock, Award, BarChart, CheckCircle } from "lucide-react";

const RecruiterPDF = () => {
  return (
    <div className="min-h-screen bg-white print:bg-white">
      <SEO 
        title="Cydena for Recruiters - Scale Your Cybersecurity Placements"
        description="Place more verified cybersecurity candidates faster with Cydena's recruiter platform."
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-12 print:p-8">
        <div className="max-w-4xl mx-auto">
          <img 
            src="/logos/cydena-main-logo.png" 
            alt="Cydena" 
            className="h-12 mb-6"
          />
          <h1 className="text-5xl font-bold mb-4 print:text-4xl">
            Scale Your Cybersecurity Recruitment Business
          </h1>
          <p className="text-xl opacity-90 print:text-lg">
            Access verified talent, streamline placements, and increase margins
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-12 print:p-8">
        
        {/* Problem Statement */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            The Cybersecurity Recruiter's Dilemma
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            You know the challenges all too well:
          </p>
          <ul className="space-y-3 text-gray-700 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Candidates inflate their qualifications and you only find out after client interviews</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Security clearance verification delays placements by weeks or months</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Managing multiple clients and candidates manually is time-consuming and error-prone</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Competing with in-house recruiters who have access to better talent pools</span>
            </li>
          </ul>
          <p className="text-lg text-gray-700 leading-relaxed">
            <strong>What if you had access to a platform where every candidate is pre-verified, security cleared, 
            and ready to interview?</strong>
          </p>
        </div>

        {/* Value Propositions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Why Top Recruitment Agencies Partner with Cydena
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Exclusive Access to Verified Talent
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Search thousands of pre-verified cybersecurity professionals with confirmed identities, right-to-work 
                  status, and active security clearances. Present only qualified candidates to your clients.
                </p>
                <p className="text-sm text-purple-600 font-semibold mt-2">
                  → Reduce candidate screening time by 80%
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Faster Placements, Higher Volume
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Pre-verification means candidates are ready to start immediately. No waiting weeks for background 
                  checks. Place more candidates per month with the same team size.
                </p>
                <p className="text-sm text-purple-600 font-semibold mt-2">
                  → Increase placement velocity by 3x
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Better Margins with Lower Overheads
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Reduce time spent on admin, vetting, and verification. Cydena's platform handles the heavy lifting 
                  so your team focuses on relationship building and closing deals.
                </p>
                <p className="text-sm text-purple-600 font-semibold mt-2">
                  → Cut operational costs by 40%
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Client Management & Reporting
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Track all your clients and placements in one dashboard. Generate reports, manage contracts, and 
                  demonstrate ROI to your clients with data-backed insights.
                </p>
                <p className="text-sm text-purple-600 font-semibold mt-2">
                  → Improve client retention by 35%
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Premium Candidate Insights
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  See verified certifications (CCRTS, CCSAS, OSCP), skills assessments, clearance levels, and more. 
                  Present detailed candidate profiles that impress clients and win contracts.
                </p>
                <p className="text-sm text-purple-600 font-semibold mt-2">
                  → Win more exclusive contracts with better quality submissions
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  White-Label & API Access
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Integrate Cydena into your existing systems or white-label the platform for your clients. Maintain 
                  your brand while leveraging our verification infrastructure.
                </p>
                <p className="text-sm text-purple-600 font-semibold mt-2">
                  → Scale without building expensive in-house tech
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            How It Works for Recruiters
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Add Your Clients</h3>
                <p className="text-gray-700">
                  Create client profiles, track hiring needs, and manage contracts all in one place.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Search Verified Talent</h3>
                <p className="text-gray-700">
                  Use advanced filters to find candidates with specific clearances, certifications, and skills. 
                  All pre-verified and ready to interview.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Submit & Track</h3>
                <p className="text-gray-700">
                  Submit candidates to clients, track interview stages, and manage the entire placement process 
                  within the platform.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Close & Earn</h3>
                <p className="text-gray-700">
                  Faster placements mean more commissions. Track your success and generate reports for your business.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-purple-50 rounded-lg p-8 mb-12 print:border print:border-purple-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Success Stories
          </h2>
          <div className="space-y-6">
            <div className="border-l-4 border-purple-600 pl-4">
              <p className="text-gray-700 italic mb-2">
                "We doubled our placement rate in the first quarter after joining Cydena. The pre-verification 
                eliminated 90% of our candidate drop-offs due to clearance issues."
              </p>
              <p className="text-sm text-gray-600 font-semibold">
                - Director, Cybersecurity Recruitment Agency
              </p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <p className="text-gray-700 italic mb-2">
                "Our clients now specifically ask for Cydena-verified candidates. It's become our competitive advantage."
              </p>
              <p className="text-sm text-gray-600 font-semibold">
                - Senior Recruiter, IT Staffing Firm
              </p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Recruiter Pricing
          </h2>
          
          <div className="border-2 border-purple-600 rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Recruiter Pro</h3>
                <p className="text-gray-600">Everything you need to scale your placements</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-purple-600">£399<span className="text-xl text-gray-600">/mo</span></div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-gray-700">
                <li>✓ 75 candidate unlocks/year</li>
                <li>✓ Unlimited client accounts</li>
                <li>✓ Advanced search & filters</li>
                <li>✓ Placement tracking dashboard</li>
                <li>✓ 3 team seats included</li>
              </ul>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Client reporting tools</li>
                <li>✓ API access</li>
                <li>✓ Priority support</li>
                <li>✓ White-label options</li>
                <li>✓ Quarterly business reviews</li>
              </ul>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                <strong>Enterprise plans available</strong> for larger recruitment firms and staffing companies
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-8 text-center print:bg-white print:text-gray-900 print:border-4 print:border-purple-600 print:rounded-lg">
          <h2 className="text-3xl font-bold mb-4 print:text-2xl">
            Ready to Scale Your Placements?
          </h2>
          <p className="text-xl mb-6 opacity-90 print:opacity-100 print:text-lg">
            Join leading recruitment agencies using Cydena to place more candidates faster
          </p>
          <div className="flex flex-col gap-3 justify-center items-center mb-6">
            <div className="text-lg font-semibold">
              👉 Visit: <span className="underline">cydena.com/recruiters</span>
            </div>
            <div className="text-lg font-semibold">
              ✉️ Email: <span className="underline">contact@cydena.com</span>
            </div>
          </div>
          <p className="text-sm opacity-75 print:opacity-100">
            Book a demo • 14-day trial • No setup fees
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

export default RecruiterPDF;
