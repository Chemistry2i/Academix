// Academix - Messages Page
import { useState } from 'react';
import { Card, Row, Col, ListGroup, Form, Badge } from 'react-bootstrap';
import { FaEnvelope, FaPaperPlane, FaSearch, FaUserCircle } from 'react-icons/fa';
import { PageHeader, Button } from '../../components/common';

const Messages = () => {
  const [conversations] = useState([
    { id: '1', name: 'James Mukasa', lastMessage: 'Thank you for the update about John.', time: '10:30 AM', unread: 2 },
    { id: '2', name: 'Mary Nakato', lastMessage: 'When is the next parent meeting?', time: '9:15 AM', unread: 0 },
    { id: '3', name: 'Peter Kamau', lastMessage: 'The exam marks have been submitted.', time: 'Yesterday', unread: 0 },
    { id: '4', name: 'Sarah Ochieng', lastMessage: 'Please check the fee balance.', time: 'Yesterday', unread: 1 },
  ]);

  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);

  return (
    <div className="messages-page">
      <PageHeader
        title="Messages"
        subtitle="Communicate with parents, teachers, and staff"
        icon={<FaEnvelope />}
        breadcrumbs={[{ label: 'Messages' }]}
      />

      <Card style={{ height: 'calc(100vh - 250px)' }}>
        <Card.Body className="p-0">
          <Row className="g-0 h-100">
            {/* Conversations List */}
            <Col md={4} className="border-end h-100">
              <div className="p-3 border-bottom">
                <div className="position-relative">
                  <FaSearch className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                  <Form.Control type="text" placeholder="Search messages..." className="ps-5" />
                </div>
              </div>
              <ListGroup variant="flush" style={{ overflowY: 'auto', height: 'calc(100% - 70px)' }}>
                {conversations.map((conv) => (
                  <ListGroup.Item
                    key={conv.id}
                    action
                    active={selectedConversation?.id === conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className="d-flex align-items-center py-3"
                  >
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: '45px', height: '45px' }}>
                      {conv.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex justify-content-between">
                        <span className="fw-medium">{conv.name}</span>
                        <small className="text-muted">{conv.time}</small>
                      </div>
                      <div className="d-flex justify-content-between">
                        <small className="text-muted text-truncate">{conv.lastMessage}</small>
                        {conv.unread > 0 && <Badge bg="primary" pill>{conv.unread}</Badge>}
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>

            {/* Message Thread */}
            <Col md={8} className="h-100 d-flex flex-column">
              {selectedConversation ? (
                <>
                  {/* Header */}
                  <div className="p-3 border-bottom d-flex align-items-center">
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                      {selectedConversation.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h6 className="mb-0">{selectedConversation.name}</h6>
                      <small className="text-muted">Parent of John Mukasa - S1 East</small>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
                    <div className="mb-3">
                      <div className="d-flex">
                        <div className="bg-light rounded p-3" style={{ maxWidth: '70%' }}>
                          <p className="mb-0">Hello, I wanted to ask about John's performance this term.</p>
                          <small className="text-muted">9:00 AM</small>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-end">
                        <div className="bg-primary text-white rounded p-3" style={{ maxWidth: '70%' }}>
                          <p className="mb-0">Good morning Mr. Mukasa. John is doing very well. He scored 85% in the recent exams.</p>
                          <small className="text-white-50">10:15 AM</small>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex">
                        <div className="bg-light rounded p-3" style={{ maxWidth: '70%' }}>
                          <p className="mb-0">Thank you for the update about John.</p>
                          <small className="text-muted">10:30 AM</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="p-3 border-top">
                    <div className="d-flex gap-2">
                      <Form.Control type="text" placeholder="Type a message..." />
                      <Button variant="primary" icon={<FaPaperPlane />}>Send</Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                  <div className="text-center">
                    <FaEnvelope size={48} className="mb-3" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Messages;
