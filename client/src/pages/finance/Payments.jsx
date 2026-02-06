// Academix - Payments Management Page
import { useState } from 'react';
import { Card, Row, Col, Badge, Form } from 'react-bootstrap';
import { FaPlus, FaMoneyBillWave, FaReceipt, FaFileExport } from 'react-icons/fa';
import { PageHeader, DataTable, Button, StatCard } from '../../components/common';

const Payments = () => {
  const [payments] = useState([
    { id: '1', receiptNo: 'RCP-001', date: '2026-02-05', student: 'John Mukasa', class: 'S1-E', amount: 1500000, method: 'Mobile Money', status: 'completed' },
    { id: '2', receiptNo: 'RCP-002', date: '2026-02-05', student: 'Sarah Nakato', class: 'S2-W', amount: 800000, method: 'Bank Transfer', status: 'completed' },
    { id: '3', receiptNo: 'RCP-003', date: '2026-02-04', student: 'David Okello', class: 'S3-N', amount: 1200000, method: 'Cash', status: 'completed' },
    { id: '4', receiptNo: 'RCP-004', date: '2026-02-04', student: 'Grace Achieng', class: 'S1-W', amount: 500000, method: 'Mobile Money', status: 'pending' },
  ]);

  const columns = [
    { header: 'Receipt No', accessor: 'receiptNo' },
    { header: 'Date', accessor: 'date' },
    { header: 'Student', accessor: 'student' },
    { header: 'Class', accessor: 'class' },
    { header: 'Amount', accessor: 'amount', render: (v) => <strong>UGX {v.toLocaleString()}</strong> },
    { header: 'Method', accessor: 'method', render: (v) => <Badge bg="info">{v}</Badge> },
    { header: 'Status', accessor: 'status', render: (v) => <Badge bg={v === 'completed' ? 'success' : 'warning'}>{v}</Badge> },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: () => <Button variant="outline-primary" size="sm"><FaReceipt /> Receipt</Button>,
    },
  ];

  return (
    <div className="payments-page">
      <PageHeader
        title="Payments"
        subtitle="Record and manage fee payments"
        icon={<FaMoneyBillWave />}
        breadcrumbs={[{ label: 'Finance' }, { label: 'Payments' }]}
        actions={
          <>
            <Button variant="outline-primary" icon={<FaFileExport />}>Export</Button>
            <Button variant="primary" icon={<FaPlus />}>Record Payment</Button>
          </>
        }
      />

      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <StatCard title="Today's Collection" value="UGX 4.5M" variant="success" icon={<FaMoneyBillWave size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="This Week" value="UGX 18.2M" variant="primary" icon={<FaMoneyBillWave size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="This Month" value="UGX 45.8M" variant="info" icon={<FaMoneyBillWave size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Pending" value="5" variant="warning" icon={<FaReceipt size={24} />} subtitle="transactions" />
        </Col>
      </Row>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Recent Payments</span>
          <Form.Control type="date" style={{ width: '200px' }} defaultValue="2026-02-06" />
        </Card.Header>
        <Card.Body>
          <DataTable columns={columns} data={payments} searchable pagination pageSize={10} />
        </Card.Body>
      </Card>
    </div>
  );
};

export default Payments;
