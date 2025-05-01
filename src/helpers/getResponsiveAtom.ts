import DEFAULT_MEDIA from '../consts/defaultMedia'
import { Atom } from './isAtom'
import { type DefaultMedia } from './isDefaultMedia'

export type ResponsiveAtom<M extends string> = Record<M | DefaultMedia, Atom>

export default function getResponsiveAtom<M extends string>(medias?: Record<M, string>) {
  return function isResponsiveAtom(atoms: unknown): atoms is ResponsiveAtom<M> {
    if (!medias || !Object.keys(medias).length) return false

    if (atoms == null || typeof atoms !== 'object' || !Object.keys(atoms).length) return false

    for (const atom in atoms) {
      if (!Object.prototype.hasOwnProperty.call(atoms, atom)) continue

      if (atom !== DEFAULT_MEDIA && !(atom in medias)) return false
    }

    return true
  }
}
