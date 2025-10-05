-- Add boost placement tracking to partner_courses
ALTER TABLE partner_courses 
ADD COLUMN boost_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN boost_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN boost_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN boost_purchased_by UUID REFERENCES auth.users(id),
ADD COLUMN boost_payment_status TEXT DEFAULT 'none' CHECK (boost_payment_status IN ('none', 'pending', 'completed')),
ADD COLUMN boost_amount_paid NUMERIC;

-- Create index for active boost placements
CREATE INDEX idx_partner_courses_boost_active 
ON partner_courses(boost_featured, boost_start_date, boost_end_date) 
WHERE boost_featured = TRUE AND boost_payment_status = 'completed';

COMMENT ON COLUMN partner_courses.boost_featured IS 'Whether this course is featured in the Boost Your Score section';
COMMENT ON COLUMN partner_courses.boost_payment_status IS 'Payment status for boost placement: none, pending, completed';