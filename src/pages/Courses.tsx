import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronRight, GraduationCap, ShieldCheck } from "lucide-react";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  partner_name: string | null;
  partner_logo_url: string | null;
  banner_url: string | null;
}

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, title, slug, description, partner_name, partner_logo_url, banner_url')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      setCourses(data || []);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Courses | Cydena" 
        description="Hands-on cybersecurity training courses with end-of-module challenges. Powered by Cydena's interactive challenge engine."
      />
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Training Courses</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Cybersecurity Courses</h1>
          <p className="text-lg text-muted-foreground">
            Hands-on training with interactive end-of-module challenges. 
            Join with your access code to start learning.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : courses.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">
                New courses are being prepared. Check back soon or contact us for early access.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {courses.map(course => (
              <Card 
                key={course.id} 
                className="hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => navigate(`/courses/${course.slug}`)}
              >
                {course.banner_url && (
                  <div className="h-40 overflow-hidden rounded-t-lg">
                    <img 
                      src={course.banner_url} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {course.title}
                      </CardTitle>
                      {course.partner_name && (
                        <p className="text-sm text-muted-foreground mt-1">
                          by {course.partner_name}
                        </p>
                      )}
                    </div>
                    {course.partner_logo_url && (
                      <img 
                        src={course.partner_logo_url} 
                        alt={course.partner_name || ""} 
                        className="h-8 object-contain ml-3 flex-shrink-0" 
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {course.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="gap-1">
                      <ShieldCheck className="h-3 w-3" /> Access Code Required
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
