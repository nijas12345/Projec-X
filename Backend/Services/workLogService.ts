import { IWorkLogService } from "../Interfaces/worklog.service.interface";
import { IWorkLogRepository } from "../Interfaces/worklog.repository.inteface";
import { IWorkLog, Statistics } from "../Interfaces/commonInterface";

class WorkLogServices implements IWorkLogService {
  private workLogRepository: IWorkLogRepository;
  constructor(workLogRepository: IWorkLogRepository) {
    this.workLogRepository = workLogRepository;
  }
  clockIn = async (user_id: string, date: Date): Promise<Date | number> => {
    try {
      return await this.workLogRepository.clockIn(user_id, date);
    } catch (error) {
      throw error;
    }
  };
  clockOut = async (user_id: string, clockIn: Date): Promise<number> => {
    try {
      return await this.workLogRepository.clockOut(user_id, clockIn);
    } catch (error) {
      throw error;
    }
  };
  clockStatus = async (user_id: string): Promise<IWorkLog | null> => {
    try {
      return await this.workLogRepository.clockStatus(user_id);
    } catch (error) {
      throw error;
    }
  };
  clockBreakStart = async (user_id: string): Promise<void> => {
    try {
      return await this.workLogRepository.clockBreakStart(user_id);
    } catch (error) {
      throw error;
    }
  };
  clockBreakEnd = async (user_id: string): Promise<void> => {
    try {
      return await this.workLogRepository.clockBreakEnd(user_id);
    } catch (error) {
      throw error;
    }
  };
  scheduleClockStatus = async (user_id: string): Promise<void> => {
    try {
      return await this.workLogRepository.scheduleClockStatus(user_id);
    } catch (error) {
      throw error;
    }
  };
  clockStatistics = async (user_id: string): Promise<Statistics[]> => {
    try {
      return await this.workLogRepository.clockStatistics(user_id);
    } catch (error) {
      throw error;
    }
  };
}

export default WorkLogServices;
