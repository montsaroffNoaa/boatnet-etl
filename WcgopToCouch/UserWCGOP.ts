// import { User } from "./UserBase";


// export interface UserWCGOP extends User {
//     user_id: number;
//     status: string;
//     created_by_user_id: number;
//     created_by_first_name: string;
//     created_by_last_name: string;
//     created_date: Date;
//     modified_by_user_id: number;
//     modified_by_first_name: string;
//     modified_by_last_name: string;
//     modified_date: Date;
//   }


// export function ConstructUserWCGOP(UserData: any){
//   let NewUser: UserWCGOP = {
//     type: 'User',
//     user_id: UserData[0],
//     first_name: UserData[1],
//     last_name: UserData[2],
//     status: UserData[3],
//     created_by_user_id: UserData[4],
//     created_date: UserData[5],
//     modified_by_user_id: UserData[6],
//     modified_date: UserData[7],
//     created_by_first_name: UserData[8],
//     created_by_last_name: UserData[9],
//     modified_by_first_name: UserData[10],
//     modified_by_last_name: UserData[11]
//   }
//   return NewUser;
// }