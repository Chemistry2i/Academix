-- Sample room data for Academix School Management System
-- This script creates room entries for a typical school

INSERT INTO rooms (room_number, room_name, room_type, capacity, location, building, floor, equipment, is_available, notes) VALUES
-- Classrooms
('S1A', 'Senior 1 A Classroom', 'CLASSROOM', 50, 'Main Block', 'Main Building', 'Ground Floor', '{"whiteboard": true, "projector": true, "desks": 50}', true, 'Primary classroom for Senior 1 A'),
('S1B', 'Senior 1 B Classroom', 'CLASSROOM', 50, 'Main Block', 'Main Building', 'Ground Floor', '{"whiteboard": true, "projector": true, "desks": 50}', true, 'Primary classroom for Senior 1 B'),
('S1C', 'Senior 1 C Classroom', 'CLASSROOM', 50, 'Main Block', 'Main Building', 'Ground Floor', '{"whiteboard": true, "projector": true, "desks": 50}', true, 'Primary classroom for Senior 1 C'),

('S2A', 'Senior 2 A Classroom', 'CLASSROOM', 50, 'Main Block', 'Main Building', '1st Floor', '{"whiteboard": true, "projector": true, "desks": 50}', true, 'Primary classroom for Senior 2 A'),
('S2B', 'Senior 2 B Classroom', 'CLASSROOM', 50, 'Main Block', 'Main Building', '1st Floor', '{"whiteboard": true, "projector": true, "desks": 50}', true, 'Primary classroom for Senior 2 B'),
('S2C', 'Senior 2 C Classroom', 'CLASSROOM', 50, 'Main Block', 'Main Building', '1st Floor', '{"whiteboard": true, "projector": true, "desks": 50}', true, 'Primary classroom for Senior 2 C'),

('S3A', 'Senior 3 A Classroom', 'CLASSROOM', 45, 'Main Block', 'Main Building', '2nd Floor', '{"whiteboard": true, "projector": true, "desks": 45}', true, 'Primary classroom for Senior 3 A'),
('S3B', 'Senior 3 B Classroom', 'CLASSROOM', 45, 'Main Block', 'Main Building', '2nd Floor', '{"whiteboard": true, "projector": true, "desks": 45}', true, 'Primary classroom for Senior 3 B'),
('S3C', 'Senior 3 C Classroom', 'CLASSROOM', 45, 'Main Block', 'Main Building', '2nd Floor', '{"whiteboard": true, "projector": true, "desks": 45}', true, 'Primary classroom for Senior 3 C'),

('S4A', 'Senior 4 A Classroom', 'CLASSROOM', 45, 'Senior Block', 'Senior Building', 'Ground Floor', '{"whiteboard": true, "projector": true, "desks": 45}', true, 'Primary classroom for Senior 4 A'),
('S4B', 'Senior 4 B Classroom', 'CLASSROOM', 45, 'Senior Block', 'Senior Building', 'Ground Floor', '{"whiteboard": true, "projector": true, "desks": 45}', true, 'Primary classroom for Senior 4 B'),
('S4C', 'Senior 4 C Classroom', 'CLASSROOM', 45, 'Senior Block', 'Senior Building', 'Ground Floor', '{"whiteboard": true, "projector": true, "desks": 45}', true, 'Primary classroom for Senior 4 C'),

('S5PCM', 'Senior 5 PCM Classroom', 'CLASSROOM', 40, 'Senior Block', 'Senior Building', '1st Floor', '{"whiteboard": true, "projector": true, "desks": 40, "specialEquipment": "Science charts"}', true, 'Classroom for Senior 5 Physics, Chemistry, Mathematics'),
('S5PCB', 'Senior 5 PCB Classroom', 'CLASSROOM', 40, 'Senior Block', 'Senior Building', '1st Floor', '{"whiteboard": true, "projector": true, "desks": 40, "specialEquipment": "Biology charts"}', true, 'Classroom for Senior 5 Physics, Chemistry, Biology'),
('S5HEG', 'Senior 5 HEG Classroom', 'CLASSROOM', 40, 'Senior Block', 'Senior Building', '1st Floor', '{"whiteboard": true, "projector": true, "desks": 40, "specialEquipment": "Maps and charts"}', true, 'Classroom for Senior 5 History, Economics, Geography'),
('S5BCM', 'Senior 5 BCM Classroom', 'CLASSROOM', 40, 'Senior Block', 'Senior Building', '1st Floor', '{"whiteboard": true, "projector": true, "desks": 40, "specialEquipment": "Business charts"}', true, 'Classroom for Senior 5 Biology, Chemistry, Mathematics'),

('S6PCM', 'Senior 6 PCM Classroom', 'CLASSROOM', 35, 'Senior Block', 'Senior Building', '2nd Floor', '{"whiteboard": true, "projector": true, "desks": 35, "specialEquipment": "Advanced Science equipment"}', true, 'Classroom for Senior 6 Physics, Chemistry, Mathematics'),
('S6PCB', 'Senior 6 PCB Classroom', 'CLASSROOM', 35, 'Senior Block', 'Senior Building', '2nd Floor', '{"whiteboard": true, "projector": true, "desks": 35, "specialEquipment": "Advanced Biology equipment"}', true, 'Classroom for Senior 6 Physics, Chemistry, Biology'),
('S6HEG', 'Senior 6 HEG Classroom', 'CLASSROOM', 35, 'Senior Block', 'Senior Building', '2nd Floor', '{"whiteboard": true, "projector": true, "desks": 35, "specialEquipment": "Advanced Arts materials"}', true, 'Classroom for Senior 6 History, Economics, Geography'),

-- Laboratories
('PHYS101', 'Physics Laboratory 1', 'LABORATORY', 30, 'Science Block', 'Science Building', 'Ground Floor', '{"benches": 15, "electricalSockets": true, "gasSupply": true, "equipment": "Physics apparatus"}', true, 'Main physics laboratory with complete apparatus'),
('PHYS102', 'Physics Laboratory 2', 'LABORATORY', 30, 'Science Block', 'Science Building', 'Ground Floor', '{"benches": 15, "electricalSockets": true, "gasSupply": true, "equipment": "Advanced physics apparatus"}', true, 'Advanced physics laboratory'),

('CHEM101', 'Chemistry Laboratory 1', 'LABORATORY', 30, 'Science Block', 'Science Building', '1st Floor', '{"benches": 15, "fumeHoods": 4, "gasSupply": true, "waterSupply": true, "equipment": "Chemistry apparatus"}', true, 'Main chemistry laboratory with fume hoods'),
('CHEM102', 'Chemistry Laboratory 2', 'LABORATORY', 30, 'Science Block', 'Science Building', '1st Floor', '{"benches": 15, "fumeHoods": 4, "gasSupply": true, "waterSupply": true, "equipment": "Advanced chemistry apparatus"}', true, 'Advanced chemistry laboratory'),

('BIO101', 'Biology Laboratory 1', 'LABORATORY', 30, 'Science Block', 'Science Building', '2nd Floor', '{"benches": 15, "microscopes": 30, "specimens": true, "equipment": "Biology apparatus"}', true, 'Main biology laboratory with microscopes'),
('BIO102', 'Biology Laboratory 2', 'LABORATORY', 30, 'Science Block', 'Science Building', '2nd Floor', '{"benches": 15, "microscopes": 30, "specimens": true, "equipment": "Advanced biology apparatus"}', true, 'Advanced biology laboratory'),

('COMP101', 'Computer Laboratory 1', 'LABORATORY', 40, 'ICT Block', 'ICT Building', 'Ground Floor', '{"computers": 40, "projector": true, "server": true, "internet": true}', true, 'Main computer laboratory'),
('COMP102', 'Computer Laboratory 2', 'LABORATORY', 35, 'ICT Block', 'ICT Building', '1st Floor', '{"computers": 35, "projector": true, "server": true, "internet": true, "specialSoftware": true}', true, 'Advanced computer science laboratory'),

-- Special Rooms
('LIB001', 'Main Library', 'LIBRARY', 200, 'Library Block', 'Library Building', 'Ground Floor', '{"books": 5000, "readingTables": 50, "computers": 10, "wifi": true}', true, 'Main school library'),
('LIB002', 'Reference Section', 'LIBRARY', 50, 'Library Block', 'Library Building', '1st Floor', '{"referenceBooks": 1000, "readingTables": 15, "quietStudy": true}', true, 'Reference and quiet study section'),

('HALL001', 'Main Assembly Hall', 'HALL', 800, 'Main Block', 'Main Building', 'Ground Floor', '{"stage": true, "soundSystem": true, "projector": true, "seating": 800}', true, 'Main assembly and event hall'),
('HALL002', 'Conference Hall', 'HALL', 150, 'Administration Block', 'Admin Building', '1st Floor', '{"projector": true, "soundSystem": true, "airConditioning": true, "seating": 150}', true, 'Meetings and conferences'),

('GYM001', 'Main Gymnasium', 'SPORTS', 300, 'Sports Complex', 'Sports Building', 'Ground Floor', '{"basketball": true, "volleyball": true, "badminton": true, "changingRooms": true}', true, 'Indoor sports activities'),
('FIELD001', 'Football Field', 'SPORTS', 1000, 'Sports Complex', 'Outdoor', 'Ground Level', '{"footballPosts": 2, "trackField": true, "stands": 500}', true, 'Main football field with track'),

-- General Purpose Rooms
('GP101', 'General Purpose Room 1', 'CLASSROOM', 60, 'Main Block', 'Main Building', 'Ground Floor', '{"movableFurniture": true, "projector": true, "soundSystem": true}', true, 'Flexible classroom space'),
('GP102', 'General Purpose Room 2', 'CLASSROOM', 60, 'Main Block', 'Main Building', '1st Floor', '{"movableFurniture": true, "projector": true, "soundSystem": true}', true, 'Flexible classroom space'),

-- Staff Rooms
('STAFF001', 'Main Staff Room', 'OFFICE', 50, 'Main Block', 'Main Building', '1st Floor', '{"desks": 25, "computers": 10, "printer": true, "coffee": true}', true, 'Main staff room and workspace'),
('STAFF002', 'HOD Office', 'OFFICE', 20, 'Administration Block', 'Admin Building', '1st Floor', '{"desks": 10, "computers": 5, "meeting": true}', true, 'Head of Department offices'),

-- Art and Music
('ART101', 'Art Studio', 'CLASSROOM', 25, 'Arts Block', 'Arts Building', 'Ground Floor', '{"easels": 25, "paintingSupplies": true, "sink": true, "storage": true}', true, 'Art and fine arts studio'),
('MUSIC101', 'Music Room', 'CLASSROOM', 30, 'Arts Block', 'Arts Building', '1st Floor', '{"piano": 1, "instruments": true, "soundProof": true, "audioSystem": true}', true, 'Music lessons and practice'),

-- Examination Hall
('EXAM001', 'Examination Hall', 'HALL', 400, 'Examination Block', 'Exam Building', 'Ground Floor', '{"desks": 400, "inveridation": true, "spaciousLayout": true}', true, 'Main examination hall');