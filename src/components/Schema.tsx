import { useEffect } from 'react';

interface SchemaProps {
  type: 'organization' | 'website' | 'jobPosting' | 'breadcrumb' | 'faqPage';
  data?: any;
}

const Schema = ({ type, data }: SchemaProps) => {
  useEffect(() => {
    const schemaData = generateSchema(type, data);
    
    // Create or update script tag
    let script = document.querySelector(`script[data-schema="${type}"]`);
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-schema', type);
      document.head.appendChild(script);
    }
    
    script.textContent = JSON.stringify(schemaData);
    
    return () => {
      // Cleanup on unmount
      const existingScript = document.querySelector(`script[data-schema="${type}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [type, data]);

  return null;
};

const generateSchema = (type: string, data?: any) => {
  const baseUrl = window.location.origin;
  
  switch (type) {
    case 'organization':
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Cydena",
        "alternateName": "Cydena Cyber Talent Platform",
        "url": baseUrl,
        "logo": `${baseUrl}/logos/cydena-logo.png`,
        "description": "The platform for verified cyber talent. Skills-based matching for security analysts, penetration testers, and cybersecurity professionals.",
        "email": "contact@cydena.com",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "GB"
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+44-xxx-xxx-xxxx",
            "contactType": "customer service",
            "email": "contact@cydena.com",
            "areaServed": "GB",
            "availableLanguage": "English"
          },
          {
            "@type": "ContactPoint",
            "contactType": "sales",
            "email": "employers@cydena.com",
            "areaServed": "GB",
            "availableLanguage": "English"
          }
        ],
        "sameAs": [
          "https://www.linkedin.com/company/cydena",
          "https://twitter.com/cydena"
        ],
        "founder": {
          "@type": "Person",
          "name": "Cydena Team"
        },
        "foundingDate": "2024",
        "slogan": "The platform for verified cyber talent",
        "knowsAbout": [
          "Cybersecurity Recruitment",
          "Information Security Jobs",
          "Security Analyst Hiring",
          "Penetration Testing Careers",
          "SOC Analyst Recruitment",
          "CISO Positions",
          "Cybersecurity Training",
          "Security Certifications"
        ],
        "areaServed": {
          "@type": "Place",
          "name": "United Kingdom"
        }
      };
    
    case 'website':
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Cydena",
        "url": baseUrl,
        "description": "The platform for verified cyber talent. Connecting verified security professionals with top employers. Free for candidates.",
        "publisher": {
          "@type": "Organization",
          "name": "Cydena"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${baseUrl}/jobs?search={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      };
    
    case 'jobPosting':
      if (!data) return null;
      return {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": data.title,
        "description": data.description,
        "datePosted": data.created_at,
        "validThrough": data.valid_through || new Date(new Date(data.created_at).setMonth(new Date(data.created_at).getMonth() + 3)).toISOString(),
        "employmentType": data.job_type === "full-time" ? "FULL_TIME" : data.job_type === "part-time" ? "PART_TIME" : data.job_type === "contract" ? "CONTRACTOR" : "OTHER",
        "hiringOrganization": {
          "@type": "Organization",
          "name": data.company?.name || "Cydena Employer",
          "sameAs": baseUrl
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": data.location || "Remote",
            "addressCountry": "GB"
          }
        },
        "baseSalary": data.salary_min && data.salary_max ? {
          "@type": "MonetaryAmount",
          "currency": "GBP",
          "value": {
            "@type": "QuantitativeValue",
            "minValue": data.salary_min,
            "maxValue": data.salary_max,
            "unitText": "YEAR"
          }
        } : undefined,
        "skills": data.required_skills?.join(", ") || "",
        "industry": "Information Technology and Cybersecurity",
        "occupationalCategory": "15-1212.00",
        "workHours": data.job_type === "full-time" ? "40 hours per week" : undefined,
        "qualifications": data.required_clearance ? `Security Clearance: ${data.required_clearance}` : undefined
      };
    
    case 'breadcrumb':
      if (!data || !data.items) return null;
      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": data.items.map((item: any, index: number) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": `${baseUrl}${item.path}`
        }))
      };
    
    case 'faqPage':
      if (!data || !data.questions) return null;
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": data.questions.map((q: { question: string; answer: string }) => ({
          "@type": "Question",
          "name": q.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": q.answer
          }
        }))
      };
    
    default:
      return null;
  }
};

export default Schema;
