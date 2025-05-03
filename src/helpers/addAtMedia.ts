import { type Medias } from './atomizer'

export default function addAtMedia<M extends Medias>(params: M) {
  const medias = {} as { [Media in keyof M]: `@media ${M[Media]}` }

  for (const media in params) {
    medias[media] = `@media ${params[media]}`
  }

  return medias
}
