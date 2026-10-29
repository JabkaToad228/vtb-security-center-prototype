import { A } from '../assets'
import { Glow } from './kit'

/** Синий баннер-итог из Frame 21 («Деньги не списаны»). */
export function OutcomeBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative h-[63px] overflow-hidden rounded-[10px] bg-brand text-white">
      <Glow src={A.glowBanner} x={19.57} y={38.06} rotate={51.09} />
      <Glow src={A.glowBanner} x={47.57} y={49.06} rotate={51.09} />
      <Glow src={A.glowBanner} x="calc(100% - 17.43px)" y={14.06} rotate={51.09} />
      <Glow src={A.glowBanner} x="calc(100% - 45.43px)" y={0.06} rotate={51.09} />
      <img alt="" src={A.iconShieldBanner} className="absolute left-[-2px] top-[-3px] size-[70px]" />
      <div className="absolute left-[69px] top-[12px] text-t16 font-bold">{title}</div>
      <div className="absolute left-[69px] top-[32px] text-t14">{subtitle}</div>
    </div>
  )
}
