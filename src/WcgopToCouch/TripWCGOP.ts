
// import { Vessel } from './vessel';
// import { Port } from './Port';
// import { UserWCGOP } from './UserWCGOP';
// import { Program } from './Program';
// import { BaseTrip } from './base-trip';
// import { Fishery } from './fishery';
// import { FirstReceiver } from './first-receiver';
// import { Contact } from './contact';
// import { LogbookType } from './logbook-type';
// import { TripStatus } from './trip-status';



// export const WcgopTripTypeName = 'wcgop-trip';

// // TODO Create these types
// declare type WcgopSightingEvent = any;
// declare type WcgopFishTicket = any;
// declare type Certificate = any;
// declare type Waiver = any;
// declare type GearType = any;

// export interface WcgopTrip extends BaseTrip {
//   observer?: any; // Contact; // formerly User ID, TODO Specifics
//   program?: Program;
//   isPartialTrip?: boolean;
//   fishingDays?: number;
//   fishery?: Fishery;
//   crewSize?: number;
//   firstReceivers?: any; // FirstReceiver[]; // FR lookups are in Permits DB
//   logbookNum?: number;
//   logbookType?: LogbookType;
//   observerLogbookNum?: number;
//   isExpanded?: boolean;
//   doExpand?: boolean; // should expand or not after manual calculation
//   isFishProcessed?: boolean;
//   tripStatus?: TripStatus;
//   isDataQualityPassing?: boolean;
//   debriefer?: Contact;
//   sightingEvents?: WcgopSightingEvent[];
//   fishTickets?: WcgopFishTicket[];
//   certificates?: Certificate[];
//   waiver?: Waiver;
//   intendedGearType?: GearType; // only for when there is no Haul data
//   legacy?: {
//     tripId?: number;
//     otcKp?: number;
//     totalHooksKp?: number;
//     export?: number; // status of expansion, ETL to isExpanded
//     runTer?: boolean;
//     evaluationId?: number; // TODO Evaluation parent
//     permitNum?: string; // ETL to Certificate
//     licenseNum?: string; // ETL to Certificate
//     isNoFishingActivity?: boolean; // did fishing NOT occur?
//   };
// }



// export function ConstructTripWCGOP(TripData: any, CreatedBy: any, ModifiedBy: any, Vessel: Vessel, 
//                                       DeparturePort: Port, ReturnPort: Port, Program: Program, Observer: UserWCGOP, Hauls: string[]){
//     let bFishProcessed: boolean;
//     let bFishingActivity: boolean;

//     if (TripData[34] == '1'){
//       bFishProcessed = true;
//     } else if (TripData[34] == '0'){
//       bFishProcessed = false;
//     } else {
//       bFishProcessed = null;
//     }

//     if (TripData[35] == '1'){
//       bFishingActivity = true;
//     } else{
//       bFishingActivity = false;
//     }


//     let NewTrip: WcgopTrip = {
//     type: 'Trip',
//     vessel: Vessel,
//     observer: Observer, // todo
//     program: Program,
//     isPartialTrip: TripData[21],
//     fishingDays: TripData[37],
//     fishery: TripData[23],
//     crewSize: TripData[24],
//     firstReceivers: TripData[28], // todo
//     logbookNum: TripData[10],
//     logbookType: TripData[27],
//     observerLogbookNum: TripData[19],
//     isExpanded: null, // todo
//     doExpand: TripData[31],
//     isFishProcessed: bFishProcessed,
//     tripStatus: TripData[5],
//     isDataQualityPassing: TripData[12],
//     debriefer: TripData[4],
//     sightingEvents: null, // todo
//     fishTickets: null, // todo
//     certificates: null, // todo
//     waiver: null, // todo
//     intendedGearType: null, // todo

//     departurePort: DeparturePort,
//     returnPort: ReturnPort,

//     departureDate: TripData[7],
//     returnDate: TripData[9],

//     notes: TripData[11],



//     createdBy: CreatedBy,
//     createdDate: TripData[14],
//     updatedBy: ModifiedBy,
//     updatedDate: TripData[16],
//     captain: TripData[22],

//     dataSource: TripData[33],

//     haulIDs: Hauls,
    
//     legacy: {
//       tripId: TripData[0],
//       otcKp: TripData[17],
//       totalHooksKp: TripData[18],
//       export: TripData[29], // status of expansion, ETL to isExpanded
//       runTer: TripData[32],
//       evaluationId: TripData[20], // TODO Evaluation parent
//       permitNum: TripData[25], // ETL to Certificate
//       licenseNum: TripData[26], // ETL to Certificate
//       isNoFishingActivity: bFishingActivity // did fishing NOT occur?
//     }
//   }
//     return NewTrip;
// }