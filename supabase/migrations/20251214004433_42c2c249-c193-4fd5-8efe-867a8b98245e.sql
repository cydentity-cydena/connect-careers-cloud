-- Link free partner courses to relevant skill pathways
-- We'll map courses based on their skill focus to appropriate pathways

-- Security Operations Analyst (Beginner Blue Team) - SOC 101, Linux Fundamentals, Intro DFIR
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'a75aec33-8ec2-4bbf-8ff6-bac2b974283b', id, 1, true FROM partner_courses WHERE title = 'SOC 101';
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'a75aec33-8ec2-4bbf-8ff6-bac2b974283b', id, 2, true FROM partner_courses WHERE title = 'Linux Fundamentals';
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'a75aec33-8ec2-4bbf-8ff6-bac2b974283b', id, 3, false FROM partner_courses WHERE title = 'Intro DFIR Challenge';

-- Security Analyst Foundation (Beginner Blue Team) - SOC 101, Linux Fundamentals
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'c7ebd4f6-f578-4b60-850f-7999aadc27d9', id, 1, true FROM partner_courses WHERE title = 'SOC 101';
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'c7ebd4f6-f578-4b60-850f-7999aadc27d9', id, 2, true FROM partner_courses WHERE title = 'Linux Fundamentals';

-- Advanced SOC Analyst (Intermediate Blue Team) - Intro DFIR, Intro to Breach & Attack Simulation
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT '811d877a-52b4-4277-81aa-f7cf5ddf8672', id, 1, true FROM partner_courses WHERE title = 'Intro DFIR Challenge';
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT '811d877a-52b4-4277-81aa-f7cf5ddf8672', id, 2, true FROM partner_courses WHERE title = 'Intro to Breach & Attack Simulation';

-- Threat Hunter (Advanced Blue Team) - Intro DFIR, Intro to Breach & Attack Simulation
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'aa2194ac-48d0-419b-a7bb-5c3fea6bc7da', id, 1, true FROM partner_courses WHERE title = 'Intro DFIR Challenge';
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'aa2194ac-48d0-419b-a7bb-5c3fea6bc7da', id, 2, true FROM partner_courses WHERE title = 'Intro to Breach & Attack Simulation';

-- Cloud Security Engineer (Intermediate Cloud) - Linux Fundamentals
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT '183fb18d-ad4f-4a3e-90f5-01ac51d14978', id, 1, true FROM partner_courses WHERE title = 'Linux Fundamentals';

-- Cloud Penetration Tester (Advanced Cloud) - Introduction to HTB Academy, SQL Injection
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'd2541975-05e2-4afd-9f8e-723a4f2daad4', id, 1, true FROM partner_courses WHERE title = 'Introduction to HTB Academy';
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'd2541975-05e2-4afd-9f8e-723a4f2daad4', id, 2, true FROM partner_courses WHERE title = 'SQL Injection';

-- Security Compliance Analyst (Beginner Governance) - SOC 101
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'a82e501d-c59f-431b-9eeb-8eb4ce9269af', id, 1, false FROM partner_courses WHERE title = 'SOC 101';

-- GRC Analyst Foundation (Beginner Governance) - SOC 101
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'ab2b1b80-391e-4a38-a5f1-79376d087e6d', id, 1, false FROM partner_courses WHERE title = 'SOC 101';

-- Add more free partner courses for better coverage

-- TryHackMe - Intro to Cyber Security (great for beginners)
INSERT INTO partner_courses (title, url, partner_slug, is_free, reward_amount, skill_slug, expected_proof, reward_code, active)
VALUES ('Intro to Cyber Security', 'https://tryhackme.com/room/introtocybersecurity?utm_source=cydena', 'tryhackme', true, 150, 'security-fundamentals', 'certificate', 'THM_INTRO_CYBER', true);

-- TryHackMe - Network Fundamentals
INSERT INTO partner_courses (title, url, partner_slug, is_free, reward_amount, skill_slug, expected_proof, reward_code, active)
VALUES ('Network Fundamentals', 'https://tryhackme.com/room/whatisnetworking?utm_source=cydena', 'tryhackme', true, 150, 'network-security', 'certificate', 'THM_NETWORK_FUND', true);

-- PortSwigger - XSS (Web Security Academy)
INSERT INTO partner_courses (title, url, partner_slug, is_free, reward_amount, skill_slug, expected_proof, reward_code, active)
VALUES ('Cross-Site Scripting (XSS)', 'https://portswigger.net/web-security/cross-site-scripting?utm_source=cydena', 'portswigger', true, 250, 'web-security', 'certificate', 'PS_XSS', true);

-- PortSwigger - Authentication
INSERT INTO partner_courses (title, url, partner_slug, is_free, reward_amount, skill_slug, expected_proof, reward_code, active)
VALUES ('Authentication Vulnerabilities', 'https://portswigger.net/web-security/authentication?utm_source=cydena', 'portswigger', true, 250, 'web-security', 'certificate', 'PS_AUTH', true);

-- LetsDefend - Phishing Analysis
INSERT INTO partner_courses (title, url, partner_slug, is_free, reward_amount, skill_slug, expected_proof, reward_code, active)
VALUES ('Phishing Email Analysis', 'https://app.letsdefend.io/path/phishing-analysis-learning-path?utm_source=cydena', 'letsdefend', true, 200, 'incident-response', 'certificate', 'LD_PHISHING', true);

-- LetsDefend - Malware Analysis Fundamentals
INSERT INTO partner_courses (title, url, partner_slug, is_free, reward_amount, skill_slug, expected_proof, reward_code, active)
VALUES ('Malware Analysis Fundamentals', 'https://app.letsdefend.io/path/malware-analysis-fundamentals?utm_source=cydena', 'letsdefend', true, 300, 'malware-analysis', 'certificate', 'LD_MALWARE', true);

-- AttackIQ - Purple Team Fundamentals
INSERT INTO partner_courses (title, url, partner_slug, is_free, reward_amount, skill_slug, expected_proof, reward_code, active)
VALUES ('Purple Team Fundamentals', 'https://www.academy.attackiq.com/?utm_source=cydena', 'attackiq', true, 250, 'purple-team', 'certificate', 'AIQ_PURPLE', true);

-- Hack The Box - Getting Started
INSERT INTO partner_courses (title, url, partner_slug, is_free, reward_amount, skill_slug, expected_proof, reward_code, active)
VALUES ('Getting Started with HTB', 'https://app.hackthebox.com/starting-point?utm_source=cydena', 'hackthebox', true, 200, 'penetration-testing', 'certificate', 'HTB_START', true);

-- Blue Team Labs - Investigation Challenges
INSERT INTO partner_courses (title, url, partner_slug, is_free, reward_amount, skill_slug, expected_proof, reward_code, active)
VALUES ('Security Investigation Challenges', 'https://blueteamlabs.online/home/challenges?utm_source=cydena', 'blueteamlabs', true, 250, 'digital-forensics', 'certificate', 'BTL_INVEST', true);

-- SANS Cyber Aces - Networking
INSERT INTO partner_courses (title, url, partner_slug, is_free, reward_amount, skill_slug, expected_proof, reward_code, active)
VALUES ('SANS Cyber Aces - Networking', 'https://www.cyberaces.org/courses?utm_source=cydena', 'sans', true, 150, 'network-security', 'certificate', 'SANS_NET', true);

-- Link new courses to pathways

-- Link TryHackMe Intro to Cyber to beginner pathways
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'c7ebd4f6-f578-4b60-850f-7999aadc27d9', id, 0, true FROM partner_courses WHERE title = 'Intro to Cyber Security';
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'a75aec33-8ec2-4bbf-8ff6-bac2b974283b', id, 0, true FROM partner_courses WHERE title = 'Intro to Cyber Security';

-- Link Network Fundamentals
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'c7ebd4f6-f578-4b60-850f-7999aadc27d9', id, 3, false FROM partner_courses WHERE title = 'Network Fundamentals';
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'a75aec33-8ec2-4bbf-8ff6-bac2b974283b', id, 4, false FROM partner_courses WHERE title = 'Network Fundamentals';

-- Link Phishing Analysis to SOC pathways
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT '811d877a-52b4-4277-81aa-f7cf5ddf8672', id, 3, false FROM partner_courses WHERE title = 'Phishing Email Analysis';
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'aa2194ac-48d0-419b-a7bb-5c3fea6bc7da', id, 3, false FROM partner_courses WHERE title = 'Phishing Email Analysis';

-- Link Malware Analysis to Threat Hunter
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'aa2194ac-48d0-419b-a7bb-5c3fea6bc7da', id, 4, true FROM partner_courses WHERE title = 'Malware Analysis Fundamentals';

-- Link Web Security courses to Cloud Pen Tester
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'd2541975-05e2-4afd-9f8e-723a4f2daad4', id, 3, false FROM partner_courses WHERE title = 'Cross-Site Scripting (XSS)';
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'd2541975-05e2-4afd-9f8e-723a4f2daad4', id, 4, false FROM partner_courses WHERE title = 'Authentication Vulnerabilities';
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT 'd2541975-05e2-4afd-9f8e-723a4f2daad4', id, 5, false FROM partner_courses WHERE title = 'Getting Started with HTB';

-- Link Cloud Security Engineer with networking
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT '183fb18d-ad4f-4a3e-90f5-01ac51d14978', id, 0, true FROM partner_courses WHERE title = 'Network Fundamentals';
INSERT INTO pathway_courses (pathway_id, course_id, sequence_order, is_required)
SELECT '183fb18d-ad4f-4a3e-90f5-01ac51d14978', id, 2, false FROM partner_courses WHERE title = 'Intro to Cyber Security';