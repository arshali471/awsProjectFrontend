import { useState } from 'react'
import {  useNavigate } from 'react-router-dom'

import { Card, Col, Container, Row } from 'react-bootstrap'

import JenkinsImage from "../../../../assets/jenkins.png"
import AnsibleImage from "../../../../assets/ansible.png"
import GitLabImage from "../../../../assets/gitLab.png"
import NexusImage from "../../../../assets/nexus.png"

export default function DevopsIndex() {

    const handleNavigate = (url: string) => {
        window.open(url, "_blank");
      };

    const [hoverIndex, setHoverIndex] = useState(null);



    const apps = [
        { url: "https://jenkins-prod.iff.com", name: "Jenkins Prod", icon: JenkinsImage },
        { url: "https://jenkins-ca-nonprod.global.iff.com", name: "Jenkins Non Prod", icon: JenkinsImage },
        // { url: "https://jenkins-nsp-nonprod.global.iff.com", name: "NSP Jenkins Prod", icon: JenkinsImage },
        // { url: "https://jenkins-nsp-prod.global.iff.com", name: "NSP Jenkins Non Prod", icon: JenkinsImage },
        { url: "https://awx.iff.com", name: "AWX Tower", icon: AnsibleImage },
        { url: "https://gitlab.com/danisco-nutrition-and-biosciences/iff-cloud-engineering", name: "Git Lab", icon: GitLabImage },
        { url: "http://nexus.iff.com", name: "Nexus", icon: NexusImage },
    ];

    return (
        <>
            <Container className="p-4 mt-5">

                <Row className="mb-3">
                    <Col>
                        <h5>DevOps</h5>
                    </Col>
                </Row>

                <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-3 mt-4">
                    {apps.map((app, index) => (
                        <Col key={index}>
                            <Card
                                className={`text-center p-3 transition`}
                                onMouseEnter={() => setHoverIndex(index)}
                                onMouseLeave={() => setHoverIndex(null)}
                                style={{
                                    cursor: "pointer",
                                    boxShadow: hoverIndex === index ? "0px 4px 12px rgba(0, 0, 0, 0.2)" : "none",
                                    transform: hoverIndex === index ? "scale(1.05)" : "scale(1)",
                                    transition: "all 0.3s ease-in-out",
                                }}
                                onClick={() => handleNavigate(app.url)}
                            >
                                <Card.Img
                                    variant="top"
                                    src={app.icon}
                                    style={{ width: "70px", height: "70px", margin: "0 auto" , objectFit: "contain" }}
                                />
                                {/* <app.icon 
                            style={{ width: "50px", height: "50px", margin: "0 auto" }}
                            /> */}
                                <Card.Body>
                                    <Card.Title style={{ fontSize: "0.9rem" }}>{app.name}</Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container >
        </>
    )
}
