import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Clock, Award, BarChart, CheckCircle } from "lucide-react";
import { MailchimpSignup } from "@/components/marketing/MailchimpSignup";

const RecruiterPDF = () => {
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
        title="Cydena for Recruiters - Scale Your Cybersecurity Placements"
        description="Place more verified cybersecurity candidates faster with Cydena's recruiter platform."
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
            Place Verified Cybersecurity Talent with Confidence
          </h1>
          <p className="text-lg opacity-90 print:text-base">
            Access verified candidates who can prove their capabilities
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 print:p-5">
        
        {/* Problem Statement */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 print:text-xl">
            The Cybersecurity Recruiter's Dilemma
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            You know the challenges:
          </p>
          <ul className="space-y-3 text-gray-700 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Candidates inflate qualifications - you discover this only after client interviews</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>No way to verify security clearances or certifications upfront</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Clients demand proof of capabilities before interviews</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Placements fall through when verification fails</span>
            </li>
          </ul>
          <p className="text-lg text-gray-700 leading-relaxed">
            <strong>What if every candidate you presented had verified credentials and proven capabilities?</strong>
          </p>
        </div>

        {/* Value Propositions */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 print:text-xl">
            Why Top Recruitment Agencies Partner with Cydena
          </h2>
          
          <div className="space-y-5 print:space-y-4">
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
        <div className="mb-8 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 print:text-xl">
            How It Works for Recruiters
          </h2>
          
          <div className="space-y-3 print:space-y-2">
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


        {/* Pricing */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 print:text-xl">
            Partnership Model
          </h2>
          
          <div className="border-2 border-purple-600 rounded-lg p-8 bg-purple-50">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Recruiter Pro Partnership</h3>
              <p className="text-gray-600">Platform access + small fee on successful placements</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Platform Access</h4>
                <div className="bg-white rounded-lg p-4 border border-purple-200 mb-3">
                  <div className="text-3xl font-bold text-purple-600 mb-1">£399<span className="text-lg text-gray-600">/mo</span></div>
                  <p className="text-sm text-gray-600">Subscription includes:</p>
                </div>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li>✓ 75 candidate unlocks/year</li>
                  <li>✓ Unlimited client accounts</li>
                  <li>✓ Advanced search & filters</li>
                  <li>✓ Pipeline management</li>
                  <li>✓ Placement tracking dashboard</li>
                  <li>✓ 3 team seats included</li>
                  <li>✓ API access & white-label options</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Partnership Fee</h4>
                <div className="bg-white rounded-lg p-4 border border-purple-200 mb-3">
                  <div className="text-3xl font-bold text-purple-600 mb-1">2-3%</div>
                  <p className="text-sm text-gray-600">of successful placements</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>You keep 97-98%</strong> of your placement fee
                  </p>
                  <p className="text-xs text-gray-600">
                    Example: £10,000 placement = £200-300 platform fee
                  </p>
                </div>
                <p className="text-xs text-purple-600 font-semibold mt-3">
                  Much lower than competing platforms while providing verified candidates
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-purple-200">
              <p className="text-center text-sm text-gray-600">
                <strong>Why this model?</strong> You focus on relationships and placements, we handle verification infrastructure. Win-win partnership.
              </p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-4 text-center">
            Enterprise plans available for larger recruitment firms • Custom pricing for high-volume partners
          </p>
        </div>

        {/* Email Signup Section */}
        <div className="mb-6 print:hidden">
          <MailchimpSignup 
            userType="recruiter"
            title="Partner with Cydena"
            description="Access pre-verified cybersecurity talent and increase your placement success. Get updates on our recruiter partnership program."
          />
        </div>

        {/* CTA */}
        <div className="print-gradient bg-gradient-to-r from-[hsl(189,97%,55%)] to-[hsl(263,70%,50%)] text-white rounded-lg p-8 text-center print:text-white print:p-6 print:break-inside-avoid">
          <h2 className="text-2xl font-bold mb-3 print:text-xl">
            Ready to Place with Confidence?
          </h2>
          <p className="text-lg mb-5 opacity-90 print:text-base">
            Join leading recruiters placing verified candidates with confidence
          </p>
          <div className="flex flex-col gap-3 justify-center items-center mb-6">
            <div className="text-lg font-semibold">
              👉 Visit: <a href="https://cydena.com" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">cydena.com</a>
            </div>
            <div className="text-lg font-semibold">
              ✉️ Email: <a href="mailto:recruiters@cydena.com" className="underline hover:opacity-80">recruiters@cydena.com</a>
            </div>
          </div>
          <p className="text-sm opacity-75 print:opacity-100">
            Book a demo • 14-day trial • No setup fees
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

export default RecruiterPDF;
