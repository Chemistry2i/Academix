// Academix - Inventory Management Page
import { useState } from 'react';
import { Card, Row, Col, Badge, Tab, Tabs } from 'react-bootstrap';
import { FaPlus, FaBoxes, FaExclamationTriangle } from 'react-icons/fa';
import { PageHeader, DataTable, Button, StatCard } from '../../components/common';
import { INVENTORY_CATEGORIES } from '../../config/constants';

const Inventory = () => {
  const [items] = useState([
    { id: '1', code: 'INV-001', name: 'Student Desks', category: 'furniture', quantity: 250, minStock: 50, location: 'Classroom Block', status: 'available' },
    { id: '2', code: 'INV-002', name: 'Lab Beakers', category: 'lab_equipment', quantity: 45, minStock: 50, location: 'Chemistry Lab', status: 'low_stock' },
    { id: '3', code: 'INV-003', name: 'Textbooks - Math S1', category: 'books', quantity: 120, minStock: 50, location: 'Library Store', status: 'available' },
    { id: '4', code: 'INV-004', name: 'Football', category: 'sports_equipment', quantity: 15, minStock: 10, location: 'Sports Store', status: 'available' },
  ]);

  const columns = [
    { header: 'Code', accessor: 'code' },
    { header: 'Item Name', accessor: 'name' },
    { header: 'Category', accessor: 'category', render: (v) => <Badge bg="primary">{v.replace('_', ' ')}</Badge> },
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Min Stock', accessor: 'minStock' },
    { header: 'Location', accessor: 'location' },
    { header: 'Status', accessor: 'status', render: (v) => <Badge bg={v === 'available' ? 'success' : 'danger'}>{v.replace('_', ' ')}</Badge> },
  ];

  return (
    <div className="inventory-page">
      <PageHeader
        title="Inventory"
        subtitle="Manage school assets and stock"
        icon={<FaBoxes />}
        breadcrumbs={[{ label: 'Inventory' }]}
        actions={<Button variant="primary" icon={<FaPlus />}>Add Item</Button>}
      />

      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <StatCard title="Total Items" value="1,245" variant="primary" icon={<FaBoxes size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Categories" value="8" variant="info" icon={<FaBoxes size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Low Stock" value="12" variant="danger" icon={<FaExclamationTriangle size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Out of Stock" value="3" variant="warning" icon={<FaExclamationTriangle size={24} />} />
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <DataTable columns={columns} data={items} searchable pagination pageSize={10} />
        </Card.Body>
      </Card>
    </div>
  );
};

export default Inventory;
