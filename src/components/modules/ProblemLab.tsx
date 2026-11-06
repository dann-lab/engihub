/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub Community Problem Lab
 * Senior COREN-grade engineering mentor solving local Nigerian challenges.
 * Naira BEME budgeting, feasibility score, safety warnings, and moderated solutions library.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { callNetlifyAI, FALLBACK_AI_ERROR } from '../../services/apiClient';
import {
  CommunityProblemSolution,
  EngineeringField,
  EngineeringSolutionOption
} from '../../types';
import { MarkdownView } from '../MarkdownView';
import { Skeleton } from '../common/Skeleton';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ThumbsUp,
  Flag,
  Share2,
  Briefcase,
  Search,
  Filter,
  Trash2,
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProblemLabProps {
  onSendToPortfolio: (solution: CommunityProblemSolution) => void;
}

const TEMPLATE_CHALLENGES = [
  {
    title: 'DC-Bus Solar Microgrid for Off-Campus Student Hostels',
    location: 'FUTA South Gate / Akure, Ondo State',
    context: 'Daily 16-hour distribution feeder blackouts force students to run generators at ₦1,200/litre of petrol, damaging laptops with voltage spikes.',
    constraints: 'Must utilize locally procurable Monocrystalline panels, LiFePO4 cells, and buck regulators from Alaba/Ladipo markets.',
    field: 'electrical' as EngineeringField
  },
  {
    title: 'Mechanical Toggle Press for Cassava Mash Dewatering',
    location: 'Ibarapa / Oyo State',
    context: 'Traditional hydraulic bottle jack screw presses leak contaminated oil into cassava mash and take 3 days to ferment and press water.',
    constraints: 'Pure mechanical advantage with SS304 food-grade perforated cage and channel iron welded locally.',
    field: 'mechanical' as EngineeringField
  },
  {
    title: 'IoT Poultry Climate & Ammonia Exhaust Controller',
    location: 'Ibadan / Oyo State',
    context: 'High ambient heat stress (>36°C) and ammonia gas buildup trigger 25% broiler flock mortality during dry season heat waves.',
    constraints: 'ESP32 microcontroller, DHT22 sensors, MQ-137 gas probe, and 12V automotive radiator relay switching.',
    field: 'computer' as EngineeringField
  },
  {
    title: 'Stormwater Silt-Trap and Permeable Infiltration Pavers',
    location: 'Lekki / Ajah, Lagos State',
    context: 'Recurrent flash floods inundate roadside drains within 20 minutes of coastal rain, washing road shoulders and causing dampness.',
    constraints: 'Reclaimed plastic aggregate and standard gravel filtration mix design with local roadside casting.',
    field: 'civil' as EngineeringField
  },
  {
    title: 'Solar-Powered Borehole Pumping & Overhead Tank Network',
    location: 'Nsukka Community / Enugu State',
    context: 'Irregular public municipal water supply leaves 5,000 community members dependent on tanker water at exorbitant cost.',
    constraints: 'Submersible 2.2kW helical rotor pump, 15m dynamic head, MPPT drive, and overhead gravity distribution manifold.',
    field: 'civil' as EngineeringField
  },
  {
    title: 'Prepaid Energy Meter Bypass & Anti-Tamper Detection Module',
    location: 'Alaba / Ojo, Lagos State',
    context: 'Neutral-loop bypass and phase shunting cause 40% commercial distribution losses and transformer phase overload burnouts.',
    constraints: 'Split-core current transformer (CT), ADE7753 energy measurement IC, and encrypted RF transmission.',
    field: 'electrical' as EngineeringField
  },
  {
    title: 'Continuous Flow Biodigester for Abattoir Waste & Cooking Gas',
    location: 'Bodija Market / Ibadan, Oyo State',
    context: 'Unprocessed slaughterhouse blood and rumen slurry pollute waterways, while vendors burn expensive firewood producing toxic smoke.',
    constraints: 'Fixed-dome masonry digester with slurry agitator, H2S iron-sponge filter, and low-pressure gas storage bladder.',
    field: 'chemical' as EngineeringField
  },
  {
    title: 'Automated Palm Oil Expeller with Local Pre-Heating Chamber',
    location: 'Oredo / Benin City, Edo State',
    context: 'Manual pounding of sterilized palm fruit yields only 12% extraction with severe physical drudgery and high residual oil in fiber.',
    constraints: 'Worm screw press fabricated with mild steel shaft, hard-facing electrode overlay, and diesel/single-phase electric motor drive.',
    field: 'mechanical' as EngineeringField
  },
  {
    title: 'Solar Cold-Room with Thermal Ice Storage for Fish Preservation',
    location: 'Makurdi / Benue State',
    context: 'Catfish and tilapia farmers lose up to 35% of harvested fresh fish before reaching Jos and Abuja markets due to zero grid cold-chain.',
    constraints: 'Phase-change thermal brine ice bank, 24V DC hermetic compressor, and polyurethane insulated sandwich panels.',
    field: 'agricultural' as EngineeringField
  },
  {
    title: 'Pure Sine Wave Dual-Conversion Inverter with LiFePO4 BMS',
    location: 'Computer Village / Ikeja, Lagos State',
    context: 'Cheap square-wave inverters hum, overheat laptop chargers and fan motors, and kill lead-acid batteries within 8 months.',
    constraints: 'SPWM microcontroller modulation, toroidal ferrite transformer, and active 16S battery management integration.',
    field: 'electrical' as EngineeringField
  },
  {
    title: 'GSM Telemetry Smart Water Meter with Solenoid Cut-Off',
    location: 'Samaru / Zaria, Kaduna State',
    context: 'Unmetered shared hostel taps cause massive water wastage, tank dry-runs, and burnt water pump coils.',
    constraints: 'ESP32 / SIM800L module, pulse-output hall flow sensor, and bistable 12V latching solenoid valve.',
    field: 'computer' as EngineeringField
  },
  {
    title: 'Solar Powered Rice De-stoner and Polisher',
    location: 'Abakaliki / Ebonyi State',
    context: 'Local brown rice fetches 40% lower market price due to grit and stone contamination from earthen drying floors.',
    constraints: 'Vibratory screen classifier, aspirator blower ducting, and 2.5 HP single-phase motor with solar VFD.',
    field: 'agricultural' as EngineeringField
  },
  {
    title: 'Mini-Hydro Run-of-River Pelton Turbine',
    location: 'Obudu / Cross River State',
    context: 'High elevation waterfall (42m head) flows unused while hillside clinic runs a noisy 2kVA generator with erratic fuel supply.',
    constraints: 'Cast bronze/aluminum Pelton runner buckets, mild steel nozzle needle valve, and 3kVA permanent magnet alternator.',
    field: 'mechanical' as EngineeringField
  },
  {
    title: 'Waste Plastic Pyrolysis Unit for Diesel/Kerosene Fuel Distillation',
    location: 'Port Harcourt / Rivers State',
    context: 'Accumulated low-density polyethylene (LDPE) waste chokes drainage canals while community fishing boats struggle with high fuel prices.',
    constraints: 'Mild steel batch retort reactor with vacuum safety valve, reflux condensing coil, and carbon black separator.',
    field: 'chemical' as EngineeringField
  },
  {
    title: 'Passive Zeer-Pot Evaporative Cooling Chamber for Produce',
    location: 'Dawanau / Kano Municipal, Kano State',
    context: 'Post-harvest tomatoes and peppers experience 40% rot within 48 hours in hot Sahelian heat without cold storage.',
    constraints: 'Double-walled terracotta clay with wet river sand packing; zero electricity consumption.',
    field: 'agricultural' as EngineeringField
  },
  {
    title: 'Local Sand Casting Foundry for Aluminum Pump Impellers',
    location: 'Ajaokuta / Kogi State',
    context: 'Imported irrigation pump impellers cost over ₦65,000 with months of shipping downtime when worn by silt erosion.',
    constraints: 'Clay-bonded green sand molding, scrap automotive piston aluminum, and waste-engine-oil burner furnace.',
    field: 'materials' as EngineeringField
  }
];

export const ProblemLab: React.FC<ProblemLabProps> = ({ onSendToPortfolio }) => {
  const { currentUser, userProfile, updateProfileData, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'solver' | 'library'>('solver');

  // Input states
  const [problemTitle, setProblemTitle] = useState(TEMPLATE_CHALLENGES[0].title);
  const [localContext, setLocalContext] = useState(TEMPLATE_CHALLENGES[0].context);
  const [stateOrRegion, setStateOrRegion] = useState(TEMPLATE_CHALLENGES[0].location);
  const [constraints, setConstraints] = useState(TEMPLATE_CHALLENGES[0].constraints);
  const [selectedField, setSelectedField] = useState<EngineeringField>('electrical');

  // Active solution
  const [currentSolution, setCurrentSolution] = useState<CommunityProblemSolution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [publishStatus, setPublishStatus] = useState<'idle' | 'success'>('idle');

  // Community Library
  const [librarySolutions, setLibrarySolutions] = useState<CommunityProblemSolution[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fieldFilter, setFieldFilter] = useState<string>('all');
  const [reportedIds, setReportedIds] = useState<string[]>([]);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const items = await firestoreService.getCommunitySolutions();
      setLibrarySolutions(items);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async () => {
    if (!problemTitle.trim() || !localContext.trim() || !currentUser) return;
    setIsLoading(true);
    setError('');
    setPublishStatus('idle');

    try {
      const data = await callNetlifyAI<any>({
        module: 'problemlab',
        problemTitle,
        localContext,
        stateOrRegion,
        constraints,
        field: selectedField,
        lowDataMode: userProfile?.lowDataMode || false
      });

      const selectedIndex = typeof data.selectedSolutionIndex === 'number' ? data.selectedSolutionIndex : 0;
      const recSol = data.threeSolutions?.[selectedIndex] || data.threeSolutions?.[0] || data.solutionOptions?.[0];
      const selectedTitle = data.selectedSolutionTitle || recSol?.title || 'Engineered Recommended Solution';

      const solutionOptions = Array.isArray(data.solutionOptions) && data.solutionOptions.length > 0
        ? data.solutionOptions
        : Array.isArray(data.threeSolutions)
          ? data.threeSolutions.map((s: any) => ({
              title: s.title || 'Alternative Solution',
              type: s.type || 'Engineering Alternative',
              description: s.description || '',
              pros: Array.isArray(s.pros) ? s.pros : ['Locally viable'],
              cons: Array.isArray(s.cons) ? s.cons : ['Requires capital']
            }))
          : [
              {
                title: selectedTitle,
                type: 'Direct Implementation',
                description: data.breakdown || data.bestSolutionDesign || 'Comprehensive engineering solution design.',
                pros: ['Locally viable', 'Uses standard Nigerian market parts'],
                cons: ['Requires careful installation']
              }
            ];

      const bemeEstimate = Array.isArray(data.bemeEstimate) && data.bemeEstimate.length > 0
        ? data.bemeEstimate
        : Array.isArray(data.materialsAndBEME)
          ? data.materialsAndBEME.map((m: any) => ({
              item: m.item || 'Material Item',
              quantity: m.quantity || '1 lot',
              unitRateNaira: Number(m.unitRateNaira || m.estimatedUnitCostNaira || 0),
              totalNaira: Number(m.totalNaira || m.estimatedTotalCostNaira || 0),
              localSource: m.localSource || 'Local Market'
            }))
          : [];

      const costScore = Number(data.feasibility?.costScore ?? data.feasibilityScores?.costScore ?? 80);
      const difficultyScore = Number(data.feasibility?.difficultyScore ?? data.feasibilityScores?.difficultyScore ?? 82);
      const impactScore = Number(data.feasibility?.impactScore ?? data.feasibilityScores?.impactScore ?? 92);
      const sustainability = Number(data.feasibility?.sustainability ?? data.feasibilityScores?.sustainabilityScore ?? 85);
      const overallScore = Number(data.feasibility?.overallScore ?? Math.round((costScore + difficultyScore + impactScore + sustainability) / 4));

      const full: CommunityProblemSolution = {
        ...data,
        id: `sol_${Date.now()}`,
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || 'Engineering Student',
        authorUniversity: userProfile?.university || 'Nigerian University',
        field: selectedField,
        problemTitle: problemTitle,
        localContext: localContext,
        stateOrRegion: stateOrRegion,
        breakdown: data.breakdown || data.bestSolutionDesign || 'Technical breakdown of problem root causes and governing failure points.',
        rootCauses: Array.isArray(data.rootCauses) && data.rootCauses.length > 0 ? data.rootCauses : ['Material fatigue from unmitigated vibration', 'Inadequate thermal protection under high ambient temperatures'],
        solutionOptions,
        selectedSolutionTitle: selectedTitle,
        governingFormulas: data.governingFormulas || '$$P = \\frac{W}{t}$$',
        sampleCalculations: data.sampleCalculations || 'Calculations sized for standard Nigerian operating conditions.',
        materialsList: Array.isArray(data.materialsList) ? data.materialsList : bemeEstimate.map((b: any) => b.item),
        bemeEstimate,
        totalEstimatedCostNaira: Number(data.totalEstimatedCostNaira) || bemeEstimate.reduce((acc: number, b: any) => acc + (Number(b.totalNaira) || 0), 0) || 150000,
        safetyAlerts: Array.isArray(data.safetyAlerts) && data.safetyAlerts.length > 0 ? data.safetyAlerts : (data.safetyWarning ? [data.safetyWarning] : ['Wear standard personal protective equipment (PPE) during assembly and testing.']),
        feasibility: {
          costScore,
          difficultyScore,
          impactScore,
          sustainability,
          overallScore
        },
        buildPlanSteps: Array.isArray(data.buildPlanSteps) && data.buildPlanSteps.length > 0 ? data.buildPlanSteps : (Array.isArray(data.stepByStepBuildPlan) ? data.stepByStepBuildPlan : ['Phase 1: Materials sourcing', 'Phase 2: Frame welding & machining', 'Phase 3: Electrical wiring & fusing', 'Phase 4: Safety calibration & testing']),
        createdAt: Date.now(),
        upvotes: 0,
        upvoters: [],
        reportCount: 0,
        isFlagged: false,
        isPublishedToLibrary: false
      };

      setCurrentSolution(full);
      // Auto save to user's saved solutions or library
      await firestoreService.saveCommunitySolution(full);
      await loadLibrary();
    } catch (err: any) {
      console.error('Problem lab generation error:', err);
      setError(FALLBACK_AI_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!currentSolution) return;
    const published = { ...currentSolution, isPublishedToLibrary: true };
    await firestoreService.saveCommunitySolution(published);
    setCurrentSolution(published);
    setPublishStatus('success');
    await loadLibrary();
    setTimeout(() => setPublishStatus('idle'), 3000);
  };

  const handleUpvote = async (solId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    await firestoreService.upvoteCommunitySolution(solId, currentUser.uid);
    await loadLibrary();
  };

  const handleReport = async (solId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (reportedIds.includes(solId)) return;
    if (!window.confirm('Report this solution for review or inappropriate content?')) return;
    await firestoreService.reportCommunitySolution(solId);
    setReportedIds([...reportedIds, solId]);
    await loadLibrary();
  };

  const handleDelete = async (solId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this community blueprint?')) return;
    await firestoreService.deleteCommunitySolution(solId);
    await loadLibrary();
    if (currentSolution?.id === solId) setCurrentSolution(null);
  };

  // Filter solutions: only show unflagged posts (unless admin)
  const visibleSolutions = librarySolutions.filter((s) => {
    if (s.isFlagged && !isAdmin) return false;
    const matchesQuery =
      s.problemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.localContext.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.stateOrRegion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesField = fieldFilter === 'all' || s.field === fieldFilter;
    return matchesQuery && matchesField;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="border-b border-[#2C3038] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] tracking-wider uppercase text-[#EA580C] font-semibold block mb-1">
            Module 04 // Social Impact Lab
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F4]">
            Community Problem Lab
          </h1>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Senior engineer mentor solutions for real Nigerian infrastructure challenges with Naira BEME pricing.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-[3px] bg-[#181A1F] border border-[#2C3038] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('solver')}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-mono font-medium transition-colors ${
              activeTab === 'solver'
                ? 'bg-[#EA580C] text-white'
                : 'text-[#78716C] hover:text-[#F5F5F4]'
            }`}
          >
            Design Solver
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-mono font-medium transition-colors ${
              activeTab === 'library'
                ? 'bg-[#EA580C] text-white'
                : 'text-[#78716C] hover:text-[#F5F5F4]'
            }`}
          >
            Solutions Library ({librarySolutions.length})
          </button>
        </div>
      </div>

      {activeTab === 'solver' ? (
        <div className="space-y-6">
          {/* Preset Challenge Cards */}
          <div className="p-5 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] block">
              Benchmark Nigerian Challenges:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TEMPLATE_CHALLENGES.map((tmpl, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => {
                    setProblemTitle(tmpl.title);
                    setLocalContext(tmpl.context);
                    setStateOrRegion(tmpl.location);
                    setConstraints(tmpl.constraints);
                    setSelectedField(tmpl.field);
                  }}
                  className="p-3 rounded-[3px] bg-[#121316] border border-[#2C3038] hover:border-[#EA580C] text-left transition-all hover:shadow-md hover:shadow-[#EA580C]/10 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#EA580C] uppercase block">{tmpl.location}</span>
                    <Sparkles className="w-3 h-3 text-[#EA580C] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs font-semibold text-[#F5F5F4] block mt-0.5">{tmpl.title}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="p-5 sm:p-6 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">Problem Title</label>
                <input
                  type="text"
                  value={problemTitle}
                  onChange={(e) => setProblemTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">Engineering Discipline</label>
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value as EngineeringField)}
                  className="w-full px-3 py-2 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
                >
                  <option value="electrical">Electrical & Electronics</option>
                  <option value="mechanical">Mechanical</option>
                  <option value="civil">Civil & Structural</option>
                  <option value="agricultural">Agricultural & Bioresources</option>
                  <option value="chemical">Chemical</option>
                  <option value="general">General Engineering</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">Location & State</label>
                <input
                  type="text"
                  value={stateOrRegion}
                  onChange={(e) => setStateOrRegion(e.target.value)}
                  className="w-full px-3 py-2 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">Local Materials & Constraints</label>
                <input
                  type="text"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="e.g. Alaba, Ladipo, scrap steel yard..."
                  className="w-full px-3 py-2 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">Local Problem Description</label>
              <textarea
                rows={3}
                value={localContext}
                onChange={(e) => setLocalContext(e.target.value)}
                className="w-full px-3 py-2 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            {error && (
              <div className="p-3 rounded-[3px] bg-[#450A0A] border border-[#DC2626]/50 text-xs text-[#FCA5A5] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isLoading ? (
              <div className="p-6 rounded-[3px] bg-[#121316] border border-[#2C3038] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C] animate-ping" />
                  <span className="text-xs font-mono text-[#EA580C] animate-pulse">
                    Senior engineer mentor is calculating specifications, Naira BEME, and build steps...
                  </span>
                </div>
                <Skeleton lines={5} />
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleGenerate}
                disabled={!problemTitle.trim() || !localContext.trim()}
                className="w-full py-3 rounded-[3px] bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold tracking-wide transition-all shadow-md shadow-[#EA580C]/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Formulate Engineering Solution & Naira BEME &rarr;</span>
              </motion.button>
            )}
          </div>

          {/* Generated Blueprint View */}
          {currentSolution && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="p-5 sm:p-6 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-5">
                <div className="border-b border-[#2C3038] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] text-[#EA580C] uppercase block">
                      {currentSolution.stateOrRegion} // {currentSolution.field || 'General'}
                    </span>
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-[#F5F5F4]">
                      {currentSolution.problemTitle}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePublish}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[#1F2228] border border-[#2C3038] text-xs font-mono text-[#F5F5F4] hover:border-[#EA580C] transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>{currentSolution.isPublishedToLibrary ? 'Saved in Library' : 'Publish to Library'}</span>
                    </button>

                    <button
                      onClick={() => onSendToPortfolio(currentSolution)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold transition-colors"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Build Portfolio Case Study</span>
                    </button>
                  </div>
                </div>

                {publishStatus === 'success' && (
                  <div className="p-3 rounded-[3px] bg-emerald-950/60 border border-emerald-600/50 text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Blueprint published to Community Solutions Library.</span>
                  </div>
                )}

                {/* Problem Breakdown */}
                <div className="space-y-2">
                  <h4 className="font-mono text-xs font-bold text-[#EA580C] uppercase">
                    1. Problem Breakdown & Failure Points
                  </h4>
                  <MarkdownView content={currentSolution.breakdown} />
                  <div className="p-3 rounded-[3px] bg-[#121316] border border-[#2C3038] space-y-1">
                    <span className="text-[11px] font-mono text-[#A8A29E] block">Identified Root Causes:</span>
                    <ul className="text-xs text-[#78716C] space-y-1 list-disc list-inside">
                      {currentSolution.rootCauses.map((rc, i) => (
                        <li key={i}>{rc}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Feasibility score bar meters */}
                <div className="space-y-2 pt-2 border-t border-[#2C3038]">
                  <h4 className="font-mono text-xs font-bold text-[#EA580C] uppercase">
                    2. Feasibility Index ({currentSolution.feasibility.overallScore} / 100)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-[3px] bg-[#121316] border border-[#2C3038]">
                      <div className="flex justify-between text-[11px] font-mono mb-1">
                        <span className="text-[#A8A29E]">Cost Feasibility</span>
                        <span className="text-[#EA580C]">{currentSolution.feasibility.costScore}%</span>
                      </div>
                      <div className="w-full bg-[#1F2228] h-2 rounded-[1px] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${currentSolution.feasibility.costScore}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="bg-[#EA580C] h-full"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-[3px] bg-[#121316] border border-[#2C3038]">
                      <div className="flex justify-between text-[11px] font-mono mb-1">
                        <span className="text-[#A8A29E]">Build Simplicity</span>
                        <span className="text-[#EA580C]">{currentSolution.feasibility.difficultyScore}%</span>
                      </div>
                      <div className="w-full bg-[#1F2228] h-2 rounded-[1px] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${currentSolution.feasibility.difficultyScore}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                          className="bg-[#EA580C] h-full"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-[3px] bg-[#121316] border border-[#2C3038]">
                      <div className="flex justify-between text-[11px] font-mono mb-1">
                        <span className="text-[#A8A29E]">Community Benefit</span>
                        <span className="text-[#EA580C]">{currentSolution.feasibility.impactScore}%</span>
                      </div>
                      <div className="w-full bg-[#1F2228] h-2 rounded-[1px] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${currentSolution.feasibility.impactScore}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                          className="bg-[#EA580C] h-full"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-[3px] bg-[#121316] border border-[#2C3038]">
                      <div className="flex justify-between text-[11px] font-mono mb-1">
                        <span className="text-[#A8A29E]">Sustainability</span>
                        <span className="text-[#EA580C]">{currentSolution.feasibility.sustainability}%</span>
                      </div>
                      <div className="w-full bg-[#1F2228] h-2 rounded-[1px] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${currentSolution.feasibility.sustainability}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                          className="bg-[#EA580C] h-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 Solutions */}
                <div className="space-y-2 pt-2 border-t border-[#2C3038]">
                  <h4 className="font-mono text-xs font-bold text-[#EA580C] uppercase">
                    3. Evaluated Engineering Alternatives
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {currentSolution.solutionOptions.map((opt, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-[3px] border space-y-2 ${
                          opt.title === currentSolution.selectedSolutionTitle
                            ? 'bg-[#1F2228] border-[#EA580C]'
                            : 'bg-[#121316] border-[#2C3038]'
                        }`}
                      >
                        <span className="font-mono text-[10px] text-[#EA580C] block">
                          Pathway {i + 1} • {opt.type}
                        </span>
                        <h5 className="font-serif text-xs font-bold text-[#F5F5F4]">{opt.title}</h5>
                        <p className="text-[11px] text-[#A8A29E] leading-relaxed">{opt.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mathematical Sizing */}
                <div className="space-y-2 pt-2 border-t border-[#2C3038]">
                  <h4 className="font-mono text-xs font-bold text-[#EA580C] uppercase">
                    4. Governing Equations & Sizing Calculations
                  </h4>
                  <div className="p-4 rounded-[3px] bg-[#121316] border border-[#2C3038]">
                    <MarkdownView content={currentSolution.governingFormulas} />
                  </div>
                  <div className="p-4 rounded-[3px] bg-[#121316] border border-[#2C3038]">
                    <span className="font-mono text-[10px] text-[#78716C] uppercase block mb-1">Numerical Working:</span>
                    <MarkdownView content={currentSolution.sampleCalculations} />
                  </div>
                </div>

                {/* Naira BEME Table */}
                <div className="space-y-2 pt-2 border-t border-[#2C3038]">
                  <div className="flex justify-between items-center">
                    <h4 className="font-mono text-xs font-bold text-[#EA580C] uppercase">
                      5. Bill of Engineering Measurement & Evaluation (BEME)
                    </h4>
                    <span className="font-mono text-xs font-bold text-[#EA580C]">
                      Total: ₦{Number(currentSolution.totalEstimatedCostNaira || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead>
                        <tr className="border-b border-[#2C3038] text-[#78716C] text-[10px]">
                          <th className="py-2 px-2.5">Item</th>
                          <th className="py-2 px-2.5">Quantity</th>
                          <th className="py-2 px-2.5">Rate (₦)</th>
                          <th className="py-2 px-2.5">Total (₦)</th>
                          <th className="py-2 px-2.5">Local Market</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2C3038] text-[11px]">
                        {currentSolution.bemeEstimate.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-2.5 text-[#F5F5F4]">{item.item}</td>
                            <td className="py-2 px-2.5 text-[#A8A29E]">{item.quantity}</td>
                            <td className="py-2 px-2.5 text-[#A8A29E]">₦{Number(item.unitRateNaira).toLocaleString()}</td>
                            <td className="py-2 px-2.5 text-[#EA580C] font-semibold">₦{Number(item.totalNaira).toLocaleString()}</td>
                            <td className="py-2 px-2.5 text-[#78716C]">{item.localSource}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Safety protocols */}
                <div className="p-4 rounded-[3px] bg-[#450A0A]/40 border border-[#DC2626]/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="font-mono text-xs font-bold text-red-400 uppercase">
                      Mandatory Safety Protocols
                    </span>
                  </div>
                  <ul className="text-xs text-[#FCA5A5] space-y-1.5">
                    {currentSolution.safetyAlerts.map((alert, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span>•</span>
                        <span>{alert}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Step by step build plan */}
                <div className="space-y-2 pt-2 border-t border-[#2C3038]">
                  <h4 className="font-mono text-xs font-bold text-[#EA580C] uppercase">
                    6. Step-by-Step Prototype Fabrication Plan
                  </h4>
                  <div className="space-y-1.5">
                    {currentSolution.buildPlanSteps.map((step, idx) => (
                      <div key={idx} className="p-2.5 rounded-[3px] bg-[#121316] border border-[#2C3038] flex items-start gap-2.5">
                        <span className="font-mono text-xs font-bold text-[#EA580C]">{idx + 1}.</span>
                        <span className="text-xs text-[#F5F5F4] leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        /* Community Solutions Library */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-[3px] bg-[#181A1F] border border-[#2C3038]">
              <Search className="w-4 h-4 text-[#78716C]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search solutions by keyword, problem, or state..."
                className="w-full bg-transparent text-xs text-[#F5F5F4] placeholder-[#78716C] focus:outline-none"
              />
            </div>

            <select
              value={fieldFilter}
              onChange={(e) => setFieldFilter(e.target.value)}
              className="px-3 py-2 rounded-[3px] bg-[#181A1F] border border-[#2C3038] text-xs font-mono text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
            >
              <option value="all">All Fields</option>
              <option value="electrical">Electrical</option>
              <option value="mechanical">Mechanical</option>
              <option value="civil">Civil</option>
              <option value="agricultural">Agricultural</option>
              <option value="chemical">Chemical</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visibleSolutions.map((sol) => (
              <div
                key={sol.id}
                onClick={() => {
                  setCurrentSolution(sol);
                  setActiveTab('solver');
                }}
                className="p-4 rounded-[4px] bg-[#181A1F] border border-[#2C3038] hover:border-[#EA580C] cursor-pointer transition-colors space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[#2C3038] pb-2 mb-2">
                    <span className="font-mono text-[10px] text-[#EA580C] uppercase">
                      {sol.stateOrRegion}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleUpvote(sol.id, e)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-mono text-[10px] border transition-colors ${
                          sol.upvoters?.includes(currentUser?.uid || '')
                            ? 'bg-[#EA580C] text-white border-[#EA580C]'
                            : 'bg-[#121316] text-[#A8A29E] border-[#2C3038] hover:text-[#F5F5F4]'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{sol.upvotes || 0}</span>
                      </button>

                      <button
                        onClick={(e) => handleReport(sol.id, e)}
                        className="text-[#78716C] hover:text-red-400 p-0.5"
                        title="Report this post"
                      >
                        <Flag className="w-3 h-3" />
                      </button>

                      {(sol.authorId === currentUser?.uid || isAdmin) && (
                        <button
                          onClick={(e) => handleDelete(sol.id, e)}
                          className="text-[#78716C] hover:text-red-400 p-0.5"
                          title="Delete post"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="font-serif text-sm font-bold text-[#F5F5F4]">{sol.problemTitle}</h4>
                  <p className="text-xs text-[#A8A29E] line-clamp-2 mt-1">{sol.localContext}</p>
                </div>

                <div className="pt-2 border-t border-[#2C3038] flex justify-between items-center text-[11px] font-mono">
                  <span className="text-[#EA580C]">₦{Number(sol.totalEstimatedCostNaira || 0).toLocaleString()}</span>
                  <span className="text-[#78716C]">By {sol.authorName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
