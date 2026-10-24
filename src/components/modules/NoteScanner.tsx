/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub Note Scanner & OCR
 * Multimodal vision parsing of handwritten engineering notes and assignment papers.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { getAuthHeaders } from '../../services/apiClient';
import { NoteAnalysisMode, ScannedNoteRecord } from '../../types';
import { MarkdownView } from '../MarkdownView';
import { Skeleton } from '../common/Skeleton';
import {
  ScanText,
  Upload,
  Copy,
  Check,
  CheckSquare,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface NoteScannerProps {
  onLaunchCBTWithNotes: (notesText: string, topicName: string) => void;
}

const SAMPLE_IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export const NoteScanner: React.FC<NoteScannerProps> = ({ onLaunchCBTWithNotes }) => {
  const { currentUser, userProfile } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState('image/jpeg');
  const [fileName, setFileName] = useState('');
  const [activeAction, setActiveAction] = useState<NoteAnalysisMode>('transcribe');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedNotes, setSavedNotes] = useState<ScannedNoteRecord[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      firestoreService.getScannedNotes(currentUser.uid).then(setSavedNotes).catch(console.error);
    }
  }, [currentUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, or WebP).');
      return;
    }

    setFileName(file.name);
    setImageMime(file.type);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setAnalysisText('');
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSample = () => {
    setSelectedImage(`data:image/png;base64,${SAMPLE_IMAGE_BASE64}`);
    setImageMime('image/png');
    setFileName('thermo_diesel_assignment_sample.png');
    setAnalysisText('');
    setError('');
  };

  const handleRunAnalysis = async (action: NoteAnalysisMode) => {
    if (!selectedImage || !currentUser) return;
    setActiveAction(action);
    setIsAnalyzing(true);
    setAnalysisText('');
    setError('');

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/scanner/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: imageMime,
          action,
          lowDataMode: userProfile?.lowDataMode || false
        })
      });

      if (!response.ok) {
        let errMessage = 'Could not scan image.';
        try {
          const err = await response.json();
          if (err.error) errMessage = err.error;
        } catch {}
        throw new Error(errMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Stream reader not available');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk) {
                fullContent += parsed.chunk;
                setAnalysisText(fullContent);
              }
              if (parsed.error) throw new Error(parsed.error);
            } catch {}
          }
        }
      }

      const newRecord: ScannedNoteRecord = {
        id: `note_${Date.now()}`,
        title: fileName || 'Scanned Engineering Document',
        extractedText: fullContent,
        mode: action,
        analysisResult: fullContent,
        timestamp: Date.now()
      };

      await firestoreService.saveScannedNote(currentUser.uid, newRecord);
      const refreshed = await firestoreService.getScannedNotes(currentUser.uid);
      setSavedNotes(refreshed);
    } catch (err: any) {
      setError(err.message || 'That didn\'t go through. Check your connection and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (!analysisText) return;
    navigator.clipboard.writeText(analysisText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    await firestoreService.deleteScannedNote(currentUser.uid, id);
    const refreshed = await firestoreService.getScannedNotes(currentUser.uid);
    setSavedNotes(refreshed);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="border-b border-[#2C3038] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] tracking-wider uppercase text-[#EA580C] font-semibold block mb-1">
            Module 03 // Document Vision
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F4]">
            Note Scanner & Assignment Solver
          </h1>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Convert handwritten lecture notes into LaTeX math and derive assignment solutions.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          className="px-3 py-1.5 rounded-[3px] bg-[#1F2228] border border-[#2C3038] text-xs font-mono text-[#F5F5F4] hover:border-[#EA580C] transition-colors self-start sm:self-auto"
        >
          Load Diesel Assignment Sample
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Upload Zone */}
      <div className="p-5 sm:p-6 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-4">
        {!selectedImage ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-[#2C3038] hover:border-[#EA580C] rounded-[3px] p-8 text-center cursor-pointer bg-[#121316] transition-colors"
          >
            <Upload className="w-6 h-6 text-[#EA580C] mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-[#F5F5F4]">
              Select or Drop Handwritten Note / Assignment Photo
            </h4>
            <p className="text-[11px] text-[#78716C] mt-1 font-mono">
              Supports JPEG, PNG, WebP up to 10MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-[3px] bg-[#121316] border border-[#2C3038]">
              <div>
                <span className="text-[10px] font-mono text-[#EA580C] uppercase block">Loaded Document</span>
                <span className="text-xs font-semibold text-[#F5F5F4]">{fileName}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-[2px] bg-[#1F2228] border border-[#2C3038] text-[11px] text-[#A8A29E] hover:text-[#F5F5F4]"
                >
                  Change File
                </button>
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setAnalysisText('');
                  }}
                  className="px-2.5 py-1 rounded-[2px] bg-[#1F2228] border border-[#2C3038] text-[11px] text-red-400 hover:bg-[#450A0A]"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* 4 Actions */}
            <div>
              <span className="block text-[11px] font-mono text-[#A8A29E] mb-2">Select Processing Goal:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleRunAnalysis('transcribe')}
                  disabled={isAnalyzing}
                  className={`p-3 rounded-[3px] border text-left transition-colors ${
                    activeAction === 'transcribe'
                      ? 'bg-[#1F2228] border-[#EA580C] text-[#F5F5F4]'
                      : 'bg-[#121316] border-[#2C3038] text-[#78716C] hover:text-[#A8A29E]'
                  }`}
                >
                  <span className="font-mono text-[10px] text-[#EA580C] block">01</span>
                  <span className="text-xs font-semibold block mt-0.5">Transcribe</span>
                  <span className="text-[10px] text-[#78716C] block">OCR &amp; LaTeX</span>
                </button>

                <button
                  onClick={() => handleRunAnalysis('summary')}
                  disabled={isAnalyzing}
                  className={`p-3 rounded-[3px] border text-left transition-colors ${
                    activeAction === 'summary'
                      ? 'bg-[#1F2228] border-[#EA580C] text-[#F5F5F4]'
                      : 'bg-[#121316] border-[#2C3038] text-[#78716C] hover:text-[#A8A29E]'
                  }`}
                >
                  <span className="font-mono text-[10px] text-[#EA580C] block">02</span>
                  <span className="text-xs font-semibold block mt-0.5">Summary</span>
                  <span className="text-[10px] text-[#78716C] block">Key Formulas</span>
                </button>

                <button
                  onClick={() => handleRunAnalysis('explain')}
                  disabled={isAnalyzing}
                  className={`p-3 rounded-[3px] border text-left transition-colors ${
                    activeAction === 'explain'
                      ? 'bg-[#1F2228] border-[#EA580C] text-[#F5F5F4]'
                      : 'bg-[#121316] border-[#2C3038] text-[#78716C] hover:text-[#A8A29E]'
                  }`}
                >
                  <span className="font-mono text-[10px] text-[#EA580C] block">03</span>
                  <span className="text-xs font-semibold block mt-0.5">Explain</span>
                  <span className="text-[10px] text-[#78716C] block">First Principles</span>
                </button>

                <button
                  onClick={() => handleRunAnalysis('solve_assignment')}
                  disabled={isAnalyzing}
                  className={`p-3 rounded-[3px] border text-left transition-colors ${
                    activeAction === 'solve_assignment'
                      ? 'bg-[#1F2228] border-[#EA580C] text-[#F5F5F4]'
                      : 'bg-[#121316] border-[#2C3038] text-[#78716C] hover:text-[#A8A29E]'
                  }`}
                >
                  <span className="font-mono text-[10px] text-[#EA580C] block">04</span>
                  <span className="text-xs font-semibold block mt-0.5">Solve Problems</span>
                  <span className="text-[10px] text-[#78716C] block">Full Working</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-[3px] bg-[#450A0A] border border-[#DC2626]/50 text-xs text-[#FCA5A5] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Output */}
      {(isAnalyzing || analysisText) && (
        <div className="p-5 sm:p-6 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-4">
          <div className="flex items-center justify-between border-b border-[#2C3038] pb-3">
            <span className="font-mono text-xs font-bold text-[#EA580C]">
              {activeAction === 'solve_assignment' && 'Assignment Derivations & Calculations'}
              {activeAction === 'transcribe' && 'Clean Markdown & LaTeX Transcription'}
              {activeAction === 'summary' && 'Revision Summary'}
              {activeAction === 'explain' && 'Core Principle Explanation'}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!analysisText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[#1F2228] border border-[#2C3038] text-xs font-mono text-[#F5F5F4]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {analysisText && !isAnalyzing && (
                <button
                  onClick={() => onLaunchCBTWithNotes(analysisText, fileName || 'Scanned Note Topic')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Generate CBT From Note</span>
                </button>
              )}
            </div>
          </div>

          {isAnalyzing && !analysisText ? (
            <Skeleton lines={5} />
          ) : (
            <MarkdownView content={analysisText} />
          )}
        </div>
      )}

      {/* Saved Documents */}
      {savedNotes.length > 0 && (
        <div className="p-5 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] block">
            Archived Transcriptions ({savedNotes.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {savedNotes.slice(0, 4).map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-[3px] bg-[#121316] border border-[#2C3038] flex items-center justify-between gap-3"
              >
                <div
                  onClick={() => {
                    setAnalysisText(n.extractedText);
                    setActiveAction(n.mode);
                    setFileName(n.title);
                  }}
                  className="cursor-pointer truncate"
                >
                  <span className="text-[10px] font-mono text-[#EA580C] block uppercase">{n.mode}</span>
                  <span className="text-xs font-semibold text-[#F5F5F4] truncate block">{n.title}</span>
                </div>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="text-[#78716C] hover:text-red-400 p-1"
                  aria-label="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
