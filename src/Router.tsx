import { Navigate, Route, Routes } from "react-router-dom";
import Auth from "./component/Auth/auth";
import PrivateRoutes from "./component/View/Private.index";
import mainRoutes from "./component/routes/routes";
import IRouter from "./component/Interface/IRouter";
import Login from "./component/View/Public/Login";
import { SelectedRegionContext } from "./component/context/context";
import { useState } from "react";

function PrivateRouter({ children }: any) {
    const auth = Auth.checkAuth();
    auth ? <PrivateRoutes /> : <Navigate to="/login" />;
    return <PrivateRoutes />;
}


export default function Router() {

    const [selectedRegion, setSelectedRegion] = useState<any>();

    return (
        <>
            <SelectedRegionContext.Provider value={{ selectedRegion, setSelectedRegion }}>
                <Routes>
                    <Route element={<PrivateRouter />}>
                        {mainRoutes.map((data: IRouter) => {
                            return (
                                <Route
                                    path={data.path + "/*"}
                                    element={<data.element />}
                                />
                            )
                        })}
                    </Route>
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </SelectedRegionContext.Provider>
        </>
    )
}