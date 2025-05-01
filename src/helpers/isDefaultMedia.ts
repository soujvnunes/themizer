import DEFAULT_MEDIA from '../consts/defaultMedia'

export type DefaultMedia = typeof DEFAULT_MEDIA

export default function isDefaultMedia(params: string): params is DefaultMedia {
  return params === DEFAULT_MEDIA
}
