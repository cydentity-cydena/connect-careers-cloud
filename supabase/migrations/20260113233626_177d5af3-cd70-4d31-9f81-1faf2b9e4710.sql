-- Create a helper function that reads verification data bypassing RLS
CREATE OR REPLACE FUNCTION public.get_verification_for_trust_score(p_candidate_id UUID)
RETURNS TABLE (
    identity_status TEXT,
    rtw_status TEXT,
    clearance_level TEXT,
    hr_ready BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT 
        cv.identity_status::TEXT, 
        cv.rtw_status::TEXT, 
        cv.clearance_level::TEXT, 
        cv.hr_ready
    FROM public.candidate_verifications cv
    WHERE cv.candidate_id = p_candidate_id
    LIMIT 1;
$$;

-- Now update the main function to use the helper
CREATE OR REPLACE FUNCTION public.calculate_trust_score(p_candidate_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
    -- Verification data from helper
    v_identity_status TEXT;
    v_rtw_status TEXT;
    v_clearance_level TEXT;
    v_hr_ready BOOLEAN;
    v_profile_completion_percent INTEGER;
    v_xp_community_points INTEGER;
BEGIN
    -- Get verification status using helper function (bypasses RLS)
    SELECT 
        identity_status, 
        rtw_status, 
        clearance_level, 
        hr_ready
    INTO 
        v_identity_status, 
        v_rtw_status, 
        v_clearance_level, 
        v_hr_ready
    FROM public.get_verification_for_trust_score(p_candidate_id);
    
    -- Identity verification (supports both 'verified' and 'green' status values)
    IF v_identity_status IN ('verified', 'green') THEN 
        v_identity_score := 100;
    ELSIF v_identity_status IN ('pending', 'amber') THEN 
        v_identity_score := 30;
    END IF;
    
    -- RTW verification (supports both 'verified' and 'green' status values)
    IF v_rtw_status IN ('verified', 'green') THEN 
        v_rtw_score := 100;
    ELSIF v_rtw_status IN ('pending', 'amber') THEN 
        v_rtw_score := 30;
    END IF;
    
    -- Clearance verification
    IF v_clearance_level IS NOT NULL AND v_clearance_level != '' THEN 
        v_clearance_score := 100; 
    END IF;
    
    -- HR Ready
    IF v_hr_ready = true THEN 
        v_hr_ready_score := 100; 
    END IF;
    
    -- Certification verification score (direct table access with empty search_path bypasses RLS)
    SELECT 
        COUNT(*) FILTER (WHERE verification_status IN ('verified', 'green') OR signed_webhook = true),
        COUNT(*)
    INTO v_verified_certs, v_total_certs
    FROM public.certifications 
    WHERE candidate_id = p_candidate_id;
    
    IF v_total_certs > 0 THEN
        v_certification_score := LEAST(100, (v_verified_certs::DECIMAL / v_total_certs) * 100);
    END IF;
    
    -- Skills score
    SELECT COUNT(*) INTO v_skills_count 
    FROM public.candidate_skills 
    WHERE candidate_id = p_candidate_id;
    v_skills_score := LEAST(100, v_skills_count * 10);
    
    -- Experience score
    SELECT years_experience INTO v_years_exp 
    FROM public.candidate_profiles 
    WHERE user_id = p_candidate_id;
    v_experience_score := LEAST(100, COALESCE(v_years_exp, 0) * 10);
    
    -- Profile completion and community points
    SELECT 
        profile_completion_percent, 
        community_points 
    INTO 
        v_profile_completion_percent, 
        v_xp_community_points
    FROM public.candidate_xp 
    WHERE candidate_id = p_candidate_id;
    
    v_profile_completion_score := COALESCE(v_profile_completion_percent, 0);
    v_community_score := LEAST(100, COALESCE(v_xp_community_points, 0) / 10);
    
    -- CTF score
    SELECT COALESCE(SUM(points_awarded), 0) INTO v_ctf_points 
    FROM public.ctf_submissions 
    WHERE candidate_id = p_candidate_id AND is_correct = true;
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
    INSERT INTO public.trust_scores (
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