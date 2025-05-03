export default function addAtMedia<const O extends Record<string, string>>(params?: O) {
  const medias = {} as Record<string, unknown>

  for (const media in params) {
    medias[media] = `@media ${params[media] as O[typeof media]}`
  }

  return medias as { [Media in keyof O]: `@media ${O[Media]}` }
}
