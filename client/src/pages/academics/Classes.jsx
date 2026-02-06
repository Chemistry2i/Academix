// Academix - Classes Management Page
import { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaBook, FaUsers, FaChalkboardTeacher, FaEdit, FaTrash } from 'react-icons/fa';
import { PageHeader, DataTable, Button } from '../../components/common';
import { CLASS_LEVELS } from '../../config/constants';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setClasses([
        { id: '1', name: 'Senior 1', section: 'East', students: 45, classTeacher: 'Mr. Peter Kamau', subjects: 10 },
        { id: '2', name: 'Senior 1', section: 'West', students: 42, classTeacher: 'Mrs. Mary Namuli', subjects: 10 },
        { id: '3', name: 'Senior 2', section: 'East', students: 48, classTeacher: 'Mr. John Opio', subjects: 11 },
        { id: '4', name: 'Senior 2', section: 'West', students: 44, classTeacher: 'Mrs. Grace Achieng', subjects: 11 },
        { id: '5', name: 'Senior 3', section: 'North', students: 50, classTeacher: 'Mr. David Okello', subjects: 8 },
        { id: '6', name: 'Senior 4', section: 'South', students: 46, classTeacher: 'Mrs. Sarah Nakato', subjects: 8 },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const columns = [
    { header: 'Class Name', accessor: 'name' },
    { header: 'Section', accessor: 'section' },
    {
      header: 'Students',
      accessor: 'students',
      render: (value) => (
        <span><FaUsers className="me-1 text-muted" />{value}</span>
      ),
    },
    { header: 'Class Teacher', accessor: 'classTeacher' },
    {
      header: 'Subjects',
      accessor: 'subjects',
      render: (value) => <Badge bg="info">{value} subjects</Badge>,
    },
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
    <div className="classes-page">
      <PageHeader
        title="Classes"
        subtitle="Manage school classes and sections"
        icon={<FaBook />}
        breadcrumbs={[{ label: 'Academics' }, { label: 'Classes' }]}
        actions={<Button variant="primary" icon={<FaPlus />}>Add Class</Button>}
      />

      <Row className="g-3 mb-4">
        {Object.entries(CLASS_LEVELS).slice(0, 4).map(([key, value]) => (
          <Col sm={6} lg={3} key={key}>
            <Card className="text-center h-100">
              <Card.Body>
                <h5 className="text-primary">{value.label}</h5>
                <Badge bg={value.section === 'O-Level' ? 'primary' : 'success'}>{value.section}</Badge>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <Card.Body>
          <DataTable columns={columns} data={classes} isLoading={isLoading} searchable pagination pageSize={10} />
        </Card.Body>
      </Card>
    </div>
  );
};

export default Classes;
