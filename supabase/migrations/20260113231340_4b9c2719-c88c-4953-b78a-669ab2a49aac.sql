-- Fix the trust score calculation to use correct status values (green/amber/red instead of verified/pending)
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
        -- Identity verification (supports both 'verified' and 'green' status values)
        IF v_verification.identity_status IN ('verified', 'green') THEN v_identity_score := 100;
        ELSIF v_verification.identity_status IN ('pending', 'amber') THEN v_identity_score := 30;
        END IF;
        
        -- RTW verification (supports both 'verified' and 'green' status values)
        IF v_verification.rtw_status IN ('verified', 'green') THEN v_rtw_score := 100;
        ELSIF v_verification.rtw_status IN ('pending', 'amber') THEN v_rtw_score := 30;
        END IF;
        
        -- Clearance verification
        IF v_verification.clearance_level IS NOT NULL THEN v_clearance_score := 100; END IF;
        
        -- HR Ready
        IF v_verification.hr_ready = true THEN v_hr_ready_score := 100; END IF;
    END IF;
    
    -- Certification verification score
    SELECT COUNT(*) FILTER (WHERE verification_status IN ('verified', 'green') OR signed_webhook = true),
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