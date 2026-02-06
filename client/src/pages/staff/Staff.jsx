// Academix - Staff Management Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Form, Badge, Dropdown } from 'react-bootstrap';
import {
  FaPlus,
  FaFileExport,
  FaChalkboardTeacher,
  FaEye,
  FaEdit,
  FaTrash,
  FaEllipsisV,
} from 'react-icons/fa';
import { PageHeader, DataTable, Button } from '../../components/common';
import CanAccess from '../../components/auth/CanAccess';
import { MODULES, PERMISSIONS, ROLE_LABELS } from '../../config/roles';

const Staff = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data
    setTimeout(() => {
      setStaff([
        {
          id: '1',
          staffId: 'STF-001',
          firstName: 'Peter',
          lastName: 'Kamau',
          role: 'teacher',
          department: 'Sciences',
          subjects: ['Physics', 'Mathematics'],
          email: 'peter.kamau@academix.ug',
          phone: '+256 701 111 222',
          status: 'active',
          joinDate: '2020-01-15',
        },
        {
          id: '2',
          staffId: 'STF-002',
          firstName: 'Mary',
          lastName: 'Namuli',
          role: 'teacher',
          department: 'Languages',
          subjects: ['English', 'Literature'],
          email: 'mary.namuli@academix.ug',
          phone: '+256 702 222 333',
          status: 'active',
          joinDate: '2019-05-20',
        },
        {
          id: '3',
          staffId: 'STF-003',
          firstName: 'Joseph',
          lastName: 'Ochieng',
          role: 'librarian',
          department: 'Library',
          subjects: [],
          email: 'joseph.ochieng@academix.ug',
          phone: '+256 703 333 444',
          status: 'active',
          joinDate: '2021-08-10',
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const columns = [
    {
      header: 'Staff ID',
      accessor: 'staffId',
    },
    {
      header: 'Name',
      accessor: 'firstName',
      render: (value, row) => (
        <div className="d-flex align-items-center">
          <div
            className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-2"
            style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}
          >
            {row.firstName[0]}{row.lastName[0]}
          </div>
          <div>
            <span className="fw-medium">{row.firstName} {row.lastName}</span>
            <br />
            <small className="text-muted">{row.email}</small>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (value) => (
        <Badge bg="primary">{ROLE_LABELS[value] || value}</Badge>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
    },
    {
      header: 'Phone',
      accessor: 'phone',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <Badge bg={value === 'active' ? 'success' : 'secondary'}>
          {value}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: (value) => (
        <Dropdown align="end">
          <Dropdown.Toggle variant="light" size="sm" className="border-0">
            <FaEllipsisV />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item><FaEye className="me-2" /> View Details</Dropdown.Item>
            <Dropdown.Item><FaEdit className="me-2" /> Edit</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item className="text-danger"><FaTrash className="me-2" /> Delete</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="staff-page">
      <PageHeader
        title="Staff Management"
        subtitle="Manage all staff members"
        icon={<FaChalkboardTeacher />}
        breadcrumbs={[{ label: 'Staff' }]}
        actions={
          <>
            <Button variant="outline-primary" icon={<FaFileExport />}>Export</Button>
            <CanAccess module={MODULES.STAFF_MANAGEMENT} permission={PERMISSIONS.CREATE}>
              <Button variant="primary" icon={<FaPlus />}>Add Staff</Button>
            </CanAccess>
          </>
        }
      />

      <Card>
        <Card.Body>
          <DataTable
            columns={columns}
            data={staff}
            isLoading={isLoading}
            searchable={true}
            pagination={true}
            pageSize={10}
            emptyMessage="No staff members found"
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default Staff;
