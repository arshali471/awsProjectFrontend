import { Outlet } from 'react-router-dom';
import mainRoutes from '../routes/routes';
import TopBar from '../TopBar/TopBar';
import SideBar from '../SideBar/SideBar';
import "./Private.index.css"

export default function PrivateRoutes() {
    return (
        <div className="private-layout">
            <div className="sidebar">
                <SideBar menuData={mainRoutes} />
            </div>
            <div className="main-content">
                <TopBar menuData={mainRoutes} />
                <div className=" p-3">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
