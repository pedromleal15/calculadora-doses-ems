import { useState, useCallback, useRef } from 'react'
import './index.css'

// shadcn/ui components
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Label } from './components/ui/label'
import { Input } from './components/ui/input'
import { Select } from './components/ui/select'
import { Separator } from './components/ui/separator'

// Iconsax
import {
  Calculator,
  Weight,
  MedalStar,
  Clock,
  People,
  ShieldTick,
  ArrowRight,
  Health,
  DocumentText,
  Warning2,
  Information,
  Home2,
  Category,
  User,
  Facebook,
  Instagram,
  VideoPlay,
  Heart,
  Timer1,
  Flash,
  StatusUp,
  Note,
  Blend2,
} from 'iconsax-react'

import { cn } from './lib/utils'

// ─── MEDICATION DATABASE ───
const medications = {
  amoxicilina: {
    name: 'Amoxicilina',
    concentrations: [
      { label: '250 mg/5mL', value: 250, mgPerMl: 50 },
      { label: '400 mg/5mL', value: 400, mgPerMl: 80 },
      { label: '500 mg/5mL', value: 500, mgPerMl: 100 },
    ],
    doseRange: '40–90 mg/kg/dia',
    defaultDose: 50,
    frequency: 3,
    duration: '7–10 dias',
  },
  'amoxicilina-clav': {
    name: 'Amoxicilina + Clavulanato',
    concentrations: [
      { label: '250 mg/5mL', value: 250, mgPerMl: 50 },
      { label: '400 mg/5mL', value: 400, mgPerMl: 80 },
    ],
    doseRange: '45–90 mg/kg/dia',
    defaultDose: 45,
    frequency: 2,
    duration: '7–10 dias',
  },
  azitromicina: {
    name: 'Azitromicina',
    concentrations: [
      { label: '200 mg/5mL', value: 200, mgPerMl: 40 },
      { label: '600 mg/15mL', value: 600, mgPerMl: 40 },
    ],
    doseRange: '10 mg/kg/dia (1o dia)',
    defaultDose: 10,
    frequency: 1,
    duration: '3–5 dias',
  },
  cefalexina: {
    name: 'Cefalexina',
    concentrations: [
      { label: '250 mg/5mL', value: 250, mgPerMl: 50 },
      { label: '500 mg/5mL', value: 500, mgPerMl: 100 },
    ],
    doseRange: '25–50 mg/kg/dia',
    defaultDose: 50,
    frequency: 4,
    duration: '7–10 dias',
  },
  cefuroxima: {
    name: 'Cefuroxima',
    concentrations: [
      { label: '250 mg/5mL', value: 250, mgPerMl: 50 },
    ],
    doseRange: '20–30 mg/kg/dia',
    defaultDose: 30,
    frequency: 2,
    duration: '7–10 dias',
  },
  claritromicina: {
    name: 'Claritromicina',
    concentrations: [
      { label: '125 mg/5mL', value: 125, mgPerMl: 25 },
      { label: '250 mg/5mL', value: 250, mgPerMl: 50 },
    ],
    doseRange: '15 mg/kg/dia',
    defaultDose: 15,
    frequency: 2,
    duration: '7–10 dias',
  },
  sulfametoxazol: {
    name: 'Sulfametoxazol + Trimetoprima',
    concentrations: [
      { label: '200+40 mg/5mL', value: 200, mgPerMl: 40 },
      { label: '400+80 mg/5mL', value: 400, mgPerMl: 80 },
    ],
    doseRange: '40 mg/kg/dia (SMX)',
    defaultDose: 40,
    frequency: 2,
    duration: '7–10 dias',
  },
  'amoxicilina-bd': {
    name: 'Amoxicilina BD',
    concentrations: [
      { label: '400 mg/5mL', value: 400, mgPerMl: 80 },
      { label: '875 mg/5mL', value: 875, mgPerMl: 175 },
    ],
    doseRange: '45–90 mg/kg/dia',
    defaultDose: 50,
    frequency: 2,
    duration: '7–10 dias',
  },
}

// ─── STAT CARD ───
function StatCard({ icon: Icon, value, label, color }) {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
  }
  return (
    <div className="flex items-center gap-3">
      <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', colors[color])}>
        <Icon size={22} variant="Bold" />
      </div>
      <div>
        <div className="font-heading text-xl font-bold text-foreground">{value}</div>
        <div className="text-[13px] text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

// ─── RESULT METRIC ───
function ResultMetric({ label, value, unit, color }) {
  const colors = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
  }
  return (
    <div className="rounded-xl border border-border bg-card p-5 text-center">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</div>
      <div className={cn('font-heading text-3xl font-extrabold', colors[color])}>{value}</div>
      <div className="mt-1 text-[13px] text-muted-foreground">{unit}</div>
    </div>
  )
}

// ─── INFO CARD ───
function InfoCard({ icon: Icon, title, description, color }) {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
  }
  return (
    <Card className="border-border/60 transition-all duration-250 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-7">
        <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-xl', colors[color])}>
          <Icon size={24} variant="Bold" />
        </div>
        <h3 className="font-heading text-base font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}

// ─── MAIN APP ───
export default function App() {
  const [weight, setWeight] = useState(10)
  const [manualWeight, setManualWeight] = useState('')
  const [medKey, setMedKey] = useState('')
  const [concIdx, setConcIdx] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [errors, setErrors] = useState({})
  const resultRef = useRef(null)

  const effectiveWeight = manualWeight ? parseFloat(manualWeight) : weight

  const handleSlider = useCallback((e) => {
    setWeight(parseFloat(e.target.value))
    setManualWeight('')
    setErrors((prev) => ({ ...prev, weight: null }))
  }, [])

  const handleManualWeight = useCallback((e) => {
    const v = e.target.value
    setManualWeight(v)
    const num = parseFloat(v)
    if (!isNaN(num) && num >= 1 && num <= 30) {
      setWeight(num)
      setErrors((prev) => ({ ...prev, weight: null }))
    }
  }, [])

  const handleMedChange = useCallback((e) => {
    setMedKey(e.target.value)
    setConcIdx('')
    setResult(null)
  }, [])

  const handleCalculate = useCallback(() => {
    const w = effectiveWeight
    const newErrors = {}

    if (isNaN(w) || w < 1 || w > 30) newErrors.weight = 'Insira um peso entre 1 e 30 kg'
    if (!medKey) newErrors.med = 'Selecione um medicamento'
    if (concIdx === '') newErrors.conc = 'Selecione a concentração'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    setTimeout(() => {
      const med = medications[medKey]
      const conc = med.concentrations[parseInt(concIdx)]
      const dailyMg = med.defaultDose * w
      const perDoseMg = dailyMg / med.frequency
      const perDoseMl = perDoseMg / conc.mgPerMl
      const dailyMl = perDoseMl * med.frequency

      setResult({
        name: med.name,
        concLabel: conc.label,
        doseMl: perDoseMl.toFixed(1),
        frequency: med.frequency,
        dailyMl: dailyMl.toFixed(1),
        weight: w,
        doseRange: med.doseRange,
        duration: med.duration,
      })
      setLoading(false)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }, 500)
  }, [effectiveWeight, medKey, concIdx])

  const med = medKey ? medications[medKey] : null
  const sliderPct = ((weight - 1) / 29) * 100
  const sliderBg = `linear-gradient(90deg, #02BFFF 0%, #2D79FF ${sliderPct}%, #E2E8F0 ${sliderPct}%)`

  return (
    <div className="min-h-screen">
      {/* ═══ NAVBAR ═══ */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-card/95 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <a href="#" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-secondary text-white text-xs font-extrabold">
              ME
            </div>
            <span className="font-heading text-lg font-bold text-secondary">Médico Exponencial</span>
          </a>
          <div className="flex items-center gap-2">
            <a href="#" className="hidden md:inline-flex rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/8 hover:text-secondary">Início</a>
            <a href="#" className="hidden md:inline-flex rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/8 hover:text-secondary">Ferramentas</a>
            <a href="#" className="hidden md:inline-flex rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/8 hover:text-secondary">Conteúdos</a>
            <Button variant="default" size="sm" className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg shadow-md shadow-primary/25">
              <User size={16} />
              Área do Médico
            </Button>
          </div>
        </div>
      </nav>

      {/* ═══ BREADCRUMB ═══ */}
      <div className="mx-auto max-w-5xl px-6">
        <nav className="flex items-center gap-2 py-4 text-[13px] text-muted-foreground" aria-label="Breadcrumb">
          <a href="#" className="transition-colors hover:text-primary flex items-center gap-1">
            <Home2 size={14} />
            Início
          </a>
          <span className="text-border">/</span>
          <a href="#" className="transition-colors hover:text-primary">Ferramentas</a>
          <span className="text-border">/</span>
          <span className="font-semibold text-secondary">Calculadora de Doses</span>
        </nav>
      </div>

      {/* ═══ HERO ═══ */}
      <section className="mx-auto max-w-5xl px-6 pb-8 pt-10 animate-fade-up" style={{ animationFillMode: 'both' }}>
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <Badge className="mb-5 gap-2 border-primary/20 bg-primary/8 text-primary px-4 py-1.5 text-[13px]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              Ferramenta Clínica Gratuita
            </Badge>
            <h1 className="font-heading text-[clamp(32px,5vw,48px)] font-extrabold tracking-tight text-foreground mb-4">
              Calculadora de{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Doses Pediátricas
              </span>
            </h1>
            <p className="max-w-xl text-[clamp(16px,2vw,18px)] text-muted-foreground leading-relaxed">
              Acesse em até <strong className="text-foreground">2 segundos</strong> a posologia indicada de antibiótico para cada paciente de até 30kg. Desenvolvida pela EMS para facilitar sua rotina clínica.
            </p>
          </div>
          {/* Hero Image */}
          <div className="flex-shrink-0 w-full max-w-[340px] md:max-w-[400px]">
            <img
              src="/hero-illustration.png"
              alt="Ilustração 3D de frasco de medicamento pediátrico com estetoscópio e cápsulas"
              className="w-full h-auto drop-shadow-xl"
              width={400}
              height={400}
            />
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <div className="mx-auto max-w-5xl px-6 pb-12">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <StatCard icon={ShieldTick} value="100%" label="Seguro e confiável" color="primary" />
          <StatCard icon={Timer1} value="< 2s" label="Resultado instantâneo" color="secondary" />
          <StatCard icon={People} value="Até 30kg" label="Pacientes pediátricos" color="accent" />
        </div>
      </div>

      {/* ═══ CALCULATOR CARD ═══ */}
      <section className="mx-auto max-w-[900px] px-6 pb-16 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <Card className="overflow-hidden shadow-xl shadow-foreground/5 border-border/40">
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-primary to-secondary px-8 py-7 flex items-center gap-4 text-white">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Calculator size={28} variant="Bold" color="white" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">Calcular Dose</h2>
              <p className="text-sm text-white/80">Antibioticoterapia pediátrica baseada em peso</p>
            </div>
          </div>

          {/* Form Body */}
          <CardContent className="p-8 pt-8">
            {/* Weight Slider */}
            <div className="mb-8">
              <Label htmlFor="weight-slider" className="mb-2">
                <Weight size={16} className="text-muted-foreground" />
                Peso do paciente
                <span className="text-accent">*</span>
              </Label>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="font-heading text-4xl font-extrabold text-secondary">
                  {weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(1)}
                </span>
                <span className="text-base font-semibold text-muted-foreground">kg</span>
              </div>
              <input
                type="range"
                id="weight-slider"
                min="1"
                max="30"
                step="0.5"
                value={weight}
                onChange={handleSlider}
                className="mt-3 w-full"
                style={{ background: sliderBg }}
                aria-label="Peso do paciente em quilogramas"
              />
              <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                <span>1 kg</span>
                <span>15 kg</span>
                <span>30 kg</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Ou digite o peso manualmente abaixo</p>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
              {/* Manual Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight-input">Peso manual</Label>
                <div className="relative">
                  <Weight size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    type="number"
                    id="weight-input"
                    placeholder="Ex: 12.5"
                    min="1"
                    max="30"
                    step="0.1"
                    value={manualWeight}
                    onChange={handleManualWeight}
                    className={cn('pl-10 pr-14', errors.weight && 'border-destructive focus-visible:ring-destructive/20')}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground pointer-events-none">
                    kg
                  </span>
                </div>
                {errors.weight && <p className="text-xs text-destructive">{errors.weight}</p>}
              </div>

              {/* Medicine Select */}
              <div className="space-y-2">
                <Label htmlFor="medicine-select">
                  Medicamento <span className="text-accent">*</span>
                </Label>
                <div className="relative">
                  <Health size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                  <Select
                    id="medicine-select"
                    value={medKey}
                    onChange={handleMedChange}
                    className={cn('pl-10', errors.med && 'border-destructive')}
                  >
                    <option value="" disabled>Selecione o medicamento</option>
                    {Object.entries(medications).map(([key, m]) => (
                      <option key={key} value={key}>{m.name}</option>
                    ))}
                  </Select>
                  <ArrowRight size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-muted-foreground pointer-events-none" />
                </div>
                {errors.med && <p className="text-xs text-destructive">{errors.med}</p>}
              </div>

              {/* Concentration Select */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="concentration-select">
                  Concentração desejada <span className="text-accent">*</span>
                </Label>
                <div className="relative">
                  <Blend2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                  <Select
                    id="concentration-select"
                    value={concIdx}
                    onChange={(e) => setConcIdx(e.target.value)}
                    disabled={!med}
                    className={cn('pl-10', errors.conc && 'border-destructive')}
                  >
                    <option value="" disabled>
                      {med ? 'Selecione a concentração' : 'Selecione o medicamento primeiro'}
                    </option>
                    {med?.concentrations.map((c, i) => (
                      <option key={i} value={i}>{c.label}</option>
                    ))}
                  </Select>
                  <ArrowRight size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-muted-foreground pointer-events-none" />
                </div>
                <p className="text-xs text-muted-foreground">A concentração disponível depende do medicamento selecionado</p>
                {errors.conc && <p className="text-xs text-destructive">{errors.conc}</p>}
              </div>
            </div>

            {/* Calculate Button */}
            <Button
              variant="accent"
              size="lg"
              className="w-full text-[17px] font-bold rounded-xl"
              onClick={handleCalculate}
              disabled={loading}
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
              ) : (
                <>
                  Calcular Dose
                  <ArrowRight size={22} />
                </>
              )}
            </Button>

            {/* ═══ RESULT ═══ */}
            {result && (
              <div ref={resultRef} className="mt-8 animate-result-in" style={{ animationFillMode: 'both' }}>
                {/* Divider */}
                <div className="flex items-center gap-3 mb-6">
                  <Separator className="flex-1" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    Resultado da Posologia
                  </span>
                  <Separator className="flex-1" />
                </div>

                {/* Result Card */}
                <div className="rounded-2xl border-[1.5px] border-secondary/15 bg-gradient-to-br from-primary/4 to-secondary/6 p-7">
                  {/* Med Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white">
                      <Health size={28} variant="Bold" />
                    </div>
                    <div>
                      <div className="font-heading text-xl font-bold text-foreground">{result.name}</div>
                      <div className="text-sm text-muted-foreground">Concentração: {result.concLabel}</div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <ResultMetric label="Dose por tomada" value={result.doseMl} unit="mL" color="primary" />
                    <ResultMetric label="Frequência" value={`${result.frequency}x`} unit="vezes ao dia" color="secondary" />
                    <ResultMetric label="Dose diária total" value={result.dailyMl} unit="mL / dia" color="accent" />
                  </div>

                  {/* Prescription Details */}
                  <div className="mt-5 rounded-xl border border-border bg-card p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                      <DocumentText size={18} className="text-secondary" />
                      Detalhes da prescrição
                    </div>
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
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ═══ INFO CARDS ═══ */}
      <section className="mx-auto max-w-[900px] px-6 pb-16 animate-fade-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <InfoCard
            icon={People}
            title="Para Pediatras"
            description="Otimize seu atendimento com dosagens precisas baseadas em peso para pacientes pediátricos."
            color="primary"
          />
          <InfoCard
            icon={StatusUp}
            title="Base Científica"
            description="Cálculos alinhados às diretrizes atuais de antibioticoterapia pediátrica e bulas aprovadas."
            color="secondary"
          />
          <InfoCard
            icon={ShieldTick}
            title="Desenvolvida pela EMS"
            description="Ferramenta criada para Pediatras, Otorrinos, Clínicos Gerais e médicos da família."
            color="accent"
          />
        </div>
      </section>

      {/* ═══ DISCLAIMER ═══ */}
      <div className="mx-auto max-w-[900px] px-6 pb-16">
        <div className="flex gap-3.5 rounded-xl border border-accent/20 bg-accent/6 p-5 text-[13px] text-muted-foreground leading-relaxed">
          <Warning2 size={20} className="shrink-0 text-accent mt-0.5" variant="Bold" />
          <p>
            Os conteúdos disponibilizados nesta plataforma são de responsabilidade exclusiva de seus autores.
            Esta ferramenta tem caráter auxiliar e não substitui a avaliação clínica individualizada.
            Sempre confirme a prescrição com base na condição do paciente.
          </p>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="flex flex-wrap justify-between gap-8 mb-8">
            <div className="max-w-xs">
              <h4 className="font-heading text-lg font-bold mb-2">Médico Exponencial EMS</h4>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Portal científico voltado a médicos, com conteúdos especializados para apoiar o diagnóstico clínico e a atualização profissional.
              </p>
              <div className="flex gap-3 mt-4">
                {[
                  { icon: Facebook, label: 'Facebook' },
                  { icon: Instagram, label: 'Instagram' },
                  { icon: VideoPlay, label: 'YouTube' },
                ].map(({ icon: Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/8 text-[#94A3B8] transition-all hover:bg-primary hover:text-white hover:-translate-y-0.5"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-semibold mb-3">Ferramentas</h5>
              <div className="space-y-2">
                {['Calculadora de Doses', 'Conteúdos Científicos', 'Atualizações Médicas'].map((t) => (
                  <a key={t} href="#" className="block text-[13px] text-[#94A3B8] transition-colors hover:text-primary">{t}</a>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-semibold mb-3">Legal</h5>
              <div className="space-y-2">
                {['Termos de Uso', 'Política de Privacidade', 'Contato'].map((t) => (
                  <a key={t} href="#" className="block text-[13px] text-[#94A3B8] transition-colors hover:text-primary">{t}</a>
                ))}
              </div>
            </div>
          </div>
          <Separator className="bg-white/8 mb-6" />
          <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#64748B]">
            <span>&copy; 2026 Médico Exponencial EMS. Todos os direitos reservados.</span>
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-white/6 px-3 py-1 text-xs font-semibold text-[#94A3B8]">EMS</span>
              <span className="rounded-md bg-white/6 px-3 py-1 text-xs font-semibold text-[#94A3B8]">Medex</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
