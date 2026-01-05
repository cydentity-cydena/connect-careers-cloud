import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const BrandingPack = () => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const logos = [
    { name: "Main Logo", path: "/logos/cydena-main-logo.png", description: "Primary logo for most uses" },
    { name: "Full Logo", path: "/logos/cydena-logo-full.png", description: "Full horizontal logo" },
    { name: "Standard Logo", path: "/logos/cydena-logo.png", description: "Standard square logo" },
    { name: "Academy Logo", path: "/logos/cydentity-academy-logo.png", description: "Academy branding (dark)" },
    { name: "Academy Logo White", path: "/logos/cydentity-academy-logo-white.png", description: "Academy branding (white)" },
    { name: "Cydentity White", path: "/logos/cydentity-logo-white.png", description: "White variant for dark backgrounds" },
  ];

  const brandColors = [
    { name: "Primary (Cyber Teal)", hsl: "189 97% 55%", hex: "#14E5D4", usage: "Primary actions, highlights, accents" },
    { name: "Secondary (Purple)", hsl: "263 70% 50%", hex: "#7C3AED", usage: "Secondary elements, gradients" },
    { name: "Background", hsl: "222 47% 11%", hex: "#0F172A", usage: "Main background color" },
    { name: "Card", hsl: "217 33% 17%", hex: "#1E293B", usage: "Card and surface backgrounds" },
    { name: "Foreground", hsl: "210 40% 98%", hex: "#F8FAFC", usage: "Primary text color" },
    { name: "Muted", hsl: "215 20% 65%", hex: "#94A3B8", usage: "Secondary text, labels" },
    { name: "Border", hsl: "217 33% 24%", hex: "#334155", usage: "Borders and dividers" },
    { name: "Destructive", hsl: "0 84% 60%", hex: "#EF4444", usage: "Error states, warnings" },
  ];

  const gradients = [
    { name: "Cyber Gradient", css: "linear-gradient(135deg, hsl(189 97% 55%), hsl(263 70% 50%))", usage: "Hero sections, CTAs" },
    { name: "Hero Gradient", css: "linear-gradient(180deg, hsl(222 47% 11%), hsl(222 47% 8%))", usage: "Page backgrounds" },
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(label);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const downloadImage = (path: string, name: string) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${name}`);
  };

  const downloadAll = () => {
    logos.forEach((logo, index) => {
      setTimeout(() => {
        downloadImage(logo.path, `cydena-${logo.name.toLowerCase().replace(/\s+/g, '-')}.png`);
      }, index * 500);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Cydena Branding Pack | Brand Assets & Guidelines"
        description="Download Cydena brand assets including logos, color palette, and design guidelines."
      />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Cydena <span className="text-primary">Branding Pack</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Official brand assets, color palette, and design guidelines for Cydena
          </p>
          <Button onClick={downloadAll} className="mt-6" size="lg">
            <Download className="mr-2 h-5 w-5" />
            Download All Logos
          </Button>
        </div>

        {/* Logos Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            Logos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logos.map((logo) => (
              <Card key={logo.name} className="bg-card border-border overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-muted/50 to-background p-8 flex items-center justify-center min-h-[200px]">
                    <img 
                      src={logo.path} 
                      alt={logo.name} 
                      className="max-h-32 max-w-full object-contain"
                    />
                  </div>
                  <div className="p-4 border-t border-border">
                    <h3 className="font-semibold text-foreground">{logo.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{logo.description}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => downloadImage(logo.path, `${logo.name.toLowerCase().replace(/\s+/g, '-')}.png`)}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PNG
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Color Palette Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-secondary rounded-full"></span>
            Color Palette
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {brandColors.map((color) => (
              <Card key={color.name} className="bg-card border-border overflow-hidden">
                <div 
                  className="h-24 w-full" 
                  style={{ backgroundColor: `hsl(${color.hsl})` }}
                />
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground text-sm">{color.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{color.usage}</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => copyToClipboard(color.hex, `${color.name} HEX`)}
                      className="flex items-center justify-between w-full text-xs bg-muted/50 rounded px-2 py-1.5 hover:bg-muted transition-colors"
                    >
                      <span className="font-mono text-foreground">{color.hex}</span>
                      {copiedColor === `${color.name} HEX` ? (
                        <Check className="h-3 w-3 text-primary" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(`hsl(${color.hsl})`, `${color.name} HSL`)}
                      className="flex items-center justify-between w-full text-xs bg-muted/50 rounded px-2 py-1.5 hover:bg-muted transition-colors"
                    >
                      <span className="font-mono text-foreground">hsl({color.hsl})</span>
                      {copiedColor === `${color.name} HSL` ? (
                        <Check className="h-3 w-3 text-primary" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Gradients Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></span>
            Gradients
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gradients.map((gradient) => (
              <Card key={gradient.name} className="bg-card border-border overflow-hidden">
                <div 
                  className="h-32 w-full" 
                  style={{ background: gradient.css }}
                />
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground">{gradient.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{gradient.usage}</p>
                  <button
                    onClick={() => copyToClipboard(gradient.css, gradient.name)}
                    className="flex items-center justify-between w-full text-xs bg-muted/50 rounded px-3 py-2 hover:bg-muted transition-colors"
                  >
                    <span className="font-mono text-foreground truncate mr-2">{gradient.css}</span>
                    {copiedColor === gradient.name ? (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            Typography
          </h2>
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Primary Font</p>
                  <p className="text-3xl font-bold text-foreground">Inter / System UI</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Heading 1</p>
                    <p className="text-4xl font-bold text-foreground">Aa Bb Cc</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Heading 2</p>
                    <p className="text-2xl font-semibold text-foreground">Aa Bb Cc</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Body</p>
                    <p className="text-base text-foreground">Aa Bb Cc</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Usage Guidelines */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-secondary rounded-full"></span>
            Usage Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary">Do's</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    Use provided logo files without modification
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    Maintain adequate spacing around logos
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    Use cyber teal as the primary accent color
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    Use white logo on dark backgrounds
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-destructive">Don'ts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5">✕</span>
                    Stretch or distort the logo
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5">✕</span>
                    Change the logo colors arbitrarily
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5">✕</span>
                    Place logo on busy or clashing backgrounds
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5">✕</span>
                    Add effects like shadows or outlines to logo
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BrandingPack;
