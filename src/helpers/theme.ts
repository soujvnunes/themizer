export class Theme {
  private atoms = ''

  setAtoms(atoms: string) {
    this.atoms = atoms
  }
  get getAtoms() {
    return this.atoms
  }
}

const theme = new Theme()

export default theme
