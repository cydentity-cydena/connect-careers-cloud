import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const FAQ = () => {
  const recruiterFAQs = [
    {
      question: "Can recruitment agencies use Cydena?",
      answer: "Yes! Agencies can manage multiple client requisitions, build candidate shortlists, and present qualified cybersecurity professionals to clients. Each recruiter gets their own dashboard to track placements."
    },
    {
      question: "How do I manage multiple clients?",
      answer: "Create separate companies for each client under your account. Post jobs, track candidates, and manage pipelines independently per client. Enterprise plans support unlimited client accounts."
    },
    {
      question: "What's the fee structure for agency placements?",
      answer: "Agencies pay the same unlock fees as direct employers (£10-£15 per profile). No placement fees, no success charges, no contracts. You keep 100% of your client fees."
    },
    {
      question: "Can I create candidate shortlists for clients?",
      answer: "Yes! Save candidates to custom lists, add notes, and track which candidates you've presented to which clients. Manage multiple requisitions across different client companies."
    },
    {
      question: "Do you offer volume discounts for agencies?",
      answer: "Yes! Agencies placing 10+ candidates per month qualify for discounted unlock rates and priority support. Contact us for custom agency pricing."
    },
    {
      question: "Can I white-label Cydena for my clients?",
      answer: "Custom branding and white-label options are available for Enterprise agencies. Your clients see your branding while you use our platform infrastructure."
    }
  ];

  const candidateFAQs = [
    {
      question: "Is Cydena really free for candidates?",
      answer: "Yes! 100% free forever for all candidates, from entry-level to CISO. No hidden fees, no premium tiers. We believe in giving cybersecurity professionals equal access to opportunities."
    },
    {
      question: "What is HR-Ready verification and should I get it?",
      answer: "HR-Ready verification means you've submitted identity documents (passport/license) and right-to-work proof (UK work visa, citizenship, etc.) that we've reviewed. It shows employers you're pre-cleared and interview-ready, significantly increasing your chances of getting shortlisted. It's optional but highly recommended!"
    },
    {
      question: "Can I prove my skills with assessments?",
      answer: "Yes! Connect your TryHackMe or HackTheBox accounts to display your rank and completed challenges. These verified platforms show real technical ability, not just claimed skills. Employers can see your actual penetration testing, forensics, and other hands-on capabilities."
    },
    {
      question: "How does the leaderboard and XP system work?",
      answer: "The leaderboard ranks candidates based on profile completion, verified certifications, skills assessments, and community engagement (peer endorsements, helping others). Earn XP by adding certifications, completing training, and contributing to the community. Higher ranks = more visibility to employers."
    },
    {
      question: "Can I track my applications in real-time?",
      answer: "Absolutely! Unlike other platforms where applications go into a black hole, Cydena shows you exactly where your application stands. You'll see when it moves from 'Applied' to 'Under Review' to 'Offer Extended' - all in real-time on your dashboard. Employers update the status as they progress, so you're never left wondering."
    },
    {
      question: "Can I apply if I'm transitioning into cybersecurity?",
      answer: "Absolutely! We welcome career transitioners. Focus on completing your profile with relevant certifications (even entry-level ones like CompTIA Security+), connect your TryHackMe/HackTheBox accounts, and showcase transferable skills. Many employers specifically look for motivated entry-level talent."
    },
    {
      question: "What training partnerships do you have?",
      answer: "We partner with Cydentity Academy, LetsDefend, Credly, and other training platforms. Complete courses through our partners and your achievements automatically sync to your profile, earning you XP and increasing your leaderboard ranking."
    },
    {
      question: "How do employers see my profile?",
      answer: "Employers see your basic information (username, title, years of experience, certifications, HR-Ready status) for free. To see your full profile with your real name, contact details, and resume, they must unlock it using credits. You'll be notified when someone unlocks your profile."
    },
    {
      question: "Can I apply for multiple jobs at once?",
      answer: "Yes! Apply to as many jobs as you like. Track all your applications in one dashboard and message employers directly through the platform."
    }
  ];

  const employerFAQs = [
    {
      question: "How is Cydena different from LinkedIn Recruiter?",
      answer: "Unlike LinkedIn's subscription model (£8,000+/year), we use a pay-per-unlock system. You only pay when you find a candidate you want to contact. Plus, our platform is specialized for cybersecurity with HR-Ready verification, verified skills assessments (TryHackMe/HackTheBox), certification validation, and security clearance filters."
    },
    {
      question: "What is HR-Ready verification and why does it matter?",
      answer: "HR-Ready candidates have submitted and had identity (passport/license) and right-to-work documentation verified by our team. This means zero compliance risk for you - they're pre-cleared and can start immediately. Filter by HR-Ready status to see only interview-ready candidates and hire 70% faster."
    },
    {
      question: "Can I integrate Cydena with my existing ATS?",
      answer: "Yes! We support direct integrations with Greenhouse, Lever, Workday, and other major ATS platforms. Push candidates directly to your ATS with one click. You can also set up custom webhooks to automate workflows. Available on Growth and Enterprise plans."
    },
    {
      question: "How are skills actually verified?",
      answer: "We verify skills through multiple sources: (1) TryHackMe & HackTheBox platform rankings showing actual hands-on performance, (2) Certification verification through issuing bodies, (3) Training course completion from our partners, (4) Peer endorsements from other verified professionals. This goes far beyond self-reported skills on other platforms."
    },
    {
      question: "What's included in a profile unlock?",
      answer: "When you unlock a candidate profile (£10-£15 depending on your subscription tier), you get: full resume/CV, direct email and phone contact, LinkedIn profile, portfolio links, detailed work history, skills assessment results, and the ability to message them directly in-platform."
    },
    {
      question: "Do I need to sign a contract?",
      answer: "No contracts, ever. Buy credits as you need them or choose a subscription tier. No retainer fees, no exclusivity agreements. Cancel anytime without penalty."
    },
    {
      question: "How quickly can I start interviewing candidates?",
      answer: "Instantly! Browse profiles immediately after signing up, filter by HR-Ready status to see pre-verified candidates, unlock qualified talent, and connect with them directly via email, phone, or in-platform messaging. No waiting for a recruiter to send you CVs - you're in control from day one."
    },
    {
      question: "Can I post multiple jobs?",
      answer: "Yes! Starter tier: up to 5 active jobs. Growth: up to 15 jobs. Scale & Enterprise: unlimited job postings. Each job can have custom requirements, pipeline stages, and application tracking."
    }
  ];

  const technicalFAQs = [
    {
      question: "How do you verify certifications?",
      answer: "Candidates submit certification documents which our team manually reviews. We check certificate IDs, issue dates, and expiration dates. We also integrate with Credly for digital badges. Verified certifications display a checkmark badge on candidate profiles."
    },
    {
      question: "What ATS platforms do you integrate with?",
      answer: "We support Greenhouse, Lever, Workday, and Workable out-of-the-box. You can also set up custom webhooks to push candidate data to any system via JSON payloads. Configure field mappings to ensure data flows correctly into your ATS. Available on Growth plans and above."
    },
    {
      question: "How do webhooks work?",
      answer: "Set up webhooks to automatically send candidate data to your systems when specific events occur (profile unlocked, application received, candidate hired, etc.). You receive a JSON payload with candidate information that you can parse and insert into your database, CRM, or ATS. Includes retry logic and delivery tracking."
    },
    {
      question: "What training platforms are integrated?",
      answer: "We integrate with Cydentity Academy, LetsDefend, Credly, TryHackMe, and HackTheBox. When candidates complete courses or challenges on these platforms, their achievements automatically sync to their Cydena profile, earning XP and increasing their leaderboard ranking."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. We use bank-level encryption (AES-256), secure authentication, and comply with GDPR/UK data protection laws. As a cybersecurity platform, security is our top priority. Your data is never sold to third parties. HR-Ready verification documents are stored encrypted and only accessible to our verification team and the candidate."
    },
    {
      question: "Do you support security clearance filtering?",
      answer: "Yes! Candidates can indicate their security clearance level (SC, DV, etc.), and employers can filter by required clearance. This is especially useful for government and defense contractor roles."
    },
    {
      question: "Can I white-label the platform?",
      answer: "Custom branding and white-label options are available for Enterprise plans. Display your company branding while using our infrastructure, verification, and candidate pool. Contact our sales team to discuss requirements."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="FAQ - Cydena | Cybersecurity Recruitment Questions Answered"
        description="Get answers to frequently asked questions about Cydena's cybersecurity recruitment platform. Learn about pricing, features, and how to get started."
        keywords="cybersecurity recruitment faq, how to hire cybersecurity talent, cyber job board questions, recruitment platform help"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold mb-4">
              Cybersecurity Recruitment <span className="bg-gradient-cyber bg-clip-text text-transparent">FAQ</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about Cydena
            </p>
          </div>

          {/* For Candidates */}
          <Card className="mb-8 animate-slide-up">
            <CardHeader>
              <CardTitle className="text-2xl">For Candidates</CardTitle>
              <CardDescription>Questions about using Cydena to find your next role</CardDescription>
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
              <CardDescription>Questions about hiring through Cydena</CardDescription>
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

          {/* For Recruiters & Agencies */}
          <Card className="mb-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <CardHeader>
              <CardTitle className="text-2xl">For Recruiters & Agencies</CardTitle>
              <CardDescription>Questions about using Cydena for recruitment agencies</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {recruiterFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`recruiter-${index}`}>
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
          <Card className="mb-8 animate-slide-up" style={{animationDelay: '0.3s'}}>
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
