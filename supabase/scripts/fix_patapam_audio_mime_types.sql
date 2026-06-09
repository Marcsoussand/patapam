-- Autoriser audio/x-m4a (MIME envoyé par Windows / certains navigateurs pour .m4a)
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/mpeg',
  'audio/webm'
]
WHERE id = 'patapam-audio';

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/mpeg',
  'audio/webm'
]
WHERE id = 'patapam-voice';
