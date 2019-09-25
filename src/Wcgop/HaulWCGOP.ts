
// import { UserWCGOP } from './UserWCGOP';
// import { CatchWCGOP } from './CatchWCGOP';
// import { CatchCategory } from './CatchCategory';
// import { Haul } from './HaulBase';

// export interface HaulWCGOP extends Haul {
//   haul_id: number;
//   old_trip_id: number;
//   haul_num: number;
//   observer_total_catch: number;
//   otc_weight_um: string;
//   otc_weight_method: string;
//   total_hooks: number;
//   gear_type: string;
//   gear_performance: number;
//   beaufort_value: string;
//   volume: number;
//   volume_um: string;
//   density: number;
//   density_um: string;
//   notes: string;
//   created_by: UserWCGOP;
//   modified_by:UserWCGOP;
//   catch_category: CatchCategory
//   catch_weight_kp: number;
//   catch_count_kp: number;
//   hooks_sampled_kp: number;
//   efp: boolean;
//   sample_weight_kp: number;
//   sample_count_kp: number;
//   deterrent_used: string;
//   avg_soak_time: string;
//   tot_gear_segments: number;
//   gear_segments_lost: number;
//   total_hooks_lost: number;
//   excluder_type: string;
//   data_source: string;
//   data_quality: boolean;
//   cal_weight: string;
//   fit: string;
//   brd_present: boolean;
//   catches: CatchWCGOP[];


// }



// export function ConstructHaulWCGOP(HaulData: any, CreatedBy: UserWCGOP, ModifiedBy: UserWCGOP, CatchCategory: CatchCategory, Catches: CatchWCGOP[]){
//   let bEFP: boolean;
//   let bDataQuality: boolean;
//   let bBRDPresent: boolean;


//   if (HaulData[22] == 'EFP'){
//     bEFP = true;
//   } else {
//     bEFP = false;
//   }

//   if (HaulData[32] == '2'){
//     bDataQuality = true;
//   } else if (HaulData[32] == '1'){
//     bDataQuality = false;
//   } else{
//     bDataQuality = undefined;
//   }

//   if (HaulData[35] == '1'){
//     bBRDPresent = true;
//   } else if (HaulData[35] = '0'){
//     bBRDPresent = false;
//   } else {
//     bBRDPresent = undefined;
//   }

//     let NewHaul: HaulWCGOP = {
//       type: "Haul",
//       haul_id: HaulData[0],
//       old_trip_id: HaulData[36],
//       haul_num: HaulData[1],
//       observer_total_catch: HaulData[2],
//       otc_weight_um: HaulData[3],
//       otc_weight_method: HaulData[4],
//       total_hooks: HaulData[5],
//       gear_type: HaulData[6],
//       gear_performance: HaulData[7],
//       beaufort_value: HaulData[8],
//       volume: HaulData[9],
//       volume_um: HaulData[10],
//       density: HaulData[11],
//       density_um: HaulData[12],
//       notes: HaulData[13],
//       created_by: CreatedBy,
//       created_date: HaulData[15],
//       modified_by: ModifiedBy,
//       modified_date: HaulData[17],
//       catch_category: CatchCategory,
//       catch_weight_kp: HaulData[19],
//       catch_count_kp: HaulData[20],
//       hooks_sampled_kp: HaulData[21],

//       efp: bEFP,

//       sample_weight_kp: HaulData[23],
//       sample_count_kp: HaulData[24],
//       deterrent_used: HaulData[25],
//       avg_soak_time: HaulData[26],
//       tot_gear_segments: HaulData[27],
//       gear_segments_lost: HaulData[28],
//       total_hooks_lost: HaulData[29],
//       excluder_type : HaulData[30],
//       data_source: HaulData[31],

//       data_quality: bDataQuality,


//       cal_weight: HaulData[33],
//       fit: HaulData[34],    

//       brd_present: bBRDPresent,
//       catches: Catches

//     }
//     return NewHaul;
// }
