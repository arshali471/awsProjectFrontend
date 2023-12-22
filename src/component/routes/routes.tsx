import IRouter from "../Interface/IRouter";
import Dashboard from "../View/Private/Dashboard/Dashboard";
import { MdSpaceDashboard } from "react-icons/md";




export const baseUrl = "/admin-dash"
const mainRoutes: IRouter[] = [
    {
        path: "ec2",
        navbarShow: true,
        element: Dashboard,
        name: "EC2",
        icon: MdSpaceDashboard
    },

]


export default mainRoutes;