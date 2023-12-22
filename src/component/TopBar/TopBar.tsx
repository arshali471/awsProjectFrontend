
import { Button, Image, Nav, NavDropdown, Navbar } from 'react-bootstrap';
import './Topbar.css';
import IRouter from '../Interface/IRouter';
import { AdminService } from '../services/admin.service';
import { useContext, useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { SelectedRegionContext } from '../context/context';
import { useNavigate } from 'react-router-dom';

interface ITopBar {
  menuData: IRouter[],
}

export default function TopBar({ menuData }: ITopBar) {

  const navigate = useNavigate()

  const { selectedRegion, setSelectedRegion }: any = useContext(SelectedRegionContext)

  const [keysData, setKeysData] = useState<any>();

  const getAllAwsKeys = async () => {
    await AdminService.getAllAwsKey().then((res) => {
      if (res.status === 200) {
        setKeysData(res.data.map((data: any) => {
          return {
            label: `${data.enviroment} (${data.region})`,
            value: data._id
          }
        }))
      }
    })
  }



  const filterKeys = (inputValue: string) => {
    return keysData.filter((i: any) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const loadOptions = (
    inputValue: string,
    callback: (options: any[]) => void
  ) => {
    setTimeout(() => {
      callback(filterKeys(inputValue));
    }, 1000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authKey");
    sessionStorage.removeItem("username");
    navigate("/login")
  }


  useEffect(() => {
    getAllAwsKeys()
  }, [])

  const showAllowedMenu = menuData.filter((routes) => routes.navbarShow === true)

  return (
    <>
      <Navbar bg="white" expand="lg" className="shadow-sm">
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Brand className="ms-2 fw-bold">
          <Image src='https://www.iff.com/sites/iff-corp/files/iff/iff-logo.png' width={35} />
          <span className="ms-2">
            Cloud Inventory
          </span>
        </Navbar.Brand>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {
              showAllowedMenu.map((data: any) => {
                return (
                  <Nav.Link className="fw-bold" href={data.path}>{data.name}</Nav.Link>
                )
              })
            }
          </Nav>
        </Navbar.Collapse>
        <div className="me-4" style={{ width: "20rem" }}>
          <AsyncSelect
            value={selectedRegion}
            placeholder="Search Region....."
            className="w-100 me-4"
            cacheOptions
            loadOptions={loadOptions}
            defaultOptions={keysData}
            isClearable={true}
            onChange={(e: any) => setSelectedRegion(e)}
          />
        </div>
        {/* <Button className="me-3" variant='secondary' onClick={handleLogout}>Logout</Button> */}
        <NavDropdown className="me-3" title={sessionStorage.getItem("username")} id="basic-nav-dropdown">
          <NavDropdown.Item className="fw-bold" onClick={handleLogout}>Logout</NavDropdown.Item>

        </NavDropdown>
      </Navbar >
    </>
  );
}
