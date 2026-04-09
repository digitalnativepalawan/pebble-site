-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  referral_source TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert applications
CREATE POLICY "Anyone can submit an application"
  ON public.applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only authenticated users can view applications
CREATE POLICY "Authenticated users can view applications"
  ON public.applications
  FOR SELECT
  TO authenticated
  USING (true);