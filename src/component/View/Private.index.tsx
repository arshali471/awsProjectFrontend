import { Outlet } from 'react-router-dom';
import mainRoutes from '../routes/routes';
import TopBar from '../TopBar/TopBar';
import SideBar from '../SideBar/SideBar';
import "./Private.index.css"

export default function PrivateRoutes() {
    return (
        <div className="private-layout">
            <SideBar menuData={mainRoutes} />
            <div className="main-content sidebar-expanded">
                <TopBar menuData={mainRoutes} />
                <div className="p-3">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
