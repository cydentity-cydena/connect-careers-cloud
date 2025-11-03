import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { verificationRequestId } = await req.json();
    
    console.log('Starting AI verification for request:', verificationRequestId);

    // Get verification request with documents
    const { data: request, error: fetchError } = await supabase
      .from('certification_verification_requests')
      .select(`
        *,
        certifications (name, issuer, credential_id, issue_date, expiry_date)
      `)
      .eq('id', verificationRequestId)
      .single();

    if (fetchError || !request) {
      throw new Error('Verification request not found');
    }

    // Get public URLs for documents
    const documentUrls = Array.isArray(request.document_urls) 
      ? request.document_urls 
      : JSON.parse(request.document_urls || '[]');

    if (documentUrls.length === 0) {
      throw new Error('No documents to verify');
    }

    const publicUrls = documentUrls.map((path: string) => {
      const { data } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(path);
      return data.publicUrl;
    });

    // Call Lovable AI to analyze the documents
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a cybersecurity certification verification expert. Analyze certification documents and extract key information.

For each document, determine:
1. Is this a legitimate certification document? (yes/no/uncertain)
2. Credential ID (if visible)
3. Issuer/Organization
4. Issue Date
5. Expiry Date
6. Confidence score (0-100) on document authenticity
7. Any red flags or concerns

Return your analysis in this exact JSON format:
{
  "isLegitimate": "yes|no|uncertain",
  "credentialId": "extracted credential ID or null",
  "issuer": "extracted issuer or null",
  "issueDate": "YYYY-MM-DD or null",
  "expiryDate": "YYYY-MM-DD or null", 
  "confidenceScore": 0-100,
  "redFlags": ["list of concerns or empty array"],
  "recommendation": "auto_approve|needs_review|reject",
  "reasoning": "brief explanation"
}`;

    const userPrompt = `Analyze these certification documents for:
Certificate Name: ${request.certifications.name}
Claimed Issuer: ${request.certifications.issuer}
Claimed Credential ID: ${request.certifications.credential_id || 'Not provided'}

Documents: ${publicUrls.join(', ')}

Note: You cannot directly view images, but analyze based on the document metadata and any text extraction available. Look for common patterns of legitimate certifications vs fake ones.`;

    console.log('Calling Lovable AI for document analysis...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    
    console.log('AI response:', aiContent);

    let analysis;
    try {
      // Extract JSON from response (AI might wrap it in markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiContent);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      analysis = {
        isLegitimate: 'uncertain',
        confidenceScore: 50,
        recommendation: 'needs_review',
        reasoning: 'AI response could not be parsed',
        redFlags: ['Unable to analyze document format']
      };
    }

    // Update verification request with AI analysis
    const aiNotes = `AI Verification (Confidence: ${analysis.confidenceScore}%):
${analysis.reasoning}
${analysis.redFlags.length > 0 ? '\n⚠️ Red Flags: ' + analysis.redFlags.join(', ') : ''}
${analysis.credentialId ? '\n📝 Extracted Credential ID: ' + analysis.credentialId : ''}
${analysis.issuer ? '\nExtracted Issuer: ' + analysis.issuer : ''}
${analysis.issueDate ? '\nExtracted Issue Date: ' + analysis.issueDate : ''}
${analysis.expiryDate ? '\nExtracted Expiry Date: ' + analysis.expiryDate : ''}`;

    const { error: updateError } = await supabase
      .from('certification_verification_requests')
      .update({
        notes: aiNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', verificationRequestId);

    if (updateError) {
      console.error('Failed to update request with AI notes:', updateError);
    }

    // Auto-approve if confidence is very high and no red flags
    if (analysis.recommendation === 'auto_approve' && 
        analysis.confidenceScore >= 90 && 
        analysis.redFlags.length === 0) {
      
      console.log('Auto-approving high-confidence verification');
      
      // Update certification to verified
      const { error: certError } = await supabase
        .from('certifications')
        .update({ verification_status: 'verified' })
        .eq('id', request.certification_id);

      if (certError) {
        console.error('Failed to auto-approve cert:', certError);
      } else {
        // Update request status
        await supabase
          .from('certification_verification_requests')
          .update({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            notes: aiNotes + '\n\n✅ Auto-approved by AI verification',
          })
          .eq('id', verificationRequestId);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis,
        autoApproved: analysis.recommendation === 'auto_approve' && analysis.confidenceScore >= 90
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in verify-certification-ai:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
