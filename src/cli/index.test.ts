describe('cli', () => {
  let errorSpy: jest.SpyInstance
  let exitSpy: jest.SpyInstance

  beforeEach(() => {
    jest.resetModules()

    exitSpy = jest.spyOn(process, 'exit').mockImplementation(jest.fn as never)
    errorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn())
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  async function renderCli() {
    const atoms = await import('./atoms')
    const atomsSpy = jest.spyOn(atoms, 'default')

    await import('./index')

    return atomsSpy
  }

  it('runs its commander files', async () => {
    const atoms = await import('./atoms')
    const atomsSpy = jest.spyOn(atoms, 'default').mockResolvedValue(undefined)

    await import('./index')

    expect(atomsSpy).toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
    expect(exitSpy).not.toHaveBeenCalled()
  })
  it('exits and thrown an error', async () => {
    const atoms = await import('./atoms')

    jest.spyOn(atoms, 'default').mockRejectedValue(new Error('error'))

    await import('./index')

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(console.error).toHaveBeenCalledWith(expect.any(Error))
  })
})
