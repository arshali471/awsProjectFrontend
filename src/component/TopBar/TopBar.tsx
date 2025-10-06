
import { Image, Nav, NavDropdown, Navbar } from 'react-bootstrap';
import './Topbar.css';
import IRouter from '../Interface/IRouter';
import { AdminService } from '../services/admin.service';
import { useContext, useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { SelectedRegionContext } from '../context/context';
import { ThemeContext } from '../context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import LogoImage from "../../assets/IFF.png"

interface ITopBar {
  menuData: IRouter[],
}

export default function TopBar({ menuData }: ITopBar) {

  const navigate = useNavigate();
  const location = useLocation();

  const { selectedRegion, setSelectedRegion }: any = useContext(SelectedRegionContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

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
      <div className="topbar shadow-sm p-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ flex: '0 1 auto', minWidth: 0 }}>
          <h6 className="mb-0" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Welcome {sessionStorage.getItem("username")}
          </h6>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 auto', justifyContent: 'flex-end', minWidth: 0 }}>
          <div style={{ flex: '1 1 auto', minWidth: '200px', maxWidth: '300px' }}>
            <AsyncSelect
              value={selectedRegion}
              placeholder="Search Region..."
              cacheOptions
              loadOptions={loadOptions}
              defaultOptions={keysData}
              isClearable={true}
              onChange={(e: any) => setSelectedRegion(e)}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                control: (base) => ({ ...base, minHeight: '40px', width: '100%' }),
                container: (base) => ({ ...base, width: '100%' })
              }}
            />
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label="Toggle theme"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{ flexShrink: 0 }}
          >
            {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
          </button>
        </div>
      </div>
    </>
  );
}
