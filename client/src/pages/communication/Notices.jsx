// Academix - Notices Page
import { useState } from 'react';
import { Card, Row, Col, Badge, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaBullhorn, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { PageHeader, DataTable, Button } from '../../components/common';

const Notices = () => {
  const [notices] = useState([
    { id: '1', title: 'Sports Day 2026', date: '2026-02-06', audience: 'All', author: 'Admin', priority: 'high', status: 'published' },
    { id: '2', title: 'Fee Payment Deadline', date: '2026-02-05', audience: 'Parents', author: 'Bursar', priority: 'high', status: 'published' },
    { id: '3', title: 'Term 1 Exam Schedule', date: '2026-02-04', audience: 'Students', author: 'Academic Head', priority: 'medium', status: 'published' },
    { id: '4', title: 'Staff Meeting', date: '2026-02-03', audience: 'Staff', author: 'Admin', priority: 'low', status: 'draft' },
  ]);

  const columns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Date', accessor: 'date' },
    { header: 'Audience', accessor: 'audience', render: (v) => <Badge bg="info">{v}</Badge> },
    { header: 'Author', accessor: 'author' },
    { header: 'Priority', accessor: 'priority', render: (v) => <Badge bg={v === 'high' ? 'danger' : v === 'medium' ? 'warning' : 'secondary'}>{v}</Badge> },
    { header: 'Status', accessor: 'status', render: (v) => <Badge bg={v === 'published' ? 'success' : 'secondary'}>{v}</Badge> },
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
    <div className="notices-page">
      <PageHeader
        title="Notices & Announcements"
        subtitle="Manage school notices"
        icon={<FaBullhorn />}
        breadcrumbs={[{ label: 'Notices' }]}
        actions={<Button variant="primary" icon={<FaPlus />}>Create Notice</Button>}
      />

      <Card>
        <Card.Body>
          <DataTable columns={columns} data={notices} searchable pagination pageSize={10} />
        </Card.Body>
      </Card>
    </div>
  );
};

export default Notices;
