// Academix - Students List Page
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Form, Badge, Dropdown } from 'react-bootstrap';
import {
  FaPlus,
  FaFileExport,
  FaFilter,
  FaUserGraduate,
  FaEye,
  FaEdit,
  FaTrash,
  FaEllipsisV,
} from 'react-icons/fa';
import { PageHeader, DataTable, Button } from '../../components/common';
import CanAccess from '../../components/auth/CanAccess';
import { MODULES, PERMISSIONS } from '../../config/roles';
import { CLASS_LEVELS, STUDENT_STATUS } from '../../config/constants';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    class: '',
    status: '',
    search: '',
  });

  // Mock data - replace with API call
  useEffect(() => {
    const mockStudents = [
      {
        id: '1',
        studentId: 'STU-2026-001',
        firstName: 'John',
        lastName: 'Mukasa',
        class: 'S1',
        section: 'East',
        gender: 'Male',
        status: 'active',
        admissionDate: '2026-01-15',
        contact: '+256 701 234 567',
      },
      {
        id: '2',
        studentId: 'STU-2026-002',
        firstName: 'Sarah',
        lastName: 'Nakato',
        class: 'S2',
        section: 'West',
        gender: 'Female',
        status: 'active',
        admissionDate: '2025-01-10',
        contact: '+256 702 345 678',
      },
      {
        id: '3',
        studentId: 'STU-2026-003',
        firstName: 'David',
        lastName: 'Okello',
        class: 'S3',
        section: 'North',
        gender: 'Male',
        status: 'active',
        admissionDate: '2024-01-08',
        contact: '+256 703 456 789',
      },
      {
        id: '4',
        studentId: 'STU-2026-004',
        firstName: 'Grace',
        lastName: 'Achieng',
        class: 'S4',
        section: 'South',
        gender: 'Female',
        status: 'inactive',
        admissionDate: '2023-01-05',
        contact: '+256 704 567 890',
      },
    ];

    setTimeout(() => {
      setStudents(mockStudents);
      setIsLoading(false);
    }, 500);
  }, []);

  const columns = [
    {
      header: 'Student ID',
      accessor: 'studentId',
      render: (value, row) => (
        <Link to={`/students/${row.id}`} className="text-primary fw-medium">
          {value}
        </Link>
      ),
    },
    {
      header: 'Name',
      accessor: 'firstName',
      render: (value, row) => (
        <div className="d-flex align-items-center">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
            style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}
          >
            {row.firstName[0]}{row.lastName[0]}
          </div>
          <div>
            <span className="fw-medium">{row.firstName} {row.lastName}</span>
            <br />
            <small className="text-muted">{row.gender}</small>
          </div>
        </div>
      ),
    },
    {
      header: 'Class',
      accessor: 'class',
      render: (value, row) => (
        <span>{CLASS_LEVELS[value]?.label || value} - {row.section}</span>
      ),
    },
    {
      header: 'Contact',
      accessor: 'contact',
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
      render: (value, row) => (
        <Dropdown align="end">
          <Dropdown.Toggle variant="light" size="sm" className="border-0">
            <FaEllipsisV />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => navigate(`/students/${value}`)}>
              <FaEye className="me-2" /> View Details
            </Dropdown.Item>
            <CanAccess module={MODULES.STUDENT_MANAGEMENT} permission={PERMISSIONS.EDIT}>
              <Dropdown.Item onClick={() => navigate(`/students/${value}/edit`)}>
                <FaEdit className="me-2" /> Edit
              </Dropdown.Item>
            </CanAccess>
            <CanAccess module={MODULES.STUDENT_MANAGEMENT} permission={PERMISSIONS.DELETE}>
              <Dropdown.Divider />
              <Dropdown.Item className="text-danger">
                <FaTrash className="me-2" /> Delete
              </Dropdown.Item>
            </CanAccess>
          </Dropdown.Menu>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="students-page">
      <PageHeader
        title="Students"
        subtitle="Manage all student records"
        icon={<FaUserGraduate />}
        breadcrumbs={[{ label: 'Students' }]}
        actions={
          <>
            <Button variant="outline-primary" icon={<FaFileExport />}>
              Export
            </Button>
            <CanAccess module={MODULES.STUDENT_MANAGEMENT} permission={PERMISSIONS.CREATE}>
              <Button variant="primary" icon={<FaPlus />}>
                Add Student
              </Button>
            </CanAccess>
          </>
        }
      />

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label className="small text-muted">Class</Form.Label>
              <Form.Select
                value={filters.class}
                onChange={(e) => setFilters({ ...filters, class: e.target.value })}
              >
                <option value="">All Classes</option>
                {Object.entries(CLASS_LEVELS).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="small text-muted">Status</Form.Label>
              <Form.Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                {Object.entries(STUDENT_STATUS).map(([key, value]) => (
                  <option key={key} value={value}>{key.replace('_', ' ')}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Button variant="outline-secondary" icon={<FaFilter />}>
                More Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Students Table */}
      <Card>
        <Card.Body>
          <DataTable
            columns={columns}
            data={students}
            isLoading={isLoading}
            searchable={true}
            pagination={true}
            pageSize={10}
            onRowClick={(row) => navigate(`/students/${row.id}`)}
            emptyMessage="No students found"
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default Students;
