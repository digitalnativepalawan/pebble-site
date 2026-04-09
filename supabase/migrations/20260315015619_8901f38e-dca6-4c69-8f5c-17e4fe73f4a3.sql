
-- Site content CMS table
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id text NOT NULL,
  field_key text NOT NULL,
  text_value text,
  image_url text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(section_id, field_key)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Anyone can insert site content" ON public.site_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update site content" ON public.site_content FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete site content" ON public.site_content FOR DELETE USING (true);

-- Storage bucket for site images
INSERT INTO storage.buckets (id, name, public) VALUES ('site-images', 'site-images', true);

CREATE POLICY "Public read site images" ON storage.objects FOR SELECT USING (bucket_id = 'site-images');
CREATE POLICY "Anyone upload site images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-images');
CREATE POLICY "Anyone update site images" ON storage.objects FOR UPDATE USING (bucket_id = 'site-images') WITH CHECK (bucket_id = 'site-images');
CREATE POLICY "Anyone delete site images" ON storage.objects FOR DELETE USING (bucket_id = 'site-images');
