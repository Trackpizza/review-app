'use client'

import { ref, uploadString, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase/client'

// Upload a data-URL (captured photo/video) to Firebase Storage and return
// its public download URL for embedding in the job + customer gallery.
export async function uploadDataUrl(path: string, dataUrl: string): Promise<string> {
  const r = ref(storage, path)
  await uploadString(r, dataUrl, 'data_url')
  return getDownloadURL(r)
}
