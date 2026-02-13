import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Zap, Shield, BookOpen, Terminal, Webhook } from "lucide-react";

const CodeBlock = ({ children, title }: { children: string; title?: string }) => (
  <div className="rounded-lg border border-border overflow-hidden my-4">
    {title && (
      <div className="bg-muted/50 px-4 py-2 border-b border-border text-xs font-mono text-muted-foreground">
        {title}
      </div>
    )}
    <pre className="p-4 overflow-x-auto text-sm font-mono bg-card/50">
      <code className="text-foreground/90">{children}</code>
    </pre>
  </div>
);

const MarketplaceDocs = () => {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="API & MCP Documentation | Cydena Marketplace" description="Integrate with Cydena's cybersecurity talent marketplace via REST API or MCP server." />
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
            <Zap className="h-3 w-3 mr-1" /> Developer Documentation
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">API & MCP Integration</h1>
          <p className="text-muted-foreground text-lg">
            Programmatically discover, book, and engage verified cybersecurity professionals.
          </p>
        </div>

        <Tabs defaultValue="api" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="api"><Terminal className="h-4 w-4 mr-2" /> REST API</TabsTrigger>
            <TabsTrigger value="mcp"><Code className="h-4 w-4 mr-2" /> MCP Server</TabsTrigger>
          </TabsList>

          {/* REST API Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  All API requests require an API key. Generate keys from your dashboard under Settings → API Keys.
                </p>
                <CodeBlock title="Authentication Header">{`Authorization: Bearer cy_live_xxxxxxxxxxxxxxxx`}</CodeBlock>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader><CardTitle>Search Talent</CardTitle></CardHeader>
              <CardContent>
                <Badge variant="outline" className="mb-3 font-mono text-xs">GET /marketplace-api?action=search_talent</Badge>
                <p className="text-sm text-muted-foreground mb-3">Search for verified cybersecurity professionals by specialism, clearance, and availability.</p>
                <CodeBlock title="curl">{`curl -X GET "${projectUrl}/functions/v1/marketplace-api?action=search_talent&specialism=pentest&clearance=SC&availability=available" \\
  -H "Authorization: Bearer cy_live_xxx"`}</CodeBlock>
                <h4 className="font-semibold text-sm mt-4 mb-2">Query Parameters</h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p><code className="text-primary">specialism</code> — Filter by specialism (e.g. pentest, red-team, incident-response)</p>
                  <p><code className="text-primary">clearance</code> — Security clearance level (none, BPSS, SC, DV)</p>
                  <p><code className="text-primary">availability</code> — Availability status (available, busy)</p>
                  <p><code className="text-primary">max_rate_gbp</code> — Maximum day rate in GBP</p>
                  <p><code className="text-primary">min_rating</code> — Minimum average rating</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader><CardTitle>Post a Bounty</CardTitle></CardHeader>
              <CardContent>
                <Badge variant="outline" className="mb-3 font-mono text-xs">POST /marketplace-api</Badge>
                <CodeBlock title="curl">{`curl -X POST "${projectUrl}/functions/v1/marketplace-api" \\
  -H "Authorization: Bearer cy_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "post_bounty",
    "category_slug": "pentest",
    "title": "Web Application Pentest — E-commerce Platform",
    "description": "Full penetration test of our e-commerce platform",
    "required_certifications": ["CREST CRT"],
    "required_clearance": "SC",
    "location_requirement": "remote",
    "budget_min_gbp": 3000,
    "budget_max_gbp": 5000,
    "engagement_type": "fixed",
    "urgency": "urgent",
    "deadline": "2026-04-01"
  }'`}</CodeBlock>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader><CardTitle>Create Engagement (Book Talent)</CardTitle></CardHeader>
              <CardContent>
                <Badge variant="outline" className="mb-3 font-mono text-xs">POST /marketplace-api</Badge>
                <CodeBlock title="curl">{`curl -X POST "${projectUrl}/functions/v1/marketplace-api" \\
  -H "Authorization: Bearer cy_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "book_talent",
    "talent_id": "uuid-here",
    "category_slug": "pentest",
    "title": "Infrastructure Penetration Test",
    "description": "Full infrastructure pentest covering internal and external",
    "engagement_type": "daily",
    "estimated_days": 5,
    "start_date": "2026-03-15",
    "requires_nda": true
  }'`}</CodeBlock>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader><CardTitle>Get Categories</CardTitle></CardHeader>
              <CardContent>
                <Badge variant="outline" className="mb-3 font-mono text-xs">GET /marketplace-api?action=get_categories</Badge>
                <CodeBlock title="curl">{`curl -X GET "${projectUrl}/functions/v1/marketplace-api?action=get_categories" \\
  -H "Authorization: Bearer cy_live_xxx"`}</CodeBlock>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-primary" /> Webhooks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Subscribe to events to receive real-time updates. Coming soon:
                </p>
                <div className="text-sm space-y-1 text-muted-foreground font-mono">
                  <p>• engagement.accepted</p>
                  <p>• engagement.completed</p>
                  <p>• bounty.application_received</p>
                  <p>• bounty.claimed</p>
                  <p>• talent.availability_changed</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MCP Tab */}
          <TabsContent value="mcp" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> MCP Server Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your AI agent to Cydena's MCP server to programmatically search, book, and manage cybersecurity talent.
                </p>
                <CodeBlock title="MCP Configuration">{`{
  "mcpServers": {
    "cydena": {
      "url": "${projectUrl}/functions/v1/cydena-mcp",
      "headers": {
        "Authorization": "Bearer cy_live_xxxxxxxxxxxxxxxx"
      }
    }
  }
}`}</CodeBlock>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader><CardTitle>Available Tools</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "cydena_search_talent", desc: "Search for verified cybersecurity professionals by skill, certification, clearance level, and availability" },
                  { name: "cydena_check_availability", desc: "Check a specific professional's availability for a date range" },
                  { name: "cydena_book_talent", desc: "Create an engagement request with a matched professional" },
                  { name: "cydena_post_bounty", desc: "Post an open task bounty for qualified professionals to apply to" },
                  { name: "cydena_get_engagement_status", desc: "Check the status of an active engagement" },
                  { name: "cydena_send_message", desc: "Send instructions or updates to an engaged professional" },
                  { name: "cydena_get_categories", desc: "List all available task categories and requirements" },
                ].map((tool) => (
                  <div key={tool.name} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <Code className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-mono text-sm font-semibold">{tool.name}</p>
                      <p className="text-xs text-muted-foreground">{tool.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader><CardTitle>Example Workflow</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  When an automated vulnerability scanner identifies issues requiring manual verification:
                </p>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Agent calls <code className="text-primary">cydena_search_talent</code> with specialism "pentest" and clearance "SC"</li>
                  <li>Agent calls <code className="text-primary">cydena_check_availability</code> for matched professionals</li>
                  <li>Agent calls <code className="text-primary">cydena_book_talent</code> to create an engagement</li>
                  <li>Talent accepts and completes the work</li>
                  <li>Webhook fires <code className="text-primary">engagement.completed</code> with results</li>
                </ol>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader><CardTitle>Compatible Platforms</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["Claude (Anthropic)", "OpenAI Agents", "AutoGPT / AgentGPT", "Custom MCP Agents"].map((p) => (
                    <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MarketplaceDocs;
