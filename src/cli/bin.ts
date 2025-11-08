import cli from './themizer'

cli().catch((error) => {
  // Format error message for better user experience
  if (error instanceof Error) {
    console.error(`themizer: ${error.message}`)

    // Show stack trace only in debug mode
    if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
  } else {
    console.error('themizer: An unexpected error occurred')
    console.error(error)
  }

  process.exit(1)
})
