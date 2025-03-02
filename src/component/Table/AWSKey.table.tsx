import { Table } from "react-bootstrap"
import { FaRegTrashAlt } from "react-icons/fa";
import { AdminService } from "../services/admin.service";
import toast from "react-hot-toast";
import moment from "moment";
import { FaEdit } from "react-icons/fa";
import { useState } from "react";
import EditAWSKey from "../modal/EditAWSKey.modal";
import ConfirmationModal from "../modal/Confirmation.modal";
interface IUsersTable {
    tableData: any,
    reload: any
}
export default function AWSKeyTable({ tableData, reload }: IUsersTable) {

    const [awsKeyIndex, setAwsKeyIndex] = useState<number>(-1)
    const [showConfirmationModal, setShowConfirmationModal] = useState<any | undefined>(undefined)


    const handleDeleteAwsKey = async (awsKey: any) => {
        await AdminService.deleteAwsKey(awsKey).then((res) => {
            if (res.status === 200) {
                reload();
                toast.success("User Deletd")
            }
        }).catch(err => {
            toast.error(err.response.data)
        })
    }


    return (
        <>
            <Table striped hover responsive>
                <thead>
                    <tr>
                        <th style={{ fontSize: 14 }}>Sr.No</th>
                        <th style={{ fontSize: 14 }}>Region</th>
                        <th style={{ fontSize: 14 }}>Enviroment</th>
                        <th style={{ fontSize: 14 }}>Access Key Id</th>
                        <th style={{ fontSize: 14 }}>Created By</th>
                        <th style={{ fontSize: 14 }}>Updated By</th>
                        <th style={{ fontSize: 14 }}>Created At</th>
                        <th style={{ fontSize: 14 }}>Updated At</th>
                        <th style={{ fontSize: 14 }}>Action</th>
                    </tr>
                </thead>
                <tbody>

                    {tableData && tableData.length > 0 ? tableData.map((data: any, index: number) => {
                        return (
                            <tr>
                                <td style={{ fontSize: 12 }}>{index + 1}</td>
                                <td style={{ fontSize: 12 }}>{data?.region}</td>
                                <td style={{ fontSize: 12 }}>{data?.enviroment}</td>
                                <td style={{ fontSize: 12 }}>{data?.accessKeyId}</td>
                                <td style={{ fontSize: 12 }}>{data?.createdBy ? data?.createdBy.username : "---"}</td>
                                <td style={{ fontSize: 12 }}>{data?.updatedBy ? data?.updatedBy.username : "---"}</td>
                                <td style={{ fontSize: 12 }}>{moment(data?.createdAt).format("DD MMM YYYY, hh:mm A")}</td>
                                <td style={{ fontSize: 12 }}>{moment(data?.updatedAt).format("DD MMM YYYY, hh:mm A")}</td>
                                <td style={{ fontSize: 12 }}>
                                    <FaEdit className="text-primary me-3" onClick={() => setAwsKeyIndex(index)} />
                                    <FaRegTrashAlt className="text-danger" onClick={() => setShowConfirmationModal(data._id)} />
                                </td>
                            </tr>
                        )
                    }) : "Please select region to get data"}
                </tbody>
            </Table >
            <EditAWSKey
                show={awsKeyIndex >= 0 ? true : false}
                handleClose={() => {
                    setAwsKeyIndex(-1)
                    reload();
                }}
                awsData={tableData && tableData[awsKeyIndex]}
            />

            <ConfirmationModal
                show={showConfirmationModal}
                handleClose={() => setShowConfirmationModal(undefined)}
                label="Are your sure you want to delete this AWS Key."
                onClick={handleDeleteAwsKey}
            />
        </>
    )
}