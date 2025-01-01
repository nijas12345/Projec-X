import { Model } from "mongoose";
import { IWorkLogRepository } from "../Interfaces/worklog.repository.inteface";
import { IUser, IWorkLog, Statistics } from "../Interfaces/commonInterface";

class WorkLogRepository implements IWorkLogRepository {
  private userModel = Model<IUser>;
  private workLog = Model<IWorkLog>;
  constructor(userModel: Model<IUser>, workLog: Model<IWorkLog>) {
    (this.userModel = userModel), (this.workLog = workLog);
  }
  clockIn = async (user_id: string): Promise<Date | number> => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const existingClockData: IWorkLog | null = await this.workLog.findOne({
        user_id: user_id,
        date: { $gte: startOfDay, $lte: endOfDay },
      });
      if (existingClockData) {
        const newClockInTime: Date = new Date();
        const updatedClockData: IWorkLog | null =
          await this.workLog.findOneAndUpdate(
            { user_id: user_id, date: { $gte: startOfDay, $lte: endOfDay } },
            { $set: { clockIn: newClockInTime, isClockedIn: true } },
            { new: true }
          );
        return updatedClockData ? updatedClockData.workDuration : 0;
      } else {
        const now = new Date();
        const clockData: IWorkLog = {
          user_id: user_id,
          date: now,
          clockIn: now,
          clockOut: now,
          workDuration: 0,
          breakDuration: 0,
          isClockedIn: true,
          isOnBreak: false,
          breakStart: now,
          breakEnd: now,
        };
        const newClockData: IWorkLog = await this.workLog.create(clockData);
        return newClockData.date;
      }
    } catch (error) {
      throw error;
    }
  };

  clockOut = async (user_id: string): Promise<number> => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const existingClockData: IWorkLog | null = await this.workLog.findOne({
        user_id: user_id,
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      if (!existingClockData || !existingClockData.clockIn) {
        throw new Error("No clock-in data found for this user today.");
      }

      const now = new Date();
      const differenceInMs: number =
        now.getTime() - existingClockData.clockIn.getTime();
      console.log(differenceInMs);

      const newWorkDuration: number =
        existingClockData.workDuration + differenceInMs;

      const updatedClockData: IWorkLog | null =
        await this.workLog.findOneAndUpdate(
          { user_id: user_id, date: { $gte: startOfDay, $lte: endOfDay } },
          {
            $set: {
              clockOut: now,
              workDuration: newWorkDuration,
              isClockedIn: false,
            },
          },
          { new: true }
        );

      return updatedClockData ? updatedClockData.workDuration : 0;
    } catch (error) {
      throw error;
    }
  };
  clockStatus = async (user_id: string): Promise<IWorkLog | null> => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const existingClockData: IWorkLog | null = await this.workLog.findOne({
        user_id: user_id,
        date: { $gte: startOfDay, $lte: endOfDay },
      });
      if (!existingClockData || !existingClockData.clockIn) {
        return null;
      }
      if (existingClockData.isClockedIn == true) {
        const now = new Date();
        const differenceInMs: number =
          now.getTime() - existingClockData.clockIn.getTime();
        console.log("difference", differenceInMs);
        const newWorkDuration: number =
          differenceInMs + existingClockData.workDuration;
        const updatedClockData: IWorkLog | null =
          await this.workLog.findOneAndUpdate(
            { user_id: user_id, date: { $gte: startOfDay, $lte: endOfDay } },
            {
              $set: {
                clockOut: now,
                clockIn: now,
                workDuration: newWorkDuration,
              },
            },
            { new: true }
          );
        return updatedClockData;
      }
      if (existingClockData.isOnBreak) {
        const now = new Date();
        const differenceInMs: number =
          now.getTime() - existingClockData.breakStart.getTime();
        console.log("difference", differenceInMs);
        const newbreakDuration: number =
          differenceInMs + existingClockData.breakDuration;
        const updatedClockData: IWorkLog | null =
          await this.workLog.findOneAndUpdate(
            { user_id: user_id, date: { $gte: startOfDay, $lte: endOfDay } },
            { $set: { breakStart: now, breakDuration: newbreakDuration } },
            { new: true }
          );
        return updatedClockData;
      }
      return existingClockData;
    } catch (error) {
      throw error;
    }
  };
  clockBreakStart = async (user_id: string): Promise<void> => {
    try {
      const now = new Date();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const existingClockData: IWorkLog | null = await this.workLog.findOne({
        user_id: user_id,
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      if (!existingClockData || !existingClockData.clockIn) {
        throw new Error("No data exist on this user");
      }
      if (existingClockData) {
        const updatedClockData: IWorkLog | null =
          await this.workLog.findOneAndUpdate(
            { user_id: user_id, date: { $gte: startOfDay, $lte: endOfDay } },
            { $set: { breakStart: now, isOnBreak: true } },
            { new: true }
          );
      }
    } catch (error) {
      throw error;
    }
  };
  clockBreakEnd = async (user_id: string): Promise<void> => {
    try {
      const now = new Date();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const existingClockData: IWorkLog | null = await this.workLog.findOne({
        user_id: user_id,
        date: { $gte: startOfDay, $lte: endOfDay },
      });
      console.log("breakEnd", existingClockData);

      if (!existingClockData || !existingClockData.clockIn) {
        throw new Error("No data exist on this user");
      }
      if (existingClockData) {
        const differenceInMs: number =
          now.getTime() - existingClockData.breakStart.getTime();
        const newBreakDuration: number =
          existingClockData.breakDuration + differenceInMs;
        const updatedClockData: IWorkLog | null =
          await this.workLog.findOneAndUpdate(
            { user_id: user_id, date: { $gte: startOfDay, $lte: endOfDay } },
            {
              $set: {
                breakEnd: now,
                breakDuration: newBreakDuration,
                isOnBreak: false,
              },
            },
            { new: true }
          );
        console.log(updatedClockData);
      }
    } catch (error) {
      throw error;
    }
  };
  scheduleClockStatus = async (user_id: string): Promise<void> => {
    try {
      const now = new Date();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const existingClockData: IWorkLog | null = await this.workLog.findOne({
        user_id: user_id,
        date: { $gte: startOfDay, $lte: endOfDay },
      });
      if (existingClockData?.isClockedIn) {
        const differenceInMs: number =
          now.getTime() - existingClockData.clockIn.getTime();

        const newWorkDuration: number =
          existingClockData.workDuration + differenceInMs;

        const updatedClockData: IWorkLog | null =
          await this.workLog.findOneAndUpdate(
            { user_id: user_id, date: { $gte: startOfDay, $lte: endOfDay } },
            {
              $set: {
                clockOut: now,
                workDuration: newWorkDuration,
                isClockedIn: false,
              },
            },
            { new: true }
          );
      }
      if (existingClockData?.isOnBreak) {
        const differenceInMs: number =
          now.getTime() - existingClockData.breakStart.getTime();
        const newBreakDuration: number =
          existingClockData.breakDuration + differenceInMs;
        const updatedClockData: IWorkLog | null =
          await this.workLog.findOneAndUpdate(
            { user_id: user_id, date: { $gte: startOfDay, $lte: endOfDay } },
            {
              $set: {
                breakEnd: now,
                breakDuration: newBreakDuration,
                isOnBreak: false,
              },
            },
            { new: true }
          );
      }
    } catch (error) {
      throw error;
    }
  };
  clockStatistics = async (user_id: string): Promise<Statistics[]> => {
    try {
      const sevenDaysAgo = new Date();
      console.log("user", user_id);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const statisticsDate = await this.workLog
        .find({
          user_id: user_id,
          date: { $gte: sevenDaysAgo },
        })
        .sort({ date: -1 });
      return statisticsDate;
    } catch (error) {
      throw error;
    }
  };
}

export default WorkLogRepository;
