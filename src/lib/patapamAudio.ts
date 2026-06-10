/**
 * Gestionnaire audio global Patapam — une piste SFX à la fois, musique séparée.
 * Tout son court (congrats, mots, consignes) passe par playSfx() : le précédent s'arrête.
 * La musique de fond est mise en pause pendant un SFX, puis reprise.
 */

let musicAudio: HTMLAudioElement | null = null
let sfxAudio: HTMLAudioElement | null = null
let musicDucked = false
let musicGeneration = 0
let musicVolume = 0.45
let sfxVolume = 1

function bindSfxCleanup(audio: HTMLAudioElement): void {
  const cleanup = () => {
    if (sfxAudio === audio) sfxAudio = null
    resumeMusicAfterSfx()
  }
  audio.addEventListener('ended', cleanup, { once: true })
  audio.addEventListener('error', cleanup, { once: true })
}

function duckMusicForSfx(): void {
  if (!musicAudio || musicAudio.paused) return
  musicAudio.pause()
  musicDucked = true
}

function resumeMusicAfterSfx(): void {
  if (!musicDucked || !musicAudio || sfxAudio) return
  musicDucked = false
  void musicAudio.play().catch(() => {})
}

export function stopMusic(): void {
  musicGeneration += 1
  musicDucked = false
  if (musicAudio) {
    musicAudio.pause()
    musicAudio.currentTime = 0
    musicAudio = null
  }
}

export function stopSfx(): void {
  if (sfxAudio) {
    sfxAudio.pause()
    sfxAudio = null
  }
  resumeMusicAfterSfx()
}

/** Arrête musique + SFX (changement de page, fermeture overlay). */
export function stopAllPatapamAudio(): void {
  stopSfx()
  stopMusic()
}

/** @deprecated Préférer stopSfx — conservé pour compatibilité. */
export function stopPatapamAudio(): void {
  stopSfx()
}

export async function playMusic(
  url: string,
  options?: { loop?: boolean; volume?: number },
): Promise<boolean> {
  stopMusic()
  const generation = musicGeneration
  const audio = new Audio(url)
  audio.loop = options?.loop ?? true
  audio.volume = options?.volume ?? musicVolume
  musicAudio = audio
  try {
    await audio.play()
    // Strict Mode / changement de page : une 2e instance ne doit pas rester active
    if (generation !== musicGeneration || musicAudio !== audio) {
      audio.pause()
      audio.currentTime = 0
      return false
    }
    return true
  } catch {
    if (musicAudio === audio) musicAudio = null
    return false
  }
}

export async function playSfx(url: string): Promise<HTMLAudioElement | null> {
  stopSfx()
  duckMusicForSfx()

  const audio = new Audio(url)
  audio.volume = sfxVolume
  sfxAudio = audio
  bindSfxCleanup(audio)

  try {
    await audio.play()
    return audio
  } catch {
    sfxAudio = null
    resumeMusicAfterSfx()
    return null
  }
}

export function getActiveSfx(): HTMLAudioElement | null {
  return sfxAudio
}

export function isMusicPlaying(): boolean {
  return musicAudio !== null && !musicAudio.paused
}
