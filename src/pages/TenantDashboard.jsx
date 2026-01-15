import { UserButton, useUser } from '@clerk/clerk-react';
import { Search, Filter, Mail, DollarSign, Calendar, MapPin, Bed, Home, Bell, Settings, HelpCircle, FileText, Users, Menu, X } from 'lucide-react';
import { useState } from 'react';
import '../styles/TenantDashboard.css';
import CurrentHostel from '../components/CurrentHostel';
import HostelSearch from '../components/HostelSearch';



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
            <h1>PropertyHub</h1>
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
                            <Search></Search>
                            Search</li>



                        {/* <li onClick={()=>handlePage('messages')} className="nav-btn">
                            <img width="20" height="20" src="https://img.icons8.com/ios/50/messages-mac.png" 
                            alt="messages-mac"/>
                            Messages</li>
                          <li onClick={()=>handlePage('orders')} className="nav-btn">
                            <img width="20" height="20" src="https://img.icons8.com/windows/32/purchase-order.png" 
                            alt="messages-mac"/>
                            Orders</li> */}
                    </ul>

                 <div className="user">
                    <UserButton></UserButton>
                    <div className="usergreeting">
                        <p>Hello, {user.firstName}</p>
                    </div>
                </div> 
                </div>

                <div className="page-content">
                    {viewPage === 'search' && 
                    <HostelSearch />
                    }
                    {viewPage === 'current' && <CurrentHostel />}
                </div>
            </section>

        </div>

    )
}

// const currentHostelData = {
//   name: 'Sunrise Hostel',
//   room: 'Room 204',
//   paymentStatus: 'Paid',
//   currentPeriod: 'December 2024',
//   nextPaymentDue: '2025-01-15',
//   amount: 'MWK 45,000',
//   landlord: {
//     name: 'Mr. John Banda',
//     email: 'john.banda@example.com',
//     phone: '+265 991 234 567'
//   }
// };

// const availableHostels = [
//   {
//     id: 1,
//     name: 'Sunrise Hostel',
//     location: 'Blantyre City Center',
//     price: 'MWK 45,000/month',
//     beds: 2,
//     amenities: ['WiFi', 'Water', 'Security'],
//     available: true
//   },
//   {
//     id: 2,
//     name: 'Campus View Lodge',
//     location: 'Near Polytechnic',
//     price: 'MWK 35,000/month',
//     beds: 4,
//     amenities: ['WiFi', 'Shared Kitchen'],
//     available: true
//   },
//   {
//     id: 3,
//     name: 'Green Valley Residence',
//     location: 'Limbe',
//     price: 'MWK 50,000/month',
//     beds: 2,
//     amenities: ['WiFi', 'Water', 'Security', 'Parking'],
//     available: false
//   },
//   {
//     id: 4,
//     name: 'Student Haven',
//     location: 'Chichiri',
//     price: 'MWK 40,000/month',
//     beds: 3,
//     amenities: ['WiFi', 'Water'],
//     available: true
//   },
//   {
//     id: 5,
//     name: 'Modern Living Hostel',
//     location: 'Blantyre City Center',
//     price: 'MWK 55,000/month',
//     beds: 2,
//     amenities: ['WiFi', 'Water', 'Security', 'Laundry'],
//     available: true
//   },
//   {
//     id: 6,
//     name: 'Comfort Zone',
//     location: 'Limbe',
//     price: 'MWK 38,000/month',
//     beds: 3,
//     amenities: ['WiFi', 'Shared Kitchen', 'Security'],
//     available: true
//   }
// ];

// const menuItems = [
//   { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
//   { id: 'payments', label: 'Payments', icon: <DollarSign size={20} /> },
//   { id: 'documents', label: 'Documents', icon: <FileText size={20} /> },
//   { id: 'support', label: 'Support', icon: <Users size={20} /> },
//   { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
//   { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
//   { id: 'help', label: 'Help & Support', icon: <HelpCircle size={20} /> }
// ];

// function CurrentHostelCard({ data }) {
//   const daysUntilDue = Math.ceil((new Date(data.nextPaymentDue) - new Date()) / (1000 * 60 * 60 * 24));

//   return (
//     <div className="current-hostel-card">
//       <div className="card-header">
//         <div className="hostel-info">
//           <h3>{data.name}</h3>
//           <p className="room-number">{data.room}</p>
//         </div>
//         <span className={`payment-status-badge ${data.paymentStatus.toLowerCase()}`}>
//           {data.paymentStatus}
//         </span>
//       </div>

//       <div className="payment-details-grid">
//         <div className="detail-box">
//           <p className="label">Current Period</p>
//           <p className="value">{data.currentPeriod}</p>
//         </div>
        
//         <div className="detail-box">
//           <p className="label">Next Payment Due</p>
//           <p className="value">
//             {new Date(data.nextPaymentDue).toLocaleDateString('en-GB')}
//             <span className="days-remaining">({daysUntilDue} days)</span>
//           </p>
//         </div>
        
//         <div className="detail-box">
//           <p className="label">Amount Due</p>
//           <p className="value amount-value">{data.amount}</p>
//         </div>
        
//         <div className="detail-box">
//           <p className="label">Landlord Contact</p>
//           <p className="value">{data.landlord.name}</p>
//         </div>
//       </div>

//       <button className="contact-landlord-btn">
//         <Mail size={18} />
//         Contact Landlord
//       </button>
//     </div>
//   );
// }

// function HostelCard({ hostel }) {
//   return (
//     <div className="hostel-card">
//       <div className="hostel-card-header">
//         <h4>{hostel.name}</h4>
//         <span className={`availability-badge ${hostel.available ? 'available' : 'unavailable'}`}>
//           {hostel.available ? 'Available' : 'Occupied'}
//         </span>
//       </div>

//       <div className="hostel-details-list">
//         <div className="hostel-detail">
//           <MapPin size={16} />
//           <span>{hostel.location}</span>
//         </div>
//         <div className="hostel-detail">
//           <Bed size={16} />
//           <span>{hostel.beds} beds</span>
//         </div>
//         <div className="hostel-detail">
//           <DollarSign size={16} />
//           <span>{hostel.price}</span>
//         </div>
//       </div>

//       <div className="amenities-tags">
//         {hostel.amenities.map((amenity, index) => (
//           <span key={index} className="amenity-tag">{amenity}</span>
//         ))}
//       </div>

//       <button className="view-details-btn" disabled={!hostel.available}>
//         {hostel.available ? 'View Details' : 'Not Available'}
//       </button>
//     </div>
//   );
// }

// function HostelSearch() {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [filters, setFilters] = useState({
//     maxPrice: '',
//     beds: '',
//     location: '',
//     availableOnly: true
//   });

//   const filteredHostels = availableHostels.filter(hostel => {
//     const matchesSearch = hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          hostel.location.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesAvailability = !filters.availableOnly || hostel.available;
    
//     return matchesSearch && matchesAvailability;
//   });

//   return (
//     <div className="hostel-search-section">
//       <div className="search-bar">
//         <input
//           type="text"
//           className="search-input"
//           placeholder="Search by name or location..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <button 
//           className="filter-toggle-btn"
//           onClick={() => setShowFilters(!showFilters)}
//         >
//           <Filter size={18} />
//           Filters
//         </button>
//       </div>

//       {showFilters && (
//         <div className="filters-panel">
//           <div className="filter-group">
//             <label>Location</label>
//             <select 
//               value={filters.location}
//               onChange={(e) => setFilters({...filters, location: e.target.value})}
//             >
//               <option value="">All Locations</option>
//               <option value="blantyre">Blantyre</option>
//               <option value="limbe">Limbe</option>
//               <option value="chichiri">Chichiri</option>
//             </select>
//           </div>

//           <div className="filter-group">
//             <label>Number of Beds</label>
//             <select
//               value={filters.beds}
//               onChange={(e) => setFilters({...filters, beds: e.target.value})}
//             >
//               <option value="">Any</option>
//               <option value="2">2 beds</option>
//               <option value="3">3 beds</option>
//               <option value="4">4 beds</option>
//             </select>
//           </div>

//           <div className="filter-group">
//             <label className="checkbox-label">
//               <input
//                 type="checkbox"
//                 checked={filters.availableOnly}
//                 onChange={(e) => setFilters({...filters, availableOnly: e.target.checked})}
//               />
//               Available Only
//             </label>
//           </div>
//         </div>
//       )}

//       <div className="hostels-grid">
//         {filteredHostels.map(hostel => (
//           <HostelCard key={hostel.id} hostel={hostel} />
//         ))}
//       </div>

//       {filteredHostels.length === 0 && (
//         <p className="no-results">No hostels found matching your criteria</p>
//       )}
//     </div>
//   );
// }

// // function Sidebar({ activeView, setActiveView, isOpen, setIsOpen }) {
// //   return (
// //     <>
// //       <div className={`mobile-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />
// //       <div className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
// //         <div className="sidebar-content">
// //           <div className="sidebar-section">
// //             <h2>Navigation</h2>
// //             <ul className="sidebar-menu">
// //               {menuItems.map(item => (
// //                 <li key={item.id}>
// //                   <a 
// //                     href="#"
// //                     className={activeView === item.id ? 'active' : ''}
// //                     onClick={(e) => {
// //                       e.preventDefault();
// //                       setActiveView(item.id);
// //                       setIsOpen(false);
// //                     }}
// //                   >
// //                     {item.icon}
// //                     {item.label}
// //                   </a>
// //                 </li>
// //               ))}
// //             </ul>
// //           </div>

// //           <div className="quick-actions">
// //             <button className="quick-action-btn">
// //               <Mail size={18} />
// //               Message Landlord
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     </>
// //   );
// // }

// export default function TenantDashboard() {
//   const [activeView, setActiveView] = useState('dashboard');
//   const [dashboardView, setDashboardView] = useState('current');
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const renderDashboardContent = () => {
//     if (dashboardView === 'current') {
//       return <div className="dcontent"><CurrentHostelCard data={currentHostelData} /></div>;
//     } else {
//       return <div className="dcontent"><HostelSearch /></div>;
//     }
//   };

//   const renderMainContent = () => {
//     if (activeView === 'dashboard') {
//       return (
//         <>
//           <div className="content-header">
//             {/* <h2>Dashboard</h2> */}
//             <div className="view-toggle">
//               <button 
//                 className={`toggle-btn ${dashboardView === 'current' ? 'active' : ''}`}
//                 onClick={() => setDashboardView('current')}
//               >
//                 Current Hostel
//               </button>
//               <button 
//                 className={`toggle-btn ${dashboardView === 'search' ? 'active' : ''}`}
//                 onClick={() => setDashboardView('search')}
//               >
//                 Search Hostels
//               </button>
//             </div>
//           </div>
//           {renderDashboardContent()}
//         </>
//       );
//     }

//     return (
//       <div className="content-header">
//         <h2>{menuItems.find(item => item.id === activeView)?.label || 'Dashboard'}</h2>
//       </div>
//     );
//   };

//   return (
//     <div className="tenant-dashboard">
//       <header className="dashboard-header">
//         <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
//           {/* <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
//             {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
//           </button> */}
//           <h1>Tenant Dashboard</h1>
//         </div>
//         <div className="header-actions">
//           <div className="notification-icon">
//             <Bell size={20} />
//           </div>
//           <UserButton afterSignOutUrl="/" />
//         </div>
//       </header>

//       <div className="dashboard-container">
//         {/* <Sidebar 
//           activeView={activeView} 
//           setActiveView={setActiveView}
//           isOpen={sidebarOpen}
//           setIsOpen={setSidebarOpen}
//         /> */}
        
//         <main className="dashboard-main">
//           <div className="main-content">
//             {renderMainContent()}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }