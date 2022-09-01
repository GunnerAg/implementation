/* eslint-disable no-unused-vars */
import { CompanyModel } from '../../blockchain'

declare global {
  namespace Express {
    export interface Request {
      currentUser: CompanyModel;
      body: any;
    }

    export interface Response {
      status: number;
    }
  }

  namespace Models {
    export type UserModel = CompanyModel;
  }
}

declare module '*.json' {
  const value: any
  export default value
}
