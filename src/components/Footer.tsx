import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center">
              <img 
                src="/logos/cydena-logo.png" 
                alt="Cydena" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting cybersecurity talent with opportunity.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/leaderboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/profiles" className="text-muted-foreground hover:text-primary transition-colors">
                  Browse Talent
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-muted-foreground hover:text-primary transition-colors">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link to="/training" className="text-muted-foreground hover:text-primary transition-colors">
                  Training
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/partnerships" className="text-muted-foreground hover:text-primary transition-colors">
                  Partners
                </Link>
              </li>
              <li>
                <Link to="/Early-Access-200" className="text-muted-foreground hover:text-primary transition-colors">
                  Early Access
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/bug-report" className="text-muted-foreground hover:text-primary transition-colors">
                  Report a Bug
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Cydena. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
