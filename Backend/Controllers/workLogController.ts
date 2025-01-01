import { Request, Response } from "express";
import HTTP_statusCode from "../Enums/httpStatusCode";
import { IWorkLogService } from "../Interfaces/worklog.service.interface";

class WorkLogController {
  private workLogService: IWorkLogService;
  constructor(workLogService: IWorkLogService) {
    this.workLogService = workLogService;
  }
  clockIn = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const date = req.body.clockInTime as Date;
      const serviceResponse = await this.workLogService.clockIn(user_id, date);
      res.status(HTTP_statusCode.OK).json({ serviceResponse });
    } catch (error: any) {
      throw error;
    }
  };
  clockOut = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const clockIn = req.body.clockInTime as Date;
      const serviceResponse = await this.workLogService.clockOut(
        user_id,
        clockIn
      );
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error) {
      throw error;
    }
  };
  clockStatus = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const serviceResponse = await this.workLogService.clockStatus(user_id);
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error) {
      throw error;
    }
  };
  breakStart = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const serviceResponse = await this.workLogService.clockBreakStart(
        user_id
      );
      res.status(HTTP_statusCode.OK).send();
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  breakEnd = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;
      const serviceResponse = await this.workLogService.clockBreakEnd(user_id);
      res.status(HTTP_statusCode.OK).send();
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  scheduleClockStatus = async (req: Request, res: Response) => {
    try {
      const user_id = req.body.user_id as string;
      const serviceResponse = await this.workLogService.scheduleClockStatus(
        user_id
      );
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
  clockStatistics = async (req: Request, res: Response) => {
    try {
      const user_id = req.user_id as string;

      const serviceResponse = await this.workLogService.clockStatistics(
        user_id
      );
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
      const message = error.message;
      res.status(HTTP_statusCode.NotFound).json({ message: error.message });
    }
  };
}

export default WorkLogController;
