import IRouter from "../Interface/IRouter";
import Dashboard from "../View/Private/Dashboard/Dashboard";
import { MdSpaceDashboard } from "react-icons/md";
import S3Index from "../View/Private/S3/S3.index";
import AddUser from "../View/Private/Account/AddUser";
import AddAWSKey from "../View/Private/Account/AddAWSKey";
import AdminIndex from "../View/Private/Account/Admin";




export const baseUrl = "/admin-dash"
const mainRoutes: IRouter[] = [
    {
        path: "ec2",
        navbarShow: true,
        element: Dashboard,
        name: "EC2",
        icon: MdSpaceDashboard
    },

    {
        path: "s3",
        navbarShow: true,
        element: S3Index,
        name: "S3",
        icon: MdSpaceDashboard
    },
    {
        path: "admin",
        navbarShow: false,
        element: AdminIndex,
        name: "S3",
        icon: MdSpaceDashboard
    },
    {
        path: "addUser",
        navbarShow: false,
        element: AddUser,
        name: "S3",
        icon: MdSpaceDashboard
    },
    {
        path: "addAWSKey",
        navbarShow: false,
        element: AddAWSKey,
        name: "S3",
        icon: MdSpaceDashboard
    },

]


export default mainRoutes;