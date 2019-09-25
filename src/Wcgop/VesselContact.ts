
// import { Contact } from './contact';
// import { Vessel } from './vessel';
// import { UserWCGOP } from './UserWCGOP';

// export interface Vessel_Contact {
//     _id?: string;
//     _rev?: string;
//     type: string;
//     vessel_contact_id: number;
//     vessel: Vessel;
//     contact: Contact;
//     contact_type: string;
//     contact_status: string;
//     created_by: UserWCGOP;
//     created_date: Date;
//     modified_by: UserWCGOP;
//     modified_date: Date;

// }

// export function ConstructVesselContact(VesselContactData: any, CreatedBy: UserWCGOP, ModifiedBy: UserWCGOP, ContactUser: Contact, Vessel: Vessel){
//   let NewVesselContact: Vessel_Contact = {
//     type: 'Vessel_Contact',
//     vessel_contact_id: VesselContactData[0],
//     vessel: Vessel,
//     contact: ContactUser,
//     contact_type: VesselContactData[3],
//     contact_status: VesselContactData[4],
//     created_by: CreatedBy,
//     created_date: VesselContactData[6],
//     modified_by: ModifiedBy,
//     modified_date: VesselContactData[8]
//   }
//   return NewVesselContact;
// }