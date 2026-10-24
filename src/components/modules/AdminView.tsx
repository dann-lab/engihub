/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { apiRequest } from '../../services/apiClient';
import { CommunityProblemSolution } from '../../types';
import { ShieldAlert, Trash2, CheckCircle2, RefreshCw, BarChart2, Shield } from 'lucide-react';

export const AdminView: React.FC = () => {
  const { currentUser } = useAuth();
  const [reportedSolutions, setReportedSolutions] = useState<CommunityProblemSolution[]>([]);
  const [serverStats, setServerStats] = useState<{
    activeTrackedUsers: number;
    totalHourlyAIRequests: number;
    totalDailyAIRequests: number;
    serverUptimeSeconds: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [allSolutions, stats] = await Promise.all([
        firestoreService.getCommunitySolutions(),
        apiRequest<any>('/api/admin/stats').catch(() => null),
      ]);

      const reported = allSolutions.filter((s) => (s.reportCount || 0) > 0);
      setReportedSolutions(reported);
      if (stats) setServerStats(stats);
    } catch (e: any) {
      setError(e.message || 'Could not fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDismissReport = async (sol: CommunityProblemSolution) => {
    try {
      await firestoreService.saveCommunitySolution({
        ...sol,
        reportCount: 0,
        isFlagged: false,
      });
      setReportedSolutions((prev) => prev.filter((s) => s.id !== sol.id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Permanently delete this reported community solution?')) return;
    try {
      await firestoreService.deleteCommunitySolution(id);
      setReportedSolutions((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="border-b border-[#2C3038] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] tracking-wider uppercase text-[#EA580C] font-semibold block mb-1">
            Faculty Administration Gate
          </span>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#F5F5F4] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#EA580C]" />
            Moderation & System Telemetry
          </h1>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Admin console for <code className="text-[#EA580C]">{currentUser?.email}</code>.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[#1F2228] border border-[#2C3038] text-xs font-mono text-[#F5F5F4] hover:border-[#EA580C] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-[3px] bg-[#450A0A] border border-[#DC2626]/50 text-xs text-[#FCA5A5]">
          {error}
        </div>
      )}

      {/* Server Stats */}
      {serverStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-[4px] bg-[#181A1F] border border-[#2C3038]">
            <span className="text-[10px] font-mono text-[#78716C] uppercase block">Active Tracked Users</span>
            <span className="font-mono text-2xl font-bold text-[#F5F5F4] mt-1 block">
              {serverStats.activeTrackedUsers}
            </span>
          </div>

          <div className="p-4 rounded-[4px] bg-[#181A1F] border border-[#2C3038]">
            <span className="text-[10px] font-mono text-[#78716C] uppercase block">Hourly AI Requests</span>
            <span className="font-mono text-2xl font-bold text-[#EA580C] mt-1 block">
              {serverStats.totalHourlyAIRequests}
            </span>
          </div>

          <div className="p-4 rounded-[4px] bg-[#181A1F] border border-[#2C3038]">
            <span className="text-[10px] font-mono text-[#78716C] uppercase block">Daily AI Total</span>
            <span className="font-mono text-2xl font-bold text-[#F5F5F4] mt-1 block">
              {serverStats.totalDailyAIRequests}
            </span>
          </div>

          <div className="p-4 rounded-[4px] bg-[#181A1F] border border-[#2C3038]">
            <span className="text-[10px] font-mono text-[#78716C] uppercase block">Server Uptime</span>
            <span className="font-mono text-2xl font-bold text-[#A8A29E] mt-1 block">
              {Math.floor(serverStats.serverUptimeSeconds / 60)}m
            </span>
          </div>
        </div>
      )}

      {/* Reported Solutions */}
      <div className="p-5 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-4">
        <div className="flex items-center justify-between border-b border-[#2C3038] pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#EA580C]" />
            <h3 className="font-serif text-sm font-bold text-[#F5F5F4]">
              Reported Community Blueprints ({reportedSolutions.length})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#78716C]">
            Auto-hidden when reports &ge; 3
          </span>
        </div>

        {reportedSolutions.length === 0 ? (
          <p className="text-xs text-[#78716C] py-6 text-center">
            No active flagged or reported community blueprints.
          </p>
        ) : (
          <div className="space-y-3">
            {reportedSolutions.map((sol) => (
              <div
                key={sol.id}
                className="p-4 rounded-[3px] bg-[#121316] border border-[#2C3038] space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-[#450A0A] text-[#FCA5A5] border border-[#DC2626]/40 font-bold">
                        {sol.reportCount || 0} Reports
                      </span>
                      {sol.isFlagged && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-red-900/60 text-white font-bold">
                          HIDDEN FROM LIBRARY
                        </span>
                      )}
                      <span className="text-xs font-mono text-[#78716C]">
                        Author: {sol.authorName} ({sol.authorUniversity})
                      </span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-[#F5F5F4]">{sol.problemTitle}</h4>
                    <p className="text-xs text-[#A8A29E] mt-1">{sol.localContext}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDismissReport(sol)}
                      className="px-2.5 py-1.5 rounded-[3px] bg-[#1F2228] hover:bg-[#282C34] border border-[#2C3038] text-xs text-[#A8A29E] hover:text-[#F5F5F4] transition-colors"
                    >
                      Dismiss Reports
                    </button>
                    <button
                      onClick={() => handleDeletePost(sol.id)}
                      className="px-2.5 py-1.5 rounded-[3px] bg-[#DC2626] hover:bg-[#B91C1C] text-xs font-bold text-white transition-colors"
                    >
                      Delete Post
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
