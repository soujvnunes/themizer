export const DEFAULT_MEDIA = 'DEFAULT'

export type DefaultMedia = typeof DEFAULT_MEDIA

export default function isDefaultMedia(params: string): params is DefaultMedia {
  return params === DEFAULT_MEDIA
}
