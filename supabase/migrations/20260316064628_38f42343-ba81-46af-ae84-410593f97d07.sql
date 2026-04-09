
-- Update RLS to allow public writes (matching existing site_content/section_media pattern)
DROP POLICY "Authenticated users can insert page blocks" ON public.page_blocks;
DROP POLICY "Authenticated users can update page blocks" ON public.page_blocks;
DROP POLICY "Authenticated users can delete page blocks" ON public.page_blocks;
DROP POLICY "Authenticated can insert versions" ON public.content_versions;
DROP POLICY "Authenticated can insert media" ON public.media_library;
DROP POLICY "Authenticated can delete media" ON public.media_library;
DROP POLICY "Authenticated can update media" ON public.media_library;
DROP POLICY "Authenticated can upsert settings" ON public.site_settings;
DROP POLICY "Authenticated can update settings" ON public.site_settings;

CREATE POLICY "Anyone can insert page blocks" ON public.page_blocks FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update page blocks" ON public.page_blocks FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete page blocks" ON public.page_blocks FOR DELETE TO public USING (true);
CREATE POLICY "Anyone can insert versions" ON public.content_versions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can insert media" ON public.media_library FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can delete media" ON public.media_library FOR DELETE TO public USING (true);
CREATE POLICY "Anyone can update media" ON public.media_library FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can upsert settings" ON public.site_settings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update settings" ON public.site_settings FOR UPDATE TO public USING (true) WITH CHECK (true);
