import Phaser from 'phaser'

type TextRenderer = (
    renderer: unknown,
    text: Phaser.GameObjects.Text,
    camera: Phaser.Cameras.Scene2D.Camera,
    parentMatrix?: Phaser.GameObjects.Components.TransformMatrix,
) => void

// Keep Phaser's text layout and hit areas while drawing the glyphs at display density.
export function installSharpText(game: Phaser.Game): void {
    const layer = document.createElement('canvas')
    layer.className = 'game-sharp-text'
    layer.setAttribute('aria-hidden', 'true')
    const context = layer.getContext('2d')
    if (!context) return

    const prototype = Phaser.GameObjects.Text.prototype as Phaser.GameObjects.Text & {
        renderCanvas: TextRenderer
        renderWebGL: TextRenderer
    }
    const originalCanvas = prototype.renderCanvas
    const originalWebGL = prototype.renderWebGL
    let scaleX = 1
    let scaleY = 1
    let drawing = false

    game.events.on(Phaser.Core.Events.PRE_RENDER, () => {
        const canvas = game.canvas
        if (!canvas?.parentElement) return
        if (!layer.isConnected) canvas.parentElement.append(layer)
        const bounds = canvas.getBoundingClientRect()
        const density = window.devicePixelRatio || 1
        const width = Math.round(bounds.width * density)
        const height = Math.round(bounds.height * density)
        drawing = width > 0 && height > 0
        if (!drawing) return
        if (layer.width !== width) layer.width = width
        if (layer.height !== height) layer.height = height
        const position = [bounds.left, bounds.top, bounds.width, bounds.height].map(value => value + 'px')
        const [left, top, cssWidth, cssHeight] = position
        Object.assign(layer.style, { left, top, width: cssWidth, height: cssHeight })
        scaleX = width / canvas.width
        scaleY = height / canvas.height
        context.resetTransform()
        context.clearRect(0, 0, width, height)
    })
    game.events.on(Phaser.Core.Events.POST_RENDER, () => { drawing = false })

    const redirect = (original: TextRenderer): TextRenderer => function (this: Phaser.GameObjects.Text, renderer, text, camera, parentMatrix) {
        if (!drawing || text.scene.game !== game) {
            original.call(this, renderer, text, camera, parentMatrix)
            return
        }
        if (!text.text || !text.width || !text.height) return
        camera.addToRenderList(text)
        if (text.scene.sys.isPaused()) return

        const resolution = Math.max(2, Math.min(8, Math.ceil(Math.max(scaleX, scaleY))))
        if (text.style.resolution !== resolution) text.setResolution(resolution)
        const { calc } = Phaser.GameObjects.GetCalcMatrix(text, camera, parentMatrix)
        context.save()
        context.setTransform(scaleX, 0, 0, scaleY, 0, 0)
        context.beginPath()
        context.rect(camera.x, camera.y, camera.width, camera.height)
        context.clip()
        context.transform(calc.a, calc.b, calc.c, calc.d, calc.e, calc.f)
        context.globalAlpha = text.alpha * camera.alpha
        context.drawImage(text.canvas, -text.displayOriginX, -text.displayOriginY, text.width, text.height)
        context.restore()
    }

    prototype.renderCanvas = redirect(originalCanvas)
    prototype.renderWebGL = redirect(originalWebGL)
    game.events.once(Phaser.Core.Events.DESTROY, () => {
        prototype.renderCanvas = originalCanvas
        prototype.renderWebGL = originalWebGL
        layer.remove()
    })
}
