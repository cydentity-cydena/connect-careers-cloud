import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const PartnersPDF = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      <style>
        {`
          @media print {
            body { 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print { display: none !important; }
            .print\\:block { display: block !important; }
          }
        `}
      </style>

      {/* Download Button (Hidden in Print) */}
      <Button
        onClick={handlePrint}
        className="no-print fixed bottom-8 right-8 z-50 shadow-lg"
        size="lg"
      >
        <Download className="mr-2 h-5 w-5" />
        Download as PDF
      </Button>

      {/* PDF Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-12">
        {/* Gradient Banner Header */}
        <div className="mb-8 print:mb-6 -mx-8 -mt-8 print:-mx-12 print:-mt-12 px-8 pt-8 pb-12 print:px-12 print:pt-12 print:pb-16 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-b-3xl">
          <div className="flex items-center justify-between mb-8">
            <img 
              src="/logos/cydentity-academy-logo-white.png" 
              alt="Cydena" 
              className="h-10 print:h-8"
            />
            <div className="text-right">
              <p className="text-sm text-blue-100">Training & Certification</p>
              <p className="text-sm font-bold text-white">Partnership Opportunities</p>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4 print:text-3xl leading-tight">
            Reach Thousands of Cybersecurity Professionals
          </h1>
          <p className="text-xl text-blue-50 print:text-lg leading-relaxed">
            Premium visibility for your training courses and certifications on the UK's fastest-growing cybersecurity talent platform
          </p>
        </div>

        {/* The Opportunity */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 print:text-xl">
            Why Partner with Cydena?
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">5,000+</div>
              <p className="text-sm text-gray-700">Active cybersecurity professionals seeking training</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-600 mb-1">Daily</div>
              <p className="text-sm text-gray-700">Dashboard visibility for premium placements</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-600 mb-1">85%</div>
              <p className="text-sm text-gray-700">Job-seeking candidates actively upskilling</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-orange-600 mb-1">Target</div>
              <p className="text-sm text-gray-700">Precise audience: cyber professionals only</p>
            </div>
          </div>
        </div>

        {/* Partnership Types */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 print:text-xl">
            Three Ways to Partner
          </h2>
          
          <div className="space-y-4">
            {/* Training Page */}
            <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Training Page Featured Placement</h3>
                  <p className="text-sm text-gray-700">Premium visibility on our dedicated training partners page</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">From £149</div>
                  <div className="text-xs text-gray-600">/week</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  <span className="text-gray-700">Top-of-page featured section</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  <span className="text-gray-700">Logo and branding display</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  <span className="text-gray-700">Direct website links</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  <span className="text-gray-700">4 premium slot positions</span>
                </div>
              </div>
            </div>

            {/* Boost Dashboard */}
            <div className="border-2 border-purple-500 rounded-lg p-4 bg-purple-50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Boost Dashboard Placement</h3>
                  <p className="text-sm text-gray-700">First thing candidates see when they log in - maximum visibility</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">From £499</div>
                  <div className="text-xs text-gray-600">/week</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span className="text-gray-700">Dashboard priority placement</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span className="text-gray-700">100% daily visibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span className="text-gray-700">Engaged active users</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span className="text-gray-700">OpenBadge integration</span>
                </div>
              </div>
            </div>

            {/* Certification Catalog */}
            <div className="border-2 border-orange-500 rounded-lg p-4 bg-orange-50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Certification Catalog Featured</h3>
                  <p className="text-sm text-gray-700">Featured placement in our comprehensive certification catalog</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">From £149</div>
                  <div className="text-xs text-gray-600">/week</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">✓</span>
                  <span className="text-gray-700">Top of certification page</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">✓</span>
                  <span className="text-gray-700">Career pathway visibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">✓</span>
                  <span className="text-gray-700">Cert-seeking candidates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">✓</span>
                  <span className="text-gray-700">Premium positioning</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Detail */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 print:text-xl">
            Transparent, Position-Based Pricing
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <h3 className="font-bold text-gray-900 mb-3">Featured Slot Positions (Training & Cert Pages)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Slot 1 (Maximum visibility)</span>
                  <span className="font-bold text-yellow-600">+£250/week</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Slot 2 (High visibility)</span>
                  <span className="font-bold text-orange-600">+£200/week</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Slot 3 (Featured)</span>
                  <span className="font-bold text-blue-600">+£150/week</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Slot 4 (Standard featured)</span>
                  <span className="font-bold text-purple-600">+£100/week</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Base placement: £149/week. Featured upgrades add premium top-section visibility.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">Volume Discounts (Automatically Applied)</h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">0%</div>
                <div className="text-xs text-gray-600">1-3 weeks</div>
              </div>
              <div className="bg-white/60 rounded p-2">
                <div className="text-lg font-bold text-green-600">10% OFF</div>
                <div className="text-xs text-gray-600">4-11 weeks</div>
              </div>
              <div className="bg-white/60 rounded p-2">
                <div className="text-lg font-bold text-green-600">15% OFF</div>
                <div className="text-xs text-gray-600">12-23 weeks</div>
              </div>
              <div className="bg-white/80 rounded p-2">
                <div className="text-lg font-bold text-green-700">20% OFF</div>
                <div className="text-xs text-gray-600">24+ weeks</div>
              </div>
            </div>
          </div>
        </div>

        {/* What You Get */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 print:text-xl">
            What's Included in Every Partnership
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-1">✓</span>
              <span className="text-sm text-gray-700">Custom logo and branding display</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-1">✓</span>
              <span className="text-sm text-gray-700">Direct links to your website</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-1">✓</span>
              <span className="text-sm text-gray-700">Custom value proposition text</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-1">✓</span>
              <span className="text-sm text-gray-700">Priority search positioning</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-1">✓</span>
              <span className="text-sm text-gray-700">Monthly performance analytics</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-1">✓</span>
              <span className="text-sm text-gray-700">Guaranteed slot placement</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-1">✓</span>
              <span className="text-sm text-gray-700">Co-marketing opportunities</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-1">✓</span>
              <span className="text-sm text-gray-700">Dedicated partner support</span>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 print:text-xl">
            How It Works
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Choose Your Placement</h3>
                <p className="text-sm text-gray-700">
                  Select from Training Page, Boost Dashboard, or Certification Catalog placement
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Select Duration & Position</h3>
                <p className="text-sm text-gray-700">
                  Pick your timeframe (longer = bigger discount) and choose your featured slot position
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Setup Your Profile</h3>
                <p className="text-sm text-gray-700">
                  Provide your logo, description, website links, and branding materials
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Go Live & Track</h3>
                <p className="text-sm text-gray-700">
                  Your featured placement goes live immediately. Track performance with monthly analytics reports
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Who Should Partner */}
        <div className="mb-8 print:mb-6 bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 print:text-xl">
            Perfect For
          </h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="font-bold text-gray-900 mb-2">Training Providers</div>
              <div className="text-sm text-gray-700">
                Cybersecurity bootcamps, online courses, skill development programs
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-900 mb-2">Certification Bodies</div>
              <div className="text-sm text-gray-700">
                Professional certifications, vendor certs, specialty credentials
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-900 mb-2">Educational Institutions</div>
              <div className="text-sm text-gray-700">
                Universities, colleges, technical schools with cyber programs
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-3 print:text-2xl">Ready to Partner?</h2>
          <p className="text-lg mb-6 text-blue-50">
            Join leading training providers reaching cybersecurity professionals on Cydena
          </p>
          
          <div className="space-y-4">
            <div>
              <div className="font-bold mb-2">Get Started Today</div>
              <div className="space-y-1 text-sm">
                <div>📧 Email: partnerships@cydena.com</div>
                <div>🌐 Visit: cydena.com</div>
                <div>📞 Book a call to discuss your needs</div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/20">
              <div className="text-xs text-blue-100">
                Limited slots available. Featured positions fill fast. Book early to secure your preferred placement.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <p className="mb-2">Cydena Ltd • United Kingdom</p>
          <p>Connecting cybersecurity talent with opportunity</p>
        </div>
      </div>
    </div>
  );
};

export default PartnersPDF;
