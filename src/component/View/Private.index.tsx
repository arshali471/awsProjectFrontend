import { Outlet } from 'react-router-dom';
import mainRoutes from '../routes/routes';
import TopBar from '../TopBar/TopBar';




export default function PrivateRoutes() {

    return (
        <>
            <TopBar menuData={mainRoutes} />

            <div className = "m-5">
                <Outlet />
            </div>
        </>
    )
}