import 'express';

declare module 'express' {
   interface Request {
      user_id?: string;
      admin_id?:string
   }
}