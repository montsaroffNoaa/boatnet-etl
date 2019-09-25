
// import { UserWCGOP } from './UserWCGOP';
// import { Port } from './Port';

// export interface Contact {
//     _id?: string;
//     _rev?: string;
//     type: string;
//     contact_id: number;
//     user: UserWCGOP;
//     first_name: string;
//     last_name: string;
//     address_line1: string;
//     address_line2: string;
//     city: string;
//     state: string;
//     zip_code: string;
//     country: string;
//     home_phone: string;
//     work_phone: string;
//     cell_phone: string;
//     work_email: string;
//     home_email: string;
//     eprib_uin: number;
//     epirb_serial_number: number;
//     port: Port;
//     contact_type: string;
//     contact_category: string;
//     relationship: string;
//     notes: string;
//     created_by: UserWCGOP;
//     created_date: Date;
//     modified_by: UserWCGOP;
//     modified_date: Date;
//     birthdate: Date;
//     license_number: string;
//     epirb_uin_2: string;


// }


// export function ConstructContact(ContactData: any, ContactUser: UserWCGOP, Port: Port, CreatedBy: UserWCGOP, ModifiedBy: UserWCGOP){

//   let NewContact: Contact = {
//     type: 'Contact',
//     contact_id: ContactData[0],
//     user: ContactUser,
//     first_name: ContactData[2],
//     last_name: ContactData[3],
//     address_line1: ContactData[4],
//     address_line2: ContactData[5],
//     city: ContactData[6],
//     state: ContactData[7],
//     zip_code: ContactData[8],
//     country: ContactData[9],
//     home_phone: ContactData[10],
//     work_phone: ContactData[11],
//     cell_phone: ContactData[12],
//     work_email: ContactData[13],
//     home_email: ContactData[14],
//     eprib_uin: ContactData[15],
//     epirb_serial_number: ContactData[16],
//     port: Port,
//     contact_type: ContactData[18],
//     contact_category: ContactData[19],
//     relationship: ContactData[20],
//     notes: ContactData[21],
//     created_by: CreatedBy,
//     created_date: ContactData[23],
//     modified_by: ModifiedBy,
//     modified_date: ContactData[25],
//     birthdate: ContactData[26],
//     license_number: ContactData[27],
//     epirb_uin_2: ContactData[28]
//   }
//   return NewContact;

// }

