// Specialization detection based on skills and certifications

export type Specialization = 
  | 'cloud-security'
  | 'incident-response'
  | 'penetration-testing'
  | 'grc-compliance'
  | 'application-security'
  | 'network-security'
  | 'threat-intelligence'
  | 'operational-technology';

export interface SpecializationBadge {
  id: Specialization;
  label: string;
  icon: string;
  color: string;
  keywords: string[];
  certKeywords: string[];
}

export const SPECIALIZATIONS: SpecializationBadge[] = [
  {
    id: 'cloud-security',
    label: 'Cloud Security',
    icon: '☁️',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    keywords: ['aws', 'azure', 'gcp', 'cloud', 'kubernetes', 'docker', 'terraform'],
    certKeywords: ['ccsp', 'aws certified', 'azure security', 'gcp security', 'google cloud', 'cloud+', 'cks', 'ckad', 'cka', 'kubernetes']
  },
  {
    id: 'incident-response',
    label: 'Incident Response',
    icon: '🚨',
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    keywords: ['incident response', 'dfir', 'forensics', 'siem', 'splunk', 'elk', 'threat hunting'],
    certKeywords: ['gcih', 'gcfa', 'gcia', 'ecir', 'chfi', 'gcfe', 'gnfa', 'ctf', 'btl1']
  },
  {
    id: 'penetration-testing',
    label: 'Penetration Testing',
    icon: '🎯',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    keywords: ['penetration testing', 'pentest', 'ethical hacking', 'metasploit', 'burp suite', 'kali', 'red team'],
    certKeywords: ['oscp', 'ceh', 'cpent', 'gpen', 'gwapt', 'crto', 'pnpt', 'oswp', 'osep', 'osed', 'oswe', 'gxpn', 'gawn']
  },
  {
    id: 'grc-compliance',
    label: 'GRC & Compliance',
    icon: '📋',
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    keywords: ['governance', 'risk', 'compliance', 'audit', 'iso', 'nist', 'gdpr', 'sox', 'pci dss'],
    certKeywords: ['cissp', 'cism', 'crisc', 'cgrc', 'cisa', 'iso 27001', 'ccsp', 'security+', 'casp+']
  },
  {
    id: 'application-security',
    label: 'Application Security',
    icon: '🔐',
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    keywords: ['appsec', 'application security', 'secure coding', 'owasp', 'sast', 'dast', 'devsecops'],
    certKeywords: ['csslp', 'gwapt', 'oswe', 'case', 'gweb', 'bscp', 'case java', 'case .net']
  },
  {
    id: 'network-security',
    label: 'Network Security',
    icon: '🌐',
    color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    keywords: ['firewall', 'vpn', 'ids', 'ips', 'network security', 'routing', 'switching', 'cisco'],
    certKeywords: ['ccna security', 'ccnp security', 'fortinet', 'palo alto', 'nse', 'pcnse', 'jncia-sec', 'network+']
  },
  {
    id: 'threat-intelligence',
    label: 'Threat Intelligence',
    icon: '🔍',
    color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    keywords: ['threat intelligence', 'cti', 'osint', 'mitre att&ck', 'indicators of compromise', 'ioc'],
    certKeywords: ['gcti', 'ctia', 'cyberthreat', 'cyberintel', 'osint']
  },
  {
    id: 'operational-technology',
    label: 'Operational Technology',
    icon: '⚙️',
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    keywords: ['operational technology', 'ot', 'scada', 'ics', 'industrial control systems', 'plc', 'hmi', 'dcs', 'modbus', 'dnp3', 'ot security', 'critical infrastructure'],
    certKeywords: ['gicsp', 'grid', 'ics', 'scada', 'ot security', 'industrial cybersecurity', 'iec 62443', 'nist 800-82']
  }
];

export function detectSpecializations(
  skills: Array<{ skills?: { name: string; category?: string } }>,
  certifications: Array<{ name: string; issuer?: string }>
): Specialization[] {
  const detectedSpecs = new Set<Specialization>();
  
  const skillNames = skills
    .map(s => s.skills?.name?.toLowerCase() || '')
    .filter(Boolean);
  
  const certNames = certifications
    .map(c => `${c.name} ${c.issuer || ''}`.toLowerCase())
    .filter(Boolean);

  SPECIALIZATIONS.forEach(spec => {
    // Check skills
    const hasSkillMatch = skillNames.some(skill => 
      spec.keywords.some(keyword => skill.includes(keyword))
    );
    
    // Check certifications
    const hasCertMatch = certNames.some(cert => 
      spec.certKeywords.some(keyword => cert.includes(keyword))
    );
    
    if (hasSkillMatch || hasCertMatch) {
      detectedSpecs.add(spec.id);
    }
  });

  return Array.from(detectedSpecs);
}

export function getSpecializationBadge(id: Specialization): SpecializationBadge | undefined {
  return SPECIALIZATIONS.find(s => s.id === id);
}
