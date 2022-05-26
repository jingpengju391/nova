/** RCS - Revision Control System */
import { join } from 'path'
import { ensureDir, createFile, pathExists } from 'fs-extra'
import type { RCSConfigOptions } from './types'
import { Index } from './objects'
import type { Model, Mask } from '@shared/dataModelTypes'

export enum RCSAddType {
  models = 'models',
  modelBlocks = 'modelBlocks'
}

export default class RCS {
  static #rcsDirPath: string
  static #index: Index
  static #configs: RCSConfigOptions

  static async init(workspaceDirPath: string) {
    this.#rcsDirPath = join(workspaceDirPath, '.rcs')
    const isRCSExist = await pathExists(this.#rcsDirPath)
    const HEADFilePath = join(this.#rcsDirPath, 'HEAD')
    const indexFilePath = join(this.#rcsDirPath, 'index')
    const objectsDirPath = join(this.#rcsDirPath, 'objects')
    const headsDirPath = join(this.#rcsDirPath, 'heads')
    const tagsDirPath = join(this.#rcsDirPath, 'tags')
    if (!isRCSExist) {
      await ensureDir(this.#rcsDirPath)
      await createFile(HEADFilePath)
      await createFile(indexFilePath)
      await ensureDir(objectsDirPath)
      await ensureDir(headsDirPath)
      await ensureDir(tagsDirPath)
    }
    this.#index = new Index(indexFilePath)
    this.#configs = this.#getDefaultConfigs()
  }

  static config(options: RCSConfigOptions) {
    this.#configs = {
      ...this.#configs,
      ...options
    }
  }

  static async add(type: RCSAddType, fields: Partial<Model> | Partial<Mask>) {
    console.log('RCS.add:', type, fields)
    switch (type) {
      case RCSAddType.models:
        await this.#index.addModelIndexEntry(fields as Partial<Model>)
        break
      case RCSAddType.modelBlocks:
        await this.#index.addModelBlockIndexEntries(fields as Partial<Mask>)
        break
      default:
    }
  }

  static async commit(message: string) {
    // TODO：if HEAD is empty, create a new tag named initial
    this.#index.writeTree()
  }

  static async push() {
    // TODO: push
  }

  static async pull() {
    // TODO: pull
  }

  static async checkout(url: URL) {
    // TODO: checkout
  }

  static #getDefaultConfigs(): RCSConfigOptions {
    // TODO: getDefaultConfigs
    return {}
  }
}
