package com.academix.server.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.academix.server.model.Subject;
import com.academix.server.repository.SubjectRepository;

@Service
@Transactional
public class SubjectService {

    private static final Logger logger = LoggerFactory.getLogger(SubjectService.class);

    @Autowired
    private SubjectRepository subjectRepository;

    /**
     * Create a new subject
     */
    public Subject createSubject(Subject subject) {
        if (subjectRepository.existsByCode(subject.getCode())) {
            throw new RuntimeException("Subject code already exists: " + subject.getCode());
        }
        if (subjectRepository.existsByName(subject.getName())) {
            throw new RuntimeException("Subject name already exists: " + subject.getName());
        }

        if (subject.getIsActive() == null) {
            subject.setIsActive(true);
        }
        if (subject.getIsCompulsory() == null) {
            subject.setIsCompulsory(false);
        }
        if (subject.getIsScience() == null) {
            subject.setIsScience(false);
        }
        if (subject.getIsArts() == null) {
            subject.setIsArts(false);
        }

        Subject saved = subjectRepository.save(subject);
        logger.info("Subject created: {} - {}", saved.getCode(), saved.getName());
        return saved;
    }

    /**
     * Get all subjects
     */
    @Transactional(readOnly = true)
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    /**
     * Get active subjects
     */
    @Transactional(readOnly = true)
    public List<Subject> getActiveSubjects() {
        return subjectRepository.findByIsActiveTrue();
    }

    /**
     * Get subject by ID
     */
    @Transactional(readOnly = true)
    public Optional<Subject> getSubjectById(Long id) {
        return subjectRepository.findById(id);
    }

    /**
     * Get subject by code
     */
    @Transactional(readOnly = true)
    public Optional<Subject> getSubjectByCode(String code) {
        return subjectRepository.findByCode(code);
    }

    /**
     * Update subject
     */
    public Subject updateSubject(Long id, Subject details) {
        Subject subject = subjectRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));

        if (details.getName() != null) {
            subject.setName(details.getName());
        }
        if (details.getCategory() != null) {
            subject.setCategory(details.getCategory());
        }
        if (details.getLevel() != null) {
            subject.setLevel(details.getLevel());
        }
        if (details.getIsCompulsory() != null) {
            subject.setIsCompulsory(details.getIsCompulsory());
        }
        if (details.getIsScience() != null) {
            subject.setIsScience(details.getIsScience());
        }
        if (details.getIsArts() != null) {
            subject.setIsArts(details.getIsArts());
        }
        if (details.getPaperCount() != null) {
            subject.setPaperCount(details.getPaperCount());
        }
        if (details.getMaxMarksPerPaper() != null) {
            subject.setMaxMarksPerPaper(details.getMaxMarksPerPaper());
        }
        if (details.getCreditUnits() != null) {
            subject.setCreditUnits(details.getCreditUnits());
        }
        if (details.getDescription() != null) {
            subject.setDescription(details.getDescription());
        }
        if (details.getDepartment() != null) {
            subject.setDepartment(details.getDepartment());
        }
        if (details.getIsActive() != null) {
            subject.setIsActive(details.getIsActive());
        }

        logger.info("Subject updated: {}", subject.getCode());
        return subjectRepository.save(subject);
    }

    /**
     * Delete subject
     */
    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
        subject.setIsActive(false);
        subjectRepository.save(subject);
        logger.info("Subject deactivated: {}", subject.getCode());
    }

    /**
     * Get O-Level subjects
     */
    @Transactional(readOnly = true)
    public List<Subject> getOLevelSubjects() {
        return subjectRepository.findOLevelSubjects();
    }

    /**
     * Get A-Level subjects
     */
    @Transactional(readOnly = true)
    public List<Subject> getALevelSubjects() {
        return subjectRepository.findALevelSubjects();
    }

    /**
     * Get subjects by category
     */
    @Transactional(readOnly = true)
    public List<Subject> getSubjectsByCategory(Subject.SubjectCategory category) {
        return subjectRepository.findByCategory(category);
    }

    /**
     * Search subjects
     */
    @Transactional(readOnly = true)
    public List<Subject> searchSubjects(String searchTerm) {
        return subjectRepository.searchSubjects(searchTerm);
    }

    /**
     * Get compulsory subjects
     */
    @Transactional(readOnly = true)
    public List<Subject> getCompulsorySubjects() {
        return subjectRepository.findByIsCompulsoryTrue();
    }

    /**
     * Get subject statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getSubjectStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSubjects", subjectRepository.count());
        stats.put("activeSubjects", subjectRepository.countByIsActiveTrue());
        stats.put("scienceSubjects", subjectRepository.findByIsScienceTrue().size());
        stats.put("artsSubjects", subjectRepository.findByIsArtsTrue().size());
        stats.put("compulsorySubjects", subjectRepository.findByIsCompulsoryTrue().size());
        stats.put("oLevelSubjects", subjectRepository.findOLevelSubjects().size());
        stats.put("aLevelSubjects", subjectRepository.findALevelSubjects().size());
        return stats;
    }

    /**
     * Initialize default Ugandan subjects
     */
    public void initializeDefaultSubjects() {
        if (subjectRepository.count() > 0) {
            logger.info("Subjects already exist, skipping initialization");
            return;
        }

        // Core O-Level subjects
        createDefaultSubject("ENG", "English Language", Subject.SubjectCategory.LANGUAGES, Subject.SubjectLevel.BOTH, true, false, false, "Languages");
        createDefaultSubject("MTH", "Mathematics", Subject.SubjectCategory.MATHEMATICS, Subject.SubjectLevel.BOTH, true, true, false, "Mathematics");
        createDefaultSubject("PHY", "Physics", Subject.SubjectCategory.SCIENCES, Subject.SubjectLevel.BOTH, false, true, false, "Sciences");
        createDefaultSubject("CHM", "Chemistry", Subject.SubjectCategory.SCIENCES, Subject.SubjectLevel.BOTH, false, true, false, "Sciences");
        createDefaultSubject("BIO", "Biology", Subject.SubjectCategory.SCIENCES, Subject.SubjectLevel.BOTH, false, true, false, "Sciences");
        createDefaultSubject("GEO", "Geography", Subject.SubjectCategory.HUMANITIES, Subject.SubjectLevel.BOTH, false, false, true, "Humanities");
        createDefaultSubject("HIS", "History", Subject.SubjectCategory.HUMANITIES, Subject.SubjectLevel.BOTH, false, false, true, "Humanities");
        createDefaultSubject("CRE", "Christian Religious Education", Subject.SubjectCategory.RELIGIOUS_EDUCATION, Subject.SubjectLevel.BOTH, false, false, true, "Religious Education");
        createDefaultSubject("IRE", "Islamic Religious Education", Subject.SubjectCategory.RELIGIOUS_EDUCATION, Subject.SubjectLevel.BOTH, false, false, true, "Religious Education");
        createDefaultSubject("AGR", "Agriculture", Subject.SubjectCategory.VOCATIONAL, Subject.SubjectLevel.BOTH, false, false, false, "Vocational");
        createDefaultSubject("COM", "Commerce", Subject.SubjectCategory.VOCATIONAL, Subject.SubjectLevel.O_LEVEL, false, false, false, "Vocational");
        createDefaultSubject("ENT", "Entrepreneurship", Subject.SubjectCategory.VOCATIONAL, Subject.SubjectLevel.BOTH, false, false, false, "Vocational");
        createDefaultSubject("CMP", "Computer Studies", Subject.SubjectCategory.TECHNICAL, Subject.SubjectLevel.BOTH, false, false, false, "Technical");
        createDefaultSubject("TD", "Technical Drawing", Subject.SubjectCategory.TECHNICAL, Subject.SubjectLevel.O_LEVEL, false, false, false, "Technical");
        createDefaultSubject("FA", "Fine Art", Subject.SubjectCategory.CREATIVE_ARTS, Subject.SubjectLevel.BOTH, false, false, true, "Creative Arts");
        createDefaultSubject("MUS", "Music", Subject.SubjectCategory.CREATIVE_ARTS, Subject.SubjectLevel.BOTH, false, false, true, "Creative Arts");
        createDefaultSubject("LIT", "Literature in English", Subject.SubjectCategory.LANGUAGES, Subject.SubjectLevel.BOTH, false, false, true, "Languages");
        createDefaultSubject("FRE", "French", Subject.SubjectCategory.LANGUAGES, Subject.SubjectLevel.BOTH, false, false, true, "Languages");
        createDefaultSubject("KIS", "Kiswahili", Subject.SubjectCategory.LANGUAGES, Subject.SubjectLevel.BOTH, false, false, true, "Languages");
        
        // A-Level specific
        createDefaultSubject("ECO", "Economics", Subject.SubjectCategory.HUMANITIES, Subject.SubjectLevel.A_LEVEL, false, false, true, "Humanities");
        createDefaultSubject("GP", "General Paper", Subject.SubjectCategory.LANGUAGES, Subject.SubjectLevel.A_LEVEL, true, false, false, "Languages");
        createDefaultSubject("ICT", "Information & Communication Technology", Subject.SubjectCategory.TECHNICAL, Subject.SubjectLevel.A_LEVEL, false, false, false, "Technical");
        createDefaultSubject("SUB", "Subsidiary Mathematics", Subject.SubjectCategory.MATHEMATICS, Subject.SubjectLevel.A_LEVEL, false, true, false, "Mathematics");

        logger.info("Default Ugandan subjects initialized");
    }

    private void createDefaultSubject(String code, String name, Subject.SubjectCategory category,
                                       Subject.SubjectLevel level, boolean compulsory, boolean science,
                                       boolean arts, String department) {
        Subject subject = new Subject();
        subject.setCode(code);
        subject.setName(name);
        subject.setCategory(category);
        subject.setLevel(level);
        subject.setIsCompulsory(compulsory);
        subject.setIsScience(science);
        subject.setIsArts(arts);
        subject.setDepartment(department);
        subject.setIsActive(true);
        subject.setPaperCount(level == Subject.SubjectLevel.A_LEVEL ? 2 : 1);
        subject.setMaxMarksPerPaper(100);
        subject.setCreditUnits(1);
        subjectRepository.save(subject);
    }
}
