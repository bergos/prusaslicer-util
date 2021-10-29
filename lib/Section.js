class Section extends Map {
  constructor (key, map) {
    super(map)

    this.abstract = false
    this.prefix = null
    this.name = null
    this.scope = null

    if (!key) {
      return this
    }

    const colonIndex = key.indexOf(':')

    if (colonIndex === -1) {
      this.prefix = key
      key = ''
    } else {
      this.prefix = key.slice(0, colonIndex)
      key = key.slice(colonIndex + 1)
    }

    const atIndex = key.lastIndexOf(' @')

    if (atIndex !== -1) {
      this.scope = key.slice(atIndex + 2)
      key = key.slice(0, atIndex)
    }

    if (key) {
      if (key.startsWith('*') && key.endsWith('*')) {
        this.abstract = true
        this.name = key.slice(1, -1)
      } else {
        this.name = key
      }
    }
  }

  get abstractName () {
    return [
      this.abstract ? '*' : '',
      this.name,
      this.abstract ? '*' : ''
    ].join('')
  }

  get key () {
    return [
      this.prefix,
      this.name ? ':' : '',
      this.abstract ? '*' : '',
      this.name || '',
      this.abstract ? '*' : '',
      this.scope ? ` @${this.scope}` : ''
    ].join('')
  }

  toJSON () {
    return Object.fromEntries(this.entries())
  }
}

export default Section
