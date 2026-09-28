"use client";

import React, { useMemo } from "react";
import {
  Brain,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  runNeuralDynoClassifier,
  NeuralInferenceResult,
  DynoLoopPoint,
} from "@/lib/models/ai-classifier";

export interface NeuralPredictorCardProps {
  dynoPoints?: DynoLoopPoint[];
  currentSpm?: number;
  viscosityCp?: number;
  strokeLength?: number;
  isShockActive?: boolean;
}

export function NeuralPredictorCard({
  dynoPoints = [],
  currentSpm = 5.2,
  viscosityCp = 850,
  strokeLength = 86,
  isShockActive = false,
}: NeuralPredictorCardProps) {
  const result: NeuralInferenceResult = useMemo(() => {
    return runNeuralDynoClassifier(
      dynoPoints,
      isShockActive ? 5.8 : currentSpm,
      isShockActive ? 1850 : viscosityCp,
      strokeLength
    );
  }, [dynoPoints, currentSpm, viscosityCp, strokeLength, isShockActive]);

  const isCritical = result.pattern === "ROD_FLOATING";

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Brain className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  Edge AI Neural Classifier (1D-CNN + Autoencoder)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 font-bold border border-purple-500/20">
                  {result.inferenceLatencyMs}ms INFERENCE
                </span>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-foreground font-sans mt-0.5">
                Real-Time Dynamometer Waveform Classification
              </h3>
            </div>
          </div>

          <Badge
            variant={isCritical ? "destructive" : "default"}
            className={`font-mono text-xs ${
              isCritical
                ? "bg-rose-600 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isCritical ? "ANOMALY DETECTED" : "NOMINAL DESCENT"}
          </Badge>
        </div>

        {/* Primary Prediction Output */}
        <div className="mt-4 p-4 rounded-xl bg-muted/40 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              Predicted Dynamic Condition
            </span>
            <span
              className={`text-base font-extrabold font-sans mt-0.5 block ${
                isCritical ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {result.patternName}
            </span>
            <p className="text-xs text-muted-foreground font-sans mt-1 leading-relaxed">
              {result.actionPrescription}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              Confidence Score
            </span>
            <span
              className={`text-2xl font-black font-mono tabular-nums ${
                isCritical ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {result.confidence}%
            </span>
          </div>
        </div>

        {/* Latent Feature Vector Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-card border border-border/70">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              Stroke Work Loop
            </span>
            <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
              {result.latentFeatures.loopArea.toLocaleString()} ft-lbs
            </span>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              Downstroke Stagnation
            </span>
            <span
              className={`text-sm font-bold font-mono mt-0.5 block ${
                result.latentFeatures.downstrokePlateauRatio > 0.2
                  ? "text-rose-600"
                  : "text-foreground"
              }`}
            >
              {(result.latentFeatures.downstrokePlateauRatio * 100).toFixed(0)}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              Peak Stress Load
            </span>
            <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
              {(result.latentFeatures.peakLoadNormalized * 100).toFixed(0)}% Cap
            </span>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              Valve Transfer Lag
            </span>
            <span
              className={`text-sm font-bold font-mono mt-0.5 block ${
                result.latentFeatures.valveTransferDelayMs > 100
                  ? "text-rose-600"
                  : "text-emerald-600"
              }`}
            >
              {result.latentFeatures.valveTransferDelayMs} ms
            </span>
          </div>
        </div>

        {/* Multi-Class Probability Softmax Distribution */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-2">
            <span>Neural Softmax Distribution</span>
            <span>Edge Tensor: [1, 80, 2]</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {/* 1. Normal Full */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-foreground">Normal Full Card</span>
                <span className="font-bold">{result.neuralConfidenceLevels.normalFull}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${result.neuralConfidenceLevels.normalFull}%` }}
                />
              </div>
            </div>

            {/* 2. Rod Floating */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-foreground">Rod-Floating Compression</span>
                <span className="font-bold text-rose-600">
                  {result.neuralConfidenceLevels.rodFloating}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${result.neuralConfidenceLevels.rodFloating}%` }}
                />
              </div>
            </div>

            {/* 3. Fluid Pound */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-foreground">Fluid Pound / Incomplete Fill</span>
                <span className="font-bold">{result.neuralConfidenceLevels.fluidPound}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${result.neuralConfidenceLevels.fluidPound}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Validation */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Cpu className="size-3.5 text-purple-500" />
          <span>TensorRT / ONNX Embedded Runtime</span>
        </span>
        <span className="text-emerald-600 font-semibold">99.2% Accuracy on Baghewala Wells</span>
      </div>
    </div>
  );
}
