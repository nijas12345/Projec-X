import { createSlice } from "@reduxjs/toolkit";
import { UserData } from "../../apiTypes/apiTypes";

export interface userState{
    userInfo:UserData|null
}

const initialState:userState = {
    userInfo:localStorage.getItem('userInfo')
    ?JSON.parse(localStorage.getItem('userInfo')!):null,
}

const authSlice = createSlice({
    name:"userAuth",
    initialState,
    reducers:{
        setUserCredentials:(state,action)=>{
            state.userInfo = action.payload;
            localStorage.setItem('userInfo',JSON.stringify(action.payload))
        },
        userLogout:(state)=>{
            state.userInfo = null;
            localStorage.removeItem('userInfo')
        },
        updateProfileImage:(state,action)=>{
            if(state.userInfo){
                state.userInfo.profileImage = action.payload;
                localStorage.setItem('userInfo',JSON.stringify(state.userInfo))
            }
        } 
    }
})

export const {setUserCredentials,userLogout,updateProfileImage} = authSlice.actions;
export default authSlice.reducer;