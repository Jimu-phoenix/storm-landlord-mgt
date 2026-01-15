import { SignUp } from "@clerk/clerk-react";
import '../styles/Auth.css'
export default function SignUpStorm(){
    return(
        <div className="sign_container">
            <img src="https://images.unsplash.com/photo-1448630360428-65456885c650?q=80&w=1467&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="login Image" />
            <div className="sign_component"><SignUp signInForceRedirectUrl={'/login'} signInUrl="/login" forceRedirectUrl={'/cross'}/></div>
        </div>
    )
}