import type { ReactNode } from 'react'
import { A } from '../assets'
import { Glow } from './kit'

type TileProps = { title: string; subtitle: string; onClick?: () => void; done?: boolean }

function TileShell({ bg, height, children, onClick, label }: { bg: string; height: number; children: ReactNode; onClick?: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative w-full overflow-hidden rounded-[15px] text-white transition-transform active:scale-[0.97]"
      style={{ height, background: bg }}
    >
      {children}
    </button>
  )
}

function HomeText({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <span className="absolute inset-x-[8px] top-[79px] flex flex-col items-center gap-[1px] text-center">
      <span className="text-t14 font-bold">{title}</span>
      <span className="text-t12">{subtitle}</span>
    </span>
  )
}

function GameText({ title, subtitle, w }: { title: string; subtitle: string; w: number }) {
  return (
    <span className="absolute inset-x-[4px] top-[120px] flex flex-col items-center gap-[3px] text-center">
      <span className="text-t14 font-bold">{title}</span>
      <span className="mx-auto text-t12" style={{ maxWidth: w }}>{subtitle}</span>
    </span>
  )
}

const Centered = ({ x, y, children }: { x: number; y: number; children: ReactNode }) => (
  <span className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `calc(50% + ${x - 79.5}px)`, top: y }}>
    {children}
  </span>
)

const deepGlows = (
  <>
    <Glow src={A.glowDeepA} x={80} y={17} />
    <Glow src={A.glowDeepB} x={164} y={160} />
  </>
)

const midGlows = (
  <>
    <Glow src={A.glowMidA} x={12} y={43} />
    <Glow src={A.glowMidB} x={11.5} y={13.5} />
    <Glow src={A.glowMidB} x={8.5} y={56.5} />
    <Glow src={A.glowMidB} x={70.5} y={20.5} />
    <Glow src={A.glowMidB} x={120.5} y={5.5} />
  </>
)

// ——— Плитки главного экрана (Frame 17), 159×129 ———

export function RiskTile(p: TileProps) {
  return (
    <TileShell bg="#004fc6" height={129} onClick={p.onClick} label={p.title}>
      {deepGlows}
      <Centered x={80.38} y={42.38}>
        <img alt="" src={A.iconRisk} className="size-[59.94px] rotate-45" />
      </Centered>
      <HomeText {...p} />
    </TileShell>
  )
}

export function TrustTile(p: TileProps) {
  return (
    <TileShell bg="#ceeaff" height={129} onClick={p.onClick} label={p.title}>
      <Glow src={A.glowSkyA} x={144} y={75.5} />
      <Glow src={A.glowSkyB} x={107} y={135} />
      <Glow src={A.glowSkyB} x={79} y={178} />
      <Glow src={A.glowSkyB} x={144} y={172} />
      <Glow src={A.glowSkyC} x={21} y={139} />
      <Centered x={80} y={44}>
        <img alt="" src={A.iconTrust} className="size-[78px]" />
      </Centered>
      <HomeText {...p} />
    </TileShell>
  )
}

export function AssistantTile(p: TileProps) {
  return (
    <TileShell bg="#aedbff" height={129} onClick={p.onClick} label={p.title}>
      <Glow src={A.glowPaleA} x={79} y={72} />
      <Glow src={A.glowPaleB} x={80} y={65} />
      <Centered x={79} y={46}>
        <img alt="" src={A.iconRobot} className="size-[118px] opacity-80" />
      </Centered>
      <HomeText {...p} />
    </TileShell>
  )
}

export function HistoryTile(p: TileProps) {
  return (
    <TileShell bg="#165fcf" height={129} onClick={p.onClick} label={p.title}>
      {midGlows}
      <Centered x={79.5} y={43.5}>
        <img alt="" src={A.iconDiamond} />
      </Centered>
      <HomeText {...p} />
    </TileShell>
  )
}

// ——— Плитки игр (Frame 22), 159×185 ———

const GlassDot = () => <img alt="" src={A.glassCircle} className="absolute" style={{ left: 'calc(50% - 12.5px)', top: 42 }} />

function DoneBadge() {
  return (
    <span className="absolute right-[10px] top-[10px] grid size-[22px] place-items-center rounded-full bg-white/90">
      <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
        <path d="M1 5l3.2 3.2L11 1.5" stroke="#004FC6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export function PatrolTile(p: TileProps) {
  return (
    <TileShell bg="#004fc6" height={185} onClick={p.onClick} label={p.title}>
      {deepGlows}
      <GlassDot />
      <img alt="" src={A.iconChatSearch} className="absolute" style={{ left: 'calc(50% - 41.5px)', top: 33.5 }} />
      <GameText {...p} w={116} />
      {p.done && <DoneBadge />}
    </TileShell>
  )
}

export function OnCallTile(p: TileProps) {
  return (
    <TileShell bg="#ceeaff" height={185} onClick={p.onClick} label={p.title}>
      <img alt="" src={A.tileOncall} className="absolute inset-0 h-full w-full" />
      <GameText {...p} w={127} />
      {p.done && <DoneBadge />}
    </TileShell>
  )
}

export function DuoTile(p: TileProps) {
  const at = (x: number) => `calc(50% + ${x - 79.5}px)`
  return (
    <TileShell bg="#aedbff" height={185} onClick={p.onClick} label={p.title}>
      <Glow src={A.glowPaleA} x={79} y={72} />
      <Glow src={A.glowPaleB} x={80} y={93} />
      <GlassDot />
      <img alt="" src={A.gamepadBody} className="absolute" style={{ left: at(45.5), top: 42.5 }} />
      <img alt="" src={A.gamepadCable} className="absolute" style={{ left: at(65.5), top: 25.5 }} />
      <span className="absolute rounded-[1px] bg-white" style={{ left: at(58), top: 52, width: 6, height: 17 }} />
      <span className="absolute rounded-[1px] bg-white" style={{ left: at(53), top: 58, width: 17, height: 6 }} />
      <span className="absolute rounded-[1px] bg-white" style={{ left: at(75), top: 61, width: 6, height: 6 }} />
      <span className="absolute rounded-[1px] bg-white" style={{ left: at(84), top: 55, width: 5, height: 6 }} />
      <GameText {...p} w={136} />
      {p.done && <DoneBadge />}
    </TileShell>
  )
}

export function BelieveTile(p: TileProps) {
  return (
    <TileShell bg="#165fcf" height={185} onClick={p.onClick} label={p.title}>
      {midGlows}
      <GlassDot />
      <img alt="" src={A.iconCheckRing} className="absolute" style={{ left: 'calc(50% - 42.5px)', top: 16 }} />
      <GameText {...p} w={136} />
      {p.done && <DoneBadge />}
    </TileShell>
  )
}
