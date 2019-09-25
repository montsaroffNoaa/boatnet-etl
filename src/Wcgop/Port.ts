
// import { UserWCGOP } from './UserWCGOP';
// export interface Port{    
//   _id?: string;
//   _rev?: string;
//   type: string;
//   created_date: Date;
//   modified_date?: Date;
//   port_id: number;
//   name: string;
//   code: string;
//   group: string;
//   state: string;
//   created_by: UserWCGOP;
//   modified_by: UserWCGOP;
//   ifq_port_id: number;
//   ifq_port_code: number;
// }

// export function ConstructPortWCGOP(PortData: any, CreatedBy: UserWCGOP, ModifiedBy: UserWCGOP){
//     let NewPort: Port = {
//       type: 'Port',
//       port_id: PortData[0],
//       name: PortData[1],
//       code: PortData[2],
//       group: PortData[3],
//       state: PortData[4],
//       created_by: CreatedBy,
//       created_date: PortData[6],
//       modified_by: ModifiedBy,
//       modified_date: PortData[8],
//       ifq_port_id: PortData[9],
//       ifq_port_code: PortData[10]
//     }
//     return NewPort;
// }