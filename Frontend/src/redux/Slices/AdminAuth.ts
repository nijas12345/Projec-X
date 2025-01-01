import { createSlice } from "@reduxjs/toolkit";
import { AdminData } from "../../apiTypes/apiTypes";

export interface userState{
    adminInfo:AdminData|null
}

const initialAdminState:userState = {
    adminInfo:localStorage.getItem('adminInfo')
    ?JSON.parse(localStorage.getItem('adminInfo')!):null,
}

const adminAuthSlice = createSlice({
    name: "adminAuth",
    initialState: initialAdminState,
    reducers: {
        setAdminCredentials: (state, action) => {
            state.adminInfo = action.payload;
            localStorage.setItem("adminInfo", JSON.stringify(action.payload));
        },
        adminLogout: (state) => {
            state.adminInfo = null;
            localStorage.removeItem("adminInfo");
        },
        updateAdminProfileImage:(state,action)=>{
            if(state.adminInfo){
                state.adminInfo.profileImage = action.payload;
                localStorage.setItem('adminInfo',JSON.stringify(state.adminInfo))
            }
        } 
    },
}); 

export const { setAdminCredentials, adminLogout,updateAdminProfileImage} = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
