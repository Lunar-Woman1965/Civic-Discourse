'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/* ================================
   TYPES & CONSTANTS
================================ */

export const reactions = [
  'thumbs_up',
  'thumbs_down',
  'care_support',
  'mad',
  'angry',
  'horrified',
] as const

export type ReactionType = typeof reactions[number]

type ReactionMeta = {
  label: string
  emoji?: string
  image?: string
  tooltip?: string
}

export const reactionUI: Record<ReactionType, ReactionMeta> = {
  thumbs_up: { label: 'Thumbs Up', emoji: '👍' },
  thumbs_down: { label: 'Thumbs Down', emoji: '👎' },
  care_support: { label: 'Care / Support', emoji: '🫶' },
  mad: { label: 'Mad', emoji: '🔥' },
  angry: { label: 'Angry', emoji: '😤' },
  horrified: {
    label: 'Horrified',
    image: '/reactions/horrified.png',
    tooltip:
      'Custom BTA emoji — © 2026 LMH. Not for reuse outside the platform.',
  },
}

type ReactionPickerProps = {
  value?: ReactionType | null
  onReact: (reaction: ReactionType) => Promise<void> | void
  defaultReaction?: ReactionType
  disabled?: boolean
  className?: string
}

const LONG_PRESS_MS = 300

/* ================================
   COMPONENT
================================ */

export function ReactionPicker({
  value = null,
  onReact,
  defaultReaction = 'thumbs_up',
  disabled = false,
  className = '',
}: ReactionPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [hovered, setHovered] = React.useState<ReactionType | null>(null)
  const [loading, setLoading] = React.useState(false)

  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const trayRef = React.useRef<HTMLDivElement | null>(null)

  const pressTimer = React.useRef<number | null>(null)
  const longPressTriggered = React.useRef(false)

  const selected = value ?? defaultReaction
  const selectedUI = reactionUI[selected]

  /* ================================
     HELPERS
  ================================= */

  const clearTimer = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  const submit = async (reaction: ReactionType) => {
    if (loading || disabled) return
    setLoading(true)
    try {
      await onReact(reaction)
    } finally {
      setLoading(false)
    }
  }

  const getReactionFromPoint = (x: number, y: number) => {
    const els = document.elementsFromPoint(x, y)

    for (const el of els) {
      if (!(el instanceof HTMLElement)) continue
      const r = el.dataset.reaction as ReactionType
      if (reactions.includes(r)) return r
    }

    return null
  }

  /* ================================
     POINTER HANDLERS
  ================================= */

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return

    longPressTriggered.current = false

    pressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true
      setOpen(true)
    }, LONG_PRESS_MS)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!open) return
    const r = getReactionFromPoint(e.clientX, e.clientY)
    setHovered(r)
  }

  const onPointerUp = async (e: React.PointerEvent<HTMLButtonElement>) => {
    clearTimer()

    if (open) {
      const r =
        getReactionFromPoint(e.clientX, e.clientY) || hovered

      if (r) await submit(r)
      setOpen(false)
      setHovered(null)
      return
    }

    if (!longPressTriggered.current) {
      await submit(defaultReaction)
    }
  }

  /* ================================
     RENDER
  ================================= */

  return (
    <div className={`relative inline-flex ${className}`}>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              ref={triggerRef}
              type="button"
              disabled={disabled || loading}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onContextMenu={(e) => e.preventDefault()}
              className="flex h-10 w-10 items-center justify-center rounded-full border bg-background shadow-sm transition hover:scale-105 hover:bg-muted disabled:opacity-60"
              aria-label={selectedUI.label}
            >
              {selectedUI.image ? (
                <Image
                  src={selectedUI.image}
                  alt={selectedUI.label}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              ) : (
                <span className="text-xl">{selectedUI.emoji}</span>
              )}
            </button>
          </TooltipTrigger>

          <TooltipContent>
            <p className="text-xs">
              {selectedUI.tooltip ?? selectedUI.label}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* REACTION TRAY */}
      {open && (
        <div
          ref={trayRef}
          className="absolute bottom-full left-1/2 z-50 mb-3 -translate-x-1/2 rounded-full border bg-background/95 p-2 shadow-xl backdrop-blur"
        >
          <div className="flex items-center gap-2">
            {reactions.map((reaction) => {
              const ui = reactionUI[reaction]
              const active = hovered === reaction

              return (
                <TooltipProvider key={reaction} delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        data-reaction={reaction}
                        onMouseEnter={() => setHovered(reaction)}
                        onClick={async () => {
                          await submit(reaction)
                          setOpen(false)
                        }}
                        className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                          active
                            ? '-translate-y-2 scale-110 bg-muted shadow-md'
                            : 'hover:scale-105'
                        }`}
                      >
                        {ui.image ? (
                          <Image
                            src={ui.image}
                            alt={ui.label}
                            width={28}
                            height={28}
                          />
                        ) : (
                          <span className="text-2xl">{ui.emoji}</span>
                        )}
                      </button>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p className="text-xs">
                        {ui.tooltip ?? ui.label}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}