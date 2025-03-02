import { Navigate, Route, Routes } from "react-router-dom";
import Auth from "./component/Auth/auth";
import PrivateRoutes from "./component/View/Private.index";
import mainRoutes from "./component/routes/routes";
import IRouter from "./component/Interface/IRouter";
import Login from "./component/View/Public/Login";
import { LoadingContext, SelectedRegionContext } from "./component/context/context";
import { useState } from "react";
import IIFFRouter, { iffRoutes } from "./component/routes/iff.routes";

function PrivateRouter() {
    const auth = Auth.checkAuth();
    return auth ? <PrivateRoutes /> : <Navigate to="/login" />;
}


export default function Router() {

    const [selectedRegion, setSelectedRegion] = useState<any>();
    const [loading, setLoading] = useState<boolean>();

    return (
        <>
            <LoadingContext.Provider value={{ loading, setLoading }}>
                <SelectedRegionContext.Provider value={{ selectedRegion, setSelectedRegion }}>
                    {/* <Routes>
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
                        <Route path="/*" element={<Navigate to="/login" />} />
                    </Routes> */}

                        <Routes>
                            <Route path="/" element={<PrivateRouter />}>
                                {iffRoutes.map((data: IIFFRouter) => {
                                    return data.children ? (
                                        <Route key={data.path} path={data.path}>
                                            {data.children.map((subData: IIFFRouter) => (
                                                <Route
                                                    key={subData.path}
                                                    path={subData.path}
                                                    element={subData.element}
                                                />
                                            ))}
                                        </Route>
                                    ) : (
                                        <Route
                                            key={data.path}
                                            path={data.path}
                                            element={data.element}
                                        />
                                    )
                                })}
                            </Route>
                            <Route path="/login" element={<Login />} />
                            <Route path="*" element={<Navigate to="/login" />} />
                        </Routes>
                </SelectedRegionContext.Provider>
            </LoadingContext.Provider>
        </>
    )
}