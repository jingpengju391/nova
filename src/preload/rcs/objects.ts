import { createWriteStream, createReadStream, writeFile, stat } from 'fs-extra'
import { Readable } from 'stream'
import { createDeflate, createInflate } from 'zlib'
import type { Mask, Model, Property } from '@shared/dataModelTypes'
// jsonstream cannot compile
// const JSONStream = require('jsonstream')

export class Index {
  #path: string
  #entries: Map<string, Partial<Model> | Partial<Mask> | Partial<Property>>

  constructor(path: string) {
    this.#path = path
    this.#entries = new Map()
    this.#init()
  }

  static IndexFileJSONKey = 'indexEntries'

  async #init() {
    const indexStats = await stat(this.#path)
    if (!indexStats.isFile() || indexStats.size <= 0) return

    createReadStream(this.#path)
      .pipe(createInflate())
      // jsonstream cannot compile
      // .pipe(JSONStream.parse(Index.IndexFileJSONKey))
      .on('data', (data: any) => {
        this.#entries = new Map(Object.entries(data))
      })
  }

  async addModelIndexEntry(fields: Partial<Model>) {
    const updatedEntry = `models/${fields.id!}/configs`
    if (!this.#entries.get(updatedEntry)) {
      this.#entries.set(updatedEntry, fields)
      await this.#persist()
    }
  }

  async #addPropertyEntries(fields: Partial<Property>, modelId: number, blockId: number, propertyType: string) {
    let updatedEntry!: string
    if ('calcFormula' in fields) {
      updatedEntry = `models/${modelId}/blocks/${blockId}/${propertyType}/${fields.id!}/calcFormula`
    } else if ('copyFormula' in fields) {
      updatedEntry = `models/${modelId}/blocks/${blockId}/${propertyType}/${fields.id!}/copyFormula`
    } else {
      updatedEntry = `models/${modelId}/blocks/${blockId}/${propertyType}/${fields.id!}/configs`
    }
    if (!this.#entries.get(updatedEntry)) {
      this.#entries.set(updatedEntry, fields)
      await this.#persist()
    }
  }

  async addModelBlockIndexEntries(fields: Partial<Mask>) {
    let updatedEntry!: string
    if ('variables' in fields) {
      await this.#addPropertyEntries(fields.variables!, fields.modelId!, fields.id!, 'variables')
      return
    } else if ('series' in fields) {
      await this.#addPropertyEntries(fields.series!, fields.modelId!, fields.id!, 'series')
      return
    } else if ('links' in fields) {
      await this.#addPropertyEntries(fields.links!, fields.modelId!, fields.id!, 'links')
      return
    } else if ('methods' in fields) {
      await this.#addPropertyEntries(fields.methods!, fields.modelId!, fields.id!, 'methods')
      return
    } else if ('copySizeFunctionLines' in fields) {
      updatedEntry = `models/${fields.modelId!}/blocks/${fields.id!}/copySizeFunctionLines`
    } else if ('runAfterRebaseFormula' in fields) {
      updatedEntry = `models/${fields.modelId!}/blocks/${fields.id!}/runAfterRebaseFormula`
    } else if ('rebaseBaseFunctionLines' in fields) {
      updatedEntry = `models/${fields.modelId!}/blocks/${fields.id!}/rebaseBaseFunctionLines`
    } else if ('initializeFormula' in fields) {
      updatedEntry = `models/${fields.modelId!}/blocks/${fields.id!}/initializeFormula`
    } else if ('finalizeFormula' in fields) {
      updatedEntry = `models/${fields.modelId!}/blocks/${fields.id!}/finalizeFormula`
    } else if ('definitions' in fields) {
      updatedEntry = `models/${fields.modelId!}/blocks/${fields.id!}/definitions`
    } else {
      updatedEntry = `models/${fields.modelId!}/blocks/${fields.id!}/configs`
    }
    if (!this.#entries.get(updatedEntry)) {
      this.#entries.set(updatedEntry, fields)
      await this.#persist()
    }
  }

  async writeTree() {
    // TODO: write object
    this.#clear()
  }

  async #persist() {
    if (this.#entries.size <= 0) return
    const entries = Object.fromEntries(this.#entries.entries())
    const content = { [Index.IndexFileJSONKey]: entries }
    return new Promise((resolve, reject) => {
      Readable.from(JSON.stringify(content))
        .pipe(createDeflate())
        .pipe(createWriteStream(this.#path))
        .on('finish', () => { resolve(true) })
        .on('error', err => { reject(err) })
    })
  }

  async #clear() {
    await writeFile(this.#path, '')
  }
}
