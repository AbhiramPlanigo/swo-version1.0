import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Committee, CommitteeMember } from '../../types';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { ImageUploadField } from '../common/ImageUploadField';
import { 
  Users, 
  Plus, 
  Mail, 
  Phone, 
  UserCheck, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  Search,
  Trash2,
  CheckCircle2,
  GraduationCap,
  Building,
  ArrowRight,
  UserPlus,
  RefreshCw,
  Award,
  Edit3
} from 'lucide-react';

export const AdminCommitteesView: React.FC = () => {
  const { 
    committees, 
    addCommitteeMember, 
    removeCommitteeMember, 
    updateCommittee, 
    createCommittee, 
    deleteCommittee, 
    registrations, 
    studentUser, 
    showToast 
  } = useApp();

  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string>(committees[0]?.id || 'com_01');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditCommitteeOpen, setIsEditCommitteeOpen] = useState(false);
  const [isCreateCommitteeOpen, setIsCreateCommitteeOpen] = useState(false);
  const [searchMember, setSearchMember] = useState('');
  const [globalRosterSearch, setGlobalRosterSearch] = useState('');

  // Committee Editing & Creation State
  const [editCommitteeForm, setEditCommitteeForm] = useState({
    name: '',
    wing: '',
    facultyCoordinator: '',
    leadName: '',
    deputyName: '',
    email: '',
    description: '',
  });

  const [createCommitteeForm, setCreateCommitteeForm] = useState({
    name: '',
    wing: '',
    facultyCoordinator: '',
    leadName: '',
    deputyName: '',
    email: '',
    description: '',
  });

  // Search by Registration Number & Assign State
  const [searchRegNo, setSearchRegNo] = useState('');
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [matchedStudent, setMatchedStudent] = useState<{
    name: string;
    regNo: string;
    email: string;
    department: string;
    phone?: string;
    source: string;
  } | null>(null);

  const [assignCommitteeId, setAssignCommitteeId] = useState<string>(committees[0]?.id || 'com_01');
  const [assignRole, setAssignRole] = useState<string>('Technical Lead');
  const [customRole, setCustomRole] = useState('');
  const [assignStudentName, setAssignStudentName] = useState('');
  const [assignStudentEmail, setAssignStudentEmail] = useState('');
  const [assignStudentDept, setAssignStudentDept] = useState('School of Engineering and Technology');
  const [assignStudentPhone, setAssignStudentPhone] = useState('');
  const [assignPortfolios, setAssignPortfolios] = useState('');

  // Standard Modal Add Member Form State
  const [memberForm, setMemberForm] = useState<Partial<CommitteeMember>>({
    name: '',
    regNo: '',
    role: 'Core Volunteer',
    department: 'School of Engineering and Technology',
    email: '',
    phone: '',
    assignedEvents: [],
  });

  const handleOpenEditCommittee = (comm: Committee) => {
    setEditCommitteeForm({
      name: comm.name || '',
      wing: comm.wing || '',
      facultyCoordinator: comm.facultyCoordinator || '',
      leadName: comm.leadName || '',
      deputyName: comm.deputyName || '',
      email: comm.email || '',
      description: comm.description || '',
    });
    setIsEditCommitteeOpen(true);
  };

  const handleSaveCommitteeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommittee) return;
    updateCommittee(activeCommittee.id, {
      name: editCommitteeForm.name.trim(),
      wing: editCommitteeForm.wing.trim(),
      facultyCoordinator: editCommitteeForm.facultyCoordinator.trim(),
      leadName: editCommitteeForm.leadName.trim(),
      deputyName: editCommitteeForm.deputyName.trim(),
      email: editCommitteeForm.email.trim(),
      description: editCommitteeForm.description.trim(),
    });
    setIsEditCommitteeOpen(false);
  };

  const handleCreateCommitteeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createCommitteeForm.name.trim()) return;
    const newWing = createCommittee({
      name: createCommitteeForm.name.trim(),
      wing: createCommitteeForm.wing.trim() || 'General SWO Wing',
      facultyCoordinator: createCommitteeForm.facultyCoordinator.trim(),
      leadName: createCommitteeForm.leadName.trim(),
      deputyName: createCommitteeForm.deputyName.trim(),
      email: createCommitteeForm.email.trim() || 'swo.yeshwanthpur@christuniversity.in',
      description: createCommitteeForm.description.trim(),
    });
    setSelectedCommitteeId(newWing.id);
    setCreateCommitteeForm({
      name: '',
      wing: '',
      facultyCoordinator: '',
      leadName: '',
      deputyName: '',
      email: '',
      description: '',
    });
    setIsCreateCommitteeOpen(false);
  };

  const activeCommittee = committees.find((c) => c.id === selectedCommitteeId) || committees[0];

  // Search student across active session and registrations by Reg No
  const handleFindStudentByRegNo = (queryReg: string) => {
    const cleanQuery = queryReg.trim().toLowerCase();
    if (!cleanQuery) {
      setMatchedStudent(null);
      return;
    }

    setIsSearchingStudent(true);

    // 1. Check currently active studentUser
    if (studentUser?.regNo && studentUser.regNo.trim().toLowerCase() === cleanQuery) {
      const match = {
        name: studentUser.name,
        regNo: studentUser.regNo,
        email: studentUser.email,
        department: studentUser.department || 'School of Engineering and Technology',
        phone: studentUser.phone || '',
        source: 'Active Student Session',
      };
      setMatchedStudent(match);
      setAssignStudentName(match.name);
      setAssignStudentEmail(match.email);
      setAssignStudentDept(match.department);
      setAssignStudentPhone(match.phone);
      setIsSearchingStudent(false);
      return;
    }

    // 2. Check event registrations list
    const foundReg = registrations.find(
      (r) => r.studentRegNo && r.studentRegNo.trim().toLowerCase() === cleanQuery
    );
    if (foundReg) {
      const match = {
        name: foundReg.studentName,
        regNo: foundReg.studentRegNo,
        email: foundReg.studentEmail,
        department: foundReg.studentDept || 'School of Engineering and Technology',
        phone: '',
        source: `Registered Attendee (${foundReg.eventTitle || 'Campus Events'})`,
      };
      setMatchedStudent(match);
      setAssignStudentName(match.name);
      setAssignStudentEmail(match.email);
      setAssignStudentDept(match.department);
      setIsSearchingStudent(false);
      return;
    }

    // 3. Check existing committee members
    for (const comm of committees) {
      const foundMem = comm.members.find(
        (m) => m.regNo && m.regNo.trim().toLowerCase() === cleanQuery
      );
      if (foundMem) {
        const match = {
          name: foundMem.name,
          regNo: foundMem.regNo,
          email: foundMem.email,
          department: foundMem.department || 'School of Engineering and Technology',
          phone: foundMem.phone || '',
          source: `Already in ${comm.name} (${foundMem.role})`,
        };
        setMatchedStudent(match);
        setAssignStudentName(match.name);
        setAssignStudentEmail(match.email);
        setAssignStudentDept(match.department);
        setAssignStudentPhone(match.phone);
        setIsSearchingStudent(false);
        return;
      }
    }

    // Not found automatically: keep query in regNo and allow manual entry
    setMatchedStudent(null);
    setIsSearchingStudent(false);
  };

  // Quick Assign Button Handler
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRegNo = searchRegNo.trim();
    const finalName = assignStudentName.trim();
    const finalEmail = assignStudentEmail.trim();

    if (!finalRegNo) {
      showToast('Registration Number Required', 'Please provide the student register number.', 'warning');
      return;
    }
    if (!finalName) {
      showToast('Student Name Required', 'Please enter the student full name.', 'warning');
      return;
    }

    const resolvedRole = assignRole === 'Custom' ? customRole.trim() || 'Core Volunteer' : assignRole;
    const portfolioArray = assignPortfolios
      ? assignPortfolios.split(',').map((p) => p.trim()).filter(Boolean)
      : ['General Operations'];

    addCommitteeMember(assignCommitteeId, {
      name: finalName,
      regNo: finalRegNo,
      role: resolvedRole,
      department: assignStudentDept || 'School of Engineering and Technology',
      email: finalEmail || `${finalRegNo.toLowerCase()}@christuniversity.in`,
      phone: assignStudentPhone,
      assignedEvents: portfolioArray,
    });

    const targetCommittee = committees.find((c) => c.id === assignCommitteeId);
    showToast(
      'Student Appointed Successfully',
      `${finalName} (${finalRegNo}) is now assigned as "${resolvedRole}" in ${targetCommittee?.name || 'the committee'}.`,
      'success'
    );

    // Reset search
    setSearchRegNo('');
    setMatchedStudent(null);
    setAssignStudentName('');
    setAssignStudentEmail('');
    setAssignStudentPhone('');
    setAssignPortfolios('');
    setCustomRole('');
  };

  // Handle Modal Submit
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommittee) return;

    const newMem: CommitteeMember = {
      id: `mem-${Date.now()}`,
      name: memberForm.name || 'Student Volunteer',
      regNo: memberForm.regNo || '2447000',
      role: memberForm.role || 'Member',
      department: memberForm.department || 'School of Engineering and Technology',
      email: memberForm.email || 'student@res.christuniversity.in',
      phone: memberForm.phone || '+91 9800000000',
      avatar: memberForm.avatar,
      assignedEvents: memberForm.assignedEvents || ['General Operations'],
    };

    addCommitteeMember(activeCommittee.id, newMem);
    setIsAddMemberOpen(false);
    setMemberForm({
      name: '',
      regNo: '',
      role: 'Core Volunteer',
      department: 'School of Engineering and Technology',
      email: '',
      phone: '',
      avatar: undefined,
      assignedEvents: [],
    });
  };

  // Find all committee affiliations for matched student
  const matchedAffiliations = useMemo(() => {
    if (!matchedStudent?.regNo) return [];
    const q = matchedStudent.regNo.trim().toLowerCase();
    return committees.flatMap((c) =>
      c.members.filter((m) => m.regNo && m.regNo.trim().toLowerCase() === q).map((m) => ({
        committeeName: c.name,
        role: m.role,
        wing: c.wing,
      }))
    );
  }, [matchedStudent, committees]);

  // Global Roster: Flatten all members across all committees
  const allAppointedMembers = useMemo(() => {
    return committees.flatMap((c) =>
      c.members.map((m) => ({
        ...m,
        committeeId: c.id,
        committeeName: c.name,
        committeeWing: c.wing,
      }))
    );
  }, [committees]);

  const filteredGlobalRoster = useMemo(() => {
    if (!globalRosterSearch.trim()) return allAppointedMembers;
    const q = globalRosterSearch.toLowerCase();
    return allAppointedMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.regNo.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.committeeName.toLowerCase().includes(q)
    );
  }, [allAppointedMembers, globalRosterSearch]);

  const filteredMembers = activeCommittee?.members.filter((m) => {
    if (!searchMember.trim()) return true;
    const q = searchMember.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.regNo.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  }) || [];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#002147]/10 dark:bg-white/10 text-[#002147] dark:text-[#93C5FD]">
              Student Leadership & Portfolios
            </span>
            <span className="text-xs text-[#86868B] dark:text-slate-400">Yeshwanthpur Campus SWO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-white tracking-tight mt-1">
            Committees & Volunteer Wings
          </h2>
          <p className="text-sm text-[#86868B] dark:text-slate-400 mt-1">
            Search students by registration number, appoint leadership designations, and manage official committee rosters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <AppleButton
            variant="secondary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateCommitteeOpen(true)}
          >
            Create New Wing
          </AppleButton>
          <AppleButton
            variant="navy"
            size="md"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsAddMemberOpen(true)}
          >
            Add Committee Member
          </AppleButton>
        </div>
      </div>

      {/* Primary Feature Card: Search by Registration Number & Assign Committee */}
      <AppleCard padding="lg" className="border border-[#002147]/15 dark:border-white/10 bg-gradient-to-br from-slate-50/80 via-white to-blue-50/20 dark:from-[#141A26] dark:via-[#161F2E] dark:to-[#121824] shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-[#002147] dark:bg-[#0071E3] text-white flex items-center justify-center">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white tracking-tight">
              Assign Committee by Registration Number
            </h3>
            <p className="text-xs text-[#86868B] dark:text-slate-400">
              Look up any student profile using their Christ register number to appoint them to an SWO committee or leadership role.
            </p>
          </div>
        </div>

        <form onSubmit={handleAssignSubmit} className="mt-4 space-y-4">
          {/* Step 1: Registration Number Input with Auto-Search */}
          <div>
            <label className="block text-xs font-bold text-[#1D1D1F] dark:text-slate-200 uppercase tracking-wider mb-1.5">
              1. Student Register Number <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 2447101, 2447108, 2421503..."
                  value={searchRegNo}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchRegNo(val);
                    handleFindStudentByRegNo(val);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/10 dark:border-white/15 text-xs font-mono font-semibold text-[#1D1D1F] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20"
                />
              </div>

              <button
                type="button"
                onClick={() => handleFindStudentByRegNo(searchRegNo)}
                className="px-4 py-2.5 rounded-xl bg-[#002147] hover:bg-[#002E62] dark:bg-[#0071E3] dark:hover:bg-[#0077ED] text-white text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Find Student</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Student Discovery Status Banner */}
          {matchedStudent ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  {matchedStudent.name ? matchedStudent.name[0].toUpperCase() : 'S'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-emerald-950 dark:text-emerald-200 text-sm">
                      {matchedStudent.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100">
                      {matchedStudent.regNo}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    {matchedStudent.email} • {matchedStudent.department}
                  </p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Found in: {matchedStudent.source}
                  </p>
                </div>
              </div>

              {matchedAffiliations.length > 0 && (
                <div className="sm:text-right text-[11px] text-emerald-900 dark:text-emerald-200 border-t sm:border-t-0 sm:border-l border-emerald-200/60 dark:border-emerald-800/60 sm:pl-3 pt-2 sm:pt-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">Existing Roles:</span>
                  {matchedAffiliations.map((aff, i) => (
                    <span key={i} className="font-semibold block">{aff.committeeName} ({aff.role})</span>
                  ))}
                </div>
              )}
            </div>
          ) : searchRegNo.trim().length > 2 ? (
            <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <span className="text-sm">ℹ️</span>
              <div>
                <p className="font-semibold">No existing record found for "{searchRegNo}".</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                  You can enter the student's name and details below to create their appointment record directly.
                </p>
              </div>
            </div>
          ) : null}

          {/* Step 2: Student Details & Assignment Targets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-[#536275] dark:text-slate-300 mb-1">
                Student Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Abhiram U"
                value={assignStudentName}
                onChange={(e) => setAssignStudentName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/10 dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#536275] dark:text-slate-300 mb-1">
                Target Committee Wing <span className="text-rose-500">*</span>
              </label>
              <select
                value={assignCommitteeId}
                onChange={(e) => setAssignCommitteeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/10 dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20"
              >
                {committees.map((comm) => (
                  <option key={comm.id} value={comm.id} className="bg-white dark:bg-[#1E293B] text-[#1D1D1F] dark:text-white">
                    {comm.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#536275] dark:text-slate-300 mb-1">
                Designation / Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={assignRole}
                onChange={(e) => setAssignRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/10 dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20"
              >
                <option value="Technical Lead">Technical Lead</option>
                <option value="Tech Lead & Webmaster">Tech Lead & Webmaster</option>
                <option value="Student Head">Student Head</option>
                <option value="Deputy Lead">Deputy Lead</option>
                <option value="Creative Director">Creative Director</option>
                <option value="Motion & UI Designer">Motion & UI Designer</option>
                <option value="Auditorium Stage Manager">Auditorium Stage Manager</option>
                <option value="Logistics Marshal">Logistics Marshal</option>
                <option value="Social Cell Convener">Social Cell Convener</option>
                <option value="Outreach Coordinator">Outreach Coordinator</option>
                <option value="Core Volunteer">Core Volunteer</option>
                <option value="Custom">-- Custom Role --</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#536275] dark:text-slate-300 mb-1">
                Academic School / Dept
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science & Engg"
                value={assignStudentDept}
                onChange={(e) => setAssignStudentDept(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/10 dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20"
              />
            </div>
          </div>

          {/* Custom Role Input if selected */}
          {assignRole === 'Custom' && (
            <div>
              <label className="block text-[11px] font-bold text-[#536275] dark:text-slate-300 mb-1">
                Enter Custom Designation / Role <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Stage AV Systems Lead, Guest Escort Officer..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/10 dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20"
              />
            </div>
          )}

          {/* Optional Portfolios & Confirm Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-black/5 dark:border-white/10">
            <div className="w-full sm:w-2/3">
              <input
                type="text"
                placeholder="Assigned Portfolios / Events (e.g. Darpan 2026, Talk Series, Web Portal)"
                value={assignPortfolios}
                onChange={(e) => setAssignPortfolios(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/10 dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#002147] hover:bg-[#002E62] dark:bg-[#0071E3] dark:hover:bg-[#0077ED] text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirm Appointment</span>
            </button>
          </div>
        </form>
      </AppleCard>

      {/* Committee Select Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {committees.map((comm) => (
          <button
            key={comm.id}
            onClick={() => setSelectedCommitteeId(comm.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
              selectedCommitteeId === comm.id
                ? 'bg-[#002147] dark:bg-[#0071E3] text-white border-[#002147] dark:border-[#0071E3] shadow-sm'
                : 'bg-white dark:bg-[#141A26] text-[#515154] dark:text-slate-300 hover:text-[#1D1D1F] dark:hover:text-white border-black/[0.06] dark:border-white/10'
            }`}
          >
            {comm.name} ({comm.members?.length || 0})
          </button>
        ))}

        <button
          type="button"
          onClick={() => setIsCreateCommitteeOpen(true)}
          className="px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border border-dashed border-[#0071E3]/40 text-[#0071E3] dark:text-[#93C5FD] hover:bg-[#0071E3]/10 cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Wing</span>
        </button>
      </div>

      {/* Active Committee Details Card */}
      {activeCommittee && (
        <AppleCard padding="lg" className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] space-y-4 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-black/[0.05] dark:border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#0071E3] dark:text-[#93C5FD] uppercase tracking-wider">
                  {activeCommittee.wing}
                </span>
                {activeCommittee.email && (
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                    • {activeCommittee.email}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-white mt-0.5">
                {activeCommittee.name}
              </h3>
              <p className="text-xs text-[#515154] dark:text-slate-300 max-w-2xl leading-relaxed">
                {activeCommittee.description || 'No description entered yet. Click "Edit Wing Details" to update.'}
              </p>
              {(activeCommittee.leadName || activeCommittee.deputyName) && (
                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1 flex-wrap">
                  {activeCommittee.leadName && (
                    <span>Lead: <strong className="text-[#1D1D1F] dark:text-white">{activeCommittee.leadName}</strong></span>
                  )}
                  {activeCommittee.deputyName && (
                    <span>Deputy: <strong className="text-[#1D1D1F] dark:text-white">{activeCommittee.deputyName}</strong></span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => handleOpenEditCommittee(activeCommittee)}
                className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-xs text-left hover:border-[#0071E3]/40 hover:bg-[#0071E3]/5 dark:hover:bg-[#0071E3]/10 transition-all cursor-pointer group min-w-[170px]"
                title="Click to edit Faculty Coordinator"
              >
                <div className="flex items-center justify-between gap-3 mb-0.5">
                  <span className="text-[10px] text-[#86868B] dark:text-slate-400 uppercase tracking-wider font-bold">
                    Faculty Coordinator
                  </span>
                  <Edit3 className="w-3 h-3 text-[#0071E3] opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className={`font-bold text-xs block truncate ${
                  activeCommittee.facultyCoordinator 
                    ? 'text-[#1D1D1F] dark:text-white' 
                    : 'text-[#0071E3] dark:text-[#93C5FD] italic'
                }`}>
                  {activeCommittee.facultyCoordinator || '+ Appoint Coordinator'}
                </span>
              </button>

              <AppleButton
                variant="secondary"
                size="sm"
                icon={<Edit3 className="w-3.5 h-3.5" />}
                onClick={() => handleOpenEditCommittee(activeCommittee)}
              >
                Edit Wing Details
              </AppleButton>
            </div>
          </div>

          {/* Members Search & Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#86868B] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by name, reg no, or role..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white placeholder-[#86868B] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 shadow-xs"
              />
            </div>

            <span className="text-xs text-[#86868B] dark:text-slate-400">
              Showing {filteredMembers.length} of {activeCommittee.members?.length || 0} appointed members
            </span>
          </div>

          {/* Members Grid or Empty State */}
          {filteredMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredMembers.map((mem) => (
                <div
                  key={mem.id}
                  className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/10 space-y-3 relative group transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-[#1D1D1F] dark:text-white tracking-tight">{mem.name}</h4>
                      <p className="text-xs font-semibold text-[#0071E3] dark:text-[#93C5FD]">{mem.role}</p>
                      <p className="text-[11px] font-mono text-[#86868B] dark:text-slate-400 mt-0.5">{mem.regNo}</p>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Remove ${mem.name} from ${activeCommittee.name}?`)) {
                          removeCommitteeMember(activeCommittee.id, mem.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-[#86868B] hover:text-[#FF3B30] hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-60 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Remove Member Appointment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1 text-xs text-[#515154] dark:text-slate-300 border-t border-black/[0.04] dark:border-white/10 pt-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-[#86868B] dark:text-slate-400 shrink-0" />
                      <span className="truncate">{mem.email}</span>
                    </div>
                    {mem.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                        <span>{mem.phone}</span>
                      </div>
                    )}
                  </div>

                  {mem.assignedEvents && mem.assignedEvents.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {mem.assignedEvents.map((evtName, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#002147]/5 dark:bg-white/10 text-[#002147] dark:text-slate-200 border border-[#002147]/10 dark:border-white/10"
                        >
                          {evtName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-black/[0.01] dark:bg-white/[0.02] border border-dashed border-black/10 dark:border-white/10 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">
                No Members Currently Appointed
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Use the search box above to find any student by Registration Number and assign them to this committee.
              </p>
            </div>
          )}
        </AppleCard>
      )}

      {/* Global Roster Section: All Appointed Students Across Campus */}
      <AppleCard padding="lg" className="border border-black/[0.06] dark:border-white/10 dark:bg-[#141A26] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.05] dark:border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-white">
              All Appointed Students Roster ({allAppointedMembers.length})
            </h3>
            <p className="text-xs text-[#86868B] dark:text-slate-400">
              Campus-wide index of all students assigned to SWO committees, searchable by Registration Number.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Reg No or Name..."
              value={globalRosterSearch}
              onChange={(e) => setGlobalRosterSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/10 dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20"
            />
          </div>
        </div>

        {filteredGlobalRoster.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/10 text-[11px] font-bold text-[#86868B] dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Register No</th>
                  <th className="py-2.5 px-3">Committee Wing</th>
                  <th className="py-2.5 px-3">Role / Designation</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/5">
                {filteredGlobalRoster.map((mem) => (
                  <tr key={mem.committeeId + mem.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#1D1D1F] dark:text-white">
                      {mem.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#0071E3] dark:text-[#93C5FD]">
                      {mem.regNo}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {mem.committeeName}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#1D1D1F] dark:text-white">
                      {mem.role}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                      {mem.department}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${mem.name} from ${mem.committeeName}?`)) {
                            removeCommitteeMember(mem.committeeId, mem.id);
                          }
                        }}
                        className="text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
                      >
                        Unassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            No appointed students found matching your search.
          </div>
        )}
      </AppleCard>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        title={`Add Member to ${activeCommittee?.name || 'Committee'}`}
        subtitle="Appoint student leader or volunteer"
        maxWidth="md"
      >
        <form onSubmit={handleAddMemberSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
              Student Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Diya Menon"
              value={memberForm.name}
              onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
                Register Number *
              </label>
              <input
                type="text"
                required
                placeholder="2447109"
                value={memberForm.regNo}
                onChange={(e) => setMemberForm({ ...memberForm, regNo: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs font-mono text-[#1D1D1F] dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
                Committee Role *
              </label>
              <select
                value={memberForm.role}
                onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
              >
                <option value="Student Head">Student Head</option>
                <option value="Deputy Lead">Deputy Lead</option>
                <option value="Technical Lead">Technical Lead</option>
                <option value="Auditorium Stage Manager">Auditorium Stage Manager</option>
                <option value="Creative Director">Creative Director</option>
                <option value="Core Volunteer">Core Volunteer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
              University Email *
            </label>
            <input
              type="email"
              required
              placeholder="diya.m@christuniversity.in"
              value={memberForm.email}
              onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
              Phone
            </label>
            <input
              type="text"
              placeholder="+91 98450 11223"
              value={memberForm.phone}
              onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
            />
          </div>

          <div>
            <ImageUploadField
              label="Member Profile Photograph (Optional)"
              value={memberForm.avatar || ''}
              onChange={(url) => setMemberForm({ ...memberForm, avatar: url })}
              aspectRatio="1:1"
              recommendedDimensions="400 × 400 px"
              description="This is the ratio of the image allowed: 1:1 Square. Square portraits display cleanly across the official committee roster."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/10">
            <AppleButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddMemberOpen(false)}
            >
              Cancel
            </AppleButton>
            <AppleButton type="submit" variant="primary" size="sm">
              Confirm Appointment
            </AppleButton>
          </div>
        </form>
      </Modal>

      {/* Edit Committee Details Modal */}
      <Modal
        isOpen={isEditCommitteeOpen}
        onClose={() => setIsEditCommitteeOpen(false)}
        title={`Edit ${activeCommittee?.name || 'Committee'} Details`}
        subtitle="Configure faculty coordinator, leadership designations, and wing details"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCommitteeSubmit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-[#0071E3]/5 dark:bg-[#0071E3]/10 border border-[#0071E3]/20 space-y-1">
            <span className="text-xs font-bold text-[#0071E3] dark:text-[#93C5FD] block">
              Faculty Coordinator Assignment
            </span>
            <p className="text-[11px] text-[#536275] dark:text-slate-300">
              Appoint or update the faculty coordinator for this committee wing. Updates live across student portals.
            </p>
            <input
              type="text"
              placeholder="e.g. Dr. Coordinator Name / Prof. Name (Leave empty if unassigned)"
              value={editCommitteeForm.facultyCoordinator}
              onChange={(e) => setEditCommitteeForm({ ...editCommitteeForm, facultyCoordinator: e.target.value })}
              className="w-full px-3.5 py-2 mt-1 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white font-semibold focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
                Committee Wing Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SWO Cultural & Performing Arts Wing"
                value={editCommitteeForm.name}
                onChange={(e) => setEditCommitteeForm({ ...editCommitteeForm, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
                Wing Category / Tag *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cultural Wing, Tech Wing"
                value={editCommitteeForm.wing}
                onChange={(e) => setEditCommitteeForm({ ...editCommitteeForm, wing: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
                Student Lead / Convenor
              </label>
              <input
                type="text"
                placeholder="e.g. Student Convenor Name"
                value={editCommitteeForm.leadName}
                onChange={(e) => setEditCommitteeForm({ ...editCommitteeForm, leadName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
                Deputy Lead / Co-Convenor
              </label>
              <input
                type="text"
                placeholder="e.g. Deputy Student Name"
                value={editCommitteeForm.deputyName}
                onChange={(e) => setEditCommitteeForm({ ...editCommitteeForm, deputyName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
              Official Contact Email
            </label>
            <input
              type="email"
              placeholder="e.g. swo.cultural.yp@christuniversity.in"
              value={editCommitteeForm.email}
              onChange={(e) => setEditCommitteeForm({ ...editCommitteeForm, email: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
              Description / Responsibilities
            </label>
            <textarea
              rows={3}
              placeholder="Detailed description of responsibilities and scope..."
              value={editCommitteeForm.description}
              onChange={(e) => setEditCommitteeForm({ ...editCommitteeForm, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-black/[0.05] dark:border-white/10">
            {committees.length > 1 ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${activeCommittee?.name}"?`)) {
                    if (activeCommittee) {
                      deleteCommittee(activeCommittee.id);
                      setSelectedCommitteeId(committees.find((c) => c.id !== activeCommittee.id)?.id || '');
                      setIsEditCommitteeOpen(false);
                    }
                  }
                }}
                className="text-rose-600 dark:text-rose-400 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Wing</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <AppleButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsEditCommitteeOpen(false)}
              >
                Cancel
              </AppleButton>
              <AppleButton type="submit" variant="primary" size="sm">
                Save Changes
              </AppleButton>
            </div>
          </div>
        </form>
      </Modal>

      {/* Create New Committee Wing Modal */}
      <Modal
        isOpen={isCreateCommitteeOpen}
        onClose={() => setIsCreateCommitteeOpen(false)}
        title="Create New SWO Committee Wing"
        subtitle="Establish a new student committee or volunteer wing"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCommitteeSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
                Committee Wing Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SWO Sports & Health Wing"
                value={createCommitteeForm.name}
                onChange={(e) => setCreateCommitteeForm({ ...createCommitteeForm, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
                Wing Category / Tag *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sports & Recreation Wing"
                value={createCommitteeForm.wing}
                onChange={(e) => setCreateCommitteeForm({ ...createCommitteeForm, wing: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
                Faculty Coordinator Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Coordinator Name"
                value={createCommitteeForm.facultyCoordinator}
                onChange={(e) => setCreateCommitteeForm({ ...createCommitteeForm, facultyCoordinator: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
                Official Wing Email
              </label>
              <input
                type="email"
                placeholder="e.g. swo.sports.yp@christuniversity.in"
                value={createCommitteeForm.email}
                onChange={(e) => setCreateCommitteeForm({ ...createCommitteeForm, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
                Student Lead / Convenor
              </label>
              <input
                type="text"
                placeholder="e.g. Lead Student Name"
                value={createCommitteeForm.leadName}
                onChange={(e) => setCreateCommitteeForm({ ...createCommitteeForm, leadName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
                Deputy Lead / Co-Convenor
              </label>
              <input
                type="text"
                placeholder="e.g. Deputy Student Name"
                value={createCommitteeForm.deputyName}
                onChange={(e) => setCreateCommitteeForm({ ...createCommitteeForm, deputyName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] dark:text-slate-200 block mb-1">
              Description / Responsibilities
            </label>
            <textarea
              rows={3}
              placeholder="Describe the committee's domain and responsibilities..."
              value={createCommitteeForm.description}
              onChange={(e) => setCreateCommitteeForm({ ...createCommitteeForm, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-black/[0.08] dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.05] dark:border-white/10">
            <AppleButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateCommitteeOpen(false)}
            >
              Cancel
            </AppleButton>
            <AppleButton type="submit" variant="primary" size="sm">
              Create Wing
            </AppleButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

