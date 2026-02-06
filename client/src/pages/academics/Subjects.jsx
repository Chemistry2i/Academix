// Academix - Subjects Management Page
import { useState, useEffect } from 'react';
import { Card, Badge } from 'react-bootstrap';
import { FaPlus, FaBookOpen, FaEdit, FaTrash } from 'react-icons/fa';
import { PageHeader, DataTable, Button } from '../../components/common';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setSubjects([
        { id: '1', code: 'MTH', name: 'Mathematics', type: 'Core', classes: ['S1', 'S2', 'S3', 'S4'], teachers: 4 },
        { id: '2', code: 'ENG', name: 'English Language', type: 'Core', classes: ['S1', 'S2', 'S3', 'S4'], teachers: 3 },
        { id: '3', code: 'PHY', name: 'Physics', type: 'Core', classes: ['S1', 'S2', 'S3', 'S4'], teachers: 2 },
        { id: '4', code: 'CHM', name: 'Chemistry', type: 'Core', classes: ['S1', 'S2', 'S3', 'S4'], teachers: 2 },
        { id: '5', code: 'BIO', name: 'Biology', type: 'Core', classes: ['S1', 'S2', 'S3', 'S4'], teachers: 3 },
        { id: '6', code: 'GEO', name: 'Geography', type: 'Core', classes: ['S1', 'S2', 'S3', 'S4'], teachers: 2 },
        { id: '7', code: 'HIS', name: 'History', type: 'Core', classes: ['S1', 'S2', 'S3', 'S4'], teachers: 2 },
        { id: '8', code: 'CMP', name: 'Computer Studies', type: 'Optional', classes: ['S1', 'S2'], teachers: 1 },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const columns = [
    { header: 'Code', accessor: 'code' },
    { header: 'Subject Name', accessor: 'name' },
    {
      header: 'Type',
      accessor: 'type',
      render: (value) => <Badge bg={value === 'Core' ? 'primary' : 'secondary'}>{value}</Badge>,
    },
    {
      header: 'Classes',
      accessor: 'classes',
      render: (value) => value.join(', '),
    },
    { header: 'Teachers', accessor: 'teachers' },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: () => (
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm"><FaEdit /></Button>
          <Button variant="outline-danger" size="sm"><FaTrash /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="subjects-page">
      <PageHeader
        title="Subjects"
        subtitle="Manage subjects and curriculum"
        icon={<FaBookOpen />}
        breadcrumbs={[{ label: 'Academics' }, { label: 'Subjects' }]}
        actions={<Button variant="primary" icon={<FaPlus />}>Add Subject</Button>}
      />

      <Card>
        <Card.Body>
          <DataTable columns={columns} data={subjects} isLoading={isLoading} searchable pagination pageSize={10} />
        </Card.Body>
      </Card>
    </div>
  );
};

export default Subjects;
