
import { Image, Nav, NavDropdown, Navbar } from 'react-bootstrap';
import './Topbar.css';
import IRouter from '../Interface/IRouter';
import { AdminService } from '../services/admin.service';
import { useContext, useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { SelectedRegionContext } from '../context/context';
import { useLocation, useNavigate } from 'react-router-dom';
import LogoImage from "../../assets/IFF.png"
interface ITopBar {
  menuData: IRouter[],
}

export default function TopBar({ menuData }: ITopBar) {

  const navigate = useNavigate();
  const location = useLocation();



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



  useEffect(() => {
    getAllAwsKeys();
  }, [])


  return (
    <>
      <div  className="shadow-sm p-2 d-flex align-items-center w-100">
        <h6>Welcome {sessionStorage.getItem("username")}</h6>
        <div className="d-flex ms-auto align-items-center me-3" style={{ gap: "1rem" }}>
          <div style={{ width: "20rem" }}>
            <AsyncSelect
              value={selectedRegion}
              placeholder="Search Region..."
              className="w-100"
              cacheOptions
              loadOptions={loadOptions}
              defaultOptions={keysData}
              isClearable={true}
              onChange={(e: any) => setSelectedRegion(e)}
            />
          </div>
        </div>
      </div>

    </>
  );
}
