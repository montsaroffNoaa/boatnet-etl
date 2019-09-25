
// import { UserWCGOP } from './UserWCGOP';
// import { Port } from './Port';

// export interface Vessel{
//   _id?: string;
//   _rev?: string;
//   type: string;
//   vessel_id: number;
//   port: Port; 
//   vessel_name: string;  
//   vessel_type: string;
//   coast_guard_num: number;
//   state_reg_num: string;
//   registered_length: number;
//   registered_length_um: string;
//   safety_decal_exp: Date; // BoatNet date?
//   vessel_status: string;
//   notes: string;
//   created_by: UserWCGOP;
//   created_date: Date;
//   modified_by: UserWCGOP;
//   modified_date: Date;
// }


// export function ConstructVesselWCGOP(VesselData: any, CreatedBy: UserWCGOP, ModifiedBy: UserWCGOP, Port: Port){
//   let NewVessel: Vessel = {
//     type: 'Vessel',
//     vessel_id: VesselData[0],
//     port: Port,
//     vessel_name : VesselData[2],
//     vessel_type: VesselData[3],
//     coast_guard_num: VesselData[4],
//     state_reg_num: VesselData[5],
//     registered_length: VesselData[6],
//     registered_length_um: VesselData[7],
//     safety_decal_exp: VesselData[8],
//     vessel_status: VesselData[9],
//     notes: VesselData[10],
//     created_by: CreatedBy,
//     created_date: VesselData[12],
//     modified_by: ModifiedBy,
//     modified_date: VesselData[14]

//   }

//   return NewVessel;
// }
