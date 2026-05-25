declare module 'gif.js' {
  interface GIFOptions {
    workers?: number
    quality?: number
    width?: number
    height?: number
    workerScript?: string
    transparent?: number | null
    dither?: string | boolean
    repeat?: number
  }

  class GIF extends EventTarget {
    constructor(options?: GIFOptions)
    addFrame(imageData: ImageData | HTMLCanvasElement | CanvasRenderingContext2D, delay?: number): void
    render(): this
    on(event: 'finished', callback: (blob: Blob) => void): this
    on(event: 'progress', callback: (progress: number) => void): this
    abort(): void
  }

  export default GIF
}
