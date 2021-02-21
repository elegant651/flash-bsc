import React from "react";

import { Row, Col, Card } from "react-bootstrap";

export default function DisplayTickets({
  nftBalance,
  tickets,
}) {
  return (
    <Card
      className="mx-auto form-card text-center"
      style={{ backgroundColor: "rgb(253, 255, 255)" }}
    >
      <Card.Header>
        <u>Your Tickets</u>
      </Card.Header>

      <Card.Body>
        <div style={{ marginBottom: "20px", color: "green", fontSize: "large" }}>
          You have {nftBalance} Tickets
        </div>

        {tickets.map((ticket, key) => (
          <Row key={key} className="text-center" style={{ paddingBottom: "20px" }}>
            <Col>
              <u>Ticket Number</u>
              <span> : </span>
              <span>{ticket.ticketNumber}</span>
            </Col>
            <Col>
              <u>isWin</u>
              <span> : </span>
              {ticket.isValid ?
                    'yes' :
                    'no'}
            </Col>
          </Row>
        ))}
      </Card.Body>
    </Card>
  );
}
