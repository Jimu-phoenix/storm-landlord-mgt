import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useUser } from "@clerk/clerk-react";

export default function CurrentHostel(){
    const [currentHostelData, setCurrentHostelData] = useState({});
    const {user, isLoaded} = useUser();
    useEffect(()=>{
        const getHostel = async()=>{
           try {
                const {data, error} = await supabase
                .from('tenant_application')
                .select('*')
                .eq('tenant_id', user.id)
                .maybeSingle()

                  if(error){
                    console.log(error)
                    setCurrentHostelData(null)
                }

                setCurrentHostelData(data)
              
           } catch (error) {
            console.log(error)
            setCurrentHostelData(null)
           }
        }
    })

}