// Academix - Users Management Page
import { useState } from 'react';
import { Card, Row, Col, Badge, Dropdown, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaUsers, FaEdit, FaTrash, FaKey, FaEllipsisV, FaUserShield } from 'react-icons/fa';
import { PageHeader, DataTable, Button, StatCard } from '../../components/common';
import { ROLES, ROLE_LABELS } from '../../config/roles';

const Users = () => {
  const [users] = useState([
    { id: '1', name: 'Admin User', email: 'admin@academix.ug', role: 'admin', status: 'active', lastLogin: '2026-02-06 10:30' },
    { id: '2', name: 'Peter Kamau', email: 'peter.kamau@academix.ug', role: 'teacher', status: 'active', lastLogin: '2026-02-06 09:15' },
    { id: '3', name: 'Mary Namuli', email: 'mary.namuli@academix.ug', role: 'teacher', status: 'active', lastLogin: '2026-02-05 14:20' },
    { id: '4', name: 'Joseph Ochieng', email: 'joseph.ochieng@academix.ug', role: 'librarian', status: 'active', lastLogin: '2026-02-06 08:00' },
    { id: '5', name: 'Grace Apio', email: 'grace.apio@academix.ug', role: 'bursar', status: 'active', lastLogin: '2026-02-05 16:45' },
    { id: '6', name: 'David Mukasa', email: 'david.mukasa@academix.ug', role: 'nurse', status: 'inactive', lastLogin: '2026-01-15 10:00' },
  ]);

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      render: (value, row) => (
        <div className="d-flex align-items-center">
          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
            {value.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <span className="fw-medium">{value}</span>
            <br />
            <small className="text-muted">{row.email}</small>
          </div>
        </div>
      ),
    },
    { header: 'Role', accessor: 'role', render: (v) => <Badge bg="primary">{ROLE_LABELS[v] || v}</Badge> },
    { header: 'Status', accessor: 'status', render: (v) => <Badge bg={v === 'active' ? 'success' : 'secondary'}>{v}</Badge> },
    { header: 'Last Login', accessor: 'lastLogin' },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: () => (
        <Dropdown align="end">
          <Dropdown.Toggle variant="light" size="sm" className="border-0"><FaEllipsisV /></Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item><FaEdit className="me-2" /> Edit</Dropdown.Item>
            <Dropdown.Item><FaKey className="me-2" /> Reset Password</Dropdown.Item>
            <Dropdown.Item><FaUserShield className="me-2" /> Permissions</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item className="text-danger"><FaTrash className="me-2" /> Delete</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="users-page">
      <PageHeader
        title="User Management"
        subtitle="Manage system users and access"
        icon={<FaUsers />}
        breadcrumbs={[{ label: 'Users' }]}
        actions={<Button variant="primary" icon={<FaPlus />}>Add User</Button>}
      />

      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <StatCard title="Total Users" value="75" variant="primary" icon={<FaUsers size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Active" value="68" variant="success" icon={<FaUsers size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Inactive" value="7" variant="secondary" icon={<FaUsers size={24} />} />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard title="Roles" value="14" variant="info" icon={<FaUserShield size={24} />} />
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <DataTable columns={columns} data={users} searchable pagination pageSize={10} />
        </Card.Body>
      </Card>
    </div>
  );
};

export default Users;
