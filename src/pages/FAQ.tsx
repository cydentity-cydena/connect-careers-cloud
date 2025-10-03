import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const FAQ = () => {
  const candidateFAQs = [
    {
      question: "Is Cydent really free for candidates?",
      answer: "Yes! 100% free forever for all candidates, from entry-level to CISO. No hidden fees, no premium tiers. We believe in giving cybersecurity professionals equal access to opportunities."
    },
    {
      question: "How does the leaderboard work?",
      answer: "The leaderboard ranks candidates based on profile completion, certifications, skills, and activity on the platform. The more you engage and showcase your expertise, the higher you rank, giving you more visibility to employers."
    },
    {
      question: "Can I apply if I'm transitioning into cybersecurity?",
      answer: "Absolutely! We welcome career transitioners. Focus on completing your profile with relevant certifications (even entry-level ones), transferable skills, and your willingness to learn. Many employers specifically look for motivated entry-level talent."
    },
    {
      question: "What certifications should I add?",
      answer: "Add any cybersecurity-related certifications from our partner organizations: CompTIA (Security+), EC-Council (CEH), SANS, ISC2 (CISSP), ISACA (CISA/CISM), or Real LMS training certificates. Even foundational certs help!"
    },
    {
      question: "How do employers see my profile?",
      answer: "Employers see your basic information (name, title, years of experience, certifications) for free. To see your full profile with contact details and resume, they must unlock it using credits. You'll be notified when someone unlocks your profile."
    },
    {
      question: "Can I apply for multiple jobs at once?",
      answer: "Yes! Apply to as many jobs as you like. Track all your applications in one dashboard and message employers directly through the platform."
    }
  ];

  const employerFAQs = [
    {
      question: "How is Cydent different from LinkedIn Recruiter?",
      answer: "Unlike LinkedIn's subscription model (£8,000+/year), we use a pay-per-unlock system. You only pay when you find a candidate you want to contact. Plus, our platform is specialized for cybersecurity with verified certifications, security clearance filters, and skills-based matching."
    },
    {
      question: "What's included in a profile unlock?",
      answer: "When you unlock a candidate profile for £10-£50, you get: full resume/CV, direct email and phone contact, LinkedIn profile, portfolio links, detailed work history, and the ability to message them directly in-platform."
    },
    {
      question: "Do I need to sign a contract?",
      answer: "No contracts, ever. Buy credits as you need them. No monthly subscriptions, no retainer fees, no exclusivity agreements. Cancel anytime without penalty."
    },
    {
      question: "How quickly can I start interviewing candidates?",
      answer: "Most employers connect with qualified candidates within 48 hours. Browse profiles immediately after signing up, unlock the ones you like, and reach out directly. No waiting for a recruiter to send you CVs."
    },
    {
      question: "What if I unlock a profile and they're not interested?",
      answer: "While we can't refund individual unlocks, we recommend using our free preview features first: view certifications, years of experience, skills, and leaderboard ranking before unlocking. Most candidates on Cydent are actively job seeking."
    },
    {
      question: "Can I post multiple jobs?",
      answer: "Yes! Small teams can post up to 5 active jobs. Enterprise customers get unlimited job postings. Each job can have custom requirements, pipeline stages, and application tracking."
    },
    {
      question: "What's your refund policy?",
      answer: "Unused credits never expire and are fully refundable within 30 days of purchase. Once you unlock a profile, that credit is consumed (since you've accessed candidate information)."
    }
  ];

  const technicalFAQs = [
    {
      question: "How do you verify certifications?",
      answer: "We partner with leading certification bodies (CompTIA, EC-Council, SANS, ISC2, ISACA) to verify credentials. Candidates are encouraged to provide certificate IDs and URLs. We're working on automated verification with our partners."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. We use bank-level encryption (AES-256), secure authentication, and comply with GDPR/UK data protection laws. As a cybersecurity platform, security is our top priority. Your data is never sold to third parties."
    },
    {
      question: "Can I integrate Cydent with my ATS?",
      answer: "API access and ATS integrations are available for Enterprise customers. Contact our sales team to discuss your specific integration needs."
    },
    {
      question: "Do you support security clearance filtering?",
      answer: "Yes! Candidates can indicate their security clearance level (SC, DV, etc.), and employers can filter by required clearance. This is especially useful for government and defense contractor roles."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="FAQ - Cydent | Cybersecurity Recruitment Questions Answered"
        description="Get answers to frequently asked questions about Cydent's cybersecurity recruitment platform. Learn about pricing, features, and how to get started."
        keywords="cybersecurity recruitment faq, how to hire cybersecurity talent, cyber job board questions, recruitment platform help"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold mb-4">
              Frequently Asked <span className="bg-gradient-cyber bg-clip-text text-transparent">Questions</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about Cydent
            </p>
          </div>

          {/* For Candidates */}
          <Card className="mb-8 animate-slide-up">
            <CardHeader>
              <CardTitle className="text-2xl">For Candidates</CardTitle>
              <CardDescription>Questions about using Cydent to find your next role</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {candidateFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`candidate-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* For Employers */}
          <Card className="mb-8 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <CardHeader>
              <CardTitle className="text-2xl">For Employers</CardTitle>
              <CardDescription>Questions about hiring through Cydent</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {employerFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`employer-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Technical Questions */}
          <Card className="mb-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <CardHeader>
              <CardTitle className="text-2xl">Technical & Security</CardTitle>
              <CardDescription>Questions about platform security and features</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {technicalFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`technical-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Still have questions */}
          <Card className="border-primary/20 bg-gradient-card animate-fade-in">
            <CardContent className="pt-6 text-center">
              <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-6">
                We're here to help! Get in touch with our team.
              </p>
              <Link to="/contact">
                <Button className="gap-2">
                  Contact Us <MessageCircle className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FAQ;
