import atoms from './atoms'

atoms().catch((error) => {
  console.error(error)
  process.exit(1)
})
