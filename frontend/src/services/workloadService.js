import api from './apiClient';

const extractArray = (payload, keys = []) => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];

    for (const key of keys) {
        if (Array.isArray(payload[key])) return payload[key];
    }

    const firstArray = Object.values(payload).find((value) => Array.isArray(value));
    return firstArray || [];
};

const normalizeAssignment = (assignment) => {
    const subject = assignment?.subject || {};

    return {
        ...assignment,
        assignmentId: assignment?.assignmentId || assignment?.id || null,
        subjectId: assignment?.subjectId || subject?.id || null,
        name: assignment?.name || subject?.name || '',
        code: assignment?.code || subject?.code || '',
        subject
    };
};

/**
 * Service to handle Teacher Workloads (Subject Assignments & Class Responsibilities)
 * Wraps EnrollmentController and SchoolClassController
 */
export const workloadService = {
    // Subject Assignments (via EnrollmentController)
    assignSubject: async (teacherId, subjectId, data) => {
        // Expected data: { isPrimary: boolean, assignedClasses: string, academicYear: string }
        const response = await api.post(`/enrollments/teacher/${teacherId}/subject/${subjectId}`, null, {
            params: {
                isPrimary: data.isPrimary,
                assignedClasses: data.assignedClasses,
                academicYear: data.academicYear
            }
        });
        return response.data;
    },

    removeSubject: async (teacherId, subjectId) => {
        const response = await api.delete(`/enrollments/teacher/${teacherId}/subject/${subjectId}`);
        return response.data;
    },

    getTeacherSubjects: async (teacherId) => {
        const response = await api.get(`/enrollments/teacher/${teacherId}/subjects`);
        return extractArray(response?.data, ['data', 'subjects']).map(normalizeAssignment);
    },

    // Class Teacher Responsibility (via SchoolClassController)
    assignClassTeacher: async (classId, teacherId) => {
        const response = await api.post(`/classes/${classId}/teacher/${teacherId}`);
        return response.data;
    },

    removeClassTeacher: async (classId, teacherId) => {
        const response = await api.delete(`/classes/${classId}/teacher/${teacherId}`);
        return response.data;
    },

    // Helper to fetch data for the pickers
    getAssignmentMetadata: async () => {
        const [classesResult, subjectsResult] = await Promise.allSettled([
            api.get('/classes'),
            api.get('/subjects')
        ]);

        const classes = classesResult.status === 'fulfilled' ? classesResult.value : null;
        const subjects = subjectsResult.status === 'fulfilled' ? subjectsResult.value : null;

        return {
            classes: extractArray(classes?.data, ['data', 'classes']),
            subjects: extractArray(subjects?.data, ['data', 'subjects'])
        };
    },

    /**
     * Standardize the workload object for the UI
     */
    getTeacherWorkload: async (teacherId) => {
        const subjects = await workloadService.getTeacherSubjects(teacherId);
        return { subjects };
    }
};