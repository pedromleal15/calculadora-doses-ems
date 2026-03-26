import { useState, useCallback, useRef } from 'react'

// Official shadcn/ui components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
// Select removed — using native <select> for lighter bundle
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// Inline SVG icons — replaces iconsax-react (~290KB → ~8KB)
import {
  Calculator, Weight, ShieldTick, ArrowRight, Health,
  DocumentText, Warning2, Facebook, Instagram,
  VideoPlay, StatusUp, SearchNormal1, Flash,
  Element3, HambergerMenu, Book1, Gift, Briefcase,
  Heart, Blend2, Note, Clock, Timer1, MedalStar,
} from './icons'

// ─── MEDICATION DATABASE ───
const medications = {
  amoxicilina: {
    name: 'Amoxicilina',
    concentrations: [
      { label: '250 mg/5mL', mgPerMl: 50 },
      { label: '400 mg/5mL', mgPerMl: 80 },
      { label: '500 mg/5mL', mgPerMl: 100 },
    ],
    doseRange: '40–90 mg/kg/dia', defaultDose: 50, frequency: 3, duration: '7–10 dias',
  },
  'amoxicilina-clav': {
    name: 'Amoxicilina + Clavulanato',
    concentrations: [
      { label: '250 mg/5mL', mgPerMl: 50 },
      { label: '400 mg/5mL', mgPerMl: 80 },
    ],
    doseRange: '45–90 mg/kg/dia', defaultDose: 45, frequency: 2, duration: '7–10 dias',
  },
  azitromicina: {
    name: 'Azitromicina',
    concentrations: [
      { label: '200 mg/5mL', mgPerMl: 40 },
      { label: '600 mg/15mL', mgPerMl: 40 },
    ],
    doseRange: '10 mg/kg/dia (1o dia)', defaultDose: 10, frequency: 1, duration: '3–5 dias',
  },
  cefalexina: {
    name: 'Cefalexina',
    concentrations: [
      { label: '250 mg/5mL', mgPerMl: 50 },
      { label: '500 mg/5mL', mgPerMl: 100 },
    ],
    doseRange: '25–50 mg/kg/dia', defaultDose: 50, frequency: 4, duration: '7–10 dias',
  },
  cefuroxima: {
    name: 'Cefuroxima',
    concentrations: [{ label: '250 mg/5mL', mgPerMl: 50 }],
    doseRange: '20–30 mg/kg/dia', defaultDose: 30, frequency: 2, duration: '7–10 dias',
  },
  claritromicina: {
    name: 'Claritromicina',
    concentrations: [
      { label: '125 mg/5mL', mgPerMl: 25 },
      { label: '250 mg/5mL', mgPerMl: 50 },
    ],
    doseRange: '15 mg/kg/dia', defaultDose: 15, frequency: 2, duration: '7–10 dias',
  },
  sulfametoxazol: {
    name: 'Sulfametoxazol + Trimetoprima',
    concentrations: [
      { label: '200+40 mg/5mL', mgPerMl: 40 },
      { label: '400+80 mg/5mL', mgPerMl: 80 },
    ],
    doseRange: '40 mg/kg/dia (SMX)', defaultDose: 40, frequency: 2, duration: '7–10 dias',
  },
  'amoxicilina-bd': {
    name: 'Amoxicilina BD',
    concentrations: [
      { label: '400 mg/5mL', mgPerMl: 80 },
      { label: '875 mg/5mL', mgPerMl: 175 },
    ],
    doseRange: '45–90 mg/kg/dia', defaultDose: 50, frequency: 2, duration: '7–10 dias',
  },
}

// ─── FLOATING PARTICLE ───
function Particle({ style }) {
  return (
    <div
      className="absolute rounded-full bg-brand-cyan opacity-20 blur-sm pointer-events-none"
      style={style}
    />
  )
}

// ─── STAT BADGE ───
function StatBadge({ icon: Icon, value, label, iconColor }) {
  return (
    <div className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2.5 md:py-4 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-200 overflow-hidden h-full">
      <div className={cn('flex h-7 w-7 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg md:rounded-xl', iconColor)}>
        <Icon size={14} variant="Bold" color="currentColor" className="text-white md:[&]:size-[20px]" />
      </div>
      <div className="min-w-0">
        <div className="font-heading text-[15px] md:text-xl font-extrabold text-white leading-none tracking-tight">{value}</div>
        <div className="text-[8px] md:text-xs text-white/50 mt-0.5 font-medium leading-snug line-clamp-2">{label}</div>
      </div>
    </div>
  )
}

export default function App() {
  const [weight, setWeight] = useState('')
  const [medKey, setMedKey] = useState('')
  const [concIdx, setConcIdx] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [errors, setErrors] = useState({})
  const resultRef = useRef(null)

  const med = medKey ? medications[medKey] : null

  const handleCalculate = useCallback(() => {
    const w = parseFloat(weight)
    const newErrors = {}
    if (!weight || isNaN(w) || w < 0.1 || w > 30) newErrors.weight = 'Insira um peso válido (até 30 kg)'
    if (!medKey) newErrors.med = 'Selecione um medicamento'
    if (concIdx === '') newErrors.conc = 'Selecione a concentração'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    setTimeout(() => {
      const medication = medications[medKey]
      const conc = medication.concentrations[parseInt(concIdx)]
      const dailyMg = medication.defaultDose * w
      const perDoseMg = dailyMg / medication.frequency
      const perDoseMl = perDoseMg / conc.mgPerMl
      const dailyMl = perDoseMl * medication.frequency

      setResult({
        name: medication.name,
        concLabel: conc.label,
        doseMl: perDoseMl.toFixed(1),
        frequency: medication.frequency,
        dailyMl: dailyMl.toFixed(1),
        weight: w,
        doseRange: medication.doseRange,
        duration: medication.duration,
      })
      setLoading(false)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }, 600)
  }, [weight, medKey, concIdx])

  return (
    <div className="min-h-screen bg-background">

      {/* ═══ NAVBAR ═══ */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Brand */}
          <a href="#" className="flex items-center group">
            <img
              src="/logo-medex.webp"
              alt="Médico Exponencial"
              className="h-8 sm:h-9 w-auto"
            />
          </a>

          {/* Nav Right */}
          <div className="flex items-center gap-3">
            <img
              src="/ems-logo.svg"
              alt="EMS"
              className="hidden sm:block h-7 w-auto"
            />
            <Button
              size="lg"
              className="rounded-full px-5 font-semibold shadow-md hover:shadow-lg transition-all bg-brand-orange hover:bg-brand-orange/90 text-white border-none"
            >
              Entrar
            </Button>
            <div className="hidden md:flex flex-col text-xs text-muted-foreground leading-tight">
              <span>
                ou{' '}
                <a href="#" className="text-brand-blue underline underline-offset-2 font-semibold hover:text-brand-cyan transition-colors">
                  Cadastre-se
                </a>
              </span>
              <span>para acessos exclusivos</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══ SUB-NAVIGATION ═══ */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-1">
            {/* Scrollable nav links */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-1 py-2.5">
                {[
                  { label: 'Educação Médica', icon: Book1 },
                  { label: 'Amostra Grátis', icon: Gift },
                  { label: 'Calculadora de Doses', icon: Calculator, active: true },
                  { label: 'Benefícios', icon: Heart },
                  { label: 'Nossos Produtos', icon: Briefcase },
                ].map(({ label, icon: Icon, active }) => (
                  <a
                    key={label}
                    href="#"
                    className={cn(
                      'flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'text-brand-blue bg-brand-blue/5 font-semibold'
                        : 'text-muted-foreground hover:text-brand-blue hover:bg-brand-blue/5'
                    )}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Search input */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Input
                  placeholder="Buscar"
                  className="h-10 w-48 lg:w-56 rounded-full pl-10 pr-4 bg-muted/50 border-border text-sm font-[Manrope] placeholder:text-muted-foreground/60 placeholder:font-[Manrope]"
                />
                <SearchNormal1 size={16} color="#94a3b8" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SEARCH BAR (mobile only) ═══ */}
      <div className="border-b border-border bg-background md:hidden">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <div className="relative max-w-2xl mx-auto">
            <Input
              placeholder="Buscar"
              className="h-10 rounded-full pl-10 pr-4 bg-muted border-border transition-all font-[Manrope] placeholder:font-[Manrope]"
            />
            <SearchNormal1 size={18} color="#94a3b8" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* ═══ HERO ═══ */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0D2844 0%, #1B3A5C 45%, #0E2F52 100%)' }}
      >
        {/* Animated mesh grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(var(--brand-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--brand-cyan) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Animated wave shapes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 800" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path opacity="0.07" fill="url(#wave-grad)">
            <animate attributeName="d"
              dur="8s" repeatCount="indefinite"
              values="
                M0 450 C200 300, 400 550, 600 400 S1000 250, 1200 380 L1440 450 L1440 800 L0 800 Z;
                M0 420 C250 350, 450 500, 650 380 S1050 300, 1250 420 L1440 480 L1440 800 L0 800 Z;
                M0 460 C180 280, 380 560, 580 410 S980 230, 1180 360 L1440 440 L1440 800 L0 800 Z;
                M0 450 C200 300, 400 550, 600 400 S1000 250, 1200 380 L1440 450 L1440 800 L0 800 Z"
            />
          </path>
          <path opacity="0.05" fill="url(#wave-grad2)">
            <animate attributeName="d"
              dur="10s" repeatCount="indefinite"
              values="
                M0 520 C300 400, 500 600, 720 480 S1100 350, 1440 520 L1440 800 L0 800 Z;
                M0 550 C280 430, 520 580, 740 460 S1120 380, 1440 490 L1440 800 L0 800 Z;
                M0 500 C320 380, 480 620, 700 500 S1080 330, 1440 540 L1440 800 L0 800 Z;
                M0 520 C300 400, 500 600, 720 480 S1100 350, 1440 520 L1440 800 L0 800 Z"
            />
          </path>
          <path opacity="0.03" fill="url(#wave-grad3)">
            <animate attributeName="d"
              dur="12s" repeatCount="indefinite"
              values="
                M0 580 C200 500, 450 650, 700 560 S1050 440, 1440 580 L1440 800 L0 800 Z;
                M0 560 C220 520, 430 630, 680 540 S1030 460, 1440 600 L1440 800 L0 800 Z;
                M0 590 C180 490, 460 660, 710 570 S1060 430, 1440 570 L1440 800 L0 800 Z;
                M0 580 C200 500, 450 650, 700 560 S1050 440, 1440 580 L1440 800 L0 800 Z"
            />
          </path>
          <defs>
            <linearGradient id="wave-grad" x1="0" y1="0" x2="1440" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor="#02BFFF" />
              <stop offset="1" stopColor="#2D79FF" />
            </linearGradient>
            <linearGradient id="wave-grad2" x1="0" y1="400" x2="1440" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2D79FF" />
              <stop offset="1" stopColor="#02BFFF" />
            </linearGradient>
            <linearGradient id="wave-grad3" x1="0" y1="500" x2="1440" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F49D25" />
              <stop offset="1" stopColor="#02BFFF" />
            </linearGradient>
          </defs>
        </svg>

        {/* Gradient orbs — animated (GPU composited) */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none animate-glow-drift-1"
          style={{ background: 'radial-gradient(circle, rgba(2,191,255,0.35) 0%, transparent 70%)', willChange: 'transform, opacity', contain: 'strict' }} />
        <div className="absolute top-10 right-0 w-80 h-80 rounded-full pointer-events-none animate-glow-drift-2"
          style={{ background: 'radial-gradient(circle, rgba(45,121,255,0.37) 0%, transparent 70%)', willChange: 'transform, opacity', contain: 'strict' }} />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full pointer-events-none animate-glow-drift-3"
          style={{ background: 'radial-gradient(circle, rgba(244,157,37,0.25) 0%, transparent 70%)', willChange: 'transform, opacity', contain: 'strict' }} />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full pointer-events-none animate-glow-drift-2"
          style={{ background: 'radial-gradient(circle, rgba(45,121,255,0.12) 0%, transparent 70%)', animationDelay: '-5s', willChange: 'transform, opacity', contain: 'strict' }} />

        {/* Floating particles */}
        <Particle style={{ top: '18%', left: '8%', width: 6, height: 6, animationDelay: '0s' }} />
        <Particle style={{ top: '55%', left: '5%', width: 4, height: 4, animationDelay: '0.6s' }} />
        <Particle style={{ top: '30%', left: '15%', width: 8, height: 8, animationDelay: '1.2s', opacity: 0.12 }} />
        <Particle style={{ top: '70%', right: '10%', width: 5, height: 5, animationDelay: '0.3s' }} />
        <Particle style={{ top: '20%', right: '18%', width: 7, height: 7, animationDelay: '0.9s', opacity: 0.15 }} />
        <Particle style={{ bottom: '15%', left: '25%', width: 4, height: 4, animationDelay: '1.5s' }} />
        <Particle style={{ top: '45%', right: '5%', width: 6, height: 6, animationDelay: '0.4s' }} />

        <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* ── Left: Hero Text ── */}
            <div className="text-center lg:text-left">

              {/* Gratuita badge */}
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 backdrop-blur-sm animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan" />
                </span>
                <span className="text-brand-cyan text-xs font-semibold tracking-wide">Ferramenta Gratuita</span>
              </div>

              {/* Headline */}
              <h1
                className="font-black uppercase text-white leading-[1.05] mb-4 animate-fade-up"
                style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.04em', animationDelay: '0.25s', animationFillMode: 'both' }}
              >
                CALCULADORA<br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(90deg, var(--brand-cyan), var(--brand-blue))' }}
                >
                  DE DOSES
                </span>
              </h1>

              <p className="text-brand-orange text-base md:text-lg font-semibold mb-5 tracking-wide animate-fade-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
                Acesse em até 2 segundos a posologia
              </p>

              <p className="text-white/85 text-sm md:text-base font-medium mb-4 max-w-md mx-auto lg:mx-0 leading-relaxed animate-fade-up" style={{ animationDelay: '0.55s', animationFillMode: 'both' }}>
                Posologia pediátrica em <strong className="text-white">2 segundos</strong>. Dose certa de antibiótico para pacientes de até{' '}
                <strong className="text-white">30kg</strong> — por peso, idade e indicação.
              </p>

              <p className="text-white/55 text-sm max-w-md mx-auto lg:mx-0 leading-relaxed animate-fade-up" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
                Desenvolvida pela <span className="text-white/80 font-semibold">EMS</span> especialmente para
                facilitar a rotina clínica de Pediatras, Otorrinos, Clínicos Gerais e médicos da família.
              </p>

            </div>

            {/* ── Right: Calculator Card ── */}
            <div className="relative animate-fade-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
              {/* Glow behind card — breathing */}
              <div
                className="absolute inset-0 rounded-3xl blur-3xl pointer-events-none -z-10 animate-glow-breathe"
                style={{ background: 'linear-gradient(135deg, rgba(2,191,255,0.5), rgba(45,121,255,0.4))' }}
              />

              <Card className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto shadow-2xl border border-white/20 rounded-3xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.97)' }}>

                {/* Card top accent strip */}
                <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--brand-cyan), var(--brand-blue), var(--brand-orange))' }} />

                <CardHeader className="pt-6 pb-3 px-6">
                  <CardTitle className="text-brand-navy text-xl font-extrabold text-center tracking-tight">
                    Calculadora de Doses
                  </CardTitle>
                  <CardDescription className="text-brand-orange font-semibold text-center text-sm mt-0.5">
                    Peso limite: 30 kg
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-6 pb-6 space-y-4">

                  <Separator />

                  {/* Weight Input */}
                  <div className="space-y-1.5">
                    <Label htmlFor="weight" className="text-sm font-bold text-foreground">
                      Insira o peso em quilogramas
                    </Label>
                    <div className="relative">
                      <Input
                        id="weight"
                        type="number"
                        placeholder="0"
                        min="0"
                        max="30"
                        step="0.1"
                        value={weight}
                        onChange={(e) => { setWeight(e.target.value); setErrors(prev => ({ ...prev, weight: null })) }}
                        className={cn(
                          'h-9 rounded-lg border-border bg-muted pl-3 pr-10 transition-all',
                          parseFloat(weight) > 30 && 'border-brand-orange bg-orange-50/50',
                          errors.weight && parseFloat(weight) <= 30 && 'border-red-400 bg-red-50/50'
                        )}
                      />
                      <Weight size={16} color="currentColor" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    {parseFloat(weight) > 30 && (
                      <p className="flex items-center gap-1 text-xs text-brand-orange font-medium">
                        <Warning2 size={12} color="currentColor" />
                        Valor máximo de 30kg
                      </p>
                    )}
                    {errors.weight && parseFloat(weight) <= 30 && (
                      <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
                        <Warning2 size={12} color="currentColor" />
                        {errors.weight}
                      </p>
                    )}
                  </div>

                  {/* Medicine Select */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-bold text-foreground">
                      Selecione a concentração diária desejada
                    </Label>
                    <select
                      value={medKey}
                      onChange={(e) => { setMedKey(e.target.value); setConcIdx(''); setResult(null); setErrors(prev => ({ ...prev, med: null })) }}
                      className={cn(
                        'w-full h-9 rounded-lg border border-border bg-muted px-3 text-sm transition-all appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 fill=%27%23666%27 viewBox=%270 0 16 16%27%3E%3Cpath d=%27M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 01.753 1.659l-4.796 5.48a1 1 0 01-1.506 0z%27/%3E%3C/svg%3E")] bg-[length:12px] bg-[right_12px_center] bg-no-repeat focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue',
                        errors.med && 'border-red-400 bg-red-50/50'
                      )}
                    >
                      <option value="" disabled>Medicamento</option>
                      {Object.entries(medications).map(([key, m]) => (
                        <option key={key} value={key}>{m.name}</option>
                      ))}
                    </select>
                    {errors.med && (
                      <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
                        <Warning2 size={12} color="currentColor" />
                        {errors.med}
                      </p>
                    )}
                  </div>

                  {/* Concentration Select */}
                  {med && (
                    <div className="space-y-1.5 animate-fade-up" style={{ animationFillMode: 'both' }}>
                      <Label className="text-sm font-bold text-foreground">Concentração</Label>
                      <select
                        value={concIdx}
                        onChange={(e) => { setConcIdx(e.target.value); setErrors(prev => ({ ...prev, conc: null })) }}
                        className={cn(
                          'w-full h-9 rounded-lg border border-border bg-muted px-3 text-sm transition-all appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 fill=%27%23666%27 viewBox=%270 0 16 16%27%3E%3Cpath d=%27M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 01.753 1.659l-4.796 5.48a1 1 0 01-1.506 0z%27/%3E%3C/svg%3E")] bg-[length:12px] bg-[right_12px_center] bg-no-repeat focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue',
                          errors.conc && 'border-red-400 bg-red-50/50'
                        )}
                      >
                        <option value="" disabled>Selecione a concentração</option>
                        {med.concentrations.map((c, i) => (
                          <option key={i} value={String(i)}>{c.label}</option>
                        ))}
                      </select>
                      {errors.conc && (
                        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
                          <Warning2 size={12} color="currentColor" />
                          {errors.conc}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Calculate Button */}
                  <Button
                    className="w-full h-9 text-white font-semibold text-sm rounded-lg gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                    style={{
                      background: loading
                        ? 'linear-gradient(135deg, var(--brand-cyan), var(--brand-blue))'
                        : 'linear-gradient(135deg, var(--brand-cyan) 0%, var(--brand-blue) 60%, #2063DD 100%)',
                      boxShadow: loading ? 'none' : '0 8px 24px rgba(45,121,255,0.45), 0 0 0 0 rgba(244,157,37,0)',
                    }}
                    onClick={handleCalculate}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
                    ) : (
                      <>
                        <Calculator size={20} variant="Bold" color="currentColor" />
                        Calcular Dose
                        <ArrowRight size={18} color="currentColor" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* ── STATS ROW (inside hero) ── */}
        <div className="relative z-10 pb-8 pt-6">
          <div className="mx-auto max-w-3xl px-4 md:px-6">
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="animate-fade-up" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
                <StatBadge
                  icon={Flash}
                  value="< 2s"
                  label="Resultado instantâneo"
                  iconColor="bg-gradient-to-br from-brand-cyan to-brand-blue"
                />
              </div>
              <div className="animate-fade-up" style={{ animationDelay: '0.95s', animationFillMode: 'both' }}>
                <StatBadge
                  icon={Weight}
                  value="30kg"
                  label="Pacientes pediátricos"
                  iconColor="bg-gradient-to-br from-brand-blue to-brand-navy"
                />
              </div>
              <div className="animate-fade-up" style={{ animationDelay: '1.1s', animationFillMode: 'both' }}>
                <StatBadge
                  icon={ShieldTick}
                  value="100%"
                  label="Seguro e confiável"
                  iconColor="bg-gradient-to-br from-brand-orange to-[#E8851A]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(13,40,68,0.5))' }} />
      </section>

      {/* ═══ RESULT ═══ */}
      {result && (
        <section
          ref={resultRef}
          className="mx-auto max-w-3xl px-6 py-12 animate-result-in"
          style={{ animationFillMode: 'both' }}
        >
          {/* Divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent" />
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/25">
              <Note size={14} className="text-brand-cyan" variant="Bold" color="currentColor" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-blue">
                Resultado da Posologia
              </span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent" />
          </div>

          {/* Result card */}
          <Card
            className="shadow-2xl border border-border rounded-3xl overflow-hidden hover:shadow-3xl transition-shadow duration-300"
            style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f0faff 100%)' }}
          >
            {/* Top accent */}
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, var(--brand-cyan), var(--brand-blue), var(--brand-orange))' }} />

            <CardHeader className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg"
                  style={{ background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-blue))' }}
                >
                  <Health size={28} variant="Bold" color="currentColor" className="text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-extrabold text-brand-navy">{result.name}</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-0.5">
                    Concentração: <span className="font-semibold text-brand-blue">{result.concLabel}</span>
                  </CardDescription>
                </div>
                <Badge
                  className="ml-auto text-white text-xs font-bold px-3 py-1 rounded-full hidden sm:flex"
                  style={{ background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-blue))' }}
                >
                  Calculado
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-6 space-y-5">
              {/* Metric cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    label: 'Dose por tomada',
                    value: result.doseMl,
                    unit: 'mL',
                    icon: Clock,
                    gradient: 'from-brand-cyan/10 to-brand-cyan/5',
                    border: 'border-brand-cyan/20',
                    color: 'text-brand-cyan',
                    iconBg: 'bg-brand-cyan/10',
                    iconColor: 'text-brand-cyan',
                  },
                  {
                    label: 'Frequência',
                    value: `${result.frequency}x`,
                    unit: 'vezes ao dia',
                    icon: Timer1,
                    gradient: 'from-brand-blue/10 to-brand-blue/5',
                    border: 'border-brand-blue/20',
                    color: 'text-brand-blue',
                    iconBg: 'bg-brand-blue/10',
                    iconColor: 'text-brand-blue',
                  },
                  {
                    label: 'Dose diária total',
                    value: result.dailyMl,
                    unit: 'mL / dia',
                    icon: StatusUp,
                    gradient: 'from-brand-orange/10 to-brand-orange/5',
                    border: 'border-brand-orange/20',
                    color: 'text-brand-orange',
                    iconBg: 'bg-brand-orange/10',
                    iconColor: 'text-brand-orange',
                  },
                ].map(({ label, value, unit, icon: Icon, gradient, border, color, iconBg, iconColor }) => (
                  <div
                    key={label}
                    className={cn(
                      'flex flex-col items-center text-center rounded-2xl p-5 border bg-gradient-to-b hover:-translate-y-0.5 hover:shadow-md transition-all duration-200',
                      gradient,
                      border
                    )}
                  >
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl mb-3', iconBg)}>
                      <Icon size={18} variant="Bold" color="currentColor" className={iconColor} />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
                    <div className={cn('font-heading text-3xl font-extrabold leading-none', color)}>{value}</div>
                    <div className="mt-1.5 text-xs text-muted-foreground font-medium">{unit}</div>
                  </div>
                ))}
              </div>

              {/* Prescription details */}
              <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
                <CardHeader className="pb-0 pt-4 px-5">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-blue/10">
                      <DocumentText size={15} variant="Bold" color="currentColor" className="text-brand-blue" />
                    </div>
                    Detalhes da prescrição
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 px-5 pb-4">
                  {[
                    ['Peso considerado', `${result.weight} kg`],
                    ['Dose mg/kg/dia', result.doseRange],
                    ['Concentração', result.concLabel],
                    ['Duração sugerida', result.duration],
                  ].map(([label, value], i, arr) => (
                    <div key={label}>
                      <div className="flex items-center justify-between py-2.5 text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-semibold text-foreground">{value}</span>
                      </div>
                      {i < arr.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <div className="flex gap-2.5 rounded-xl bg-amber-50 border border-amber-200/70 px-4 py-3">
                <Warning2 size={16} className="text-amber-500 shrink-0 mt-0.5" variant="Bold" color="currentColor" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Este resultado é uma referência clínica. Sempre avalie individualmente cada paciente
                  e consulte as bulas e diretrizes vigentes antes de prescrever.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* ═══ PARTNER TOOLS ═══ */}
      <section className="py-16 border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-6">
          {/* Section header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20">
              <Element3 size={14} className="text-brand-cyan" variant="Bold" color="currentColor" />
              <span className="text-brand-cyan text-xs font-bold tracking-wide uppercase">Ecossistema</span>
            </div>
            <h3 className="font-heading text-2xl md:text-3xl text-brand-navy leading-snug">
              Conheça nossas{' '}
              <strong className="font-extrabold">ferramentas parceiras para você</strong>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              /* ── ROW 1: Novos cards (acima) ── */
              {
                category: 'Educação Médica',
                brand: 'EMS Academy',
                icon: Book1,
                description: 'Cursos, aulas e conteúdos exclusivos para aprimorar sua prática clínica diária.',
                iconColor: 'from-[#6366F1] to-[#4F46E5]',
                accentColor: '#6366F1',
                buttonGradient: 'linear-gradient(135deg, #6366F1, #4F46E5)',
              },
              {
                category: 'Amostra Grátis',
                brand: 'EMS Amostras',
                icon: Gift,
                description: 'Solicite amostras grátis de medicamentos para conhecer e indicar aos seus pacientes.',
                iconColor: 'from-[#10B981] to-[#059669]',
                accentColor: '#10B981',
                buttonGradient: 'linear-gradient(135deg, #10B981, #059669)',
              },
              {
                category: 'Nossos Produtos',
                brand: 'Portfólio EMS',
                icon: Briefcase,
                description: 'Conheça a linha completa de medicamentos e soluções terapêuticas da EMS.',
                iconColor: 'from-brand-cyan to-brand-blue',
                accentColor: 'var(--brand-blue)',
                buttonGradient: 'linear-gradient(135deg, var(--brand-blue), var(--brand-navy))',
              },
              {
                category: 'Benefícios Exclusivos',
                brand: 'Programa Viva Bem',
                icon: Heart,
                description: 'Descontos especiais em medicamentos para os pacientes que você indicar.',
                iconColor: 'from-[#F43F5E] to-[#E11D48]',
                accentColor: '#F43F5E',
                buttonGradient: 'linear-gradient(135deg, #F43F5E, #E11D48)',
              },
              /* ── ROW 2: Cards originais (abaixo) ── */
              {
                category: 'Prescrição Digital',
                brand: 'mevo',
                icon: DocumentText,
                description: 'Prescreva gratuitamente do seu consultório particular ou de qualquer outro lugar.',
                iconColor: 'from-brand-cyan to-brand-blue',
                accentColor: 'var(--brand-cyan)',
                buttonGradient: 'linear-gradient(135deg, var(--brand-cyan), color-mix(in srgb, var(--brand-cyan) 80%, transparent))',
              },
              {
                category: 'Gestão de clínicas',
                brand: 'santé med',
                icon: StatusUp,
                description: 'Solução completa para Gestão de Clínicas e Consultórios!',
                iconColor: 'from-brand-blue to-brand-navy',
                accentColor: 'var(--brand-blue)',
                buttonGradient: 'linear-gradient(135deg, var(--brand-blue), color-mix(in srgb, var(--brand-blue) 80%, transparent))',
              },
              {
                category: 'Gestão de clínicas e teleconsulta',
                brand: 'Grupo Afya iClinic',
                icon: VideoPlay,
                description: 'Garanta um Atendimento Médico Seguro e Conveniente!',
                iconColor: 'from-brand-orange to-[#E8851A]',
                accentColor: 'var(--brand-orange)',
                buttonGradient: 'linear-gradient(135deg, var(--brand-orange), color-mix(in srgb, var(--brand-orange) 80%, transparent))',
              },
              {
                category: 'Parcelamento para seu paciente',
                brand: 'lucree',
                icon: Blend2,
                description: 'Parcele a consulta de seu paciente e receba em até 1 dia útil!',
                iconColor: 'from-[#2B3A4E] to-[#1a2636]',
                accentColor: '#2B3A4E',
                buttonGradient: 'linear-gradient(135deg, #2B3A4E, #1a2636)',
              },
            ].map(({ category, brand, icon: CardIcon, description, iconColor, accentColor, buttonGradient }) => (
              <Card
                key={brand}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden group"
              >
                {/* Top colored line per card */}
                <div
                  className="h-1 w-full"
                  style={{ background: `linear-gradient(90deg, ${accentColor}, color-mix(in srgb, ${accentColor} 67%, transparent))` }}
                />

                <CardHeader className="pb-2 pt-5 px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div
                        className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                        style={{ color: accentColor }}
                      >
                        {category}
                      </div>
                      <CardTitle
                        className="text-lg font-extrabold text-foreground capitalize"
                      >
                        {brand}
                      </CardTitle>
                    </div>
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br',
                        iconColor
                      )}
                    >
                      <CardIcon size={18} variant="Bold" color="currentColor" className="text-white" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-5 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </CardContent>

                <CardFooter className="px-5 pb-5 pt-0 border-t-0 bg-transparent">
                  <Button
                    className="w-full rounded-lg h-9 text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg gap-2"
                    style={{ background: buttonGradient }}
                  >
                    Quero saber mais
                    <ArrowRight size={15} color="currentColor" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-brand-navy text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          {/* Top row */}
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-blue))' }}>
                <Health size={18} variant="Bold" color="currentColor" className="text-white" />
              </div>
              <span className="font-heading text-lg font-extrabold tracking-wide leading-tight">
                MÉDICO<br />EXPONENCIAL
              </span>
            </div>

            {/* Right: Badge + Socials */}
            <div className="flex items-center gap-6">
              <img
                src="/ems-logo.svg"
                alt="EMS"
                loading="lazy"
                decoding="async"
                className="h-10 w-auto"
              />
              <div className="flex gap-3">
                {[Facebook, Instagram, VideoPlay].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
                    aria-label="Social"
                  >
                    <Icon size={17} color="currentColor" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <Separator className="bg-white/15 mb-6" />

          {/* Disclaimer */}
          <p className="text-white/55 text-xs text-center leading-relaxed mb-4 max-w-3xl mx-auto">
            Os conteúdos disponibilizados nesta plataforma são de responsabilidade exclusiva de seus
            autores, sendo a EMS apenas intermediadora para sua divulgação, não tendo responsabilidade
            sobre o conteúdo técnico criado pelos autores.
          </p>
          <p className="text-white/35 text-xs text-center">
            &copy; 2022 Médico Exponencial EMS. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
