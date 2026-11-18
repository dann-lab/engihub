/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EngiHub Engineering Student Community Hub
 * Warm Nigerian campus palette: Deep forest green (#1B4332 / #2D6A4F),
 * cream canvas (#FDFBF7), dark campus study theme (#0B1612 / #11221B),
 * gold accents (#C67D0A / #E0A844), real engineering photography,
 * real-time post creation, discussions, comments, and upvoting.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { CommunityCategory, CommunityPost, PostComment } from '../../types';
import { MarkdownView } from '../MarkdownView';
import { REAL_ENGINEERING_PHOTOS } from '../../assets/realPhotos';
import {
  Users,
  MessageSquare,
  ThumbsUp,
  Plus,
  Send,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EngiHubLogo } from '../common/EngiHubLogo';

const CATEGORIES: CommunityCategory[] = [
  'SWEP & SIWES Projects',
  'Past Questions & Solved Derivations',
  'Hardware, IoT & Tech Hacks',
  'Course Advice & Exam Tips',
  'Campus Engineering Gist'
];

const NIGERIAN_UNIVERSITIES = [
  'All Universities',
  'University of Lagos (UNILAG)',
  'Federal University of Technology Akure (FUTA)',
  'Ahmadu Bello University (ABU Zaria)',
  'University of Nigeria Nsukka (UNN)',
  'Obafemi Awolowo University (OAU Ife)',
  'University of Ibadan (UI)',
  'University of Ilorin (UNILORIN)',
  'Covenant University',
  'Federal University of Technology Minna (FUTMINNA)'
];

const BENCHMARK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post_bm_1',
    authorId: 'student_unilag_1',
    authorName: 'Chinedu Okafor',
    authorEmail: 'chinedu.okafor@student.unilag.edu.ng',
    authorUniversity: 'University of Lagos (UNILAG)',
    authorDepartment: 'Mechanical Engineering',
    authorLevel: '300L',
    title: 'Diesel Cycle Cut-off Ratio Calculation & Worked 2024 Past Question Derivation',
    category: 'Past Questions & Solved Derivations',
    content: `For anyone revising for **Thermodynamics MEE 301**, here is the comprehensive mathematical breakdown for the Diesel Cycle thermal efficiency formula:

$$\\eta_{th} = 1 - \\frac{1}{r^{\\gamma - 1}} \\left[ \\frac{r_c^\\gamma - 1}{\\gamma (r_c - 1)} \\right]$$

Where:
* $r = \\frac{V_1}{V_2}$ (Compression ratio, typically $14 - 22$)
* $r_c = \\frac{V_3}{V_2}$ (Cut-off volume ratio during constant pressure fuel injection)
* $\\gamma = 1.4$ for standard air.

**Key tip:** If the question states *cut-off takes place at 5% of stroke*, remember:
$$V_3 - V_2 = 0.05(V_1 - V_2)$$
$$r_c = 1 + 0.05(r - 1)$$

Hope this helps someone in their upcoming exams! Let me know if you want the full Brayton gas turbine cycle notes as well.`,
    tags: ['Thermodynamics', 'DieselCycle', 'MEE301', 'PastQuestions'],
    imageUrl: REAL_ENGINEERING_PHOTOS.mechanicalGears,
    upvotesCount: 28,
    upvotedBy: ['sample_user_1', 'sample_user_2'],
    commentsCount: 4,
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    updatedAt: Date.now() - 1000 * 60 * 60 * 6,
  },
  {
    id: 'post_bm_2',
    authorId: 'student_futa_2',
    authorName: 'Tunde Bakare',
    authorEmail: 'tunde.bakare@futa.edu.ng',
    authorUniversity: 'Federal University of Technology Akure (FUTA)',
    authorDepartment: 'Electrical & Electronics Engineering',
    authorLevel: '400L',
    title: 'Fabricated a 1.5kVA Pure Sine Wave Solar Inverter for SWEP Workshop Defense',
    category: 'SWEP & SIWES Projects',
    content: `Just concluded our SWEP 400 defense at the School of Engineering and Engineering Technology (SEET), FUTA!

We designed and fabricated a **1.5kVA / 24V Pure Sine Wave Inverter** driven by an **EGS002 (SPWM EG8010) driver module** and a bank of 8 IRFB4110 MOSFETs on an aluminum heatsink.

**Key Design Specs:**
1. Efficiency: $91.4\\%$ at $800W$ resistive load
2. Standby idle draw: $< 0.45A$
3. Total BEME prototype expenditure: $₦184,500$ (sourced locally from Alaba Int'l & Post Office market Akure)

If any 200L/300L student needs the Gerber files, Proteus circuit schematic, or transformer winding calculation sheet, drop a comment below!`,
    tags: ['SWEP', 'SolarEnergy', 'InverterDesign', 'EEE400'],
    imageUrl: REAL_ENGINEERING_PHOTOS.electricalCircuit,
    upvotesCount: 45,
    upvotedBy: ['sample_user_3', 'sample_user_4'],
    commentsCount: 9,
    createdAt: Date.now() - 1000 * 60 * 60 * 22,
    updatedAt: Date.now() - 1000 * 60 * 60 * 22,
  },
  {
    id: 'post_bm_3',
    authorId: 'student_abu_3',
    authorName: 'Amina Bello',
    authorEmail: 'amina.bello@abu.edu.ng',
    authorUniversity: 'Ahmadu Bello University (ABU Zaria)',
    authorDepartment: 'Civil & Water Resources Engineering',
    authorLevel: '300L',
    title: 'Hydraulic Moody Chart & Colebrook-White Pipe Head Loss Summary for CVE 305',
    category: 'Past Questions & Solved Derivations',
    content: `When sizing water transmission pipelines in Nigeria (e.g. Zaria municipal water project), friction head loss is calculated using Darcy-Weisbach:

$$h_f = f \\cdot \\frac{L}{D} \\cdot \\frac{v^2}{2g}$$

For laminar flow ($Re < 2000$), $f = \\frac{64}{Re}$.
For turbulent flow in rough galvanized iron pipes ($Re > 4000$), avoid manual iterations of Colebrook-White in timed exam halls! Use Swamee-Jain explicit approximation:

$$f = \\frac{0.25}{\\left[ \\log_{10} \\left( \\frac{\\varepsilon / D}{3.7} + \\frac{5.74}{Re^{0.9}} \\right) \\right]^2}$$

This formula gives $< 1\\%$ deviation from Moody and saves 10 valuable minutes during university examinations!`,
    tags: ['CivilEngineering', 'FluidMechanics', 'Hydraulics', 'CVE305'],
    imageUrl: REAL_ENGINEERING_PHOTOS.civilEngineering,
    upvotesCount: 37,
    upvotedBy: ['sample_user_5'],
    commentsCount: 3,
    createdAt: Date.now() - 1000 * 60 * 60 * 36,
    updatedAt: Date.now() - 1000 * 60 * 60 * 36,
  }
];

export const CommunityHub: React.FC = () => {
  const { currentUser, userProfile, isAdmin, recordDailyActivity } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedUni, setSelectedUni] = useState<string>('All Universities');

  // New Post Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState<CommunityCategory>('SWEP & SIWES Projects');
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [postPhotoUrl, setPostPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postError, setPostError] = useState('');
  const [noticeBanner, setNoticeBanner] = useState('');

  // Inline delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Active expanded comments
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState(false);

  // Load posts
  useEffect(() => {
    setLoading(true);

    try {
      const cached = localStorage.getItem('engihub_community_posts_cache');
      if (cached) {
        setPosts(JSON.parse(cached));
      } else {
        setPosts(BENCHMARK_COMMUNITY_POSTS);
      }
    } catch {
      setPosts(BENCHMARK_COMMUNITY_POSTS);
    }
    setLoading(false);

    const unsub = firestoreService.subscribeToCommunityPosts(
      (loaded) => {
        if (loaded.length > 0) {
          // Keep any local starter benchmark posts not yet replaced so community always stays rich
          const loadedIds = new Set(loaded.map((p) => p.id));
          const merged = [
            ...loaded,
            ...BENCHMARK_COMMUNITY_POSTS.filter((bp) => !loadedIds.has(bp.id)),
          ];
          setPosts(merged);
          try {
            localStorage.setItem('engihub_community_posts_cache', JSON.stringify(merged));
          } catch {
            // Ignore cache quota error
          }
        } else {
          setPosts((prev) => (prev.length > 0 ? prev : BENCHMARK_COMMUNITY_POSTS));
        }
      },
      (err) => {
        console.warn('Realtime community listener notice:', err);
      }
    );

    return () => unsub();
  }, []);

  // Handle Post Creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim() || !currentUser) return;

    setIsSubmitting(true);
    setPostError('');

    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      authorId: currentUser.uid,
      authorName: userProfile?.displayName || currentUser.displayName || 'Engineering Student',
      authorEmail: currentUser.email || 'student@engihub.app',
      authorUniversity: userProfile?.university || 'Nigerian University',
      authorDepartment: userProfile?.department || 'Engineering',
      authorLevel: userProfile?.level || '300L',
      title: postTitle.trim(),
      category: postCategory,
      content: postContent.trim(),
      tags: postTags.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean),
      imageUrl: postPhotoUrl.trim() || undefined,
      upvotesCount: 1,
      upvotedBy: [currentUser.uid],
      commentsCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      // Optimistic update
      setPosts((prev) => [newPost, ...prev]);
      try {
        const stored = JSON.parse(localStorage.getItem('engihub_community_posts_cache') || '[]');
        localStorage.setItem('engihub_community_posts_cache', JSON.stringify([newPost, ...stored]));
      } catch {
        // Ignore storage errors
      }

      await firestoreService.createCommunityPost(newPost);
      await recordDailyActivity();

      // Reset form
      setPostTitle('');
      setPostContent('');
      setPostTags('');
      setPostPhotoUrl('');
      setShowCreateModal(false);
      setNoticeBanner('Discussion post published to the campus community.');
      setTimeout(() => setNoticeBanner(''), 4000);
    } catch (err: any) {
      console.error('Error creating post:', err);
      setPostError(err?.message || 'Could not publish post to server. Saved locally for now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Upvote
  const handleToggleUpvote = async (post: CommunityPost) => {
    if (!currentUser) return;
    const hasUpvoted = post.upvotedBy.includes(currentUser.uid);
    const updatedUpvotedBy = hasUpvoted
      ? post.upvotedBy.filter((id) => id !== currentUser.uid)
      : [...post.upvotedBy, currentUser.uid];
    const updatedCount = updatedUpvotedBy.length;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, upvotesCount: updatedCount, upvotedBy: updatedUpvotedBy }
          : p
      )
    );

    await firestoreService.togglePostUpvote(post.id, currentUser.uid).catch((e) => {
      console.warn('Upvote sync notice:', e);
    });
  };

  // Handle Load Comments
  const handleToggleComments = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }
    setExpandedPostId(postId);

    if (!commentsMap[postId]) {
      const fetched = await firestoreService.getPostComments(postId);
      setCommentsMap((prev) => ({ ...prev, [postId]: fetched }));
    }
  };

  // Submit Comment
  const handleAddComment = async (postId: string) => {
    const text = (newCommentText[postId] || '').trim();
    if (!text || !currentUser || submittingComment) return;

    setSubmittingComment(true);
    const comment: PostComment = {
      id: `comment_${Date.now()}`,
      postId,
      authorId: currentUser.uid,
      authorName: userProfile?.displayName || currentUser.displayName || 'Engineering Student',
      authorUniversity: userProfile?.university || 'Nigerian University',
      authorDepartment: userProfile?.department || 'Engineering',
      authorLevel: userProfile?.level || '300L',
      content: text,
      createdAt: Date.now(),
    };

    try {
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment],
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
        )
      );
      setNewCommentText((prev) => ({ ...prev, [postId]: '' }));

      await firestoreService.addPostComment(postId, comment);
      await recordDailyActivity();
    } catch (e) {
      console.error('Failed to post comment:', e);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setConfirmDeleteId(null);
    await firestoreService.deleteCommunityPost(postId).catch((e) => {
      console.warn('Delete post notice:', e);
    });
  };

  // Filtered posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || post.category === selectedCategory;

    const matchesUni =
      selectedUni === 'All Universities' ||
      post.authorUniversity.toLowerCase().includes(selectedUni.toLowerCase());

    return matchesSearch && matchesCategory && matchesUni;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Campus Community Header */}
      <div className="p-6 rounded-2xl border bg-[#FDFBF7] dark:bg-[#11221B] text-[#142E22] dark:text-[#F6F3EE] border-[#E8E1D3] dark:border-[#223A30] paper-shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#C67D0A]/12 dark:from-[#E0A844]/12 via-[#1B4332]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-[#C67D0A] dark:bg-[#E0A844] animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#C67D0A] dark:text-[#E0A844] font-bold">
                EngiHub Campus Commons
              </span>
              <span className="text-[#687D72]">·</span>
              <span className="text-xs text-[#687D72] dark:text-[#AEC1B6]">
                UNILAG · FUTA · ABU · UNN · OAU · Covenant
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5">
              <span>Campus Engineering Community</span>
            </h1>
            <p className="text-sm text-[#405449] dark:text-[#AEC1B6] mt-1 max-w-2xl">
              Collaborate on SWEP projects, share verified past question derivations, exchange circuit schematics, and learn alongside engineering students across Nigeria.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setPostError('');
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] dark:bg-[#E0A844] dark:hover:bg-[#DDA15E] text-white dark:text-[#0B1612] text-xs font-semibold shadow-sm transition-all self-start sm:self-auto cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Discussion Post</span>
          </motion.button>
        </div>
      </div>

      {noticeBanner && (
        <div className="p-3 rounded-xl bg-[#E8F1EC] dark:bg-[#162C23] border border-[#1B4332]/30 dark:border-[#325C4B] text-[#1B4332] dark:text-[#AEC1B6] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] dark:text-[#E0A844] shrink-0" />
          <span>{noticeBanner}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border bg-[#FDFBF7] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#223A30] space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#687D72] dark:text-[#6E8578]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equations, SWEP projects, thermodynamics, circuit boards..."
              className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-[#F5EFE6] dark:bg-[#0B1612] text-[#142E22] dark:text-[#F6F3EE] border border-[#E8E1D3] dark:border-[#223A30] focus:border-[#1B4332] dark:focus:border-[#E0A844] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedUni}
              onChange={(e) => setSelectedUni(e.target.value)}
              aria-label="Filter by Nigerian University"
              className="px-3 py-2 rounded-lg text-xs bg-[#F5EFE6] dark:bg-[#0B1612] text-[#142E22] dark:text-[#F6F3EE] border border-[#E8E1D3] dark:border-[#223A30] focus:border-[#1B4332] dark:focus:border-[#E0A844] focus:outline-hidden font-medium"
            >
              {NIGERIAN_UNIVERSITIES.map((uni) => (
                <option key={uni} value={uni}>
                  {uni}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories segmented scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white font-semibold shadow-xs'
                  : 'bg-[#F5EFE6] dark:bg-[#0B1612] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-white border border-[#E8E1D3] dark:border-[#223A30]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Stream */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#687D72] dark:text-[#AEC1B6] animate-pulse font-mono">
          Loading engineering community discussions...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-12 rounded-xl border border-[#E8E1D3] dark:border-[#223A30] bg-[#FDFBF7] dark:bg-[#11221B] text-center space-y-3">
          <Users className="w-8 h-8 text-[#687D72] dark:text-[#6E8578] mx-auto" />
          <h3 className="font-serif font-semibold text-[#142E22] dark:text-[#F6F3EE] text-base">
            No discussions found in this view
          </h3>
          <p className="text-xs text-[#687D72] dark:text-[#AEC1B6] max-w-sm mx-auto">
            Be the first to start a conversation, share your university SWEP build, or post a past question derivation!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg bg-[#1B4332] dark:bg-[#E0A844] text-white dark:text-[#0B1612] text-xs font-semibold hover:opacity-90"
          >
            Start First Post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const hasUpvoted = currentUser && post.upvotedBy.includes(currentUser.uid);
            const isCommentsOpen = expandedPostId === post.id;
            const commentsList = commentsMap[post.id] || [];

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border bg-[#FDFBF7] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#223A30] overflow-hidden hover:border-[#1B4332]/40 dark:hover:border-[#325C4B] transition-all paper-shadow-sm"
              >
                {/* Real Engineering Photo Attachment Header */}
                {post.imageUrl && (
                  <div className="w-full h-48 sm:h-64 overflow-hidden relative group">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    <span className="absolute top-3 right-3 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-black/65 text-[#E0A844] border border-white/15 backdrop-blur-xs">
                      Engineering Showcase
                    </span>
                  </div>
                )}

                <div className="p-5 sm:p-6 space-y-4">
                  {/* Author Header */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1B4332] to-[#C67D0A] dark:from-[#2D6A4F] dark:to-[#E0A844] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                        {post.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#142E22] dark:text-[#F6F3EE] block">
                            {post.authorName}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FDF4E5] dark:bg-[#1D2B20] text-[#A86604] dark:text-[#E0A844] font-mono border border-[#E8D4B0] dark:border-[#325C4B] font-semibold">
                            {post.authorLevel}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#687D72] dark:text-[#6E8578] block mt-0.5">
                          {post.authorDepartment} ·{' '}
                          <span className="text-[#405449] dark:text-[#AEC1B6]">{post.authorUniversity}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-[#F5EFE6] dark:bg-[#0B1612] text-[#405449] dark:text-[#AEC1B6] border border-[#E8E1D3] dark:border-[#223A30]">
                        {post.category}
                      </span>
                      {(currentUser?.uid === post.authorId || isAdmin) && (
                        confirmDeleteId === post.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-semibold"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded bg-[#F5EFE6] dark:bg-[#162C23] text-[#405449] dark:text-[#AEC1B6] text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(post.id)}
                            className="text-[#687D72] hover:text-red-500 p-1"
                            title="Delete post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Post Title */}
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#142E22] dark:text-[#F6F3EE] tracking-tight leading-snug">
                    {post.title}
                  </h2>

                  {/* Post Content */}
                  <div className="text-xs text-[#405449] dark:text-[#AEC1B6] leading-relaxed space-y-2">
                    <MarkdownView content={post.content} />
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5EFE6] dark:bg-[#0B1612] text-[#1B4332] dark:text-[#E0A844] border border-[#E8E1D3] dark:border-[#223A30]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E8E1D3] dark:border-[#223A30] text-xs">
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleToggleUpvote(post)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-colors ${
                          hasUpvoted
                            ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white border-[#1B4332] dark:border-[#325C4B]'
                            : 'bg-[#F5EFE6] dark:bg-[#0B1612] text-[#405449] dark:text-[#AEC1B6] border-[#E8E1D3] dark:border-[#223A30] hover:text-[#142E22] dark:hover:text-white'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-current' : ''}`} />
                        <span>{post.upvotesCount || 0} Upvotes</span>
                      </motion.button>

                      <button
                        onClick={() => handleToggleComments(post.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                          isCommentsOpen
                            ? 'bg-[#E8F1EC] dark:bg-[#162C23] text-[#1B4332] dark:text-[#E0A844] border-[#1B4332]/40 dark:border-[#325C4B]'
                            : 'bg-[#F5EFE6] dark:bg-[#0B1612] text-[#405449] dark:text-[#AEC1B6] border-[#E8E1D3] dark:border-[#223A30] hover:text-[#142E22] dark:hover:text-white'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.commentsCount || 0} Comments</span>
                      </button>
                    </div>

                    <span className="text-[10px] text-[#687D72] dark:text-[#6E8578] font-mono">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Expandable Comments Drawer */}
                  <AnimatePresence>
                    {isCommentsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-3 border-t border-[#E8E1D3] dark:border-[#223A30] space-y-3"
                      >
                        <span className="text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] block">
                          Student Discussion Thread ({commentsList.length})
                        </span>

                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {commentsList.length === 0 ? (
                            <p className="text-xs text-[#687D72] dark:text-[#6E8578] italic py-2">
                              No comments yet. Start the engineering discussion!
                            </p>
                          ) : (
                            commentsList.map((comm) => (
                              <div
                                key={comm.id}
                                className="p-3 rounded-lg bg-[#F5EFE6] dark:bg-[#0B1612] border border-[#E8E1D3] dark:border-[#223A30] space-y-1"
                              >
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-semibold text-[#142E22] dark:text-[#F6F3EE]">
                                    {comm.authorName} ({comm.authorUniversity})
                                  </span>
                                  <span className="text-[10px] text-[#687D72] dark:text-[#6E8578] font-mono">
                                    {new Date(comm.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                <p className="text-xs text-[#405449] dark:text-[#AEC1B6]">{comm.content}</p>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            value={newCommentText[post.id] || ''}
                            onChange={(e) =>
                              setNewCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                            placeholder="Write a reply or mathematical clarification..."
                            className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#F5EFE6] dark:bg-[#0B1612] border border-[#E8E1D3] dark:border-[#223A30] text-[#142E22] dark:text-[#F6F3EE] focus:outline-hidden focus:border-[#1B4332] dark:focus:border-[#E0A844]"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={submittingComment || !(newCommentText[post.id] || '').trim()}
                            className="px-3 py-2 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] dark:bg-[#E0A844] dark:hover:bg-[#DDA15E] text-white dark:text-[#0B1612] text-xs font-semibold disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl rounded-2xl border bg-[#FDFBF7] dark:bg-[#11221B] text-[#142E22] dark:text-[#F6F3EE] border-[#E8E1D3] dark:border-[#223A30] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#E8E1D3] dark:border-[#223A30] pb-3">
                <div className="flex items-center gap-2">
                  <EngiHubLogo size="sm" />
                  <h3 className="font-serif font-bold text-base">Create Community Post</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-[#687D72] hover:text-[#142E22] dark:hover:text-white hover:bg-[#F5EFE6] dark:hover:bg-[#162C23]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {postError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{postError}</span>
                </div>
              )}

              <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#405449] dark:text-[#AEC1B6] font-semibold mb-1">
                    Discussion Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="e.g. Sizing 2.5kVA Inverter Transformer or CVE 301 Mohr Circle trick"
                    className="w-full px-3 py-2 rounded-lg bg-[#F5EFE6] dark:bg-[#0B1612] border border-[#E8E1D3] dark:border-[#223A30] text-[#142E22] dark:text-[#F6F3EE] focus:outline-hidden focus:border-[#1B4332] dark:focus:border-[#E0A844]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#405449] dark:text-[#AEC1B6] font-semibold mb-1">
                      Category
                    </label>
                    <select
                      value={postCategory}
                      onChange={(e) => setPostCategory(e.target.value as CommunityCategory)}
                      className="w-full px-3 py-2 rounded-lg bg-[#F5EFE6] dark:bg-[#0B1612] border border-[#E8E1D3] dark:border-[#223A30] text-[#142E22] dark:text-[#F6F3EE] focus:outline-hidden focus:border-[#1B4332] dark:focus:border-[#E0A844]"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#405449] dark:text-[#AEC1B6] font-semibold mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={postTags}
                      onChange={(e) => setPostTags(e.target.value)}
                      placeholder="Thermodynamics, SWEP, Inverter, CVE305"
                      className="w-full px-3 py-2 rounded-lg bg-[#F5EFE6] dark:bg-[#0B1612] border border-[#E8E1D3] dark:border-[#223A30] text-[#142E22] dark:text-[#F6F3EE] focus:outline-hidden focus:border-[#1B4332] dark:focus:border-[#E0A844]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#405449] dark:text-[#AEC1B6] font-semibold mb-1">
                    Photo Attachment (Real Engineering Photo Preset or URL)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="url"
                      value={postPhotoUrl}
                      onChange={(e) => setPostPhotoUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-[#F5EFE6] dark:bg-[#0B1612] border border-[#E8E1D3] dark:border-[#223A30] text-[#142E22] dark:text-[#F6F3EE] focus:outline-hidden focus:border-[#1B4332] dark:focus:border-[#E0A844]"
                    />
                    <button
                      type="button"
                      onClick={() => setPostPhotoUrl(REAL_ENGINEERING_PHOTOS.electricalCircuit)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#F5EFE6] dark:bg-[#162C23] border border-[#E8E1D3] dark:border-[#223A30] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-white"
                    >
                      Circuit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostPhotoUrl(REAL_ENGINEERING_PHOTOS.solarPower)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#F5EFE6] dark:bg-[#162C23] border border-[#E8E1D3] dark:border-[#223A30] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-white"
                    >
                      Solar
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostPhotoUrl(REAL_ENGINEERING_PHOTOS.civilEngineering)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#F5EFE6] dark:bg-[#162C23] border border-[#E8E1D3] dark:border-[#223A30] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-white"
                    >
                      Civil
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[#405449] dark:text-[#AEC1B6] font-semibold mb-1">
                    Content / Derivation / Project Details * (Supports LaTeX $...$ and Code)
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share your calculation steps, project breakdown, BEME figures, or questions for other undergraduates..."
                    className="w-full px-3 py-2 rounded-lg bg-[#F5EFE6] dark:bg-[#0B1612] border border-[#E8E1D3] dark:border-[#223A30] text-[#142E22] dark:text-[#F6F3EE] focus:outline-hidden focus:border-[#1B4332] dark:focus:border-[#E0A844] font-mono text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E1D3] dark:border-[#223A30]">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg border border-[#E8E1D3] dark:border-[#223A30] text-[#687D72] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] dark:bg-[#E0A844] dark:hover:bg-[#DDA15E] text-white dark:text-[#0B1612] font-semibold flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Publishing...' : 'Publish to Community'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
