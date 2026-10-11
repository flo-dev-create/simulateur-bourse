import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  PiggyBank,
  ShieldCheck,
  ArrowUpRight,
  Info,
  Calendar,
  Wallet,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Scale,
  RefreshCw,
  Bookmark
} from 'lucide-react';

/**
 * Calcule l'épargne avec intérêts composés et versements mensuels
 */
const calculateInvestment = (initial, monthly, annualRatePct, years, taxRatePct) => {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;

  let gross = initial;
  if (r > 0) {
    gross = initial * Math.pow(1 + r, n) + monthly * ((Math.pow(1 + r, n) - 1) / r);
  } else {
    gross = initial + monthly * n;
  }

  const invested = initial + monthly * n;
  const gain = Math.max(0, gross - invested);
  const tax = gain * (taxRatePct / 100);
  const net = gross - tax;

  return {
    gross: Math.round(gross),
    invested: Math.round(invested),
    gain: Math.round(gain),
    tax: Math.round(tax),
    net: Math.round(net)
  };
};

const formatEuro = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 shadow-2xl text-xs space-y-2 min-w-[240px]">
        <div className="font-semibold text-slate-200 border-b border-slate-700/80 pb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            Année {label}
          </span>
          <span className="text-slate-400 font-normal">
            Investi : {formatEuro(payload[0]?.payload?.invested || 0)}
          </span>
        </div>
        <div className="space-y-1.5 pt-0.5">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-slate-100">{formatEuro(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [initialCapital, setInitialCapital] = useState(10000);
  const [monthlyDeposit, setMonthlyDeposit] = useState(250);
  const [years, setYears] = useState(20);
  const [spRate, setSpRate] = useState(10.4);
  const [cacRate, setCacRate] = useState(6.8);
  const [showTaxExplanation, setShowTaxExplanation] = useState(false);
  const [viewTable, setViewTable] = useState(false);

  const PEA_TAX = 17.2;
  const CTO_TAX = 30.0;

  const { chartData, finalStats, milestones } = useMemo(() => {
    const data = [];
    const milestoneSteps = [5, 10, 15, 20, 25, 30].filter((step) => step <= years);
    if (!milestoneSteps.includes(years)) milestoneSteps.push(years);

    for (let t = 0; t <= years; t++) {
      const spPea = calculateInvestment(initialCapital, monthlyDeposit, spRate, t, PEA_TAX);
      const spCto = calculateInvestment(initialCapital, monthlyDeposit, spRate, t, CTO_TAX);
      const cacPea = calculateInvestment(initialCapital, monthlyDeposit, cacRate, t, PEA_TAX);

      data.push({
        year: t,
        invested: spPea.invested,
        spPeaNet: spPea.net,
        spCtoNet: spCto.net,
        cacPeaNet: cacPea.net,
        spGross: spPea.gross,
        cacGross: cacPea.gross
      });
    }

    const finalSpPea = calculateInvestment(initialCapital, monthlyDeposit, spRate, years, PEA_TAX);
    const finalSpCto = calculateInvestment(initialCapital, monthlyDeposit, spRate, years, CTO_TAX);
    const finalCacPea = calculateInvestment(initialCapital, monthlyDeposit, cacRate, years, PEA_TAX);

    const taxSavedOnSp = finalSpCto.tax - finalSpPea.tax;
    const spOutperformance = finalSpPea.net - finalCacPea.net;

    const milestonesData = milestoneSteps.map((step) => {
      const spP = calculateInvestment(initialCapital, monthlyDeposit, spRate, step, PEA_TAX);
      const spC = calculateInvestment(initialCapital, monthlyDeposit, spRate, step, CTO_TAX);
      const cacP = calculateInvestment(initialCapital, monthlyDeposit, cacRate, step, PEA_TAX);
      return {
        year: step,
        invested: spP.invested,
        spPea: spP.net,
        spCto: spC.net,
        cacPea: cacP.net,
        taxGain: spC.tax - spP.tax
      };
    });

    return {
      chartData: data,
      finalStats: {
        invested: finalSpPea.invested,
        spPea: finalSpPea,
        spCto: finalSpCto,
        cacPea: finalCacPea,
        taxSavedOnSp,
        spOutperformance
      },
      milestones: milestonesData
    };
  }, [initialCapital, monthlyDeposit, years, spRate, cacRate]);

  const resetDefaults = () => {
    setInitialCapital(10000);
    setMonthlyDeposit(200);
    setYears(20);
    setSpRate(10.4);
    setCacRate(6.8);
  };

  const totalInvested = finalStats.invested;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 lg:p-8 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background radial effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Simulateur Patrimonial & Fiscalité FR
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              S&P 500 <span className="text-slate-500 text-xl font-normal">vs</span> CAC 40
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 ml-2">
                (PEA vs CTO)
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Projetez vos gains nets réels après déduction de la fiscalité française : 
              <span className="text-emerald-400 font-medium"> 17,2 % sur PEA</span> (après 5 ans) vs 
              <span className="text-amber-400 font-medium"> 30 % Flat Tax sur CTO</span>.
            </p>
          </div>

          <button
            onClick={resetDefaults}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Réinitialiser valeurs historiques
          </button>
        </header>

        {/* Grille des 4 cartes KPI */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Carte 1 : S&P 500 PEA */}
          <div className="bg-slate-900/80 border border-indigo-900/40 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Bookmark className="w-4 h-4" /> Option Optimale
                </span>
                <span className="text-[11px] font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/50 px-2 py-0.5 rounded-full">
                  Net -17,2%
                </span>
              </div>
              <div className="text-xs text-slate-400 font-medium mb-1">S&P 500 en PEA</div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {formatEuro(finalStats.spPea.net)}
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Plus-value nette :</span>
                <span className="text-emerald-400 font-semibold">+{formatEuro(finalStats.spPea.net - totalInvested)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Impôt prélevé (17,2%) :</span>
                <span className="text-rose-400 font-medium">-{formatEuro(finalStats.spPea.tax)}</span>
              </div>
            </div>
          </div>

          {/* Carte 2 : S&P 500 CTO */}
          <div className="bg-slate-900/80 border border-amber-900/30 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Wallet className="w-4 h-4" /> Courtier Étranger
                </span>
                <span className="text-[11px] font-medium bg-amber-950/80 text-amber-300 border border-amber-800/50 px-2 py-0.5 rounded-full">
                  Flat Tax 30%
                </span>
              </div>
              <div className="text-xs text-slate-400 font-medium mb-1">S&P 500 en CTO (ex. DEGIRO)</div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {formatEuro(finalStats.spCto.net)}
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Plus-value nette :</span>
                <span className="text-emerald-400 font-semibold">+{formatEuro(finalStats.spCto.net - totalInvested)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Impôt Flat tax (30%) :</span>
                <span className="text-rose-400 font-medium">-{formatEuro(finalStats.spCto.tax)}</span>
              </div>
            </div>
          </div>

          {/* Carte 3 : CAC 40 PEA */}
          <div className="bg-slate-900/80 border border-sky-900/30 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Scale className="w-4 h-4" /> Indice Français
                </span>
                <span className="text-[11px] font-medium bg-sky-950/80 text-sky-300 border border-sky-800/50 px-2 py-0.5 rounded-full">
                  Net -17,2%
                </span>
              </div>
              <div className="text-xs text-slate-400 font-medium mb-1">CAC 40 GR en PEA</div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {formatEuro(finalStats.cacPea.net)}
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Plus-value nette :</span>
                <span className="text-emerald-400 font-semibold">+{formatEuro(finalStats.cacPea.net - totalInvested)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Impôt prélevé (17,2%) :</span>
                <span className="text-rose-400 font-medium">-{formatEuro(finalStats.cacPea.tax)}</span>
              </div>
            </div>
          </div>

          {/* Carte 4 : Bonus Fiscal PEA */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" /> Bonus Fiscal PEA
                </span>
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                  Économie nette
                </span>
              </div>
              <div className="text-xs text-slate-400 font-medium mb-1">Économie d'impôt (PEA vs CTO)</div>
              <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                +{formatEuro(finalStats.taxSavedOnSp)}
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-emerald-900/40 text-xs flex justify-between items-center">
              <span className="text-slate-400">Total injecté :</span>
              <span className="text-white font-semibold">{formatEuro(totalInvested)}</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-4 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <PiggyBank className="w-5 h-5 text-indigo-400" />
              Paramètres de simulation
            </h2>

            {/* Slider 1: Capital Initial */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Montant initial
                </label>
                <span className="font-bold text-indigo-300 text-sm">{formatEuro(initialCapital)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={initialCapital}
                onChange={(e) => setInitialCapital(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 €</span>
                <span>50 000 €</span>
                <span>100 000 €</span>
              </div>
            </div>

            {/* Slider 2: Versement Mensuel */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-slate-400" /> Épargne mensuelle (DCA)
                </label>
                <span className="font-bold text-indigo-300 text-sm">{formatEuro(monthlyDeposit)} / mois</span>
              </div>
              <input
                type="range"
                min="0"
                max="2500"
                step="50"
                value={monthlyDeposit}
                onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 €</span>
                <span>1 000 €</span>
                <span>2 500 €</span>
              </div>
            </div>

            {/* Slider 3: Horizon */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Horizon d'investissement
                </label>
                <span className="font-bold text-indigo-300 text-sm">{years} ans</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>5 ans (seuil PEA)</span>
                <span>20 ans</span>
                <span>40 ans</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Hypothèses de rendement brut (TR)
              </div>

              {/* Slider 4: Rendement S&P 500 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-medium flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    S&P 500 TR annualisé
                  </label>
                  <span className="font-bold text-indigo-400">{spRate.toFixed(1)} % / an</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="16"
                  step="0.2"
                  value={spRate}
                  onChange={(e) => setSpRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Slider 5: Rendement CAC 40 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-medium flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    CAC 40 GR annualisé
                  </label>
                  <span className="font-bold text-sky-400">{cacRate.toFixed(1)} % / an</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="14"
                  step="0.2"
                  value={cacRate}
                  onChange={(e) => setCacRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">Rendements historiques (20+ ans) :</strong> Le S&P 500 TR a historiquement produit ~10,4 %/an en euros, contre ~6,8 %/an pour le CAC 40 GR.
              </div>
            </div>
          </div>

          {/* Chart Column */}
          <div className="lg:col-span-8 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Trajectoires comparées nettes d'impôt
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Montants nets réels après déduction fiscale en cas de rachat à l'année N
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setViewTable(!viewTable)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  {viewTable ? 'Voir Graphique' : 'Voir Tableau Jalons'}
                </button>
              </div>
            </div>

            {!viewTable ? (
              <div className="h-[400px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpPea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorSpCto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorCacPea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                    <XAxis
                      dataKey="year"
                      stroke="#94a3b8"
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `An ${v}`}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
                      width={55}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
                    />

                    {/* S&P 500 PEA */}
                    <Area
                      type="monotone"
                      dataKey="spPeaNet"
                      name="S&P 500 Net (PEA -17,2%)"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorSpPea)"
                    />

                    {/* S&P 500 CTO */}
                    <Area
                      type="monotone"
                      dataKey="spCtoNet"
                      name="S&P 500 Net (CTO -30%)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      fillOpacity={1}
                      fill="url(#colorSpCto)"
                    />

                    {/* CAC 40 PEA */}
                    <Area
                      type="monotone"
                      dataKey="cacPeaNet"
                      name="CAC 40 Net (PEA -17,2%)"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCacPea)"
                    />

                    {/* Versements */}
                    <Area
                      type="monotone"
                      dataKey="invested"
                      name="Total versements (Capital brut)"
                      stroke="#64748b"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      fill="transparent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Horizon</th>
                      <th className="py-2.5 px-3">Versements</th>
                      <th className="py-2.5 px-3 text-indigo-400">S&P 500 PEA</th>
                      <th className="py-2.5 px-3 text-amber-400">S&P 500 CTO</th>
                      <th className="py-2.5 px-3 text-sky-400">CAC 40 PEA</th>
                      <th className="py-2.5 px-3 text-emerald-400">Gain Fiscal PEA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {milestones.map((m) => (
                      <tr key={m.year} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 font-sans font-semibold text-slate-200">
                          {m.year} ans
                        </td>
                        <td className="py-3 px-3 text-slate-400">{formatEuro(m.invested)}</td>
                        <td className="py-3 px-3 text-indigo-300 font-bold">{formatEuro(m.spPea)}</td>
                        <td className="py-3 px-3 text-amber-300">{formatEuro(m.spCto)}</td>
                        <td className="py-3 px-3 text-sky-300">{formatEuro(m.cacPea)}</td>
                        <td className="py-3 px-3 text-emerald-400 font-bold">
                          +{formatEuro(m.taxGain)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Quick takeaway bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-slate-800/80 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Surperformance S&P 500 vs CAC 40 (PEA) :</span>
                <span className="text-emerald-400 font-bold">+{formatEuro(finalStats.spOutperformance)}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Écart fiscal PEA vs CTO (S&P 500) :</span>
                <span className="text-indigo-400 font-bold">+{formatEuro(finalStats.taxSavedOnSp)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Explications */}
        <section className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <button
            onClick={() => setShowTaxExplanation(!showTaxExplanation)}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Comprendre la fiscalité française appliquée aux investissements
                </h3>
                <p className="text-xs text-slate-400">
                  Comment sont calculés les impôts sur PEA vs CTO (règle des 5 ans, ETF synthétiques)
                </p>
              </div>
            </div>
            <div className="text-slate-400">
              {showTaxExplanation ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          {showTaxExplanation && (
            <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-950/50 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 leading-relaxed">
              <div className="space-y-2">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                  <ArrowUpRight className="w-4 h-4" /> 1. Le PEA (Plan d'Épargne en Actions)
                </h4>
                <p>
                  <strong>Exonération après 5 ans :</strong> Tout retrait effectué après les 5 ans du PEA est totalement exonéré d'impôt sur le revenu (12,8%). Seuls les <strong>prélèvements sociaux de 17,2%</strong> s'appliquent sur la quote-part de gain retirée.
                </p>
                <p>
                  <strong>Bulle fiscale :</strong> Tant que l'argent reste dans le PEA, les arbitrages et ventes ne déclenchent <strong>aucune imposition</strong>.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
                  <ArrowUpRight className="w-4 h-4" /> 2. Le CTO (Compte-Titres Ordinaire)
                </h4>
                <p>
                  <strong>La Flat Tax (30%) :</strong> Applicable chez les courtiers comme DEGIRO ou Trade Republic. Chaque plus-value est taxée à 12,8% d'impôt + 17,2% de prélèvements sociaux (PFU), quelle que soit la durée de détention.
                </p>
                <p>
                  <strong>Déclaration 3916 :</strong> Les courtiers domiciliés hors de France (ex. DEGIRO aux Pays-Bas/Allemagne) doivent obligatoirement être déclarés chaque année au fisc sous peine d'amende (1 500 € par compte).
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-indigo-400 flex items-center gap-1.5 text-sm">
                  <ArrowUpRight className="w-4 h-4" /> 3. S&P 500 américain dans un PEA ?
                </h4>
                <p>
                  <strong>La réplication synthétique (Swap) :</strong> Le PEA exige 75% d'actions européennes. Les émetteurs (Amundi, BNP) achètent ces actions UE et échangent leur performance contre celle du S&P 500 américain via un contrat d'échange légal.
                </p>
                <p>
                  Vous profitez ainsi du dynamisme des géants américains tout en conservant le bouclier fiscal du PEA.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-900">
          Simulateur indicatif à des fins pédagogiques. Les performances passées ne préjugent pas des performances futures.
        </footer>
      </div>
    </div>
  );
}