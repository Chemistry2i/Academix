// Academix - Library Management Page
import { useState } from 'react';
import { Card, Row, Col, Badge, Tab, Tabs } from 'react-bootstrap';
import { FaPlus, FaBookOpen, FaUndo, FaExclamationTriangle } from 'react-icons/fa';
import { PageHeader, DataTable, Button, StatCard } from '../../components/common';

const Library = () => {
  const [books] = useState([
    { id: '1', isbn: '978-1-234567-00-1', title: 'Advanced Mathematics', author: 'John Smith', category: 'Mathematics', copies: 25, available: 18, issued: 7 },
    { id: '2', isbn: '978-1-234567-00-2', title: 'Physics Fundamentals', author: 'Sarah Jones', category: 'Physics', copies: 30, available: 22, issued: 8 },
    { id: '3', isbn: '978-1-234567-00-3', title: 'Organic Chemistry', author: 'David Brown', category: 'Chemistry', copies: 20, available: 15, issued: 5 },
    { id: '4', isbn: '978-1-234567-00-4', title: 'English Grammar', author: 'Mary Wilson', category: 'English', copies: 40, available: 35, issued: 5 },
  ]);

  const columns = [
    { header: 'ISBN', accessor: 'isbn' },
    { header: 'Title', accessor: 'title' },
    { header: 'Author', accessor: 'author' },
    { header: 'Category', accessor: 'category', render: (v) => <Badge bg="primary">{v}</Badge> },
    { header: 'Total', accessor: 'copies' },
    { header: 'Available', accessor: 'available', render: (v) => <span className="text-success">{v}</span> },
    { header: 'Issued', accessor: 'issued', render: (v) => <span className="text-warning">{v}</span> },
  ];

  return (
    <div className="library-page">
      <PageHeader
        title="Library"
        subtitle="Manage books and library transactions"
        icon={<FaBookOpen />}
        breadcrumbs={[{ label: 'Library' }]}
        actions={
          <>
            <Button variant="outline-primary" icon={<FaUndo />}>Return Book</Button>
            <Button variant="primary" icon={<FaPlus />}>Add Book</Button>
          </>
        }
      />

      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <StatCard title="Total Books" value="2,450" variant="primary" icon={<FaBookOpen size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Issued Today" value="12" variant="info" icon={<FaBookOpen size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Returns Today" value="8" variant="success" icon={<FaUndo size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Overdue" value="15" variant="danger" icon={<FaExclamationTriangle size={24} />} />
        </Col>
      </Row>

      <Tabs defaultActiveKey="books" className="mb-4">
        <Tab eventKey="books" title="Books">
          <Card>
            <Card.Body>
              <DataTable columns={columns} data={books} searchable pagination pageSize={10} />
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="issued" title="Issued Books">
          <Card><Card.Body><p className="text-muted">Currently issued books will be shown here.</p></Card.Body></Card>
        </Tab>
        <Tab eventKey="overdue" title="Overdue">
          <Card><Card.Body><p className="text-muted">Overdue books will be shown here.</p></Card.Body></Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Library;
