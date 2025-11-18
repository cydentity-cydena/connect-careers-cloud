import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy - Cydena"
        description="Privacy Policy for Cydena cybersecurity recruitment platform. Learn how we protect and handle your personal data in compliance with UK GDPR and DPA 2018."
      />
      <Navigation />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in">
            Privacy <span className="bg-gradient-cyber bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-muted-foreground mb-8 animate-fade-in">Last updated: January 2025</p>

          <Card className="mb-6 animate-slide-up bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Quick Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p className="font-medium">Your privacy matters. Here&apos;s what you need to know:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We&apos;re transparent about what data we collect and why</li>
                <li>You control your profile - you can update or delete it anytime</li>
                <li>We verify skills and certifications to build trust in our platform</li>
                <li>Employers only see your contact details if they unlock your profile</li>
                <li>We never sell your data to third parties</li>
                <li>You have full GDPR rights including access, correction, and deletion</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up">
            <CardHeader>
              <CardTitle>1. Who We Are (Data Controller)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong>Cydena Ltd</strong> is the data controller responsible for your personal information.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 mt-4">
                <p><strong>Registered Company Name:</strong> Cydena Ltd</p>
                <p><strong>Company Number:</strong> 16779531 (registered in Wales)</p>
                <p><strong>Registered Office:</strong> [Your registered office address]</p>
                <p><strong>Email:</strong> privacy@cydena.com</p>
                <p><strong>Data Protection Officer:</strong> dpo@cydena.com</p>
              </div>
              <p className="text-sm mt-4">
                You can verify our company details at{" "}
                <a 
                  href="https://find-and-update.company-information.service.gov.uk/company/16779531" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Companies House
                </a>
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <CardHeader>
              <CardTitle>2. What Personal Data We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground mb-2">For Candidates (Cybersecurity Professionals):</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account & Contact:</strong> Name, email address, phone number, location, username</li>
                  <li><strong>Professional Profile:</strong> Job title, years of experience, professional statement, work preferences</li>
                  <li><strong>Skills & Certifications:</strong> Technical skills, certifications, security clearances</li>
                  <li><strong>Documents:</strong> CV/resume files, certification documents, portfolio links</li>
                  <li><strong>Platform Activity:</strong> Job applications, messages, profile views, assessment results</li>
                  <li><strong>URLs:</strong> LinkedIn, GitHub, portfolio website links</li>
                  <li><strong>Verification Data:</strong> Documents for identity checks, right-to-work evidence</li>
                </ul>
              </div>

              <div className="mt-6">
                <p className="font-semibold text-foreground mb-2">For Employers & Recruiters:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account Details:</strong> Work email, name, job title</li>
                  <li><strong>Company Information:</strong> Organisation name, industry, size, location, website</li>
                  <li><strong>Job Postings:</strong> Job descriptions, requirements, salary ranges</li>
                  <li><strong>Billing:</strong> Payment details (via Stripe), billing address</li>
                  <li><strong>Platform Activity:</strong> Profile unlocks, searches, applications, messages</li>
                </ul>
              </div>

              <div className="mt-6">
                <p className="font-semibold text-foreground mb-2">For Training & Certification Partners:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Organisation Details:</strong> Partner name, contact information</li>
                  <li><strong>Course Information:</strong> Training courses, badges, completion data</li>
                  <li><strong>Integration Data:</strong> API credentials, webhook endpoints</li>
                </ul>
              </div>

              <div className="mt-6">
                <p className="font-semibold text-foreground mb-2">For All Website Visitors:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                  <li><strong>Usage Data:</strong> Pages visited, time spent, features used</li>
                  <li><strong>Cookies:</strong> See section 9 for details</li>
                </ul>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg mt-6">
                <p className="font-semibold text-foreground mb-2">⚠️ Special Category Data</p>
                <p>
                  Cydena does not require or systematically collect special category personal data (e.g., health information, ethnicity, religious beliefs). If you voluntarily include such information in your profile, we process it based on your explicit consent (Art. 9(2)(a) GDPR). We recommend not including unnecessary sensitive information.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <CardHeader>
              <CardTitle>3. How We Use Your Information & Legal Basis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-medium text-foreground">
                We process your data only for specific purposes with a lawful basis under UK GDPR/DPA 2018:
              </p>

              <div className="space-y-6 mt-4">
                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold text-foreground">Running Your Account & Platform Services</p>
                  <p><strong>Purpose:</strong> Creating accounts, providing features, matching candidates with jobs</p>
                  <p><strong>Legal Basis:</strong> Contract (Art. 6(1)(b)) - necessary to perform our service agreement</p>
                  <p><strong>Data Used:</strong> Account details, profile information, applications</p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold text-foreground">Skills & Certification Verification</p>
                  <p><strong>Purpose:</strong> Verifying credentials, contacting certification bodies, checking public profiles</p>
                  <p><strong>Legal Basis:</strong> Legitimate Interests (Art. 6(1)(f)) - preventing fraud, maintaining platform integrity</p>
                  <p><strong>Data Used:</strong> Certification details, verification documents, credential IDs</p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold text-foreground">Payment Processing</p>
                  <p><strong>Purpose:</strong> Processing employer credit purchases, managing subscriptions</p>
                  <p><strong>Legal Basis:</strong> Contract (Art. 6(1)(b)) + Legal Obligation (Art. 6(1)(c)) for tax records</p>
                  <p><strong>Data Used:</strong> Billing details, payment information, purchase history</p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold text-foreground">Platform Improvement & Analytics</p>
                  <p><strong>Purpose:</strong> Understanding usage, improving features, fixing bugs</p>
                  <p><strong>Legal Basis:</strong> Legitimate Interests (Art. 6(1)(f)) - improving service quality</p>
                  <p><strong>Data Used:</strong> Usage patterns, anonymised analytics</p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold text-foreground">Security & Fraud Prevention</p>
                  <p><strong>Purpose:</strong> Detecting abuse, protecting accounts, security logging</p>
                  <p><strong>Legal Basis:</strong> Legitimate Interests (Art. 6(1)(f)) - protecting users</p>
                  <p><strong>Data Used:</strong> IP addresses, device info, login attempts</p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold text-foreground">Marketing Communications (Optional)</p>
                  <p><strong>Purpose:</strong> Sending newsletters, product updates</p>
                  <p><strong>Legal Basis:</strong> Consent (Art. 6(1)(a)) - you can opt out anytime</p>
                  <p><strong>Data Used:</strong> Email address, communication preferences</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <CardHeader>
              <CardTitle>4. Controller vs Processor: Our Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-medium text-foreground">Understanding our data responsibilities:</p>
              
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mt-4">
                <p className="font-semibold text-foreground mb-2">When Cydena is a Data Controller:</p>
                <p>
                  For most platform operations, <strong>Cydena is the data controller</strong>. This means we decide what candidate and employer data to collect, how long to keep it, and who can access it. This includes candidate profiles, job postings, verification processes, and platform analytics.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg mt-4">
                <p className="font-semibold text-foreground mb-2">When Cydena is a Data Processor:</p>
                <p>
                  In specific circumstances, <strong>Cydena may act as a data processor</strong> for employers or recruiters. For example, if an employer uses our platform to manage their own candidate pool or white-label talent database, they remain the controller and we process data on their instructions. In these cases, we have Data Processing Agreements (DPAs) in place.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <CardHeader>
              <CardTitle>5. How We Share Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground mb-2">For Candidates:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Public Profile Data:</strong> Name, job title, skills, certifications visible to all employers</li>
                  <li><strong>Unlocked Profiles:</strong> Full contact details only shared with employers who unlock your profile using credits</li>
                  <li><strong>Notifications:</strong> You receive an email when an employer unlocks your profile</li>
                  <li><strong>Job Applications:</strong> Your full profile shared with the employer you apply to</li>
                </ul>
              </div>

              <div className="mt-6">
                <p className="font-semibold text-foreground mb-2">Third-Party Service Providers:</p>
                <p>We share data with trusted service providers who help us operate Cydena:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li><strong>Hosting & Infrastructure:</strong> Supabase (cloud database and backend)</li>
                  <li><strong>Payment Processing:</strong> Stripe (card processing - we don&apos;t store card details)</li>
                  <li><strong>Email Delivery:</strong> SendGrid (notifications)</li>
                  <li><strong>Analytics:</strong> Privacy-focused analytics providers</li>
                  <li><strong>Verification Services:</strong> Certification bodies when verifying credentials</li>
                </ul>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg mt-6">
                <p className="font-semibold text-foreground mb-2">✓ What We Don&apos;t Do:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Sell your personal data to third parties</li>
                  <li>Share candidate contact info with employers who haven&apos;t unlocked profiles</li>
                  <li>Use your data for advertising without explicit consent</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.5s'}}>
            <CardHeader>
              <CardTitle>6. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Your data may be stored and processed in countries outside the UK/EEA. When we transfer data internationally, we ensure appropriate safeguards:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Standard Contractual Clauses (SCCs):</strong> EU/UK-approved contracts requiring overseas providers to protect your data to GDPR standards</li>
                <li><strong>Adequacy Decisions:</strong> Transfers to countries the UK Government has deemed to have equivalent data protection laws</li>
                <li><strong>US Transfers:</strong> We ensure US providers comply with UK-US data transfer frameworks or SCCs</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.6s'}}>
            <CardHeader>
              <CardTitle>7. How Long We Keep Your Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-medium text-foreground">We only keep your data as long as necessary:</p>

              <div className="space-y-4 mt-4">
                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold text-foreground">Active Candidate Accounts</p>
                  <p>Kept while active and for 3 years after last activity</p>
                  <p className="text-sm mt-1"><em>Reason: Employers may contact you for opportunities even if you haven&apos;t logged in recently</em></p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold text-foreground">Active Employer Accounts</p>
                  <p>Kept while active and for 6 years after closure</p>
                  <p className="text-sm mt-1"><em>Reason: UK tax law requires business records for 6 years</em></p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold text-foreground">Deleted Accounts</p>
                  <p>Most data deleted within 30 days. Some retained longer:</p>
                  <ul className="list-disc pl-6 mt-1 space-y-1">
                    <li>Financial records: 6 years (legal requirement)</li>
                    <li>Verification records: 2 years (fraud prevention)</li>
                    <li>Security logs: 1 year (abuse prevention)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold text-foreground">Profile Unlock History</p>
                  <p>Records kept for 2 years for dispute resolution and audit requirements</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.7s'}}>
            <CardHeader>
              <CardTitle>8. Your Rights Under UK GDPR & DPA 2018</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-medium text-foreground">You have the following data protection rights:</p>

              <div className="space-y-4 mt-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-semibold text-foreground">Right to Access</p>
                  <p>Request a copy of all personal data we hold about you</p>
                  <p className="text-sm mt-2"><strong>How:</strong> Email privacy@cydena.com with &quot;Subject Access Request&quot;. We&apos;ll respond within 30 days</p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-semibold text-foreground">Right to Rectification</p>
                  <p>Correct inaccurate or incomplete information</p>
                  <p className="text-sm mt-2"><strong>How:</strong> Update in Settings → Profile or email privacy@cydena.com</p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-semibold text-foreground">Right to Erasure (&quot;Right to be Forgotten&quot;)</p>
                  <p>Request deletion of your personal data</p>
                  <p className="text-sm mt-2"><strong>How:</strong> Settings → Account → Delete Account or email privacy@cydena.com</p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-semibold text-foreground">Right to Data Portability</p>
                  <p>Receive your data in machine-readable format</p>
                  <p className="text-sm mt-2"><strong>How:</strong> Settings → Export Data or email privacy@cydena.com</p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-semibold text-foreground">Right to Object</p>
                  <p>Object to processing based on legitimate interests</p>
                  <p className="text-sm mt-2"><strong>How:</strong> Email privacy@cydena.com. For marketing, click &quot;Unsubscribe&quot;</p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-semibold text-foreground">Right to Complain</p>
                  <p className="text-sm mt-2">
                    <strong>Information Commissioner&apos;s Office (ICO):</strong><br/>
                    Website: <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ico.org.uk/make-a-complaint</a><br/>
                    Phone: 0303 123 1113<br/>
                    Address: Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mt-6">
                <p className="font-semibold text-foreground mb-2">⏱️ Response Times</p>
                <p>We respond to all requests within <strong>30 days</strong>. Complex requests may take up to 3 months - we&apos;ll let you know if this is the case. All requests are <strong>free of charge</strong>.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.8s'}}>
            <CardHeader>
              <CardTitle>9. Cookies & Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We use cookies and similar technologies to improve your experience:</p>

              <div className="space-y-4 mt-4">
                <div className="border-l-4 border-emerald-500 pl-4">
                  <p className="font-semibold text-foreground">Essential Cookies (Always Active)</p>
                  <p><strong>Purpose:</strong> Required for login, security, core functionality</p>
                  <p className="text-sm mt-1"><em>Cannot be disabled - necessary for platform to work</em></p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold text-foreground">Preference Cookies</p>
                  <p><strong>Purpose:</strong> Remember settings (theme, language, notifications)</p>
                  <p className="text-sm mt-1"><em>Can be disabled, but settings won&apos;t persist</em></p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="font-semibold text-foreground">Analytics Cookies (Optional)</p>
                  <p><strong>Purpose:</strong> Understanding usage to improve features</p>
                  <p className="text-sm mt-1"><em>Only activate if you consent via cookie banner</em></p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg mt-6">
                <p className="font-semibold text-foreground mb-2">🍪 Cookie Consent</p>
                <p>
                  Non-essential cookies <strong>only activate after you give consent</strong> via the cookie banner. You can change preferences anytime in Settings → Privacy.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.9s'}}>
            <CardHeader>
              <CardTitle>10. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We implement industry-standard security measures:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Encryption:</strong> AES-256 for data at rest, TLS 1.3 for data in transit (HTTPS)</li>
                <li><strong>Authentication:</strong> Secure password hashing, mandatory 2FA for all users</li>
                <li><strong>Access Controls:</strong> Role-based permissions, principle of least privilege</li>
                <li><strong>Monitoring:</strong> 24/7 security monitoring, intrusion detection</li>
                <li><strong>Backups:</strong> Daily encrypted backups with 30-day retention</li>
                <li><strong>Audits:</strong> Regular security assessments and penetration testing</li>
              </ul>

              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg mt-6">
                <p className="font-semibold text-foreground mb-2">⚠️ Data Breach Notification</p>
                <p>If we experience a data breach affecting your information, we will notify you by email within 72 hours and report it to the ICO as required by law.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '1.0s'}}>
            <CardHeader>
              <CardTitle>11. Children&apos;s Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Cydena is a professional platform intended for adults. <strong>Our services are not for anyone under 18 years old.</strong>
              </p>
              <p className="mt-4">
                We do not knowingly collect personal information from children. If we become aware we&apos;ve collected data from someone under 18, we will immediately suspend the account and delete all personal information within 7 days.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '1.1s'}}>
            <CardHeader>
              <CardTitle>12. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We may update this Privacy Policy from time to time. When we make changes, we&apos;ll notify you by:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Updating the &quot;Last updated&quot; date at the top</li>
                <li><strong>For significant changes:</strong> Sending an email notification</li>
                <li><strong>For major changes:</strong> Displaying a prominent notice and requesting consent where required</li>
              </ul>
              <p className="mt-4">
                Continued use of Cydena after changes are posted constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{animationDelay: '1.2s'}}>
            <CardHeader>
              <CardTitle>13. Contact Us & Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-medium text-foreground">Have questions about this Privacy Policy or how we handle your data?</p>

              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mt-4 space-y-3">
                <div>
                  <p className="font-semibold text-foreground">Data Protection Officer</p>
                  <p>Email: <a href="mailto:dpo@cydena.com" className="text-primary hover:underline">dpo@cydena.com</a></p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">General Privacy Enquiries</p>
                  <p>Email: <a href="mailto:privacy@cydena.com" className="text-primary hover:underline">privacy@cydena.com</a></p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Contact Form</p>
                  <p><a href="/contact" className="text-primary hover:underline">Visit our Contact page</a></p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Postal Address</p>
                  <p>
                    Cydena Ltd<br/>
                    [Registered Office Address]<br/>
                    Company Number: 16779531 (Wales)
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg mt-6">
                <p className="font-semibold text-foreground mb-2">Not satisfied with our response?</p>
                <p>You have the right to lodge a complaint with the Information Commissioner&apos;s Office (ICO):</p>
                <div className="mt-3 space-y-1">
                  <p><strong>Website:</strong> <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ico.org.uk/make-a-complaint</a></p>
                  <p><strong>Phone:</strong> 0303 123 1113</p>
                  <p><strong>Address:</strong> Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF</p>
                </div>
              </div>

              <p className="mt-6 text-sm text-center text-muted-foreground/60">
                This Privacy Policy complies with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018 (DPA 2018).
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Privacy;