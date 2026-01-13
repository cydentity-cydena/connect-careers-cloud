-- Create a table to map skills to related certifications for graph traversal
CREATE TABLE IF NOT EXISTS public.skill_certification_map (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    certification_pattern TEXT NOT NULL, -- Pattern to match certification names
    relevance_weight DECIMAL(3,2) DEFAULT 1.0, -- How relevant this cert is to the skill (0-1)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Seed common skill-cert mappings
INSERT INTO public.skill_certification_map (skill_id, certification_pattern, relevance_weight) VALUES
    ((SELECT id FROM skills WHERE name ILIKE '%penetration%' LIMIT 1), 'OSCP', 1.0),
    ((SELECT id FROM skills WHERE name ILIKE '%penetration%' LIMIT 1), 'CEH', 0.8),
    ((SELECT id FROM skills WHERE name ILIKE '%cloud%' LIMIT 1), 'AWS', 0.9),
    ((SELECT id FROM skills WHERE name ILIKE '%cloud%' LIMIT 1), 'Azure', 0.9),
    ((SELECT id FROM skills WHERE name ILIKE '%network%' LIMIT 1), 'CCNA', 0.9),
    ((SELECT id FROM skills WHERE name ILIKE '%security%' LIMIT 1), 'CISSP', 1.0),
    ((SELECT id FROM skills WHERE name ILIKE '%security%' LIMIT 1), 'Security+', 0.8)
ON CONFLICT DO NOTHING;

-- Create Trust Score table for caching computed scores
CREATE TABLE IF NOT EXISTS public.trust_scores (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Verification components (0-100 each)
    identity_score INTEGER DEFAULT 0,
    rtw_score INTEGER DEFAULT 0,
    clearance_score INTEGER DEFAULT 0,
    hr_ready_score INTEGER DEFAULT 0,
    certification_score INTEGER DEFAULT 0,
    -- Profile strength components
    profile_completion_score INTEGER DEFAULT 0,
    skills_score INTEGER DEFAULT 0,
    experience_score INTEGER DEFAULT 0,
    -- Activity signals
    ctf_score INTEGER DEFAULT 0,
    community_score INTEGER DEFAULT 0,
    assessment_score INTEGER DEFAULT 0,
    -- Composite score (weighted average)
    total_trust_score INTEGER DEFAULT 0,
    -- Metadata
    last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.skill_certification_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for skill_certification_map (readable by all, modifiable by admins)
CREATE POLICY "Anyone can view skill cert mappings" ON public.skill_certification_map
    FOR SELECT USING (true);

-- RLS policies for trust_scores
CREATE POLICY "Users can view their own trust score" ON public.trust_scores
    FOR SELECT USING (auth.uid() = candidate_id);

CREATE POLICY "Employers can view trust scores" ON public.trust_scores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('employer', 'recruiter', 'admin', 'staff')
        )
    );

-- Function to calculate trust score for a candidate
CREATE OR REPLACE FUNCTION public.calculate_trust_score(p_candidate_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_identity_score INTEGER := 0;
    v_rtw_score INTEGER := 0;
    v_clearance_score INTEGER := 0;
    v_hr_ready_score INTEGER := 0;
    v_certification_score INTEGER := 0;
    v_profile_completion_score INTEGER := 0;
    v_skills_score INTEGER := 0;
    v_experience_score INTEGER := 0;
    v_ctf_score INTEGER := 0;
    v_community_score INTEGER := 0;
    v_assessment_score INTEGER := 0;
    v_total_score INTEGER := 0;
    v_verified_certs INTEGER := 0;
    v_total_certs INTEGER := 0;
    v_skills_count INTEGER := 0;
    v_years_exp INTEGER := 0;
    v_ctf_points INTEGER := 0;
    v_community_points INTEGER := 0;
    v_verification RECORD;
    v_xp RECORD;
BEGIN
    -- Get verification status
    SELECT * INTO v_verification FROM candidate_verifications WHERE candidate_id = p_candidate_id;
    
    IF v_verification IS NOT NULL THEN
        -- Identity verification
        IF v_verification.identity_status = 'verified' THEN v_identity_score := 100;
        ELSIF v_verification.identity_status = 'pending' THEN v_identity_score := 30;
        END IF;
        
        -- RTW verification
        IF v_verification.rtw_status = 'verified' THEN v_rtw_score := 100;
        ELSIF v_verification.rtw_status = 'pending' THEN v_rtw_score := 30;
        END IF;
        
        -- Clearance verification
        IF v_verification.clearance_level IS NOT NULL THEN v_clearance_score := 100; END IF;
        
        -- HR Ready
        IF v_verification.hr_ready = true THEN v_hr_ready_score := 100; END IF;
    END IF;
    
    -- Certification verification score
    SELECT COUNT(*) FILTER (WHERE verification_status = 'verified' OR signed_webhook = true),
           COUNT(*)
    INTO v_verified_certs, v_total_certs
    FROM certifications WHERE candidate_id = p_candidate_id;
    
    IF v_total_certs > 0 THEN
        v_certification_score := LEAST(100, (v_verified_certs::DECIMAL / v_total_certs) * 100);
    END IF;
    
    -- Skills score
    SELECT COUNT(*) INTO v_skills_count FROM candidate_skills WHERE candidate_id = p_candidate_id;
    v_skills_score := LEAST(100, v_skills_count * 10);
    
    -- Experience score
    SELECT years_experience INTO v_years_exp FROM candidate_profiles WHERE user_id = p_candidate_id;
    v_experience_score := LEAST(100, COALESCE(v_years_exp, 0) * 10);
    
    -- Profile completion
    SELECT * INTO v_xp FROM candidate_xp WHERE candidate_id = p_candidate_id;
    IF v_xp IS NOT NULL THEN
        v_profile_completion_score := COALESCE(v_xp.profile_completion_percent, 0);
        v_community_score := LEAST(100, COALESCE(v_xp.community_points, 0) / 10);
    END IF;
    
    -- CTF score
    SELECT COALESCE(SUM(points_awarded), 0) INTO v_ctf_points 
    FROM ctf_submissions WHERE candidate_id = p_candidate_id AND is_correct = true;
    v_ctf_score := LEAST(100, v_ctf_points / 5);
    
    -- Calculate weighted total (verification weighted higher)
    v_total_score := (
        (v_identity_score * 0.15) +
        (v_rtw_score * 0.10) +
        (v_clearance_score * 0.10) +
        (v_hr_ready_score * 0.15) +
        (v_certification_score * 0.15) +
        (v_profile_completion_score * 0.10) +
        (v_skills_score * 0.05) +
        (v_experience_score * 0.05) +
        (v_ctf_score * 0.05) +
        (v_community_score * 0.05) +
        (v_assessment_score * 0.05)
    )::INTEGER;
    
    -- Upsert trust score
    INSERT INTO trust_scores (
        candidate_id, identity_score, rtw_score, clearance_score, hr_ready_score,
        certification_score, profile_completion_score, skills_score, experience_score,
        ctf_score, community_score, assessment_score, total_trust_score, last_calculated_at
    ) VALUES (
        p_candidate_id, v_identity_score, v_rtw_score, v_clearance_score, v_hr_ready_score,
        v_certification_score, v_profile_completion_score, v_skills_score, v_experience_score,
        v_ctf_score, v_community_score, v_assessment_score, v_total_score, now()
    )
    ON CONFLICT (candidate_id) DO UPDATE SET
        identity_score = EXCLUDED.identity_score,
        rtw_score = EXCLUDED.rtw_score,
        clearance_score = EXCLUDED.clearance_score,
        hr_ready_score = EXCLUDED.hr_ready_score,
        certification_score = EXCLUDED.certification_score,
        profile_completion_score = EXCLUDED.profile_completion_score,
        skills_score = EXCLUDED.skills_score,
        experience_score = EXCLUDED.experience_score,
        ctf_score = EXCLUDED.ctf_score,
        community_score = EXCLUDED.community_score,
        assessment_score = EXCLUDED.assessment_score,
        total_trust_score = EXCLUDED.total_trust_score,
        last_calculated_at = now(),
        updated_at = now();
    
    RETURN v_total_score;
END;
$$;

-- Function for graph-based job matching (skills → certs → jobs)
CREATE OR REPLACE FUNCTION public.get_job_matches_graph(p_candidate_id UUID)
RETURNS TABLE (
    job_id UUID,
    job_title TEXT,
    company_name TEXT,
    match_score INTEGER,
    matched_skills TEXT[],
    matched_certs TEXT[],
    missing_skills TEXT[],
    missing_certs TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH candidate_skills_cte AS (
        SELECT s.name as skill_name, cs.proficiency_level
        FROM candidate_skills cs
        JOIN skills s ON s.id = cs.skill_id
        WHERE cs.candidate_id = p_candidate_id
    ),
    candidate_certs_cte AS (
        SELECT name as cert_name
        FROM certifications
        WHERE candidate_id = p_candidate_id
    ),
    job_analysis AS (
        SELECT 
            j.id,
            j.title,
            c.name as company_name,
            j.required_skills,
            j.required_certifications,
            -- Calculate matched skills
            COALESCE(ARRAY(
                SELECT DISTINCT unnest(j.required_skills)
                INTERSECT
                SELECT skill_name FROM candidate_skills_cte
            ), ARRAY[]::TEXT[]) as matched_skills,
            -- Calculate matched certs (fuzzy match)
            COALESCE(ARRAY(
                SELECT DISTINCT req_cert
                FROM unnest(COALESCE(j.required_certifications, ARRAY[]::TEXT[])) as req_cert
                WHERE EXISTS (
                    SELECT 1 FROM candidate_certs_cte cc
                    WHERE cc.cert_name ILIKE '%' || req_cert || '%'
                       OR req_cert ILIKE '%' || cc.cert_name || '%'
                )
            ), ARRAY[]::TEXT[]) as matched_certs,
            -- Missing skills
            COALESCE(ARRAY(
                SELECT DISTINCT unnest(j.required_skills)
                EXCEPT
                SELECT skill_name FROM candidate_skills_cte
            ), ARRAY[]::TEXT[]) as missing_skills,
            -- Missing certs
            COALESCE(ARRAY(
                SELECT DISTINCT req_cert
                FROM unnest(COALESCE(j.required_certifications, ARRAY[]::TEXT[])) as req_cert
                WHERE NOT EXISTS (
                    SELECT 1 FROM candidate_certs_cte cc
                    WHERE cc.cert_name ILIKE '%' || req_cert || '%'
                       OR req_cert ILIKE '%' || cc.cert_name || '%'
                )
            ), ARRAY[]::TEXT[]) as missing_certs
        FROM jobs j
        LEFT JOIN companies c ON c.id = j.company_id
        WHERE j.is_active = true
    )
    SELECT 
        ja.id as job_id,
        ja.title as job_title,
        ja.company_name,
        -- Calculate match score (0-100)
        CASE 
            WHEN COALESCE(array_length(ja.required_skills, 1), 0) + COALESCE(array_length(ja.required_certifications, 1), 0) = 0 
            THEN 50
            ELSE (
                (COALESCE(array_length(ja.matched_skills, 1), 0)::DECIMAL / NULLIF(COALESCE(array_length(ja.required_skills, 1), 0), 0) * 60) +
                (COALESCE(array_length(ja.matched_certs, 1), 0)::DECIMAL / NULLIF(COALESCE(array_length(ja.required_certifications, 1), 0), 0) * 40)
            )::INTEGER
        END as match_score,
        ja.matched_skills,
        ja.matched_certs,
        ja.missing_skills,
        ja.missing_certs
    FROM job_analysis ja
    ORDER BY match_score DESC;
END;
$$;

-- Function to get skill upgrade suggestions based on job market demand
CREATE OR REPLACE FUNCTION public.get_skill_upgrade_suggestions(p_candidate_id UUID)
RETURNS TABLE (
    skill_name TEXT,
    demand_count INTEGER,
    related_certs TEXT[],
    avg_salary_boost INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH candidate_current_skills AS (
        SELECT s.name
        FROM candidate_skills cs
        JOIN skills s ON s.id = cs.skill_id
        WHERE cs.candidate_id = p_candidate_id
    ),
    in_demand_skills AS (
        SELECT 
            unnest(required_skills) as skill,
            COUNT(*) as job_count,
            AVG(COALESCE(salary_max, salary_min, 0)) as avg_salary
        FROM jobs
        WHERE is_active = true
        GROUP BY unnest(required_skills)
        HAVING COUNT(*) >= 2
    )
    SELECT 
        ids.skill as skill_name,
        ids.job_count::INTEGER as demand_count,
        COALESCE(ARRAY(
            SELECT DISTINCT scm.certification_pattern
            FROM skill_certification_map scm
            JOIN skills s ON s.id = scm.skill_id
            WHERE s.name ILIKE '%' || ids.skill || '%'
        ), ARRAY[]::TEXT[]) as related_certs,
        ids.avg_salary::INTEGER as avg_salary_boost
    FROM in_demand_skills ids
    WHERE NOT EXISTS (
        SELECT 1 FROM candidate_current_skills ccs
        WHERE ccs.name ILIKE '%' || ids.skill || '%'
    )
    ORDER BY ids.job_count DESC, ids.avg_salary DESC
    LIMIT 10;
END;
$$;