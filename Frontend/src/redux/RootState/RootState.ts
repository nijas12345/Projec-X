import {UserData} from '../../apiTypes/apiTypes';
import { AdminData } from '../../apiTypes/apiTypes';

export interface RootState{
    userAuth:{
        userInfo:UserData | null
    }
    adminAuth:{
        adminInfo:AdminData | null
    }
}