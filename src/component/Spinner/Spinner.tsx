import { Spinner } from "react-bootstrap";

export default function LoaderSpinner() {
    return (
        <div className="d-flex justify-content-center align-items-center">
            <Spinner animation="border" />
        </div>
    )
}