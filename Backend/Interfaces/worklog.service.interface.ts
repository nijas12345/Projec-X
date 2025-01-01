import { IWorkLog,Statistics  } from "./commonInterface"

export interface IWorkLogService {
    clockIn(user_id:string,clockIn:Date):Promise<Date|number>
    clockOut(user_id:string,clockIn:Date):Promise<number>
    clockStatus(user_id:string):Promise<IWorkLog|null>
    clockBreakStart(user_id:string):Promise<void>
    clockBreakEnd(user_id:string):Promise<void>
    scheduleClockStatus(user_id:string):Promise<void>
    clockStatistics(user_id:string):Promise<Statistics[]>
}