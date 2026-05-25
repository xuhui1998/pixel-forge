/**
 * Image compression utility
 */
import imageCompression from 'browser-image-compression'
import type { CompressOptions } from '../types/image'

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: options.maxSizeMB ?? 1,
    maxWidthOrHeight: options.maxWidthOrHeight ?? 1920,
    initialQuality: options.quality ?? 0.8,
    fileType: options.fileType,
    useWebWorker: true,
  }
  return await imageCompression(file, defaultOptions)
}
