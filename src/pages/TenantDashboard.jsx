import { UserButton, useUser } from '@clerk/clerk-react';
import { Search, Receipt, Menu, X } from 'lucide-react';
import { useState } from 'react';
import '../styles/TenantDashboard.css';
import CurrentHostel from '../components/CurrentHostel';
import HostelSearch from '../components/HostelSearch';
import PaymentHistory from '../components/PaymentHistory';

export default function Admin(){

    const { user, isLoaded, isSignedIn } = useUser();
    const [viewPage, setViewPage] = useState('current')
    const [loading, setLoading] = useState(true)
    const [menuClass, setMenuClass] = useState('closeNav')
    const [menubtn, setMenubtn] = useState('https://img.icons8.com/ios-filled/50/menu--v6.png')

    const handlePage = (page)=>{
        setViewPage(page);
    }
    const handleMenu = ()=>{
        if(menuClass === 'navigate'){
            setMenuClass('closeNav');
            setMenubtn("https://img.icons8.com/ios-filled/50/menu--v6.png");
        }
        else{
            setMenuClass('navigate');
            setMenubtn('https://img.icons8.com/ios-glyphs/30/delete-sign.png');
        }
    }

    if(!isLoaded){
        return(
            <div className="loader"></div>
        )
    }

    return(

        <div className="admin">
           <div className="header">
            <h1>SmartLord</h1>
            <button className="mobilemenu" onClick={handleMenu}>
                <img width="25" height="25" src={menubtn} 
                alt="menu--v6"/>
            </button>
           </div>

            <section className="main-content">


                <div className={menuClass}>
                    <ul className="pages">

                        <li onClick={()=>handlePage('current')} className="nav-btn">
                            <img width="20" height="20" src="https://img.icons8.com/fluency-systems-regular/48/home--v1.png" 
                            alt="package"/>
                            Current</li>

                        <li onClick={()=>handlePage('search')} className="nav-btn">
                            <Search size={20}></Search>
                            Search</li>

                        <li onClick={()=>handlePage('payments')} className="nav-btn">
                            <Receipt size={20}></Receipt>
                            Payment History</li>

                    </ul>

                 <div className="user">
                    <UserButton></UserButton>
                    <div className="usergreeting">
                        <p>Hello, {user.firstName}</p>
                    </div>
                </div> 
                </div>

                <div className="page-content">
                    {viewPage === 'search' && <HostelSearch />}
                    {viewPage === 'current' && <CurrentHostel onSearch={() => handlePage('search')}/>}
                    {viewPage === 'payments' && <PaymentHistory />}
                </div>
            </section>

        </div>

    )
}