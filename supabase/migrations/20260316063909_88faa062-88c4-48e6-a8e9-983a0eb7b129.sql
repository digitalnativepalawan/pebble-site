
-- Page blocks: the core CMS table
CREATE TABLE public.page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  block_type TEXT NOT NULL,
  block_order INTEGER NOT NULL DEFAULT 0,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_blocks_slug ON public.page_blocks(page_slug, block_order);

ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page blocks" ON public.page_blocks
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can insert page blocks" ON public.page_blocks
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update page blocks" ON public.page_blocks
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete page blocks" ON public.page_blocks
  FOR DELETE TO authenticated USING (true);

-- Content versions for history
CREATE TABLE public.content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL REFERENCES public.page_blocks(id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read versions" ON public.content_versions
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated can insert versions" ON public.content_versions
  FOR INSERT TO authenticated WITH CHECK (true);

-- Media library
CREATE TABLE public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  media_type TEXT NOT NULL DEFAULT 'image',
  file_size INTEGER,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read media" ON public.media_library
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated can insert media" ON public.media_library
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can delete media" ON public.media_library
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can update media" ON public.media_library
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Site settings
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.site_settings
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated can upsert settings" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update settings" ON public.site_settings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Auto-update updated_at on page_blocks
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER page_blocks_updated_at
  BEFORE UPDATE ON public.page_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
