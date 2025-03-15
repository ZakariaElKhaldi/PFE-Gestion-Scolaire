// filepath: c:\Users\pc\back-front-web-v2\backend\src\types\express.d.ts
import { JwtPayload } from './auth';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}