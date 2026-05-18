-- Check if teachers exist
SELECT id, email, full_name, assigned_classes FROM teacher LIMIT 10;

-- Check if classes exist  
SELECT id, name, class_teacher_id FROM school_class LIMIT 10;

-- Check relationship between teachers and classes
SELECT t.id, t.email, t.full_name, t.assigned_classes 
FROM teacher t 
WHERE t.assigned_classes IS NOT NULL AND t.assigned_classes != '';
