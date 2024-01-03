
import { Container, Image, Nav, NavDropdown, Navbar } from 'react-bootstrap';
import './Topbar.css';
import IRouter from '../Interface/IRouter';
import { AdminService } from '../services/admin.service';
import { useContext, useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { SelectedRegionContext } from '../context/context';
import { useLocation, useNavigate } from 'react-router-dom';

interface ITopBar {
  menuData: IRouter[],
}

export default function TopBar({ menuData }: ITopBar) {

  const navigate = useNavigate();
  const location = useLocation();



  const { selectedRegion, setSelectedRegion }: any = useContext(SelectedRegionContext)

  const [keysData, setKeysData] = useState<any>();
  const [userData, setUserData] = useState<any>();

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

  const manageData = [
    {
      path: "addAWSKey",
      name: "Add AWS Key",
    },
    {
      path: "addUser",
      name: "Add User",
    },
    {
      path: "admin",
      name: "Manage Users",
    },
  ]




  const getUserData = async () => {
    try {
      const res = await AdminService.getUserData();
      let manageUsers: any = [];

      if (res.status === 200) {

        if (res.data.admin) {
          manageUsers.push("admin");
        }
        if (res.data.addUser) {
          manageUsers.push("addUser");
        }
        if (res.data.addAWSKey) {
          manageUsers.push("addAWSKey");
        }
        setUserData(manageUsers);
      } else {
        // Handle other HTTP statuses if needed
        console.error(`Failed to fetch user data. Status: ${res.status}`);
      }
    } catch (error) {
      // Handle errors during the API call
      console.error("Error fetching user data:", error);
    }
  };



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

  console.log({ userData }, "user")

  useEffect(() => {
    getAllAwsKeys();
    getUserData();
  }, [])

  const showAllowedMenu = menuData.filter((routes) => routes.navbarShow === true)

  return (
    <>
      <Navbar bg="white" expand="lg" className="shadow-sm">
        {/* <Container> */}
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
              showAllowedMenu.map((data: any, index: number) => {
                const isActive = data.path === location.pathname.split("/")[1];
                console.log(isActive, "active")
                return (
                  <span
                    key={index}
                    className={`fw-bold me-4 ${isActive ? 'text-primary' : 'text-muted'
                      }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(data.path)}
                  >
                    {data.name}
                  </span>
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
        <NavDropdown style={{ marginRight: 90 }} title={sessionStorage.getItem("username")} id="basic-nav-dropdown">

          {userData?.map((data: any) => {
            return (
              <NavDropdown.Item className="text-muted" style={{ fontWeight: "500" }} onClick={() => navigate(data)}>{data === "admin" ? "Admin" : data === "addUser" ? "Add User" : "Add Aws Key"}</NavDropdown.Item>
            )
          })}
          <NavDropdown.Divider />
          <NavDropdown.Item className="fw-bold" onClick={handleLogout}>Logout</NavDropdown.Item>
        </NavDropdown>
        {/* </Container> */}
      </Navbar >
    </>
  );
}
