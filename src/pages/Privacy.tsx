import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy - Cydena"
        description="Privacy Policy for Cydena cybersecurity recruitment platform. Learn how we protect and handle your personal data."
      />
      <Navigation />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in">
            Privacy <span className="bg-gradient-cyber bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-muted-foreground mb-8 animate-fade-in">Last updated: January 2025</p>

          <Card className="mb-6 animate-slide-up">
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                At Cydena, we take your privacy seriously. This Privacy Policy explains how we collect, use, store, and 
                protect your personal information when you use our platform.
              </p>
              <p>
                By using Cydena, you agree to the collection and use of information in accordance with this policy.
                We are committed to transparency and compliance with GDPR (General Data Protection Regulation) and UK data 
                protection laws.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <CardHeader>
              <CardTitle>2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p><strong>For Candidates:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal details: Name, email address, phone number, location</li>
                <li>Professional information: Work experience, skills, certifications, education</li>
                <li>Profile data: Bio, avatar/photo, portfolio links, LinkedIn profile</li>
                <li>Security clearance status (if provided)</li>
                <li>Resume/CV files</li>
                <li>Application and messaging activity on the platform</li>
              </ul>
              <p className="mt-4"><strong>For Employers:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Company details: Name, website, industry, size, location</li>
                <li>Contact information: Email, phone number</li>
                <li>Job postings and requirements</li>
                <li>Payment and billing information</li>
                <li>Candidate unlocks and interaction history</li>
              </ul>
              <p className="mt-4"><strong>Automatically Collected Data:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Usage data: Pages viewed, time spent, interactions with features</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <CardHeader>
              <CardTitle>3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We use your personal information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain the Cydena platform</li>
                <li>Match candidates with relevant job opportunities</li>
                <li>Enable communication between candidates and employers</li>
                <li>Process payments and manage credits for employers</li>
                <li>Display candidate profiles and leaderboard rankings</li>
                <li>Send important notifications about applications, messages, and platform updates</li>
                <li>Improve our services through analytics and user feedback</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal obligations</li>
                <li>Send marketing communications (with your consent, which you can withdraw at any time)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <CardHeader>
              <CardTitle>4. Legal Basis for Processing (GDPR)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We process your personal data based on the following legal grounds:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Contract:</strong> To perform our contract with you (providing the platform services)</li>
                <li><strong>Consent:</strong> Where you have given explicit consent (e.g., marketing emails)</li>
                <li><strong>Legitimate Interests:</strong> For platform improvement, fraud prevention, and analytics</li>
                <li><strong>Legal Obligation:</strong> To comply with laws and regulations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <CardHeader>
              <CardTitle>5. How We Share Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p><strong>For Candidates:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Basic profile information (name, title, certifications, years of experience) is visible to all employers browsing the platform</li>
                <li>Full contact details and resume are only shared with employers who unlock your profile using credits</li>
                <li>You will be notified when an employer unlocks your profile</li>
              </ul>
              <p className="mt-4"><strong>For Employers:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Job postings are visible to all candidates</li>
                <li>Company information is displayed on job listings</li>
              </ul>
              <p className="mt-4"><strong>Third-Party Service Providers:</strong></p>
              <p>We may share data with trusted third parties who assist us in operating the platform:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cloud hosting providers (for data storage and infrastructure)</li>
                <li>Payment processors (for handling credit purchases)</li>
                <li>Email service providers (for sending notifications)</li>
                <li>Analytics providers (for platform improvement)</li>
              </ul>
              <p className="mt-4"><strong>We do NOT:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sell your personal data to third parties</li>
                <li>Share candidate contact information with employers who haven't unlocked their profiles</li>
                <li>Share data for advertising purposes without consent</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.5s'}}>
            <CardHeader>
              <CardTitle>6. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>AES-256 encryption for data at rest and in transit (HTTPS/TLS)</li>
                <li>Secure authentication with password hashing</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls limiting who can view sensitive data</li>
                <li>Regular backups to prevent data loss</li>
              </ul>
              <p className="mt-4">
                While we strive to protect your data, no method of transmission over the internet is 100% secure. 
                We cannot guarantee absolute security but will notify you of any data breaches as required by law.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.6s'}}>
            <CardHeader>
              <CardTitle>7. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Active accounts: Data is retained while your account remains active</li>
                <li>Deleted accounts: Most data is deleted within 30 days of account closure, except where required by law (e.g., financial records for tax purposes)</li>
                <li>Employer unlocks: Records of profile unlocks are retained for dispute resolution and auditing purposes</li>
                <li>Inactive accounts: May be deleted after 2 years of inactivity with prior notice</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.7s'}}>
            <CardHeader>
              <CardTitle>8. Your Rights (GDPR)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Under GDPR and UK data protection laws, you have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for marketing or other consent-based processing</li>
              </ul>
              <p className="mt-4">
                To exercise any of these rights, contact us at privacy@cydena.com. We will respond within 30 days.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.8s'}}>
            <CardHeader>
              <CardTitle>9. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We use cookies and similar tracking technologies to enhance your experience on Cydena:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for login, security, and core platform functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings. Note that disabling essential cookies may affect 
                platform functionality.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.9s'}}>
            <CardHeader>
              <CardTitle>10. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Cydena is not intended for users under the age of 16. We do not knowingly collect personal information 
                from children. If we become aware that we have collected data from a child, we will delete it promptly.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '1.0s'}}>
            <CardHeader>
              <CardTitle>11. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Your data may be stored and processed in countries outside the UK/EU. When we transfer data internationally, 
                we ensure appropriate safeguards are in place, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Standard Contractual Clauses approved by the European Commission</li>
                <li>Adequacy decisions for countries with equivalent data protection laws</li>
                <li>Certification schemes like Privacy Shield (where applicable)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '1.1s'}}>
            <CardHeader>
              <CardTitle>12. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
                We will notify you of significant changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Posting a notice on the platform</li>
                <li>Sending an email notification</li>
                <li>Updating the "Last updated" date at the top of this policy</li>
              </ul>
              <p className="mt-4">
                Continued use of the platform after changes are posted constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{animationDelay: '1.2s'}}>
            <CardHeader>
              <CardTitle>13. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                If you have questions about this Privacy Policy or how we handle your data, please contact us:
              </p>
              <ul className="list-none space-y-2 mt-4">
                <li><strong>Email:</strong> privacy@cydena.com</li>
                <li><strong>Data Protection Officer:</strong> dpo@cydena.com</li>
                <li><strong>Contact Form:</strong> Available on our Contact page</li>
              </ul>
              <p className="mt-4">
                If you're not satisfied with our response, you have the right to lodge a complaint with the Information 
                Commissioner's Office (ICO) in the UK or your local data protection authority.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
