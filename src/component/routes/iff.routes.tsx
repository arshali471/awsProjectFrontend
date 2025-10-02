import { FaBullhorn, FaMagento } from "react-icons/fa"
import Dashboard from "../View/Private/Dashboard/Dashboard"
import { MdSpaceDashboard } from "react-icons/md"
import S3Index from "../View/Private/S3/S3.index"
import AdminIndex from "../View/Private/Account/Admin"
import AddUser from "../View/Private/Account/AddUser"
import AddAWSKey from "../View/Private/Account/AddAWSKey"
import { IoKeySharp, IoSettings } from "react-icons/io5";
import { RiAdminFill } from "react-icons/ri";
import { FaUsersGear } from "react-icons/fa6";
import { SiAmazonec2, SiAmazoneks, SiAmazons3, SiAmazondynamodb } from "react-icons/si";
import { SiAwsorganizations } from "react-icons/si";
import Kubernetes from "../View/Private/Kubernetes/Kubernetes"
import { SiAmazonrds } from "react-icons/si";
import RDSIndex from "../View/Private/RDS/RDS.index"
import VolumesIndex from "../View/Private/Volumes/Volumes"
import { RxDashboard } from "react-icons/rx";
import IffDashboard from "../View/Private/IffDashboard/IffDashboard"
import ZabbixStatus from "../View/Private/ZabbixStatus/ZabbixStatus"

export default interface IIFFRouter {
    path: string
    navbarShow: Boolean
    element?: any
    name: string
    icon?: any
    children?: any[]
}


export const iffRoutes: IIFFRouter[] = [
    // {
    //     path: "dashboard",
    //     navbarShow: true,
    //     name: "Dashboard",
    //     icon: RxDashboard,
    //     element: <IffDashboard />
    // },
    {
        path: "platform",
        navbarShow: true,
        name: "Platform",
        icon: FaBullhorn,
        children: [
            {
                path: "agent-status",
                navbarShow: true,
                element: <ZabbixStatus />,
                name: "Agent Status",
                icon: FaMagento
            },
            {
                path: "ec2",
                navbarShow: true,
                element: <Dashboard />,
                name: "EC2",
                icon: SiAmazonec2
            },
            {
                path: "Volumes",
                navbarShow: true,
                element: <VolumesIndex />,
                name: "Volumes",
                icon: SiAmazondynamodb
            },
            {
                path: "s3",
                navbarShow: true,
                element: <S3Index />,
                name: "S3",
                icon: SiAmazons3
            },
            // {
            //     path: "eks",
            //     navbarShow: true,
            //     element: <Kubernetes />,
            //     name: "Kubernetes",
            //     icon: SiAmazoneks
            // },
            {
                path: "rds",
                navbarShow: true,
                element: <RDSIndex />,
                name: "RDS",
                icon: SiAmazonrds
            },
        ],
    },

    // {
    //     path: "settings",
    //     navbarShow: false,
    //     name: "Settings",
    //     icon: IoSettings,
    //     children: [
    //         {
    //             path: "admin",
    //             navbarShow: false,
    //             element: <AdminIndex />,
    //             name: "Admin",
    //             icon: RiAdminFill
    //         },
    //         {
    //             path: "addUser",
    //             navbarShow: false,
    //             element: <AddUser />,
    //             name: "Add Users",
    //             icon: FaUsersGear
    //         },
    //         {
    //             path: "addAWSKey",
    //             navbarShow: false,
    //             element: <AddAWSKey />,
    //             name: "Add AWS Key",
    //             icon: IoKeySharp
    //         },
    //         {
    //             path: "change-password",
    //             navbarShow: false,
    //             element: <AddAWSKey />,
    //             name: "Add AWS Key",
    //             icon: IoKeySharp
    //         },
    //     ],
    // },
]