/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Check } from 'lucide-react';

const NIGERIAN_UNIVERSITIES = [
  'Federal University of Technology, Akure (FUTA)',
  'University of Lagos (UNILAG)',
  'Ahmadu Bello University (ABU Zaria)',
  'University of Nigeria, Nsukka (UNN)',
  'Obafemi Awolowo University (OAU Ile-Ife)',
  'University of Ilorin (UNILORIN)',
  'University of Ibadan (UI)',
  'Federal University of Technology, Minna (FUTMINNA)',
  'Covenant University',
  'University of Benin (UNIBEN)',
  'Other Nigerian University / Polytechnic'
];

const ENGINEERING_DEPTS = [
  'Mechanical Engineering',
  'Electrical & Electronics Engineering',
  'Civil & Environmental Engineering',
  'Chemical Engineering',
  'Agricultural & Bioresources Engineering',
  'Mechatronics Engineering',
  'Metallurgical & Materials Engineering',
  'Computer & Software Engineering',
  'Petroleum & Gas Engineering'
];

const COMMON_COURSES = [
  'Thermodynamics (MEE 301)',
  'Fluid Mechanics (MEE 303)',
  'Differential Equations (MTH 201)',
  'Engineering Materials (MEE 205)',
  'Electric Circuit Theory (EEE 201)',
  'Strength of Materials (CEE 301)',
  'Engineering Mathematics III (ENG 301)',
  'Workshop Practice (MEE 101/201)',
  'Control Systems (EEE 401)',
  'Heat & Mass Transfer (MEE 405)'
];

export const OnboardingModal: React.FC = () => {
  const { userProfile, updateProfileData } = useAuth();
  const [university, setUniversity] = useState(userProfile?.university || NIGERIAN_UNIVERSITIES[0]);
  const [department, setDepartment] = useState(userProfile?.department || ENGINEERING_DEPTS[0]);
  const [level, setLevel] = useState(userProfile?.level || '300L');
  const [selectedCourses, setSelectedCourses] = useState<string[]>(
    userProfile?.courses && userProfile.courses.length > 0
      ? userProfile.courses
      : ['Thermodynamics (MEE 301)', 'Engineering Mathematics III (ENG 301)']
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!userProfile || userProfile.onboardingCompleted) return null;

  const toggleCourse = (c: string) => {
    if (selectedCourses.includes(c)) {
      setSelectedCourses(selectedCourses.filter((item) => item !== c));
    } else {
      setSelectedCourses([...selectedCourses, c]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateProfileData({
        university,
        department,
        level,
        courses: selectedCourses,
        onboardingCompleted: true,
      });
    } catch (err: any) {
      console.error('Onboarding save notice:', err);
      setError(err?.message || 'Could not sync academic profile to cloud, saved locally.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-[#11221B] text-[#F6F3EE] border border-[#223A30] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2D6A4F] text-[#F6F3EE] font-serif font-bold text-lg flex items-center justify-center shrink-0">
            E
          </div>
          <div>
            <span className="font-mono text-[10px] tracking-wider uppercase text-[#E0A844] font-semibold block">
              Academic Profile Setup
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#F6F3EE]">
              Welcome to EngiHub.
            </h2>
          </div>
        </div>
        <p className="text-xs text-[#AEC1B6]">
          Configure your institution, discipline, and enrolled courses to tailor your baby-step tutor and CBT problem sets.
        </p>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-[#AEC1B6] mb-1">
              Institution / University
            </label>
            <select
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B1612] border border-[#223A30] text-xs text-[#F6F3EE] focus:outline-hidden focus:border-[#E0A844]"
            >
              {NIGERIAN_UNIVERSITIES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-[#AEC1B6] mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B1612] border border-[#223A30] text-xs text-[#F6F3EE] focus:outline-hidden focus:border-[#E0A844]"
              >
                {ENGINEERING_DEPTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#AEC1B6] mb-1">
                Level of Study
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B1612] border border-[#223A30] text-xs text-[#F6F3EE] focus:outline-hidden focus:border-[#E0A844]"
              >
                <option value="100L">100L (Pre-Engineering)</option>
                <option value="200L">200L (Foundations)</option>
                <option value="300L">300L (Core Engineering)</option>
                <option value="400L (SIWES)">400L (SIWES Candidate)</option>
                <option value="500L (Final Year)">500L (Final Year Project)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#AEC1B6] mb-1.5">
              Select Current Enrolled Courses
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {COMMON_COURSES.map((course) => {
                const isSelected = selectedCourses.includes(course);
                return (
                  <button
                    key={course}
                    type="button"
                    onClick={() => toggleCourse(course)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-left text-[11px] font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#1D3C2C] border-[#E0A844] text-[#F6F3EE]'
                        : 'bg-[#0B1612] border-[#223A30] text-[#6E8578] hover:text-[#AEC1B6]'
                    }`}
                  >
                    <span className="truncate mr-1">{course}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#E0A844] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#E0A844] hover:bg-[#DDA15E] text-[#0B1612] text-xs font-bold tracking-wide transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving Profile...' : 'Complete Setup & Open Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
