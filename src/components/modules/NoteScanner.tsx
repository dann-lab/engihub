/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub Note Scanner & Assignment Solver
 * Vision transcription of handwritten engineering notes and problem sheets.
 * Warm Nigerian campus aesthetic: deep forest green, cream paper, sunny yellow-gold accents.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { callNetlifyAI, FALLBACK_AI_ERROR } from '../../services/apiClient';
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
import { compressImage } from '../../utils/imageCompressor';

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, or WebP).');
      return;
    }

    setError('');
    setFileName(file.name);

    try {
      // Compress smartphone camera images (even 12MB+) down to fast ~250KB JPEG
      const compressed = await compressImage(file, 1600, 0.82);
      setSelectedImage(compressed.dataUrl);
      setImageMime('image/jpeg');
      setAnalysisText('');
    } catch (err) {
      console.warn('Canvas compression fallback to FileReader:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSelectedImage(dataUrl);
        setImageMime(file.type || 'image/jpeg');
        setAnalysisText('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSample = () => {
    setError('');
    setFileName('sample_thermodynamics_notes.jpg');
    setImageMime('image/jpeg');
    setSelectedImage(`data:image/jpeg;base64,${SAMPLE_IMAGE_BASE64}`);
    setAnalysisText('');
  };

  const handleRunAnalysis = async (mode: NoteAnalysisMode) => {
    if (!selectedImage || !currentUser) {
      setError('Upload an image of your notes or problem sheet first.');
      return;
    }

    setActiveAction(mode);
    setIsAnalyzing(true);
    setError('');
    setAnalysisText('');

    try {
      const base64Data = selectedImage.split(',')[1] || selectedImage;

      const data = await callNetlifyAI<{ text?: string; reply?: string }>({
        module: 'scanner',
        action: mode,
        imageBase64: base64Data,
        imageMimeType: imageMime,
        fileName: fileName || 'Uploaded Note'
      });

      const fullResult = data.text || data.reply || '';
      if (!fullResult) {
        throw new Error(FALLBACK_AI_ERROR);
      }

      setAnalysisText(fullResult);

      const record: ScannedNoteRecord = {
        id: `note_${Date.now()}`,
        title: fileName || 'Lecture Note Scan',
        extractedText: fullResult,
        mode: mode,
        analysisResult: fullResult,
        timestamp: Date.now()
      };

      await firestoreService.saveScannedNote(currentUser.uid, record);
      const updated = await firestoreService.getScannedNotes(currentUser.uid);
      setSavedNotes(updated);
    } catch (err: any) {
      console.error('Note Scanner error:', err);
      setError(FALLBACK_AI_ERROR);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(analysisText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (noteId: string) => {
    if (!currentUser) return;
    await firestoreService.deleteScannedNote(currentUser.uid, noteId);
    setSavedNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Title */}
      <div className="p-6 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <ScanText className="w-4 h-4 text-[#C67D0A] dark:text-[#E0A844]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C67D0A] dark:text-[#E0A844]">
            Note Scanner & OCR
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#142E22] dark:text-[#F6F3EE]">
          Handwritten Note Scanner & Assignment Solver
        </h1>
        <p className="text-sm text-[#405449] dark:text-[#AEC1B6] mt-0.5">
          Snap a photo of your handwritten lecture notes or past question sheet. Transcribe into clean LaTeX, get explanations, or solve problems step by step.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="p-6 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm space-y-5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {!selectedImage ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#E8E1D3] dark:border-[#234436] hover:border-[#1B4332] dark:hover:border-[#52B788] rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-colors bg-[#FAF6EE] dark:bg-[#11221B]"
          >
            <div className="max-w-xs mx-auto space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#162C23] border border-[#E8E1D3] dark:border-[#234436] flex items-center justify-center mx-auto text-[#1B4332] dark:text-[#E0A844] shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="font-serif text-sm font-bold text-[#142E22] dark:text-[#F6F3EE] block">
                  Tap to upload handwritten page
                </span>
                <span className="text-xs text-[#687D72] dark:text-[#6E8578] block mt-0.5">
                  JPEG, PNG, or WebP up to 4.5MB
                </span>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUseSample();
                  }}
                  className="text-xs text-[#C67D0A] dark:text-[#E0A844] hover:underline font-semibold"
                >
                  Or test with sample note &rarr;
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md border border-[#E8E1D3] dark:border-[#234436] overflow-hidden bg-white dark:bg-[#162C23] flex items-center justify-center">
                  <img src={selectedImage} alt="Uploaded note preview" className="w-full h-full object-cover" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] block truncate">
                    {fileName}
                  </span>
                  <span className="text-[10px] text-[#687D72] dark:text-[#6E8578] block">
                    Ready for OCR processing
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#162C23] border border-[#E8E1D3] dark:border-[#234436] text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE]"
                >
                  Replace
                </button>
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setAnalysisText('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs font-semibold text-red-700 dark:text-red-300"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* 4 Processing Goals */}
            <div>
              <span className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] mb-2">
                Select Processing Goal:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'transcribe', label: 'Transcribe', sub: 'OCR & LaTeX formulas' },
                  { id: 'summary', label: 'Summary', sub: 'Key definitions & units' },
                  { id: 'explain', label: 'Explain', sub: 'Teach first principles' },
                  { id: 'solve_assignment', label: 'Solve Problems', sub: 'Step-by-step calculations' }
                ].map((act) => (
                  <button
                    key={act.id}
                    onClick={() => handleRunAnalysis(act.id as NoteAnalysisMode)}
                    disabled={isAnalyzing}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      activeAction === act.id
                        ? 'bg-[#1B4332] dark:bg-[#2D6A4F] border-[#1B4332] dark:border-[#2D6A4F] text-white shadow-xs'
                        : 'bg-[#FAF6EE] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-[#F6F3EE]'
                    }`}
                  >
                    <span className="font-serif text-sm font-bold block">
                      {act.label}
                    </span>
                    <span className={`text-[10px] block mt-0.5 ${
                      activeAction === act.id ? 'text-white/80' : 'text-[#687D72] dark:text-[#6E8578]'
                    }`}>
                      {act.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Output */}
      {(isAnalyzing || analysisText) && (
        <div className="p-6 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E1D3] dark:border-[#234436] pb-3">
            <span className="font-serif text-sm font-bold text-[#142E22] dark:text-[#F6F3EE]">
              {activeAction === 'solve_assignment' && 'Assignment Derivations & Calculations'}
              {activeAction === 'transcribe' && 'Clean Markdown & LaTeX Transcription'}
              {activeAction === 'summary' && 'Revision Summary'}
              {activeAction === 'explain' && 'Core Principle Explanation'}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!analysisText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {analysisText && !isAnalyzing && (
                <button
                  onClick={() => onLaunchCBTWithNotes(analysisText, fileName || 'Scanned Note Topic')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1B4332] dark:bg-[#2D6A4F] hover:bg-[#143427] dark:hover:bg-[#40916C] text-white text-xs font-semibold shadow-xs"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-[#DDA15E]" />
                  <span>Generate CBT From Note</span>
                </button>
              )}
            </div>
          </div>

          {isAnalyzing && !analysisText ? (
            <div className="space-y-3 py-4">
              <span className="text-xs font-mono text-[#C67D0A] dark:text-[#E0A844] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C67D0A] animate-ping" />
                Reading handwriting and transcribing formulas...
              </span>
              <Skeleton lines={5} />
            </div>
          ) : (
            <MarkdownView content={analysisText} />
          )}
        </div>
      )}

      {/* Saved Documents */}
      {savedNotes.length > 0 && (
        <div className="p-6 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#687D72] dark:text-[#6E8578] block">
            Archived Transcriptions ({savedNotes.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {savedNotes.slice(0, 4).map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-lg bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] flex items-center justify-between gap-3"
              >
                <div
                  onClick={() => {
                    setAnalysisText(n.extractedText);
                    setActiveAction(n.mode);
                    setFileName(n.title);
                  }}
                  className="cursor-pointer truncate"
                >
                  <span className="text-[10px] font-mono text-[#C67D0A] dark:text-[#E0A844] block font-semibold uppercase">
                    {n.mode}
                  </span>
                  <span className="text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] truncate block">
                    {n.title}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="text-[#687D72] hover:text-red-500 p-1"
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
