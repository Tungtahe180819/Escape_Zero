import type Phaser from 'phaser'

export function installMobileOrientation(game: Phaser.Game): void {
    const app = document.getElementById('app')
    if (!app || (!window.matchMedia('(any-pointer: coarse)').matches && navigator.maxTouchPoints === 0)) return

    const portrait = window.matchMedia('(orientation: portrait)')
    const notice = document.createElement('section')
    notice.className = 'game-rotate-notice'
    notice.innerHTML = '<h1>Xoay ngang để chơi</h1><p>Hãy xoay điện thoại sang ngang. Nếu màn hình đang khóa xoay, hãy bật tự động xoay.</p>'

    if (document.fullscreenEnabled && app.requestFullscreen) {
        const fullscreen = document.createElement('button')
        fullscreen.type = 'button'
        fullscreen.textContent = 'Chơi toàn màn hình'
        fullscreen.onclick = async () => {
            try {
                if (!document.fullscreenElement) await app.requestFullscreen()
                const orientation = screen.orientation as (ScreenOrientation & {
                    lock?: (value: 'landscape') => Promise<void>
                }) | undefined
                await orientation?.lock?.('landscape')
            } catch {
                // The rotation instructions remain available if the browser rejects either request.
            }
        }
        notice.append(fullscreen)
    }

    app.append(notice)
    let pausedForPortrait = false
    const sync = (): void => {
        notice.hidden = !portrait.matches
        if (portrait.matches && !game.isPaused) {
            pausedForPortrait = true
            game.pause()
        } else if (!portrait.matches && pausedForPortrait) {
            pausedForPortrait = false
            game.resume()
        }
    }
    portrait.addEventListener('change', sync)
    sync()
    game.events.once('destroy', () => {
        portrait.removeEventListener('change', sync)
        notice.remove()
    })
}
