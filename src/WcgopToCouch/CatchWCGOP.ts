// import { CatchCategory } from "./CatchCategory";
// import  { Catch } from "./CatchBase";
// import { UserWCGOP } from "./UserWCGOP";

// export interface CatchWCGOP extends Catch {
//     catch_id: string;
//     catch_num: number;
//     catch_category: CatchCategory;
//     catch_weight: number;
//     catch_weight_um: string;
//     catch_weight_method: string;
//     catch_count: number;
//     catch_disposition: string;
//     discard_reason: string;
//     catch_purity: string;
//     volume: number;
//     volume_um: string;
//     density: number;
//     density_um: string;
//     notes: string;
//     created_by?: UserWCGOP;
//     modified_by?: UserWCGOP;
//     hooks_sampled: number;
//     sample_weight: number;
//     sample_weight_um: string;
//     sample_count: number;
//     catch_weight_itq: number;
//     length_itq: number;
//     density_basket_weight_itq: number
//     width_itq: number;
//     depth_itq: number;
//     baskets_weighed_itq: number;
//     total_baskets_itq: number;
//     partial_basket_weight_itq: number;
//     units_sampled_itq: number;
//     total_units_itq: number;
//     gear_segments_itq: number;
//     basket_weight_kp: number;
//     addl_basket_weight_kp: number;
//     basket_weight_count_kp: number;
//     data_source: string;


//   }
  

//   export function ConstructCatchWCGOP(CatchData: any, CatchCat: CatchCategory, CreatedBy: UserWCGOP, ModifiedBy: UserWCGOP) {
      
//     let NewCatch: CatchWCGOP = {
//       type: 'Catch',
//       catch_id: CatchData[0],
//       catch_num: CatchData[1],
//       catch_category: CatchData[2],
//       catch_weight: CatchData[3],
//       catch_weight_um: CatchData[4],
//       catch_weight_method: CatchData[5],
//       catch_count: CatchData[6],
//       catch_disposition: CatchData[7],
//       discard_reason: CatchData[8],
//       catch_purity: CatchData[9],
//       volume: CatchData[10],
//       volume_um: CatchData[11],
//       density: CatchData[12],
//       density_um: CatchData[13],
//       notes: CatchData[14],
//       created_by: CreatedBy,
//       created_date: CatchData[16],
//       modified_by: ModifiedBy,
//       modified_date: CatchData[18],
//       hooks_sampled: CatchData[19],
//       sample_weight: CatchData[20],
//       sample_weight_um: CatchData[21],
//       sample_count: CatchData[22],
//       catch_weight_itq: CatchData[23],
//       length_itq: CatchData[24],
//       density_basket_weight_itq: CatchData[25],
//       width_itq: CatchData[26],
//       depth_itq: CatchData[27],
//       baskets_weighed_itq: CatchData[28],
//       total_baskets_itq: CatchData[29],
//       partial_basket_weight_itq: CatchData[30],
//       units_sampled_itq: CatchData[31],
//       total_units_itq: CatchData[32],
//       gear_segments_itq: CatchData[33],
//       basket_weight_kp: CatchData[34],
//       addl_basket_weight_kp: CatchData[35],
//       basket_weight_count_kp: CatchData[36],
//       data_source: CatchData[37]
      
//   }
//     return NewCatch;
//   }