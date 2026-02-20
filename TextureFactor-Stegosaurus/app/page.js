"use client";

import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { TextureEngine } from '@/lib/TextureEngine';
import {
  STEP_TYPES,
  FILTER_PIPELINE,
  generateSemanticName
} from '@/lib/constants';

import NavBar from './components/NavBar';
import BuilderTab from './components/BuilderTab';
import GeneratorTab from './components/GeneratorTab';
import SetsTab from './components/SetsTab';
import SettingsTab from './components/SettingsTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('builder');
  const [engine, setEngine] = useState(null);
  const batchEngineRef = useRef(null);
  const [erosion, setErosion] = useState(0);
  const [profileName, setProfileName] = useState("Particle_01");
  const [showGizmos, setShowGizmos] = useState(true);
  const [selectedResolutions, setSelectedResolutions] = useState([2048]);
  const [enableAI, setEnableAI] = useState(true);

  const [dreamParams, setDreamParams] = useState({
    batchSize: 20,
    batchCycles: 1,
    refineCycles: 1,
    minDensity: 0.15,
    maxDensity: 0.75,
    minSimplicity: 0.1,
    maxSimplicity: 0.9,
    varianceStrictness: 0.1,
    randStrength: 0.5,
    randCount: 3,
    variantCount: 0,
    prompt: ""
  });

  const [isDreaming, setIsDreaming] = useState(false);
  const [dreamState, setDreamState] = useState({ results: [], rejectedIds: [], phase: '', rejectLabel: '' });
  const [savedLibrary, setSavedLibrary] = useState([]);
  const [sets, setSets] = useState([]);
  const [steps, setSteps] = useState([
    {
      id: 's1',
      typeDef: STEP_TYPES.BASE_SHAPE,
      active: true,
      blendMode: 0,
      params: { ...STEP_TYPES.BASE_SHAPE.params },
      universal: { power: 1, mult: 1, scale: 1, offsetX: 0, offsetY: 0 },
      previewUrl: null
    }
  ]);

  const [finalPreviewUrl, setFinalPreviewUrl] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const availableResolutions = [256, 512, 1024, 2048, 4096];

  useEffect(() => {
    const eng = new TextureEngine(256, 256);
    setEngine(eng);
    batchEngineRef.current = new TextureEngine(64, 64);
  }, []);

  useEffect(() => {
    if (!engine) return;
    engine.renderStack(steps);
    setPreviewUrls(steps.map((_, i) => engine.getTextureUrl(i)));
    setFinalPreviewUrl(engine.getTextureUrl(steps.length - 1));
  }, [steps, engine]);

  const handleUpdateStep = (id, changes) => setSteps(prev => prev.map(s => s.id === id ? { ...s, ...changes } : s));
  const handleToggleStep = (id) => setSteps(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));

  const handleAddStep = (key, index = -1) => {
    const typeDef = STEP_TYPES[key];
    const newStep = {
      id: 'step_' + Date.now() + Math.random().toString(36).substr(2, 9),
      typeDef: typeDef,
      active: true,
      blendMode: typeDef.cat === 'GEN' ? 0 : (typeDef.cat === 'ERODE' ? 1 : (key === 'BASIC' ? 0 : 2)),
      params: { ...typeDef.params },
      universal: { power: 1.0, mult: 1.0, scale: 1.0, offsetX: 0.0, offsetY: 0.0 },
      previewUrl: null,
      note: ""
    };
    setSteps(prev => {
      const next = [...prev];
      if (index === -1) next.push(newStep);
      else next.splice(index, 0, newStep);
      return next;
    });
  };

  const handleRemoveStep = (id) => setSteps(prev => prev.filter(s => s.id !== id));

  const handleMoveStep = (idx, dir) => {
    const newSteps = [...steps];
    const target = idx + dir;
    if (target < 1 || target >= newSteps.length) return;
    [newSteps[idx], newSteps[target]] = [newSteps[target], newSteps[idx]];
    setSteps(newSteps);
  };

  const toggleResolution = (res) => setSelectedResolutions(prev =>
    prev.includes(res) ? prev.filter(r => r !== res) : [...prev, res].sort((a, b) => a - b)
  );

  const handleExport = async () => {
    const zip = new JSZip();
    for (const res of selectedResolutions) {
      const bigEngine = new TextureEngine(res, res);
      bigEngine.renderStack(steps);
      const url = bigEngine.getTextureUrl(steps.length - 1);
      zip.file(`${profileName}_${res}.png`, url.split(',')[1], { base64: true });
    }
    // Also save the step config as JSON
    const configJson = JSON.stringify(steps, null, 2);
    zip.file(`${profileName}_config.json`, configJson);

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.download = `${profileName}.zip`;
    link.href = URL.createObjectURL(content);
    link.click();
  };

  const generateRandomSteps = () => {
    const generators = ['BASE_SHAPE', 'BASE_GRAD'];
    const operators = ['NOISE_PERLIN', 'NOISE_WORLEY', 'FRACTAL', 'SPIRAL', 'THRESHOLD', 'VIGNETTE', 'SMEAR'];
    const newSteps = [];
    const baseKey = generators[Math.floor(Math.random() * generators.length)];
    const baseDef = STEP_TYPES[baseKey];
    const baseParams = { ...baseDef.params };

    baseDef.controls.forEach(c => {
      if (c.type === 'slider') {
        const range = c.max - c.min;
        baseParams[c.key] = c.min + Math.random() * range;
      }
    });

    newSteps.push({
      id: 'base_' + Date.now(),
      typeDef: baseDef,
      active: true,
      blendMode: 0,
      params: baseParams,
      universal: { power: 1.0, mult: 1.0, scale: 1.0, offsetX: 0.0, offsetY: 0.0 }
    });

    for (let i = 0; i < dreamParams.randCount; i++) {
      const key = operators[Math.floor(Math.random() * operators.length)];
      const def = STEP_TYPES[key];
      const params = { ...def.params };
      def.controls.forEach(c => {
        if (c.type === 'slider') {
          const range = c.max - c.min;
          params[c.key] = c.min + Math.random() * range;
        }
      });
      newSteps.push({
        id: 'op_' + Date.now() + '_' + i,
        typeDef: def,
        active: true,
        blendMode: def.cat === 'GEN' ? 0 : (def.cat === 'ERODE' ? 1 : 2),
        params: params,
        universal: { power: 1.0, mult: 1.0, scale: 1.0, offsetX: 0.0, offsetY: 0.0 }
      });
    }
    return newSteps;
  };

  const handleDream = async () => {
    if (!batchEngineRef.current) return;
    setIsDreaming(true);
    const batchEngine = batchEngineRef.current;
    let accumulator = [...savedLibrary];
    const safeBatchCycles = Math.max(1, dreamParams.batchCycles);
    const existingNames = new Set(savedLibrary.map(i => i.name));

    try {
      for (let b = 0; b < safeBatchCycles; b++) {
        setDreamState(prev => ({ ...prev, phase: `Cycle ${b + 1}: Generating...` }));
        const batch = [];
        for (let i = 0; i < dreamParams.batchSize; i++) {
          let newItem = null;
          let attempts = 0;
          while (!newItem && attempts < 10) {
            attempts++;
            const cfg = generateRandomSteps();
            batchEngine.renderStack(cfg);
            const analysis = batchEngine.analyzeTexture(cfg.length - 1);
            if (analysis.density < dreamParams.minDensity || analysis.density > (dreamParams.maxDensity || 0.75)) continue;
            if (analysis.sScore < dreamParams.minSimplicity || analysis.sScore > dreamParams.maxSimplicity) continue;
            newItem = {
              config: cfg,
              url: batchEngine.getTextureUrl(cfg.length - 1),
              id: `b${b}_i${i}_${Math.random()}`,
              density: analysis.density,
              cScore: analysis.cScore,
              sScore: analysis.sScore,
              name: ''
            };
          }
          if (newItem) {
            batch.push(newItem);
            setDreamState(prev => ({ ...prev, results: [...prev.results, newItem] }));
            await new Promise(r => setTimeout(r, 10));
          }
        }
        accumulator = [...accumulator, ...batch];
        if (dreamParams.refineCycles > 0) {
          const context = {
            minDensity: dreamParams.minDensity,
            maxDensity: dreamParams.maxDensity,
            prompt: dreamParams.prompt,
            varianceStrictness: dreamParams.varianceStrictness,
            useAI: enableAI
          };
          for (const filter of FILTER_PIPELINE) {
            setDreamState(prev => ({ ...prev, phase: `Refining (${filter.name})...`, rejectLabel: filter.rejectLabel }));
            await new Promise(r => setTimeout(r, 500));
            const ids = filter.execute(accumulator, context);
            if (ids.length > 0) {
              setDreamState(prev => ({ ...prev, rejectedIds: ids }));
              await new Promise(r => setTimeout(r, 1000));
              accumulator = accumulator.filter(item => !ids.includes(item.id));
              setDreamState(prev => ({ ...prev, results: [...accumulator], rejectedIds: [] }));
            }
          }
        }
      }
      const finalAccumulator = accumulator.map(item => {
        if (!item.name || item.name === '') {
          const name = enableAI ? generateSemanticName(item, existingNames) : `Tex_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
          existingNames.add(name);
          return { ...item, name };
        }
        return item;
      });
      setSavedLibrary(finalAccumulator);
      setIsDreaming(false);
    } catch (e) {
      console.error(e);
      setIsDreaming(false);
    }
  };

  const handleAutoOrganize = () => {
    const newSets = {};
    savedLibrary.forEach(item => {
      const parts = item.name.split('_');
      let key = parts.length >= 3 ? `${parts[1]} ${parts[2]}` : "Misc";
      if (!newSets[key]) newSets[key] = [];
      newSets[key].push(item);
    });
    setSets(Object.keys(newSets).map(k => ({ id: k, name: k, items: newSets[k] })));
  };

  return (
    <div className="flex flex-col h-screen bg-[#111] text-gray-200 font-sans">
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'builder' && (
          <BuilderTab
            steps={steps}
            updateStep={handleUpdateStep}
            toggleStep={handleToggleStep}
            addStep={handleAddStep}
            removeStep={handleRemoveStep}
            moveStep={handleMoveStep}
            showGizmos={showGizmos}
            setShowGizmos={setShowGizmos}
            finalUrl={finalPreviewUrl}
            profileName={profileName}
            setProfileName={setProfileName}
            erosion={erosion}
            setErosion={setErosion}
            resList={availableResolutions}
            selectedRes={selectedResolutions}
            toggleRes={toggleResolution}
            onExport={handleExport}
          />
        )}
        {activeTab === 'generator' && (
          <GeneratorTab
            dreamParams={dreamParams}
            setDreamParams={setDreamParams}
            onDream={handleDream}
            isDreaming={isDreaming}
            dreamState={dreamState}
            onSave={(item) => setSavedLibrary(p => [...p, item])}
            onLoad={(cfg) => { setSteps(cfg); setActiveTab('builder'); }}
            previewEngine={batchEngineRef.current}
          />
        )}
        {activeTab === 'sets' && (
          <SetsTab
            library={savedLibrary}
            onLoad={(cfg) => { setSteps(cfg); setActiveTab('builder'); }}
            onDelete={(i) => setSavedLibrary(p => p.filter((_, x) => x !== i))}
            handleAutoOrganize={handleAutoOrganize}
            sets={sets}
            previewEngine={batchEngineRef.current}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab enableAI={enableAI} setEnableAI={setEnableAI} />
        )}
      </div>
    </div>
  );
}
