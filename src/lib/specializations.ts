// Specialization detection based on skills and certifications

export type Specialization = 
  | 'cloud-security'
  | 'incident-response'
  | 'penetration-testing'
  | 'red-team'
  | 'blue-team'
  | 'grc-compliance'
  | 'application-security'
  | 'network-security'
  | 'threat-intelligence'
  | 'operational-technology'
  | 'operational-security'
  | 'security-architecture'
  | 'data-privacy'
  | 'cyber-defence'
  | 'ai-security'
  | 'emerging-technology';

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
    keywords: ['penetration testing', 'pentest', 'ethical hacking', 'metasploit', 'burp suite', 'kali'],
    certKeywords: ['oscp', 'ceh', 'cpent', 'gpen', 'gwapt', 'pnpt', 'oswp', 'osep', 'osed', 'oswe', 'gxpn', 'gawn']
  },
  {
    id: 'red-team',
    label: 'Red Team Operations',
    icon: '⚔️',
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    keywords: ['red team', 'adversary simulation', 'attack simulation', 'offensive security', 'purple team', 'breach simulation', 'red teaming'],
    certKeywords: ['crto', 'crtp', 'ccrts', 'ccsas', 'osep', 'osed', 'gxpn', 'red team', 'btl2']
  },
  {
    id: 'blue-team',
    label: 'Blue Team Defense',
    icon: '🛡️',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    keywords: ['blue team', 'defensive security', 'security monitoring', 'threat detection', 'incident response', 'soc analyst', 'defense'],
    certKeywords: ['btl1', 'btl2', 'gcih', 'gcia', 'gcfa', 'cysa+', 'blue team', 'security+']
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
  },
  {
    id: 'operational-security',
    label: 'Operational Security',
    icon: '⚙️',
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    keywords: ['operational security', 'opsec', 'security operations', 'change management', 'patch management', 'vulnerability management', 'security monitoring'],
    certKeywords: ['security+', 'casp+', 'cissp', 'cism', 'sans', 'itil']
  },
  {
    id: 'security-architecture',
    label: 'Security Architecture & Engineering',
    icon: '🏗️',
    color: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
    keywords: ['security architecture', 'security design', 'cyber engineering', 'secure design', 'zero trust', 'defense in depth', 'security framework'],
    certKeywords: ['cissp', 'ccsp', 'togaf', 'sabsa', 'cism', 'casp+', 'sans architect']
  },
  {
    id: 'data-privacy',
    label: 'Data Privacy & Protection',
    icon: '🛡️',
    color: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
    keywords: ['data privacy', 'data protection', 'gdpr', 'dpa', 'sox', 'privacy', 'data governance', 'personal data'],
    certKeywords: ['cipp', 'cipm', 'cipt', 'cdpse', 'gdpr', 'privacy professional']
  },
  {
    id: 'cyber-defence',
    label: 'Cyber Defence & National Security',
    icon: '🛡️',
    color: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    keywords: ['cyber defence', 'national security', 'modaf', 'secure by design', 'hmc cesg', 'rmads', 'hmg ia', 'government security'],
    certKeywords: ['sc clearance', 'dv clearance', 'cesg', 'ncsc', 'cissp', 'check']
  },
  {
    id: 'ai-security',
    label: 'AI & ML Security',
    icon: '🤖',
    color: 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20',
    keywords: ['ai security', 'machine learning security', 'ml security', 'artificial intelligence security', 'llm security', 'ai red team', 'prompt injection', 'model security'],
    certKeywords: ['ai security', 'ml security', 'ai red team']
  },
  {
    id: 'emerging-technology',
    label: 'Emerging Technology',
    icon: '🔮',
    color: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
    keywords: ['blockchain security', 'web3 security', 'quantum security', 'iot security', 'robotics security', 'automation security'],
    certKeywords: ['blockchain security', 'web3 security', 'iot security']
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
