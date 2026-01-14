import { AlertCircle, Search, CheckCircleIcon, } from "lucide-react";
import '../styles/CurrentHostel.css'

export default function CurrentHostel(){

     const currentHostelData = {
        name: 'Sunrise Hostel',
        room: 'Room 204',
        paymentStatus: true,
        currentPeriod: 'December 2024',
        nextPaymentDue: '2025-01-15',
        amount: 'MWK 45,000',
        landlord: {
            name: 'Mr. John Banda',
            email: 'john.banda@example.com',
            phone: '+265 991 234 567'
        }
    };

    if(!currentHostelData){
        return(
            <div className="no-hostel">
                <AlertCircle></AlertCircle>
                <h1>You are currently not Residing in any Hostel</h1>
                <button className="btn"><Search />Search For Hostel</button>
            </div>
        )
    }
    else{
        return(
            <div className="hostelInfo">
                <div className="top">
                    <h1>{currentHostelData.name}</h1>
                    <p>{currentHostelData.room}</p>
                </div>
                <div className="payment">
                    {currentHostelData.paymentStatus
                    ? <div className="paid">
                            <CheckCircleIcon />
                            <p>Paid</p> 
                        </div> 
                    : <div className="unpaid">
                        <AlertCircle />
                        <p>Not Paid</p>
                        </div>}
                </div>
                <div className="date">
                    <p>Next Payment Due: <span>{currentHostelData.nextPaymentDue}</span></p>
                    <p>Amount: <span>{currentHostelData.amount}</span></p>
                </div>
                <hr />
                <div className="contact">
                    <h2>Contact Landlord</h2>
                    <a href={`mailto:${currentHostelData.landlord.email}`}>{currentHostelData.landlord.email}</a>
                    <a href={`tel:${currentHostelData.landlord.phone}`}>{currentHostelData.landlord.phone}</a>
                </div>
            </div>
        )
    }
}