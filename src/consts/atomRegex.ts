const ATOM_REGEX = /var\((--[\w-]+)(?:,\s*((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))+))?\)/g

export default ATOM_REGEX
