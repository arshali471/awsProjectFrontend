
import { Image, Nav, NavDropdown, Navbar } from 'react-bootstrap';
import './Topbar.css';
import IRouter from '../Interface/IRouter';
import { AdminService } from '../services/admin.service';
import { useContext, useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { SelectedRegionContext, SelectedAccountContext } from '../context/context';
import { useLocation, useNavigate } from 'react-router-dom';
import LogoImage from "../../assets/IFF.png"

interface ITopBar {
  menuData: IRouter[],
}

export default function TopBar({ menuData }: ITopBar) {

  const navigate = useNavigate();
  const location = useLocation();

  const { selectedRegion, setSelectedRegion }: any = useContext(SelectedRegionContext);
  const { selectedAccount, setSelectedAccount }: any = useContext(SelectedAccountContext);

  const [accountsData, setAccountsData] = useState<any[]>([]);
  const [regionsData, setRegionsData] = useState<any[]>([]);

  const getAccountsAndRegions = async () => {
    await AdminService.getAccountsAndRegions().then((res) => {
      if (res.status === 200) {
        setAccountsData(res.data.accounts || []);

        // Convert grouped regions to react-select grouped options format
        const groupedOptions = (res.data.regions || []).map((group: any) => ({
          label: group.groupName,
          options: group.regions
        }));

        setRegionsData(groupedOptions);
      }
    }).catch(err => {
      console.error("Error fetching accounts and regions:", err);
    });
  }

  const filterAccounts = (inputValue: string) => {
    return accountsData.filter((i: any) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const filterRegions = (inputValue: string) => {
    // Filter across all groups
    return regionsData.map((group: any) => ({
      ...group,
      options: group.options.filter((region: any) =>
        region.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        region.value.toLowerCase().includes(inputValue.toLowerCase())
      )
    })).filter((group: any) => group.options.length > 0);
  };

  const loadAccountOptions = (
    inputValue: string,
    callback: (options: any[]) => void
  ) => {
    setTimeout(() => {
      callback(filterAccounts(inputValue));
    }, 300);
  };

  const loadRegionOptions = (
    inputValue: string,
    callback: (options: any[]) => void
  ) => {
    setTimeout(() => {
      callback(filterRegions(inputValue));
    }, 300);
  };

  useEffect(() => {
    getAccountsAndRegions();
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
          {/* Account Selector */}
          <div style={{ flex: '1 1 auto', minWidth: '180px', maxWidth: '250px' }}>
            <AsyncSelect
              value={selectedAccount}
              placeholder="Select Account..."
              cacheOptions
              loadOptions={loadAccountOptions}
              defaultOptions={accountsData}
              isClearable={true}
              onChange={(e: any) => {
                setSelectedAccount(e);
                // Clear region when account changes
                if (!e) {
                  setSelectedRegion(null);
                }
              }}
              menuPortalTarget={document.body}
              maxMenuHeight={280}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                control: (base) => ({ ...base, minHeight: '40px', width: '100%' }),
                container: (base) => ({ ...base, width: '100%' }),
                menu: (base) => ({ ...base, maxHeight: '280px' }),
                menuList: (base) => ({ ...base, maxHeight: '280px' })
              }}
            />
          </div>
          {/* Region Selector */}
          <div style={{ flex: '1 1 auto', minWidth: '180px', maxWidth: '250px' }}>
            <AsyncSelect
              value={selectedRegion}
              placeholder="Select Region..."
              cacheOptions
              loadOptions={loadRegionOptions}
              defaultOptions={regionsData}
              isClearable={true}
              isDisabled={!selectedAccount}
              onChange={(e: any) => setSelectedRegion(e)}
              menuPortalTarget={document.body}
              maxMenuHeight={280}
              formatGroupLabel={(group: any) => (
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '0.9em',
                  color: '#0073bb',
                  padding: '5px 10px',
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: '#f5f5f5'
                }}>
                  {group.label}
                </div>
              )}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                control: (base) => ({
                  ...base,
                  minHeight: '40px',
                  width: '100%',
                  backgroundColor: !selectedAccount ? '#f0f0f0' : 'white'
                }),
                container: (base) => ({ ...base, width: '100%' }),
                menu: (base) => ({ ...base, maxHeight: '280px' }),
                menuList: (base) => ({ ...base, maxHeight: '280px' }),
                group: (base) => ({ ...base, paddingTop: 0, paddingBottom: 0 }),
                groupHeading: (base) => ({ ...base, margin: 0, padding: 0 })
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
