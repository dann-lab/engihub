/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Check } from 'lucide-react';

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

  // If user has already completed onboarding, do not display
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
    try {
      await updateProfileData({
        university,
        department,
        level,
        courses: selectedCourses,
        onboardingCompleted: true,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-[#181A1F] text-[#F5F5F4] border border-[#2C3038] rounded-[4px] p-6 sm:p-7 shadow-2xl space-y-5">
        <div>
          <span className="font-mono text-[10px] tracking-wider uppercase text-[#EA580C] font-semibold block mb-1">
            Academic Profile Setup
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#F5F5F4]">
            Welcome to EngiHub.
          </h2>
          <p className="text-xs text-[#A8A29E] mt-1">
            Configure your institution, discipline, and enrolled courses to tailor the baby-step tutor and CBT problem sets.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">
              Institution / University
            </label>
            <select
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full px-3 py-2 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
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
              <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
              >
                {ENGINEERING_DEPTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">
                Level of Study
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
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
            <label className="block text-[11px] font-mono text-[#A8A29E] mb-1.5">
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
                    className={`flex items-center justify-between p-2 rounded-[3px] border text-left text-[11px] font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#1F2228] border-[#EA580C] text-[#F5F5F4]'
                        : 'bg-[#121316] border-[#2C3038] text-[#78716C] hover:text-[#A8A29E]'
                    }`}
                  >
                    <span className="truncate mr-1">{course}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-[3px] bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold tracking-wide transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving Profile...' : 'Complete Setup & Open Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
