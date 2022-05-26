export default class Queue<T> {
  #array = [] as (T | null)[]
  #headIndex: number | null = null

  push(val: T) {
    // Edge Case #5: Missing value or value is null
    if (val === undefined || val === null) {
      console.log('Input a value for the push method. Cannot be left blank or null')
      return
    }

    if (this.#headIndex === null && !this.#array.length) {
      this.#headIndex = 0
    }
    // Edge Case #1: [null, null, null]
    if (this.#array[this.#array.length - 1] === null) {
      this.#headIndex!++
    }
    this.#array.push(val)
    return this.#array
  }

  pop() {
    if (this.#array[this.#array.length - 1]) {
      // Edge Case #2: [10]
      if (this.#array.length - 1 === 0) {
        this.#headIndex = null
      // Edge Case #3: [null, null, 10]
      } else if (!this.#array[this.#array.length - 2]) {
        this.#headIndex!--
      }
      return this.#array.pop()
    // Edge Case #4: [] || [null, null, null]
    } else {
      console.log('Action not executed. The #array is already empty.')
    }
  }

  shift() {
    // Edge Case #1: [null, null, null]
    if (!this.#array[this.#array.length - 1]) {
      console.log('Action not executed. The #array is already empty.')
      return
    }

    const value = this.#array[this.#headIndex!]
    this.#array[this.#headIndex!] = null

    if (this.#headIndex !== this.#array.length - 1) {
      this.#headIndex!++
    }
    return value
  }

  head() {
    // Edge Case #4: [] || [null, null, null]
    if (!this.#array.length || !this.#array[this.#headIndex!]) {
      console.log('Action not executed. The #array is already empty')
    } else {
      return this.#array[this.#headIndex!]
    }
  }

  tail() {
    // Edge Case #4: [] || [null, null, null]
    if (!this.#array.length || !this.#array[this.#array.length - 1]) {
      console.log('Action not executed. The #array is already empty')
    } else {
      return this.#array[this.#array.length - 1]
    }
  }

  cleanUp() {
    // Edge Case #6: [] || [10, 20, 30]
    if (!this.#array.length || this.#array[0]) {
      console.log('There are no more null values in the #array!')
    // Edge Case #1: [null, null, null]
    } else if (this.#array[this.#array.length - 1] === null) {
      this.#array = []
      this.#headIndex = null
    } else {
      this.#array = this.#array.slice(this.#headIndex!)
      this.#headIndex = 0
    }
    return this.#array
  }
}
