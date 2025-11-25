import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Import Credly badge function called');
    const { badgeUrl } = await req.json();
    console.log('Badge URL:', badgeUrl);

    if (!badgeUrl || !badgeUrl.includes('credly.com')) {
      console.error('Invalid Credly URL:', badgeUrl);
      return new Response(
        JSON.stringify({ error: 'Invalid Credly URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching badge page...');
    // Fetch the Credly badge page
    const response = await fetch(badgeUrl);
    
    if (!response.ok) {
      console.error('Failed to fetch badge page:', response.status);
      throw new Error(`Failed to fetch badge page: ${response.status}`);
    }
    
    const html = await response.text();
    console.log('Badge page fetched, HTML length:', html.length);

    // Extract Open Graph meta tags and JSON-LD data
    const extractMetaContent = (property: string): string | null => {
      const regex = new RegExp(`<meta[^>]*(?:property|name)="${property}"[^>]*content="([^"]*)"`, 'i');
      const match = html.match(regex);
      return match ? match[1] : null;
    };

    // Try to extract JSON-LD data
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    let certData: any = {};
    
    if (jsonLdMatch) {
      try {
        console.log('Found JSON-LD data');
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        certData = {
          name: jsonLd.name || extractMetaContent('og:title'),
          issuer: jsonLd.creator?.name || jsonLd.author?.name,
          description: jsonLd.description || extractMetaContent('og:description'),
          issueDate: jsonLd.dateCreated,
          credentialUrl: badgeUrl,
        };
      } catch (e) {
        console.error('Failed to parse JSON-LD:', e);
      }
    }

    // Fallback to meta tags if JSON-LD parsing failed
    if (!certData.name) {
      certData.name = extractMetaContent('og:title') || extractMetaContent('twitter:title');
      console.log('Extracted name from meta tags:', certData.name);
    }
    if (!certData.description) {
      certData.description = extractMetaContent('og:description') || extractMetaContent('twitter:description');
    }

    // Extract issuer from the page title or content
    if (!certData.issuer) {
      const issuerMatch = html.match(/Issued by[:\s]+([^<\n]+)/i) || 
                          html.match(/"issuer"[:\s]*{[^}]*"name"[:\s]*"([^"]+)"/i);
      certData.issuer = issuerMatch ? issuerMatch[1].trim() : 'Credly Badge';
      console.log('Extracted issuer:', certData.issuer);
    }

    // Extract dates from the page
    if (!certData.issueDate) {
      const issueDateMatch = html.match(/Issued[:\s]+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i) ||
                             html.match(/"dateIssued"[:\s]*"([^"]+)"/i);
      if (issueDateMatch) {
        certData.issueDate = new Date(issueDateMatch[1]).toISOString().split('T')[0];
      }
    }

    const expiryMatch = html.match(/Expires[:\s]+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i) ||
                        html.match(/"expirationDate"[:\s]*"([^"]+)"/i);
    if (expiryMatch) {
      certData.expiryDate = new Date(expiryMatch[1]).toISOString().split('T')[0];
    }

    // Extract credential ID from URL or page
    const credIdMatch = badgeUrl.match(/\/badges\/([a-f0-9-]+)/i);
    certData.credentialId = credIdMatch ? credIdMatch[1] : '';

    console.log('Extracted certification data:', certData);

    return new Response(
      JSON.stringify({
        success: true,
        data: certData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error importing Credly badge:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to import badge data', 
        details: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
