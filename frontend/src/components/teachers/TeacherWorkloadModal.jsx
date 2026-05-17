import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    XMarkIcon, 
    BookOpenIcon, 
    UserGroupIcon, 
    PlusIcon, 
    TrashIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import { workloadService } from '../../services/workloadService';
import toast from 'react-hot-toast';

const parseClassList = (assignedClasses) => {
    if (Array.isArray(assignedClasses)) return assignedClasses.filter(Boolean);
    if (typeof assignedClasses === 'string') {
        return assignedClasses.split(',').map((item) => item.trim()).filter(Boolean);
    }
    return [];
};

const TeacherWorkloadModal = ({ isOpen, onClose, teacher, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [availableData, setAvailableData] = useState({ classes: [], subjects: [] });
    const [currentSubjects, setCurrentSubjects] = useState([]);
    
    // Form States
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedClassForSubject, setSelectedClassForSubject] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return [currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map(String);
    }, []);

    useEffect(() => {
        if (isOpen && teacher) {
            loadData();
        }
    }, [isOpen, teacher]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [meta, workload] = await Promise.all([
                workloadService.getAssignmentMetadata(),
                workloadService.getTeacherWorkload(teacher.id)
            ]);
            setAvailableData(meta);
            setCurrentSubjects(Array.isArray(workload.subjects) ? workload.subjects : []);
        } catch (error) {
            toast.error("Failed to load assignment data");
        } finally {
            setLoading(false);
        }
    };

    const toggleClassSelection = (className) => {
        setSelectedClassForSubject(className);
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        if (!selectedSubject) return toast.error("Please select a subject.");
        if (!selectedClassForSubject) return toast.error("Please select a class for this subject.");

        setSubmitting(true);
        try {
            await workloadService.assignSubject(teacher.id, selectedSubject, {
                isPrimary: currentSubjects.length === 0,
                assignedClasses: selectedClassForSubject,
                academicYear: selectedYear
            });
            toast.success("Subject assigned successfully");
            setSelectedSubject('');
            setSelectedClassForSubject('');
            loadData();
            onUpdate();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to assign subject");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssignClassTeacher = async () => {
        if (!selectedClassId) return toast.error("Select a class");
        
        setSubmitting(true);
        try {
            await workloadService.assignClassTeacher(selectedClassId, teacher.id);
            toast.success(`Assigned as Class Teacher for the selected class`);
            onUpdate();
            onClose();
        } catch (error) {
            toast.error("Failed to assign class responsibility");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveSubject = async (subjectId) => {
        try {
            await workloadService.removeSubject(teacher.id, subjectId);
            toast.success("Subject removed");
            loadData();
            onUpdate();
        } catch (error) {
            toast.error("Failed to remove subject");
        }
    };

    const handleRemoveClassTeacher = async () => {
        if (!teacher?.classResponsibility) return;

        const matchedClass = Array.isArray(availableData.classes)
            ? availableData.classes.find((item) => item.name === teacher.classResponsibility)
            : null;

        if (!matchedClass?.id) {
            toast.error("Unable to find the assigned class.");
            return;
        }

        setSubmitting(true);
        try {
            await workloadService.removeClassTeacher(matchedClass.id, teacher.id);
            toast.success("Class teacher removed successfully");
            loadData();
            onUpdate();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to remove class responsibility");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]"
            >
                <div className="px-6 py-4 border-b flex justify-between items-center bg-purple-50">
                    <div>
                        <h2 className="text-xl font-bold text-purple-900">Manage Workload</h2>
                        <p className="text-sm text-purple-700">{teacher.firstName} {teacher.lastName}</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-purple-100 rounded-full transition-colors">
                        <XMarkIcon className="w-6 h-6 text-purple-900" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-8">
                    {/* Section 1: Subject Assignment */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpenIcon className="w-5 h-5 text-purple-600" />
                            <h3 className="font-semibold text-gray-900">Subject Load</h3>
                        </div>
                        
                        <form onSubmit={handleAddSubject} className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_auto]">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Subject</label>
                                <select 
                                    value={selectedSubject} 
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="h-11 w-full rounded-lg border-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="">Select Subject...</option>
                                    {Array.isArray(availableData.subjects) && availableData.subjects.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Classes</label>
                                <select
                                    value={selectedClassForSubject}
                                    onChange={(e) => setSelectedClassForSubject(e.target.value)}
                                    className="w-full h-11 rounded-lg border-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="">Select Class...</option>
                                    {Array.isArray(availableData.classes) && availableData.classes.map((c) => (
                                        <option key={c.id} value={c.name}>{c.name} {c.stream ? `(${c.stream})` : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end gap-2 self-end">
                                <select 
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="h-11 rounded-lg border-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500"
                                >
                                    {years.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                                <Button type="submit" size="sm" isLoading={submitting} title="Add to Workload" className="h-11 px-4">
                                    <span className="mr-2">Add</span>
                                    <PlusIcon className="w-4 h-4" />
                                </Button>
                            </div>
                        </form>

                        <div className="space-y-3">
                            {Array.isArray(currentSubjects) && currentSubjects.length > 0 ? currentSubjects.map((assignment) => {
                                const subject = assignment.subject || assignment;
                                const classList = parseClassList(assignment.assignedClasses);

                                return (
                                    <div key={assignment.assignmentId || assignment.id || subject.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-sm font-semibold text-gray-900">{subject.name} ({subject.code})</p>
                                                    {assignment.isPrimary && (
                                                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-700">Primary</span>
                                                    )}
                                                    {assignment.academicYear && (
                                                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700">{assignment.academicYear}</span>
                                                    )}
                                                </div>

                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {classList.length > 0 ? classList.map((className) => (
                                                        <span key={className} className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700">
                                                            {className}
                                                        </span>
                                                    )) : (
                                                        <span className="text-xs text-gray-500">No classes assigned</span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="danger"
                                                size="sm"
                                                isLoading={submitting}
                                                onClick={() => handleRemoveSubject(assignment.subjectId || subject.id)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p className="text-sm text-gray-500">No subject assignments yet.</p>
                            )}
                        </div>
                    </section>

                    {/* Section 2: Class Teacher Assignment */}
                    <section className="pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <UserGroupIcon className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">Class Teacher Responsibility</h3>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            {teacher.isClassTeacher ? (
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <CheckBadgeIcon className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-800">
                                            Currently assigned to: <span className="font-bold">{teacher.classResponsibility || 'Assigned Class'}</span>
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="danger"
                                        size="sm"
                                        isLoading={submitting}
                                        onClick={handleRemoveClassTeacher}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-sm text-blue-600 mb-4 italic">No class responsibility assigned yet.</p>
                            )}

                            {Array.isArray(teacher.assignedClasses) && teacher.assignedClasses.length > 0 && (
                                <div className="mb-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">Assigned classes</p>
                                    <div className="flex flex-wrap gap-2">
                                        {teacher.assignedClasses.map((className) => (
                                            <span key={className} className="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-xs text-blue-700">
                                                {className}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <select 
                                    value={selectedClassId} 
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                    className="flex-1 h-11 rounded-lg border-blue-200 text-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Choose Class to Assign...</option>
                                    {Array.isArray(availableData.classes) && availableData.classes.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name} {c.stream ? `(${c.stream})` : ''}</option>
                                    ))}
                                </select>
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    onClick={handleAssignClassTeacher}
                                    isLoading={submitting}
                                    className="h-11"
                                >
                                    Assign
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>
            </motion.div>
        </div>
    );
};

export default TeacherWorkloadModal;