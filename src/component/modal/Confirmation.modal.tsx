import { Button, Modal } from "react-bootstrap";

interface IConfirmationModal {
    show: any,
    handleClose: () => void
    label?: string
    onClick: (userId: any) => void
}

export default function ConfirmationModal(props: IConfirmationModal) {
    return (
        <Modal
            show={props.show ? true : false}
            onHide={props.handleClose}
            centered
            animation={true}
            backdrop="static"
        >
            <Modal.Header closeButton>
                <Modal.Title></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-center">
                    {props.label}
                </p>

                <div className="d-flex justify-content-center align-items-center gap-5">
                    <Button variant="secondary" className = "rounded-xl" onClick={props.handleClose}>
                        Close
                    </Button>
                    <Button variant="danger" onClick={() => props.onClick(props.show)}>
                        Delete
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    )
}