import cli from './themizer'

cli().catch((error) => {
  console.error(error)
  process.exit(1)
})
