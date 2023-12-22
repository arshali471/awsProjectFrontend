import React, { useState } from 'react';
import { Nav, } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import './sidebar.css';
import { useLocation } from 'react-router-dom';
import IRouter from '../Interface/IRouter';


interface ISideBar {
    menuData: IRouter[],
    panelName: string,
    baseUrl: string
}

export default function SideBar({ menuData, panelName, baseUrl }: ISideBar) {
    let navigate = useNavigate();
    const location = useLocation();

    const [close, setClose] = useState(true);


    const showAllowedMenu = menuData.filter((routes) => routes.navbarShow === true)

    return (
        <>
            <Nav defaultActiveKey="0" className={close ? "flex-column xrg-dashboard-sub-nav xrg-nav-closed" : "flex-column xrg-dashboard-sub-nav"} >
                <div>
                    {/* <div className='d-flex justify-content-center mt-3'>
                        <FontAwesomeIcon icon={faBars} onClick={() => setClose(!close)} />
                    </div> */}
                </div>
                {
                    showAllowedMenu.map((data, index) => {
                        return (
                            <div key={index}
                                className={"xrg-nav-link" + (data.path == location.pathname.split("/")[2] ? " xrg-nav-selected" : " ")}
                                onClick={() => navigate(data.path)}
                            >
                                <div className='xrg-nav-item'>
                                    <div className={(close ? "xrg-nav-close" : "xrg-nav-open")}>
                                        < data.icon />
                                        {close ? <></> : data.name}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </Nav>
        </>
    )
}