
CREATE TABLE public.section_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id text NOT NULL,
  slot_key text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  image_url text,
  external_url text,
  sort_order integer NOT NULL DEFAULT 0,
  display_mode text NOT NULL DEFAULT 'single',
  caption text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.section_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read section media" ON public.section_media FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert section media" ON public.section_media FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update section media" ON public.section_media FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete section media" ON public.section_media FOR DELETE TO public USING (true);
