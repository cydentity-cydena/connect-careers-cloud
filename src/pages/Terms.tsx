import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Terms of Service - Cydena"
        description="Terms of Service for Cydena cybersecurity recruitment platform. Read our terms and conditions for using our services."
      />
      <Navigation />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in">
            Terms of <span className="bg-gradient-cyber bg-clip-text text-transparent">Service</span>
          </h1>
          <p className="text-muted-foreground mb-8 animate-fade-in">Last updated: January 2025</p>

          <Card className="mb-6 animate-slide-up">
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                By accessing or using Cydena ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). 
                If you do not agree to these Terms, you may not access or use the Platform.
              </p>
              <p>
                These Terms apply to all users of the Platform, including candidates, employers, and visitors.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Cydena is an online platform that connects cybersecurity professionals with employers seeking to hire 
                cybersecurity talent. The Platform provides:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Profile creation and management for candidates</li>
                <li>Job posting and candidate search capabilities for employers</li>
                <li>Skills-based matching and leaderboard ranking systems</li>
                <li>Application tracking and messaging features</li>
                <li>Certification verification and skills showcasing</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <CardHeader>
              <CardTitle>3. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong>Account Creation:</strong> You must create an account to use certain features of the Platform. 
                You agree to provide accurate, current, and complete information during registration.
              </p>
              <p>
                <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account 
                credentials and for all activities under your account. Notify us immediately of any unauthorized access.
              </p>
              <p>
                <strong>Account Types:</strong> Accounts are categorized as Candidate accounts or Employer accounts. 
                You must select the appropriate account type based on your intended use.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <CardHeader>
              <CardTitle>4. For Candidates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong>Free Access:</strong> Candidate accounts and core features are provided free of charge.
              </p>
              <p>
                <strong>Profile Accuracy:</strong> You agree to provide truthful and accurate information about your skills, 
                experience, and certifications. False information may result in account suspension.
              </p>
              <p>
                <strong>Profile Visibility:</strong> Your profile may be viewed by employers. Full contact details are only 
                accessible to employers who unlock your profile using credits.
              </p>
              <p>
                <strong>Certifications:</strong> You are responsible for ensuring any certifications listed are valid and current. 
                We reserve the right to verify certification claims with issuing organizations.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <CardHeader>
              <CardTitle>5. For Employers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong>Credit System:</strong> Employers must purchase credits to unlock full candidate profiles. 
                Credits are non-refundable once used to unlock a profile, as access to candidate information has been provided.
              </p>
              <p>
                <strong>Unused Credits:</strong> Unused credits do not expire and can be refunded within 30 days of purchase.
              </p>
              <p>
                <strong>Job Postings:</strong> You agree that job postings must be genuine employment opportunities. 
                We reserve the right to remove fraudulent or misleading job posts.
              </p>
              <p>
                <strong>Candidate Contact:</strong> Contact information obtained through profile unlocks must only be used 
                for recruitment purposes related to the role(s) you posted. Sharing or selling candidate data is strictly prohibited.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.5s'}}>
            <CardHeader>
              <CardTitle>6. Prohibited Conduct</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Platform for any illegal purpose or in violation of any laws</li>
                <li>Post false, misleading, or fraudulent information</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to gain unauthorized access to the Platform or other users' accounts</li>
                <li>Scrape, copy, or download user data without authorization</li>
                <li>Use automated systems (bots) to access the Platform without permission</li>
                <li>Resell or redistribute candidate information obtained through the Platform</li>
                <li>Interfere with or disrupt the Platform's operation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.6s'}}>
            <CardHeader>
              <CardTitle>7. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                All content on the Platform, including text, graphics, logos, and software, is owned by or licensed to Cydena 
                and is protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                You retain ownership of content you submit (profiles, resumes, job postings), but grant Cydena a license to
                use, display, and distribute such content as necessary to operate the Platform.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.7s'}}>
            <CardHeader>
              <CardTitle>8. Payment and Refunds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong>Pricing:</strong> Current pricing is displayed on our Pricing page and may be updated at our discretion. 
                Price changes do not affect credits already purchased.
              </p>
              <p>
                <strong>Payment Processing:</strong> Payments are processed securely through third-party payment providers. 
                We do not store payment card details.
              </p>
              <p>
                <strong>Refund Policy:</strong> Unused credits are refundable within 30 days of purchase. Once a credit is used 
                to unlock a candidate profile, it cannot be refunded as the service (access to candidate information) has been delivered.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.8s'}}>
            <CardHeader>
              <CardTitle>9. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Your use of the Platform is also governed by our Privacy Policy, which describes how we collect, use, and 
                protect your personal information. By using the Platform, you consent to our data practices as described in 
                the Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '0.9s'}}>
            <CardHeader>
              <CardTitle>10. Disclaimer of Warranties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. 
                WE DO NOT GUARANTEE THAT THE PLATFORM WILL BE ERROR-FREE, UNINTERRUPTED, OR MEET YOUR SPECIFIC REQUIREMENTS.
              </p>
              <p>
                We are not responsible for the accuracy of user-submitted content, including candidate profiles and job postings. 
                We do not guarantee employment outcomes or successful hiring.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '1.0s'}}>
            <CardHeader>
              <CardTitle>11. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CYDENA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
                CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
              </p>
              <p>
                OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM YOUR USE OF THE PLATFORM SHALL NOT EXCEED THE AMOUNT YOU 
                PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '1.1s'}}>
            <CardHeader>
              <CardTitle>12. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We reserve the right to suspend or terminate your account at any time for violation of these Terms or for 
                any other reason at our sole discretion.
              </p>
              <p>
                You may terminate your account at any time by contacting us. Upon termination, your right to use the Platform 
                ceases immediately.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '1.2s'}}>
            <CardHeader>
              <CardTitle>13. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We may update these Terms from time to time. We will notify you of significant changes by posting a notice 
                on the Platform or by email. Your continued use of the Platform after changes are posted constitutes acceptance 
                of the updated Terms.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-slide-up" style={{animationDelay: '1.3s'}}>
            <CardHeader>
              <CardTitle>14. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                These Terms are governed by the laws of England and Wales. Any disputes arising from these Terms or your use 
                of the Platform shall be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{animationDelay: '1.4s'}}>
            <CardHeader>
              <CardTitle>15. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                If you have any questions about these Terms, please contact us through our Contact page or email us at 
                legal@cydena.com.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Terms;
