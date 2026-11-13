import { requireSupabase } from '../lib/supabase';

const DATA_URL_PATTERN = /^data:([^;,]+);base64,/i;

function extensionForMime(mimeType) {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'webp';
}

function uniqueName() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function isInlineMedia(value) {
  return typeof value === 'string' && DATA_URL_PATTERN.test(value);
}

async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  if (!response.ok) throw new Error('Could not prepare the selected media file for upload.');
  return response.blob();
}

export async function uploadPublicMedia(value, { userId, folder = 'misc' } = {}) {
  if (!value || !isInlineMedia(value)) return value || '';
  if (!userId) throw new Error('You must be signed in before uploading media.');

  const client = requireSupabase();
  const blob = await dataUrlToBlob(value);
  const extension = extensionForMime(blob.type);
  const objectPath = `${userId}/${folder}/${uniqueName()}.${extension}`;
  const { error } = await client.storage.from('brand-media').upload(objectPath, blob, {
    cacheControl: '31536000',
    contentType: blob.type || 'image/webp',
    upsert: false
  });

  if (error) throw error;
  const { data } = client.storage.from('brand-media').getPublicUrl(objectPath);
  return data.publicUrl;
}

export async function uploadVerificationDocument(value, { userId } = {}) {
  if (!value) return '';
  if (!isInlineMedia(value)) return value;
  if (!userId) throw new Error('You must be signed in before uploading verification documents.');

  const client = requireSupabase();
  const blob = await dataUrlToBlob(value);
  const extension = extensionForMime(blob.type);
  const objectPath = `${userId}/verification/${uniqueName()}.${extension}`;
  const { error } = await client.storage.from('verification-documents').upload(objectPath, blob, {
    contentType: blob.type || 'image/webp',
    upsert: false
  });

  if (error) throw error;
  return objectPath;
}
