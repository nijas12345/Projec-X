import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../Slices/UserAuth'
import adminReducer from '../Slices/AdminAuth'

const store = configureStore({
    reducer:{
        userAuth:authReducer,
        adminAuth:adminReducer
    }
})

export default store