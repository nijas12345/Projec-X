import { IWorkLog,Statistics } from "./commonInterface"

export interface IWorkLogRepository{
    clockIn(user_id:string,date:Date):Promise<Date|number>
    clockOut(user_id:string,date:Date):Promise<number>
    clockStatus(user_id:string):Promise<IWorkLog|null>
    clockBreakStart(user_id:string):Promise<void>
    clockBreakEnd(user_id:string):Promise<void>
    scheduleClockStatus(user_id:string):Promise<void>
    clockStatistics(user_id:string):Promise<Statistics[]>
}