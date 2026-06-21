'use client'

import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase/client'

// Upload a data-URL (captured photo/video) to Firebase Storage and return
// its public download URL for embedding in the job + customer gallery.
export async function uploadDataUrl(path: string, dataUrl: string): Promise<string> {
  const r = ref(storage, path)
  await uploadString(r, dataUrl, 'data_url')
  return getDownloadURL(r)
}

// Delete a captured file when staff retake it. Best-effort: a missing object
// (already gone) shouldn't throw and block removing it from the job.
export async function deleteFile(path: string): Promise<void> {
  try {
    await deleteObject(ref(storage, path))
  } catch {
    /* already deleted / not found — ignore */
  }
}
