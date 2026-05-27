-- Run this in Supabase SQL Editor to create the event-banners storage bucket

-- Create the bucket (public so banners are directly accessible)
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-banners', 'event-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to event-banners
CREATE POLICY "Authenticated users can upload event banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-banners');

-- Allow anyone to read event banners (public bucket)
CREATE POLICY "Anyone can view event banners"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-banners');

-- Allow organizers to update their own event banners
CREATE POLICY "Organizers can update their event banners"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-banners');

-- Allow organizers to delete their event banners
CREATE POLICY "Organizers can delete their event banners"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-banners');
