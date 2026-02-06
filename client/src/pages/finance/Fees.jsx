// Academix - Fees Management Page
import { useState } from 'react';
import { Card, Row, Col, Badge, Tab, Tabs } from 'react-bootstrap';
import { FaPlus, FaMoneyBillWave, FaEdit, FaTrash } from 'react-icons/fa';
import { PageHeader, DataTable, Button, StatCard } from '../../components/common';
import { FEE_TYPES } from '../../config/constants';

const Fees = () => {
  const [feeStructures] = useState([
    { id: '1', class: 'Senior 1', term: 'Term 1', tuition: 800000, boarding: 600000, other: 200000, total: 1600000 },
    { id: '2', class: 'Senior 2', term: 'Term 1', tuition: 850000, boarding: 600000, other: 200000, total: 1650000 },
    { id: '3', class: 'Senior 3', term: 'Term 1', tuition: 900000, boarding: 600000, other: 250000, total: 1750000 },
    { id: '4', class: 'Senior 4', term: 'Term 1', tuition: 950000, boarding: 600000, other: 300000, total: 1850000 },
  ]);

  const columns = [
    { header: 'Class', accessor: 'class' },
    { header: 'Term', accessor: 'term' },
    { header: 'Tuition', accessor: 'tuition', render: (v) => `UGX ${v.toLocaleString()}` },
    { header: 'Boarding', accessor: 'boarding', render: (v) => `UGX ${v.toLocaleString()}` },
    { header: 'Other', accessor: 'other', render: (v) => `UGX ${v.toLocaleString()}` },
    { header: 'Total', accessor: 'total', render: (v) => <strong>UGX {v.toLocaleString()}</strong> },
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
    <div className="fees-page">
      <PageHeader
        title="Fee Structure"
        subtitle="Manage school fee structures"
        icon={<FaMoneyBillWave />}
        breadcrumbs={[{ label: 'Finance' }, { label: 'Fees' }]}
        actions={<Button variant="primary" icon={<FaPlus />}>Add Fee Structure</Button>}
      />

      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <StatCard title="Total Expected" value="UGX 125.5M" variant="primary" icon={<FaMoneyBillWave size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Total Collected" value="UGX 98.2M" variant="success" icon={<FaMoneyBillWave size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Outstanding" value="UGX 27.3M" variant="danger" icon={<FaMoneyBillWave size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Collection Rate" value="78.2%" variant="info" icon={<FaMoneyBillWave size={24} />} />
        </Col>
      </Row>

      <Card>
        <Card.Header>Fee Structures - Term 1, 2026</Card.Header>
        <Card.Body>
          <DataTable columns={columns} data={feeStructures} searchable pagination pageSize={10} />
        </Card.Body>
      </Card>
    </div>
  );
};

export default Fees;
