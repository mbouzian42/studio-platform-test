-- ============================================================
-- Fix Storage Buckets MIME types for Beat Marketplace
-- ============================================================

-- Update beat-previews to allow MP3 and common WAV variations
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'audio/wav', 
  'audio/x-wav', 
  'audio/wave', 
  'audio/mpeg', 
  'audio/mp3', 
  'audio/aiff', 
  'audio/x-aiff', 
  'audio/flac', 
  'image/jpeg', 
  'image/png', 
  'image/webp'
]
WHERE id = 'beat-previews';

-- Update beat-files to allow MP3 and common WAV variations
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'audio/wav', 
  'audio/x-wav', 
  'audio/wave', 
  'audio/mpeg', 
  'audio/mp3', 
  'audio/aiff', 
  'audio/x-aiff', 
  'audio/flac'
]
WHERE id = 'beat-files';
