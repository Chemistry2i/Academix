// Academix - Medical/Clinic Page
import { useState } from 'react';
import { Card, Row, Col, Badge, Tab, Tabs, Form } from 'react-bootstrap';
import { FaPlus, FaHospital, FaNotesMedical, FaSyringe } from 'react-icons/fa';
import { PageHeader, DataTable, Button, StatCard } from '../../components/common';

const Medical = () => {
  const [visits] = useState([
    { id: '1', date: '2026-02-06', student: 'John Mukasa', class: 'S1-E', complaint: 'Headache', treatment: 'Paracetamol', status: 'treated' },
    { id: '2', date: '2026-02-06', student: 'Sarah Nakato', class: 'S2-W', complaint: 'Stomach ache', treatment: 'Antacid', status: 'treated' },
    { id: '3', date: '2026-02-05', student: 'David Okello', class: 'S3-N', complaint: 'Fever', treatment: 'Referred to hospital', status: 'referred' },
  ]);

  const columns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Student', accessor: 'student' },
    { header: 'Class', accessor: 'class' },
    { header: 'Complaint', accessor: 'complaint' },
    { header: 'Treatment', accessor: 'treatment' },
    { header: 'Status', accessor: 'status', render: (v) => <Badge bg={v === 'treated' ? 'success' : 'warning'}>{v}</Badge> },
  ];

  return (
    <div className="medical-page">
      <PageHeader
        title="Medical / Clinic"
        subtitle="Manage student health records"
        icon={<FaHospital />}
        breadcrumbs={[{ label: 'Medical' }]}
        actions={<Button variant="primary" icon={<FaPlus />}>Log Visit</Button>}
      />

      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <StatCard title="Today's Visits" value="8" variant="primary" icon={<FaHospital size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="This Week" value="32" variant="info" icon={<FaNotesMedical size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Referred" value="2" variant="warning" icon={<FaHospital size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Follow-ups" value="5" variant="secondary" icon={<FaSyringe size={24} />} />
        </Col>
      </Row>

      <Tabs defaultActiveKey="visits" className="mb-4">
        <Tab eventKey="visits" title="Clinic Visits">
          <Card><Card.Body><DataTable columns={columns} data={visits} searchable pagination pageSize={10} /></Card.Body></Card>
        </Tab>
        <Tab eventKey="records" title="Medical Records">
          <Card><Card.Body><p className="text-muted">Student medical records will be shown here.</p></Card.Body></Card>
        </Tab>
        <Tab eventKey="immunization" title="Immunizations">
          <Card><Card.Body><p className="text-muted">Immunization records will be shown here.</p></Card.Body></Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Medical;
