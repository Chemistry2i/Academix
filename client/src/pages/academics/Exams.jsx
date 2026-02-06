// Academix - Examinations Management Page
import { useState } from 'react';
import { Card, Row, Col, Badge, Tab, Tabs } from 'react-bootstrap';
import { FaPlus, FaFileAlt, FaCalendarAlt, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { PageHeader, DataTable, Button } from '../../components/common';

const Exams = () => {
  const [exams] = useState([
    { id: '1', name: 'Beginning of Term 1', type: 'BOT', term: 'Term 1', year: '2026', status: 'completed', startDate: '2026-02-10', endDate: '2026-02-14' },
    { id: '2', name: 'Mid-Term 1', type: 'MID', term: 'Term 1', year: '2026', status: 'upcoming', startDate: '2026-03-20', endDate: '2026-03-25' },
    { id: '3', name: 'End of Term 1', type: 'EOT', term: 'Term 1', year: '2026', status: 'scheduled', startDate: '2026-04-15', endDate: '2026-04-20' },
  ]);

  const columns = [
    { header: 'Exam Name', accessor: 'name' },
    { header: 'Type', accessor: 'type', render: (v) => <Badge bg="primary">{v}</Badge> },
    { header: 'Term', accessor: 'term' },
    { header: 'Start Date', accessor: 'startDate' },
    { header: 'End Date', accessor: 'endDate' },
    {
      header: 'Status',
      accessor: 'status',
      render: (v) => <Badge bg={v === 'completed' ? 'success' : v === 'upcoming' ? 'warning' : 'info'}>{v}</Badge>,
    },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: () => (
        <div className="d-flex gap-2">
          <Button variant="outline-info" size="sm"><FaEye /></Button>
          <Button variant="outline-primary" size="sm"><FaEdit /></Button>
          <Button variant="outline-danger" size="sm"><FaTrash /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="exams-page">
      <PageHeader
        title="Examinations"
        subtitle="Manage exams and schedules"
        icon={<FaFileAlt />}
        breadcrumbs={[{ label: 'Exams' }]}
        actions={<Button variant="primary" icon={<FaPlus />}>Create Exam</Button>}
      />

      <Tabs defaultActiveKey="all" className="mb-4">
        <Tab eventKey="all" title="All Exams">
          <Card>
            <Card.Body>
              <DataTable columns={columns} data={exams} searchable pagination pageSize={10} />
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="schedule" title="Exam Schedule">
          <Card>
            <Card.Body>
              <p className="text-muted">Exam schedule calendar view will be displayed here.</p>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="grading" title="Grading System">
          <Card>
            <Card.Body>
              <p className="text-muted">Grading system configuration will be displayed here.</p>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Exams;
