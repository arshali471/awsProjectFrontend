import { Form, Table } from "react-bootstrap"
import { FaUserCheck, FaCheckCircle } from "react-icons/fa";
import { FaUserXmark, FaCircleXmark } from "react-icons/fa6";
import { FaRegTrashAlt } from "react-icons/fa";
import { AdminService } from "../services/admin.service";
import toast from "react-hot-toast";
import moment from "moment";
import { FaEdit } from "react-icons/fa";
import { useState } from "react";
import EditAWSKey from "../modal/EditAWSKey.modal";
interface IUsersTable {
    tableData: any,
    reload: any
}
export default function AWSKeyTable({ tableData, reload }: IUsersTable) {

    const [awsKeyIndex, setAwsKeyIndex] = useState<number>(-1)


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
                        <th>Sr.No</th>
                        <th>Region</th>
                        <th>Enviroment</th>
                        <th>Access Key Id</th>
                        <th>Created By</th>
                        <th>Updated By</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>

                    {tableData && tableData.length > 0 ? tableData.map((data: any, index: number) => {
                        return (
                            <tr>
                                <td>{index + 1}</td>
                                <td>{data?.region}</td>
                                <td>{data?.enviroment}</td>
                                <td>{data?.accessKeyId}</td>
                                <td>{data?.createdBy ? data?.createdBy.username : "---" }</td>
                                <td>{data?.updatedBy ? data?.updatedBy.username : "---"}</td>
                                <td>{data?.accessKeyId}</td>
                                <td>{moment(data?.createdAt).format("DD MMM YYYY, hh:mm A")}</td>
                                <td>{moment(data?.updatedAt).format("DD MMM YYYY, hh:mm A")}</td>
                                <td>
                                    <FaEdit className="text-primary me-3" onClick={() => setAwsKeyIndex(index)} />
                                    <FaRegTrashAlt className="text-danger" onClick={() => handleDeleteAwsKey(data._id)} />
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
        </>
    )
}