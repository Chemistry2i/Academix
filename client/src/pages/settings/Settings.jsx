// Academix - Settings Page
import { useState } from 'react';
import { Card, Row, Col, Form, Tab, Tabs, ListGroup } from 'react-bootstrap';
import { FaCog, FaSchool, FaUser, FaBell, FaLock, FaPalette } from 'react-icons/fa';
import { PageHeader, Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import CanAccess from '../../components/auth/CanAccess';
import { MODULES } from '../../config/roles';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="settings-page">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and system settings"
        icon={<FaCog />}
        breadcrumbs={[{ label: 'Settings' }]}
      />

      <Row>
        <Col lg={3}>
          <Card className="mb-4">
            <Card.Body className="p-0">
              <ListGroup variant="flush">
                <ListGroup.Item
                  action
                  active={activeTab === 'profile'}
                  onClick={() => setActiveTab('profile')}
                >
                  <FaUser className="me-2" /> My Profile
                </ListGroup.Item>
                <ListGroup.Item
                  action
                  active={activeTab === 'security'}
                  onClick={() => setActiveTab('security')}
                >
                  <FaLock className="me-2" /> Security
                </ListGroup.Item>
                <ListGroup.Item
                  action
                  active={activeTab === 'notifications'}
                  onClick={() => setActiveTab('notifications')}
                >
                  <FaBell className="me-2" /> Notifications
                </ListGroup.Item>
                <ListGroup.Item
                  action
                  active={activeTab === 'appearance'}
                  onClick={() => setActiveTab('appearance')}
                >
                  <FaPalette className="me-2" /> Appearance
                </ListGroup.Item>
                <CanAccess module={MODULES.SCHOOL_MANAGEMENT}>
                  <ListGroup.Item
                    action
                    active={activeTab === 'school'}
                    onClick={() => setActiveTab('school')}
                  >
                    <FaSchool className="me-2" /> School Settings
                  </ListGroup.Item>
                </CanAccess>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9}>
          {activeTab === 'profile' && (
            <Card>
              <Card.Header>Profile Information</Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label>First Name</Form.Label>
                    <Form.Control type="text" defaultValue={user?.firstName || ''} />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control type="text" defaultValue={user?.lastName || ''} />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" defaultValue={user?.email || ''} />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Phone</Form.Label>
                    <Form.Control type="tel" defaultValue={user?.phone || ''} />
                  </Col>
                  <Col xs={12}>
                    <Button variant="primary">Save Changes</Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <Card.Header>Security Settings</Card.Header>
              <Card.Body>
                <h6>Change Password</h6>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control type="password" />
                  </Col>
                  <Col xs={12}></Col>
                  <Col md={6}>
                    <Form.Label>New Password</Form.Label>
                    <Form.Control type="password" />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control type="password" />
                  </Col>
                  <Col xs={12}>
                    <Button variant="primary">Update Password</Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <Card.Header>Notification Preferences</Card.Header>
              <Card.Body>
                <Form.Check type="switch" label="Email notifications" className="mb-3" defaultChecked />
                <Form.Check type="switch" label="SMS notifications" className="mb-3" />
                <Form.Check type="switch" label="Push notifications" className="mb-3" defaultChecked />
                <Form.Check type="switch" label="Weekly digest" className="mb-3" />
                <Button variant="primary">Save Preferences</Button>
              </Card.Body>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <Card.Header>Appearance Settings</Card.Header>
              <Card.Body>
                <Form.Label>Theme</Form.Label>
                <Form.Select className="mb-3" style={{ maxWidth: '200px' }}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">System Default</option>
                </Form.Select>
                <Form.Label>Language</Form.Label>
                <Form.Select style={{ maxWidth: '200px' }}>
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                </Form.Select>
              </Card.Body>
            </Card>
          )}

          {activeTab === 'school' && (
            <Card>
              <Card.Header>School Settings</Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label>School Name</Form.Label>
                    <Form.Control type="text" defaultValue="Academix Secondary School" />
                  </Col>
                  <Col md={6}>
                    <Form.Label>School Code</Form.Label>
                    <Form.Control type="text" defaultValue="ACS-001" />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" defaultValue="info@academix.ug" />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Phone</Form.Label>
                    <Form.Control type="tel" defaultValue="+256 700 000 000" />
                  </Col>
                  <Col xs={12}>
                    <Form.Label>Address</Form.Label>
                    <Form.Control as="textarea" rows={2} defaultValue="Kampala, Uganda" />
                  </Col>
                  <Col xs={12}>
                    <Button variant="primary">Save School Settings</Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Settings;
