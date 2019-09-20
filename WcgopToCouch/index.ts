
// import * as dbconnections from './../../dbconnections'
// import * as oraclesql from  './oraclesql'
// import app from './App'
// import { print } from 'util';
// import { executionAsyncId } from 'async_hooks';
// import { checkServerIdentity } from 'tls';
// import { OBJECT } from 'oracledb';
// import { ConstructFishTicket, ConstructTripCertificate, ConstructHaulWCGOP, ConstructCatchWCGOP, ConstructTripWCGOP, ConstructVessel, ConstructPort, ConstructProgram, ConstructCatchSpeciesFromBio, ConstructCatchSpeciesFromComp, ConstructBaskets, ConstructLookup, ConstructDissections, ConstructWcgopSpecimenFromItems, ConstructWcgopSpecimenFromFreq, ConstructPerson, ConstructHLFC, ConstructInteractionEvent, ConstructSightingEvent, ConstructFishingLocation } from './construct-wcgop-objects';
// import { WcgopCatch, WcgopTrip, WcgopSpecimen, Biostructure, Measurement, WcgopOperation, InteractionEvent, SightingEvent, WcgopFishTicket, BrdConfigurationTypeName, Basket, VesselCaptain } from '../libs/bn-models';
// import { stringify } from 'querystring';
// import { strBioSpecimensSQL, strSpeciesCompSQL, strSpeciesCompBasketsSQL, strBioSpecimenItemsSQL, strDissectionsSQL, strLengthFrequenciesSQL, NewLookups, DissectionsTableSQL, BioSpecimenItemsTableSQL, BioSpecimensTableSQL, LengthFrequenciesTableSQL, SpeciesCompositionsAndItemsTableSQL, CatchesTableSQL, HaulsTableSQL, HlfcTableSQL, TripTableSQL, SpeciesSightingsTableSQL, SpeciesInteractionsTableSQL, SpeciesInteractionHaulsXREFTableSQL, FishTicketsTableSQL, FishingLocationsTableSQL } from './oraclesql';
// import { generateKeyPair } from 'crypto';
// import { WcgopHlfcConfiguration } from '../libs/bn-models/models/wcgop/wcgop-hlfc-configuration';
// import { Program, HlfcProductDeliveryState, HlfcAerialExtent, HlfcHorizontalExtent, HlfcMitigationType, Person, Behavior, InteractionType, Port, FirstReceiver, FirstReceiverTypeName, Vessel, BeaufortTypeName, DiscardReasonTypeName, BiostructureTypeTypeName, BodyLengthTypeName, ConfidenceTypeName, ContactTypeTypeName, ContactCategoryTypeName, InteractionTypeTypeName, InteractionOutcomeTypeName, RelationshipTypeName, TripStatusTypeName, VesselStatusTypeName, VesselTypeTypeName, WaiverTypeTypeName, WeightMethodTypeName, BiosampleSampleMethodTypeName, SpeciesCategoryTypeName, SpeciesSubCategoryTypeName, GearPerformanceTypeName, CatchDispositionTypeName, Species } from '../libs/bn-models/dist/models/_lookups';
// import { FishingLocation } from '../libs/bn-models/models/_common/fishing-location';

// export var UploadedBy = 'nicholas.shaffer@noaa.gov';
// export var UploadedDate: any;

// var dictCatchCat: { [id: number] : any; } = {};
// var dictUsers: { [id: number] : any; } = {};
// var dictPorts: { [id: number] : any; } = {};
// var dictProgram: { [id: number] : Program; } = {};
// var dictVessels: { [id: number] : any; } = {};
// var dictContacts: { [id: number] : any; } = {};
// var dictDiscardReasons: { [id: number] : any; } = {};
// var dictSpecies: { [id: number] : any; } = {};


// export var dictRelation: { [id: number] : any; } = {};
// export var dictContactCategory: { [id: number] : any; } = {};
// export var dictContactType: { [id: number] : any; } = {};
// export var dictBiostructureType: { [id: number] : any; } = {};
// export var dictVesselType: { [id: number] : any; } = {};
// export var dictVesselStatus: { [id: number] : any; } = {};
// var dictTripStatus: { [id: number] : any; } = {};
// var dictHlfcProductDelivery: { [id: number] : any; } = {};
// var dictHlfcMitigationTypes: { [id: number] : any; } = {};
// var dictHlfcAerialEtent: { [id: number] : any; } = {};
// var dictHlfcHorizontalExtent: { [id: number] : any; } = {};
// var dictSpeciesSubCategory: { [id: number] : any; } = {};
// var dictSpeciesCategory: { [id: number] : any; } = {};
// var dictBiospecimenSampleMethod: { [id: number] : any; } = {};
// var dictWeightMethod: { [id: number] : any; } = {};
// var dictDisposition: { [id: number] : any; } = {};
// var dictGearPerformance: { [id: number] : any; } = {};
// var dictGearType: { [id: number] : any; } = {};
// var dictSightingCondition: { [id: number] : any; } = {};
// var dictFishingInteraction: { [id: number] : any; } = {};
// var dictInteractionBehaviors: { [id: number] : any; } = {};
// var dictInteractionOutcome: { [id: number] : any; } = {};
// var dictConfidence: { [id: number] : any; } = {};
// var dictBodyLength: { [id: number] : any; } = {};
// var dictBeaufort: { [id: number] : any; } = {};
// var dictFishery: { [id: number] : any; } = {};
// var dictFirstReceivers: { [id: number] : any; } = {};
// var dictAllBaskets: { [id: number] : any; } = {};

// // ENTIRE TABLES LOADED INTO MEMORY HERE
// // id = table ID, value = array of returned fields (from oraclesql file)
// var dictAllDissections: { [id: number] : any; } = {};
// var dictAllBiospecimenItems: { [id: number] : any; } = {};
// var dictAllBiospecimens: { [id: number] : any; } = {};
// var dictAllLengthFrequencies: { [id: number] : any; } = {};
// var dictAllSpeciesCompositions: { [id: number] : any; } = {};
// var dictAllHlfc: { [id: number] : any; } = {};
// var dictAllSpeciesSightings: { [id: number] : any; } = {};
// var dictAllSpeciesInteractions: { [id: number] : any; } = {};
// var dictAllSpeciesSightingsHaulsXREF: { [id: number] : any; } = {};
// var dictAllFishTickets: { [id: number] : any; } = {};
// var dictAllFishingLocations: { [id: number] : any; } = {};
// var dictAllCatchCategory: { [id: number] : any; } = {};

// var dictAllCatches: { [id: number] : any; } = {};
// var dictAllHauls: { [id: number] : any; } = {};
// var dictAllTrips: { [id: number] : any; } = {};



// var cron = require('cron')
// var oracledb = require('oracledb');
// var moment = require('moment');

// var strCatchSQL: string = oraclesql['strCatchSQL']
// var strCatchCategorySQL: string = oraclesql['strCatchCategorySQL']
// var strContactSQL: string = oraclesql['strContactSQL']
// var strHaulSQL: string = oraclesql['strHaulSQL']
// var strTripSQL: string = oraclesql['strTripSQL']
// var strPortSQL: string = oraclesql['strPortSQL']
// var strVesselContactSQL: string = oraclesql['strVesselContactSQL']
// var strVesselSQL: string = oraclesql['strVesselSQL']
// var strUserSQL: string = oraclesql['strUserSQL']
// var strProgramSQL: string = oraclesql['strProgramSQL']
// var strLookupSQL: string = oraclesql['strLookupSQL']
// var strReceiverSQL: string = oraclesql['strReceiverSQL'];

// var strFishTicketSQL: string = oraclesql['strFishTicketSQL']
// var strTripCertificateSQL: string = oraclesql['strTripCertificateSQL']
// var strHLFCSQL: string = oraclesql['strHLFCSQL']
// var strBRDSQL: string = oraclesql['strBRDSQL']
// var strSpeciesSightingSQL: string = oraclesql['strSpeciesSightingSQL']

// var CouchDBName: string = dbconnections['CouchDBName']
// var CouchHost: string = dbconnections['CouchHost']
// var CouchPass: string = dbconnections['CouchPass']
// var CouchPort: string = dbconnections['CouchPort']
// var CouchUser: string = dbconnections['CouchUser']

// var IFQServiceName: string = dbconnections['IFQServiceName']
// var IFQHost: string = dbconnections['IFQHost']
// var IFQPass: string = dbconnections['IFQPass']
// var IFQPort: string = dbconnections['IFQPort']
// var IFQUser: string = dbconnections['IFQUser']
// var strConnection: string = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=" + IFQHost + ")(PORT=" + IFQPort + "))(CONNECT_DATA =(SERVICE_NAME=" + IFQServiceName + ")))"

// // Create connection to Couch to last entire runtime of application
// var couchurl: string = "https://" + CouchUser + ":" + CouchPass + "@" + CouchHost + ":" + CouchPort
// const couchDB = require('nano')({
//   url: couchurl,
//   requestDefaults: {
//     pool: {
//       maxSockets: Infinity
//     }
//   }
// });

// // Setting this process var to "0" is extremely unsafe in most situations, use with care.
// // It is unsafe because Node does not like self signed TLS (SSL) certificates, 
// // this setting disables Node's rejection of invalid or unauthorized certificates, and allows them.
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
// console.log('CouchDB connection configured successfully.');


// export async function OracleConnection(){
//   let odb = await oracledb.getConnection( 
//     {
//       user: IFQUser,
//       password: IFQPass,
//       connectString: strConnection
//     }
//   ).catch((error: any) => {
//     console.log("oracle connection failed", error);
//   });
//   return odb
// }
// export async function ReleaseOracle(connection: any) {
//   await connection.close(
//     function (err: Error) {
//       if (err)
//         console.error(err.message);
//       else 
//         console.log('Oracle released successfully.')
//     });
// }
// export async function ExecuteOracleSQL(dbconnection: any, strSQL: string) {
//   let aData = await dbconnection.execute(strSQL).catch((error: any) => {
//       console.log("oracle query failed", error, strSQL);
//     });
//   if(aData){
//     return aData.rows;
//   } else {
//     return null;
//   }
// }

// async function UpdateDocCouchDB(UpdatedDoc: any){
//   const dbName = couchDB.use(CouchDBName);
//   await dbName.insert(UpdatedDoc).then((data: any) => {
//     //console.log(data)
//   }).catch((error: any) => {
//     console.log("update failed", error, UpdatedDoc);
  
//   });

// }
// async function InsertBulkCouchDB(lstDocuments: any){
//   let lstDocumentIDs: string[];
//   lstDocumentIDs = [];
//   const dbName = couchDB.use(CouchDBName);

//   await dbName.bulk({docs:lstDocuments}).then((lstReturn: any) => {
//     //console.log(lstReturn);
//     for (let i = 0; i < lstReturn.length; i++){
//       lstDocumentIDs.push(lstReturn[i].id)
//     }
//   }).catch((error: any) => {
//     console.log("bulk insert failed", error, lstDocuments);
//   });

//   return lstDocumentIDs;
// }
// async function FetchRevID(strProperty: string, iOldID: number, ViewName: string){
//   let strDocID;
//   let strDocRev;
//   const dbName = couchDB.use(CouchDBName);
//   // const Params = {
//   //   selector: {
//   //     [strProperty]: { "$eq": iOldID}
//   //   },
//   //   fields: [ "_id", "_rev"],
//   //   limit:50
//   // };
//   // await dbName.find(Params).then((data: any) => {
//   //   //console.log(data);
//   //   if (data.docs.length == 0){
//   //     strDocID = null;
//   //     strDocRev = null;
//   //   } 
//   //   else {
//   //     strDocID = data.docs[0]._id;
//   //     strDocRev = data.docs[0]._rev;
//   //   }
    
//   // }).catch((error: any) => {
//   //   console.log("fetchRevID failed", error, strProperty, iOldID);
//   //   return false;
//   // });


//   await dbName.view('MainDocs', ViewName, {
//     'key': iOldID,
//     'include_docs': true
//   }).then((data: any) => {
//     if (data.rows.length == 0){      
//       strDocID = null;
//       strDocRev = null;
//     }
//     else {
//       strDocID = data.rows[0].id;
//       strDocRev = data.rows[0].value;
//     }
//   }).catch((error: any) => {
//     console.log(error, ViewName, iOldID);
//   });


//   return [strDocID, strDocRev];
// }

// async function QueryLookupView(ViewName: string, iLookupID: number){
//   const dbName = couchDB.use(CouchDBName);
//   let strDocID, strDocRev: string;
//   await dbName.view('LookupDocs', ViewName, {
//     'key': iLookupID,
//     'include_docs': true
//   }).then((data: any) => {
//     if (data.rows.length > 0){      
//       strDocID = data.rows[0].id;
//       strDocRev = data.rows[0].value;
//     }
//   }).catch((error: any) => {
//     console.log(error, ViewName, iLookupID);
//   });
//   return [strDocID, strDocRev]
// }

// export async function FetchDocument(iOldID: number, ViewName:string, DesignName: string){
//   let strDocID;
//   let strDocRev;
//   let Document;
//   const dbName = couchDB.use(CouchDBName);
//   // const Params = {
//   //   selector: {
//   //     [strProperty]: { "$eq": iOldID}
//   //   },
//   //   limit:50
//   // };
//   // await dbName.find(Params).then((data: any) => {
//   //   //console.log(data);
//   //   if (data.docs.length == 0){
//   //     strDocID = null;
//   //     strDocRev = null;
//   //     Document = null;
//   //   } 
//   //   else {
//   //     strDocID = data.docs[0]._id;
//   //     strDocRev = data.docs[0]._rev;
//   //     Document = data.docs[0];
//   //   }
    
//   // }).catch((error: any) => {
//   //   console.log("FetchDocument failed", error, strProperty, iOldID);
//   // });


//   await dbName.view(DesignName, ViewName, {
//     'key': iOldID,
//     'include_docs': true
//   }).then((data: any) => {
//     if (data.rows.length > 0){      
//       strDocID = data.rows[0].id;
//       strDocRev = data.rows[0].value;
//       Document = data.rows[0].doc
//     }
//   }).catch((error: any) => {
//     console.log(error, DesignName, ViewName);
//   });


//   return [strDocID, strDocRev, Document];
// }
// async function FetchHaulsAndRevID(iOldTripID: number, ViewName: string){
//   let strDocID;
//   let strDocRev;
//   let lstHaulIDs;




//   const dbName = couchDB.use(CouchDBName);
//   await dbName.view('MainDocs', ViewName, {
//     'key': iOldTripID,
//     'include_docs': true
//   }).then((data: any) => {
//     if (data.rows.length == 0){      
//       strDocID = null;
//       strDocRev = null;
//       lstHaulIDs = null;
//     }
//     else {
//       strDocID = data.rows[0].id;
//       strDocRev = data.rows[0].value;
//       lstHaulIDs = data.rows[0].doc.operationIDs
//     }
//   }).catch((error: any) => {
//     console.log(error, ViewName, iOldTripID);
//   });



//   // const Params = {
//   //   selector: {
//   //     'legacy.tripId': { "$eq": iOldTripID}
//   //   },
//   //   fields: [ "_id", "_rev", "operationIDs"],
//   //   limit:50
//   // };
//   // await dbName.find(Params).then((data: any) => {
//   //   //console.log(data);
//   //   if (data.docs.length == 0){
//   //     strDocID = null;
//   //     strDocRev = null;
//   //     lstHaulIDs = null;
//   //   } 
//   //   else {
//   //     strDocID = data.docs[0]._id;
//   //     strDocRev = data.docs[0]._rev;
//   //     lstHaulIDs = data.docs[0].hauls;
//   //   }
    
//   // }).catch((error: any) => {
//   //   console.log("FetchHaulsandRevID failed", error, OldTripID);
//   //   strDocID = null;
//   //   strDocRev = null;
//   //   lstHaulIDs = null;
//   // });

//   return [strDocID, strDocRev, lstHaulIDs];
// }
// async function CreateViews(){

  
// const dbName = couchDB.use(CouchDBName);
// let LookupDocs: any = {
//   "_id": "_design/LookupDocs",
//   "views": {
//     "beaufort-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'beaufort') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "biostructure-type-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'biostructure-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "discard-reason-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'discard-reason') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "confidence-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'confidence') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "body-length-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'body-length') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "contact-type-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'contact-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "interaction-type-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'interaction-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "contact-category-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'contact-category') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "interaction-outcome-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'interaction-outcome') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "relationship-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'relationship') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "trip-status-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'trip-status') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "vessel-status-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'vessel-status') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "vessel-type-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'vessel-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "waiver-type-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'waiver-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "waiver-reason-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'waiver-reason-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "weight-method-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'weight-method') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "biospecimen-sample-method-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'biospecimen-sample-method') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "species-sub-category-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'species-sub-category') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "species-category-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'species-category') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "gear-performance-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'gear-performance') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "catch-disposition-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'catch-disposition') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "gear-type-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'gear-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "sighting-condition-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'sighting-condition') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "fishery-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'fishery') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "first-receiver-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'first-receiver') { \r\n    emit(doc.legacy.ifqDealerId, doc._rev);\r\n  }\r\n}"
//     },
//     "behavior-type-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'behavior-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "hlfc-mitigation-type-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'hlfc-mitigation-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "hlfc-horizontal-extent-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'hlfc-horizontal-extent') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "hlfc-aerial-extent-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'hlfc-aerial-extent') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     },
//     "hlfc-product-delivery-state-lookup": {
//       "map": "function (doc) {\r\n  if (doc.type == 'hlfc-product-delivery-state') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
//     }
    
    
    
//   },
//   "language": "javascript"
// }

// await dbName.get('_design/LookupDocs').then((body: any) => {
//   LookupDocs._rev = body._rev;
// }).catch((error: any) => {
// });


// await dbName.insert(LookupDocs).then((data: any) => {
//   console.log(data)
// }).catch((error: any) => {
//   console.log("update failed", error, LookupDocs);

// });

// let MainDocs: any = {
//   "_id": "_design/MainDocs",
//   "views": {
//     "all-operations": {
//       "map": "function (doc) {\r\n  if (doc.type == 'wcgop-operation') { \r\n    emit(doc.legacy.fishingActivityId, doc._rev);\r\n  }\r\n}"
//     },
//     "all-trips": {
//       "map": "function (doc) {\r\n  if (doc.type == 'wcgop-trip') { \r\n    emit(doc.legacy.tripId, doc._rev);\r\n  }\r\n}"
//     },
//     "all-vessels": {
//       "map": "function (doc) {\r\n  if (doc.type == 'vessel') { \r\n    emit(doc.legacy.vesselId, doc._rev);\r\n  }\r\n}"
//     },
//     "all-contacts": {
//       "map": "function (doc) {\r\n  if (doc.type == 'person') { \r\n    emit(doc.legacy.PersonId, doc._rev);\r\n  }\r\n}"
//     },
//     "all-ports": {
//       "map": "function (doc) {\r\n  if (doc.type == 'port') { \r\n    emit(doc.legacy.portId, doc._rev);\r\n  }\r\n}"
//     },
//     "all-programs": {
//       "map": "function (doc) {\r\n  if (doc.type == 'program') { \r\n    emit(doc.legacy.programId, doc._rev);\r\n  }\r\n}"
//     },
//     "all-species": {
//       "map": "function (doc) {\r\n  if (doc.type == 'species') { \r\n    emit(doc.legacy.speciesId, doc._rev);\r\n  }\r\n}"
//     }
//   },
//   "language": "javascript"
// }

// await dbName.get('_design/MainDocs').then((body: any) => {
//   MainDocs._rev = body._rev;
// }).catch((error: any) => {
// });

// await dbName.insert(MainDocs).then((data: any) => {
//   console.log(data)
// }).catch((error: any) => {
//   console.log("update failed", error, MainDocs);

// });


// }

// export async function GenerateCouchID(){
  
//   const dbName = couchDB.use(CouchDBName);
//   let CouchID: string;

//   await couchDB.uuids(1).then((data: any) => {
//     //console.log(data);
//     CouchID = data.uuids[0]
//   });

//   return CouchID;
// }

// async function GenerateCouchIDs(iNumToGenerate: number){
  
//   const dbName = couchDB.use(CouchDBName);
//   let CouchIDs: string[];

//   await couchDB.uuids(iNumToGenerate).then((data: any) => {
//     //console.log(data);
//     CouchIDs = data.uuids
//   });

//   return CouchIDs;
// }

// // Checks if subdocument exists in dictionary instance, if not, fetches from couch and adds to global dict passed in
// export async function GetDocFromDict(dictDocuments: { [id: number] : any; }, iID: number, ViewName: string, DesignName: string){
//   let Document;
//   if (iID != null){
//     if(iID in dictDocuments){
//       Document = dictDocuments[iID];
//     } else {
//       [,, Document] = await FetchDocument(iID, ViewName, DesignName);
//       dictDocuments[iID] = Document;
//     }
//   } else {
//     Document = null;
//   }
//   return Document;
// }
// function Transpose(aInput: any) {
//   return Object.keys(aInput[0]).map(function(c) {
//       return aInput.map(function(r: any) { return r[c]; });
//   });
// }

// function RemoveDocNullVals(Document: any){

//     // setting property to undefined instead of deleting is much faster, and adequate for the purpose of migrating to couch
//     for (let item in Document){
//       if (Document[item] == null){
//         //delete Document[item];
//         Document[item] = undefined;
//       } else if (typeof(Document[item]) === 'object'){
//         let subdoc = RemoveDocNullVals(Document[item]);
//         Document[item] = subdoc;
//       } else if (typeof(Document[item]) === 'string') {
//           if(!Document[item].replace(/\s/g, '').length){
//             // string only contains whitespace
//             Document[item] = undefined;
//           }
//       }
//     }

//     return Document;
// }

// // Each function beginning with "Build" refers to a document or sub document built from a table in OBSPROD
// async function BuildBRD(odb: any, iBRDID: number){


// }

// async function BuildFishingLocations(odb: any, iHaulID: number){
//   let lstAllFishingLocations: FishingLocation[] = [];

//   if (iHaulID in dictAllFishingLocations){    
//     let lstLocationsByHaul = dictAllFishingLocations[iHaulID];

//     for (let i = 0; i < lstLocationsByHaul.length; i++){
//       let NewLocation: FishingLocation = await ConstructFishingLocation(lstLocationsByHaul[i]);
//       lstAllFishingLocations.push(NewLocation);
//     }
//   }
//   return lstAllFishingLocations;
// }
// async function BuildHaul(odb: any, iHaulID: number, lstCatches: WcgopCatch[]){
//   if ( iHaulID != undefined) {
//     //let lstHaulData = await ExecuteOracleSQL(odb, strHaulSQL + iHaulID);
//     let lstHaulData = dictAllHauls[iHaulID];
//     //lstHaulData = lstHaulData[0]

//     if (lstHaulData == null){
//       console.log('lstHaulData is null, error')
//     }

//     let iUserCreatedbyID = lstHaulData[14];
//     let iUserModifiedByID = lstHaulData[16];

//     let lstFishingLocations: FishingLocation[] = await BuildFishingLocations(odb, iHaulID);

//     let WeightMethod = await GetDocFromDict(dictWeightMethod, lstHaulData[4], 'weight-method-lookup', 'LookupDocs')
//     if (WeightMethod != null){
//       WeightMethod = {
//         description: WeightMethod.description,
//         _id: WeightMethod._id
//       }
//     }    

//     let GearPerformance = await GetDocFromDict(dictGearPerformance, lstHaulData[7], 'gear-performance-lookup', 'LookupDocs')
//     if (GearPerformance != null){
//       GearPerformance = {
//         description: GearPerformance.description,
//         _id: GearPerformance._id
//       }
//     }

//     let GearType = await GetDocFromDict(dictGearType, lstHaulData[6], 'gear-type-lookup', 'LookupDocs')
//     if (GearType != null){
//       GearType = {
//         description: GearType.description,
//         _id: GearType._id
//       }
//     }

//     let CreatedBy = iUserCreatedbyID // await GetDocFromDict(dictUsers, iUserCreatedbyID, 'legacy.userId');
//     let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');

//     let cHaul: WcgopOperation = ConstructHaulWCGOP(lstHaulData, CreatedBy, ModifiedBy, lstCatches, WeightMethod, GearPerformance, GearType, lstFishingLocations);

//     return cHaul;
//   } else { 
//     return null;
//   }
// }

// async function BuildHlfc(iTripID: number){

//   if (iTripID != null && iTripID in dictAllHlfc){

//     let lstHlfcData = dictAllHlfc[iTripID];
//     let HLFCConfigurations: WcgopHlfcConfiguration[] = [];
  
//     for ( let i = 0; i < lstHlfcData.length; i++){
//       let AvgSpeed: Measurement;
//       if ( lstHlfcData[i][4] != null){
//         AvgSpeed = {
//           measurementType: 'speed',
//           value: lstHlfcData[i][4],
//           units: 'knots'
//         }
//       } else {
//         AvgSpeed = null;
//       }
        
//       let WeightPerSinker: Measurement;
//       if (lstHlfcData[i][9] != null){
//         WeightPerSinker = {
//           measurementType: 'weight',
//           value: lstHlfcData[i][9],
//           units: 'lbs'
//         }
//       } else {
//         WeightPerSinker = null;
//       }
  
//       let RawHaulIDs = [];
//       if (lstHlfcData[i][2] != null){
//         RawHaulIDs = lstHlfcData[i][2].split(',');
//       }
//       let CouchOperationIDs: string[] = [];
//       for (let j = 0; j < RawHaulIDs.length; j++){
//         let OperationID: string;
//         [OperationID,] = await FetchRevID(null, parseInt(RawHaulIDs[j]), 'all-operations')
//         CouchOperationIDs.push(OperationID);
//       }
  
  
  
//       let ProductDelivery: HlfcProductDeliveryState = await GetDocFromDict(dictHlfcProductDelivery, lstHlfcData[i][3], 'hlfc-product-delivery-state-lookup', 'LookupDocs')
      
//       if(ProductDelivery != null){
//         ProductDelivery = {
//           description: ProductDelivery.description,
//           _id: ProductDelivery._id
//         }
//       }
//       let AerialExtent: HlfcAerialExtent = await GetDocFromDict(dictHlfcAerialEtent, lstHlfcData[i][13], 'hlfc-aerial-extent-lookup', 'LookupDocs')
      
//       if (AerialExtent != null){
//         AerialExtent = {
//           description: AerialExtent.description,
//           _id: AerialExtent._id
//         }
//       }
//       let HorizontalExtent: HlfcHorizontalExtent = await GetDocFromDict(dictHlfcHorizontalExtent, lstHlfcData[i][14], 'hlfc-horizontal-extent-lookup', 'LookupDocs')
      
//       if (HorizontalExtent != null){
//         HorizontalExtent = {
//           description: HorizontalExtent.description,
//           _id: HorizontalExtent._id
//         }
//       }
//       let MitigationConfig: HlfcMitigationType[] = [];
  
//       let lstAvoidance = [];
//       if (lstHlfcData[i][12] != null){
//         lstAvoidance = lstHlfcData[i][12].split(',');
//       }
      
//       for ( let j = 0; j < lstAvoidance.length; j++){
//         let MitigationItem = await GetDocFromDict(dictHlfcMitigationTypes, lstAvoidance[j], 'hlfc-mitigation-type-lookup', 'LookupDocs')
//         if (MitigationItem != null){ 
//           MitigationItem = {
//             description: MitigationItem.description,
//             _id: MitigationItem._id
//           }
//           MitigationConfig.push(MitigationItem);
//         }
//       }
//       if ( lstAvoidance.length == 0){
//         lstAvoidance = null;
//       }
  
//       let bFloatsUsed: boolean;
//       if (lstHlfcData[i][6] == 1){
//         bFloatsUsed = true;
//       } else if ( lstHlfcData[i][6] == 0 ){
//         bFloatsUsed = false
//       } else {
//         bFloatsUsed = null;
//       }
  
//       let bWeightsUsed: boolean;
//       if (lstHlfcData[i][8] == 1){
//         bWeightsUsed = true;
//       } else if ( lstHlfcData[i][8] == 0 ){
//         bWeightsUsed = false
//       } else {
//         bWeightsUsed = null;
//       }
      
//       let CouchID = await GenerateCouchID();
//       let HlfcItem = ConstructHLFC(CouchID, lstHlfcData, AvgSpeed, WeightPerSinker, ProductDelivery, MitigationConfig, AerialExtent, HorizontalExtent, CouchOperationIDs, bFloatsUsed, bWeightsUsed)
//       HLFCConfigurations.push(HlfcItem);
//     }
//     return HLFCConfigurations;
//   } else {
//     return null;
//   }


// }
// async function BuildCatch(odb: any, iCatchID: number){
//   if ( iCatchID != undefined) {
//     //let lstCatchData = await ExecuteOracleSQL(odb, strCatchSQL + iCatchID);
//     let lstCatchData = dictAllCatches[iCatchID]
//     //lstCatchData = lstCatchData[0]
//     let iCatchCatID = lstCatchData[2];
//     let iUserCreatedByID = lstCatchData[15];
//     let iUserModifiedByID = lstCatchData[17];
//     //let lstCatchCatData = await ExecuteOracleSQL(odb, strCatchCategorySQL + iCatchCatID);
//     let lstCatchCatData;
//     let strCatchName;
//     let strCatchCode;
//     if (iCatchCatID in dictAllCatchCategory){
//       lstCatchCatData = dictAllCatchCategory[iCatchCatID]
//       strCatchName = lstCatchCatData[1];
//       strCatchCode = lstCatchCatData[2];
//     } else {
//       lstCatchCatData = null;
//     }    

//     let WeightMethod = await GetDocFromDict(dictWeightMethod, lstCatchData[5], 'weight-method-lookup', 'LookupDocs')
//     if (WeightMethod != null){
//       WeightMethod = {
//         description: WeightMethod.description,
//         _id: WeightMethod._id
//       }
//     }
    
//     let Disposition = await GetDocFromDict(dictDisposition, lstCatchData[7], 'catch-disposition-lookup', 'LookupDocs')
//     if (Disposition != null){
//       Disposition = {
//         description: Disposition.description,
//         _id: Disposition._id
//       }
//     }

//     let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId');
//     let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');

//     let SubCatch: WcgopCatch[] = await BuildCatchSpecies(odb, iCatchID);

//     if (SubCatch.length == 0){
//       SubCatch = null;
//     }
//     let cCatch: WcgopCatch = ConstructCatchWCGOP(lstCatchData, CreatedBy, ModifiedBy, iCatchCatID, strCatchName, strCatchCode, SubCatch, WeightMethod, Disposition);
//     return cCatch;
//   } else { 
//     return null;
//   }
// }

// async function BuildCatchSpecies(odb: any, iCatchID: number){

//   let CatchSpecies: WcgopCatch[] = [];
//   //let CatchSpeciesData = await ExecuteOracleSQL(odb,  strBioSpecimensSQL + iCatchID);
//   let BioSpecimenData: any[] = [];

//   if (iCatchID in dictAllBiospecimens){
//     BioSpecimenData = dictAllBiospecimens[iCatchID];
//   } else {
//     BioSpecimenData = [];
//   }

//   // CatchSpecies from Biospecimen
//   for( let i = 0; i < BioSpecimenData.length; i++){
//     let iBioSpecimenID = BioSpecimenData[i][0];
//     //let SpecimenItemData = await ExecuteOracleSQL(odb, strBioSpecimenItemsSQL + iBioSpecimenID)
//     let SpecimenItemData = [];
//     if (iBioSpecimenID in dictAllBiospecimenItems){
//       SpecimenItemData = dictAllBiospecimenItems[iBioSpecimenID];
//     } 

//     let lstSpecimens: WcgopSpecimen[] = [];
//     let Species = await GetDocFromDict(dictSpecies, BioSpecimenData[i][2], 'all-species', 'MainDocs')
//     if (Species != null){
//       Species = {
//         scientificName: Species.scientificName,
//         commonName: Species.commonName,
//         _id: Species._id
//       }
//     }
//     let DiscardReason = await GetDocFromDict(dictDiscardReasons, BioSpecimenData[i][13], 'discard-reason-lookup', 'LookupDocs');
//     if (DiscardReason != null){
//       DiscardReason = {
//         description: DiscardReason.description,
//         _id: DiscardReason._id
//       }
//     }
//    //let BioSampleMethod = CatchSpeciesData[i][3];
//     let BioSampleMethod = await GetDocFromDict(dictBiospecimenSampleMethod, BioSpecimenData[i][3], 'biospecimen-sample-method-lookup', 'LookupDocs')
//     if (BioSampleMethod != null){
//       BioSampleMethod = {
//         description: BioSampleMethod.description,
//         _id: BioSampleMethod._id
//       }
//     }
//     let iCatchID = BioSpecimenData[i][1];

//     // biospecimen items data
//     for (let j = 0; j < SpecimenItemData.length; j++){
//       let iSpecimenItemID = SpecimenItemData[j][0];
//       //let AllDissectionData = await ExecuteOracleSQL(odb, strDissectionsSQL + iSpecimenItemID);
//       let AllDissectionData = [];

//       if ( iSpecimenItemID in dictAllDissections){
//         AllDissectionData = dictAllDissections[iSpecimenItemID];
//       }

//       let CouchIDs: string[] = await GenerateCouchIDs(AllDissectionData.length);
//       let Dissections: Biostructure[] = await ConstructDissections(CouchIDs, AllDissectionData);
//       let CouchID = await GenerateCouchID();
//       let BioSpecimenItem: WcgopSpecimen = ConstructWcgopSpecimenFromItems(CouchID, SpecimenItemData[j], Species, Dissections, DiscardReason, BioSampleMethod, iCatchID);
//       lstSpecimens.push(BioSpecimenItem);
//     }

//     // length frequency data
//     //let SpecimenItemFreqData = await ExecuteOracleSQL(odb, strLengthFrequenciesSQL + iBioSpecimenID)
//     let SpecimenItemFreqData = [];

//     if ( iBioSpecimenID in dictAllLengthFrequencies){
//       SpecimenItemFreqData = dictAllLengthFrequencies[iBioSpecimenID];
//     }

//     for (let j = 0; j < SpecimenItemFreqData.length; j++){
//       let CouchID = await GenerateCouchID();
//       let SpecimenFreq: WcgopSpecimen = ConstructWcgopSpecimenFromFreq(CouchID, SpecimenItemFreqData[j], Species, DiscardReason, BioSampleMethod, iCatchID)
//       lstSpecimens.push(SpecimenFreq);
//     }

//     let CouchID = await GenerateCouchID();
//     if ( lstSpecimens.length == 0 ){
//       lstSpecimens = null;
//     }
//     let cCatchSpeciesItem: WcgopCatch = ConstructCatchSpeciesFromBio(CouchID, BioSpecimenData[i], lstSpecimens, Species, DiscardReason);
//     CatchSpecies.push(cCatchSpeciesItem);
//   }

//   // CatchSpecies from SpeciesComp
//   //CatchSpeciesData = await ExecuteOracleSQL(odb, strSpeciesCompSQL + iCatchID);

//   if ( iCatchID in dictAllSpeciesCompositions){
//     BioSpecimenData = dictAllSpeciesCompositions[iCatchID];
//   } else {
//     BioSpecimenData = [];
//   }

//   for( let i = 0; i < BioSpecimenData.length; i++){
//     let CouchID = await GenerateCouchID();
//     let iSpeciesCompItemId = BioSpecimenData[i][15];
//     //let BasketData = await ExecuteOracleSQL(odb, strSpeciesCompBasketsSQL + iSpeciesCompItemId);

//     let Baskets: Basket[];
//     if (iSpeciesCompItemId in dictAllBaskets) {
//       let BasketData = dictAllBaskets[iSpeciesCompItemId];
//       let iNumToGenerate =  BasketData.length;
//       let CouchIDs = await GenerateCouchIDs(iNumToGenerate);
//       Baskets = ConstructBaskets(CouchIDs, BasketData);
//     } else {
//       Baskets = null;
//     }

//     let Species = await GetDocFromDict(dictSpecies, BioSpecimenData[i][16], 'all-species', 'MainDocs');
//     if (Species != null){
//       Species = {
//         scientificName: Species.scientificName,
//         commonName: Species.commonName,
//         _id: Species._id
//       }
//     }
//     let DiscardReason = await GetDocFromDict(dictDiscardReasons, BioSpecimenData[i][22], 'discard-reason-lookup', 'LookupDocs');
//     if (DiscardReason != null){
//       DiscardReason = {
//         description: DiscardReason.description,
//         _id: DiscardReason._id
//       }
//     }
//     let cCatchSpeciesItem: WcgopCatch = ConstructCatchSpeciesFromComp(CouchID, BioSpecimenData[i], Baskets, Species, DiscardReason);
//     CatchSpecies.push(cCatchSpeciesItem);
//   }

//   return CatchSpecies
// }

// async function BuildContact(odb: any, iContactID: number){
//   if ( iContactID != undefined) {
//     let lstContactData = await ExecuteOracleSQL(odb, strContactSQL + iContactID);
//     lstContactData = lstContactData[0];

//     let iContactUserID = lstContactData[1];
//     let iPortID = lstContactData[17];
//     let iUserCreatedByID = lstContactData[22];
//     let iUserModifiedByID = lstContactData[24];
    
//     let ContactUser = iContactUserID // await GetDocFromDict(dictUsers, iContactUserID, 'legacy.userId');    
//     let Port = await GetDocFromDict(dictPorts, iPortID, 'all-ports', 'MainDocs'); 
//     if (Port != null){
//       Port.legacy = undefined;
//     }
//     let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId'); 
//     let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');

//     let cContact: Person = await ConstructPerson(lstContactData, ContactUser, Port, CreatedBy, ModifiedBy);
//     return cContact;

//   } else { 
//     return null;
//   }
// }

// async function BuildFishTickets(odb: any, iTripID: number){
//   if ( iTripID != null && iTripID in dictAllFishTickets) {
//     let lstFishTicketData = dictAllFishTickets[iTripID];
//     let lstFishTickets: WcgopFishTicket[] = [];
//     for (let i = 0; i < lstFishTicketData.length; i++){

//       let iUserCreatedByID = lstFishTicketData[i][2];
//       let iUserModifiedByID = lstFishTicketData[i][4];
  
//       let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId'); 
//       let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');
  
//       let cFishTicket = ConstructFishTicket(lstFishTicketData[i], CreatedBy, ModifiedBy);
//       lstFishTickets.push(cFishTicket);
//     }

//     return lstFishTickets;

//   } else { 
//     return null;
//   }
// }


// async function BuildSpecies(odb: any, iSpeciesID: number){
//   if ( iSpeciesID != undefined) {
//     let SpeciesData = await ExecuteOracleSQL(odb, oraclesql.strSpeciesSQL + iSpeciesID);
//     SpeciesData = SpeciesData[0];
//     let iUserCreatedByID = SpeciesData[5];
//     let iUserModifiedByID = SpeciesData[7];

//     let SpeciesCategory = await GetDocFromDict(dictSpeciesCategory, SpeciesData[10], 'species-category-lookup', 'LookupDocs')
//     if (SpeciesCategory != null){
//       SpeciesCategory = {
//         description: SpeciesCategory.description,
//         _id: SpeciesCategory._id
//       }
//     }
//     let SpeciesSubCategory = await GetDocFromDict(dictSpeciesSubCategory, SpeciesData[11], 'species-sub-category-lookup', 'LookupDocs')
//     if (SpeciesSubCategory != null){
//       SpeciesSubCategory = {
//         description: SpeciesSubCategory.description,
//         _id: SpeciesSubCategory._id
//       }
//     }
//     let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId'); 
//     let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');

//     let cSpecies: Species = null;
//     // let cSpecies = ConstructSpecies(SpeciesData, SpeciesCategory, SpeciesSubCategory);
//     return cSpecies;

//   } else { 
//     return null;
//   }
// }

// async function BuildLookups(odb: any, strLookupType: string, strType: string, strDateBegin: string, strDateEnd: string, DateCompare: Date, ViewName: string){
//   let strSQL = NewLookups(strDateBegin, strDateEnd, strLookupType);
//   let LookupData = await ExecuteOracleSQL(odb, strSQL);
//   let lstLookups = [];
//   for (let i = 0; i < LookupData.length; i++){
//     let strCouchID = await GenerateCouchID();
//     let cLookup = ConstructLookup(LookupData[i], strType);

//     let iLookupID = LookupData[i][0]; // TODO
//     let [strDocID, strDocRev] = await QueryLookupView(ViewName, iLookupID);

//     if((cLookup.legacy.obsprodLoadDate > DateCompare || cLookup.createdDate > DateCompare) && strDocID == null){
//       cLookup._id = strCouchID;
//     }
//     else if(cLookup.updatedDate > DateCompare || strDocID != null){
//       // Else already exists in couch, recreate it
//       [strDocID, strDocRev] = await QueryLookupView(ViewName, iLookupID);
//       cLookup = JSON.parse(JSON.stringify(cLookup));
//       cLookup._id = strDocID;
//       cLookup._rev = strDocRev;
//     } 
//     else {
//       console.log('error, lookup record niether newly updated or created id = ' + iLookupID)
//     }
//     cLookup = RemoveDocNullVals(cLookup);
//     lstLookups.push(cLookup);
//   }
//   return lstLookups;

// }

// async function BuildMmsbt(iTripID: number): Promise<[SightingEvent[], InteractionEvent[]]>{
//   try {
    
//   if (iTripID != null && iTripID in dictAllSpeciesSightings){

//     let SpeciesSightingData = dictAllSpeciesSightings[iTripID];
//     let lstSightingEvents: SightingEvent[] = [];
//     let lstInteractionEvents: InteractionEvent[] = [];
    
//     for ( let i = 0; i < SpeciesSightingData.length; i++){
//       let SpeciesSightingID = SpeciesSightingData[i][0];
//       let MmsbtItem: InteractionEvent | SightingEvent;
  
//       let Species = await GetDocFromDict(dictSpecies, SpeciesSightingData[i][2], 'all-species', 'MainDocs');
//       if (Species != null){
//         Species = {
//           scientificName: Species.scientificName,
//           commonName: Species.commonName,
//           _id: Species._id
//         }
//       }
//       let Confidence = await GetDocFromDict(dictConfidence, SpeciesSightingData[i][11], 'confidence-lookup', 'LookupDocs');
//       if (Confidence != null){
//         Confidence = {
//           description: Confidence.description,
//           _id: Confidence._id
//         }
//       }
//       let BodyLength = await GetDocFromDict(dictBodyLength, SpeciesSightingData[i][12], 'body-length-lookup', 'LookupDocs')
//       if (BodyLength != null){        
//         BodyLength = {
//           description: BodyLength.description,
//           _id: BodyLength._id
//         }
//       }
//       let SightingCondition = await GetDocFromDict(dictSightingCondition, SpeciesSightingData[i][13], 'sighting-condition-lookup', 'LookupDocs');
//       if (SightingCondition != null){
//         SightingCondition = {
//           description: SightingCondition.description,
//           _id: SightingCondition._id
//         }
//       }
//       let BeaufortValue = await GetDocFromDict(dictBeaufort, SpeciesSightingData[i][13], 'beaufort-lookup', 'LookupDocs');
//       if (BeaufortValue != null){
//         BeaufortValue = {
//           description: BeaufortValue.description,
//           _id: BeaufortValue._id
//         }
//       }
//       let Outcome = await GetDocFromDict(dictInteractionOutcome, SpeciesSightingData[i][27], 'interaction-outcome-lookup', 'LookupDocs')
//       if (Outcome != null){
//         Outcome = {
//           description: Outcome.description,
//           _id: Outcome._id
//         }
//       }
  
//       let lstHaulIDs = [];
//       if (SpeciesSightingData[i][22] != null){
//         lstHaulIDs = SpeciesSightingData[i][22].split(',');
//       }
//       let lstHaulCouchIDs: string[] = [];
//       for (let HaulNum = 0; HaulNum < lstHaulIDs.length; HaulNum++){
//         let [strDocID,] = await FetchRevID("legacy.operationId", lstHaulIDs[HaulNum], 'all-operations');
//         lstHaulCouchIDs.push(strDocID);
//       }
  
//       let BehaviorIDs = [];
//       if(SpeciesSightingData[i][28] != null) {
//         BehaviorIDs = SpeciesSightingData[i][28].split(',');
//       }
//       let Behaviors: Behavior[] = [];
//       for (let BehaveNum = 0; BehaveNum < BehaviorIDs.length; BehaveNum++){
//         let docBehavior = await GetDocFromDict(dictInteractionBehaviors, BehaviorIDs[BehaveNum], 'behavior-type-lookup', 'LookupDocs');
//         if (docBehavior != null){
//           docBehavior = {
//             description: docBehavior.description,
//             _id: docBehavior._id
//           }
//         }
//         Behaviors.push(docBehavior);
//       }
  
//       // if species_interaction record exists, check if its interaction type was sighting only, build interact or sighting respectively
//       if (SpeciesSightingID in dictAllSpeciesInteractions){
//         let InteractionData = dictAllSpeciesInteractions[SpeciesSightingID];
//         let lstInteractionTypes: InteractionType[] = []
  
//         for ( let j = 0; j < InteractionData.length; j++){
//           // if record has interaction type 101 (sighting only), it will be the only record in InteractionData, else get list of interaction types
//           if (InteractionData[j][2] == 101){
//             MmsbtItem = await ConstructSightingEvent(SpeciesSightingData[i], Behaviors, Confidence, BodyLength, SightingCondition, BeaufortValue, Species, lstHaulCouchIDs);
//             lstSightingEvents.push(MmsbtItem);
//           } else {
//             let FishingInteraction = await GetDocFromDict(dictFishingInteraction, InteractionData[j][2], 'interaction-type-lookup', 'LookupDocs');
//             if (FishingInteraction != null){
//               FishingInteraction = {
//                 description: FishingInteraction.description,
//                 _id: FishingInteraction._id
//               }
//             }
//             lstInteractionTypes.push(FishingInteraction);
//           }
//         }
//         let Interaction = await ConstructInteractionEvent(lstInteractionTypes, SpeciesSightingData[i], Behaviors, Confidence, BodyLength, SightingCondition, BeaufortValue, Species, lstHaulCouchIDs, Outcome);
//         lstInteractionEvents.push(Interaction);
//       } else {
//         let Sighting = await ConstructSightingEvent(SpeciesSightingData[i], Behaviors, Confidence, BodyLength, SightingCondition, BeaufortValue, Species, lstHaulCouchIDs);
//         lstSightingEvents.push(Sighting)
//       }
//     }
//     if (lstSightingEvents.length == 0){
//       lstSightingEvents = null;
//     } 
//     if (lstInteractionEvents.length == 0){
//       lstInteractionEvents = null;
//     }
//     let ReturnTuple: [SightingEvent[], InteractionEvent[]] = [lstSightingEvents, lstInteractionEvents]
//     return ReturnTuple
//   } else {
//     return [null, null];
//   }

//   } catch (error) {
//     console.log(error)
//   }


// }

// async function BuildProgram(odb: any, iProgramID: number){
//   if ( iProgramID != undefined) {
//     let lstProgramData = await ExecuteOracleSQL(odb, strProgramSQL + iProgramID);
//     lstProgramData = lstProgramData[0];
//     let iUserCreatedByID = lstProgramData[3];
//     let iUserModifiedByID = lstProgramData[5];

//     let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId');
//     let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');

//     let cProgram: Program = ConstructProgram(lstProgramData, CreatedBy, ModifiedBy);

//     return cProgram;
//   } else { 
//     return null;
//   }
// }
// async function BuildPort(odb: any, iPortID: number){
//   if ( iPortID != undefined) {
//     let lstPortData = await ExecuteOracleSQL(odb, strPortSQL + iPortID);
//     lstPortData = lstPortData[0];
//     let iUserCreatedByID = lstPortData[5];
//     let iUserModifiedByID = lstPortData[7];
    
//     let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId');
//     let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');

//     let cPort: Port = ConstructPort(lstPortData, CreatedBy, ModifiedBy);
//     return cPort;
//   } else { 
//     return null;
//   }
// }

// async function BuildReceiver(odb: any, iReceiverID: number){
//   if ( iReceiverID != null){
//     let lstReceiverData = await ExecuteOracleSQL(odb, strReceiverSQL + iReceiverID);
//     lstReceiverData = lstReceiverData[0];
    

//     let PortID = await ExecuteOracleSQL(odb, 'SELECT PORT_ID FROM OBSPROD.PORTS WHERE IFQ_PORT_CODE = ' + lstReceiverData[5])
//     PortID = PortID[0][0];  
//     let ReceiverPort: Port = await GetDocFromDict(dictPorts, PortID, 'all-ports', 'MainDocs');
//     if (ReceiverPort != null){
//       ReceiverPort.legacy = undefined;
//     }
//     let bActive: boolean;

//     if (lstReceiverData[9] == 1){
//       bActive = true;
//     } else {
//       bActive = false;
//     }

//     let NewReceiver: FirstReceiver = {
//       type: FirstReceiverTypeName,
//       dealerName: lstReceiverData[4],
//       dealerNumber: lstReceiverData[3],
//       port: ReceiverPort,
//       createdDate: moment(lstReceiverData[6], moment.ISO_8601).format(),
//       createdBy: lstReceiverData[7],
//       uploadedBy: UploadedBy,
//       uploadedDate: UploadedDate,

//       legacy: {
//         ifqDealerId: lstReceiverData[0],
//         agencyId: lstReceiverData[1],
//         receiverNum: lstReceiverData[2],
//         receiverCode: lstReceiverData[8],
//         active: bActive
//       }
//     }
//     return NewReceiver;    
//   }
// }

// async function BuildTrip(odb: any, iTripID: number, lstHaulIDs: string[]){
//   // let lstTripData = await ExecuteOracleSQL(odb, strTripSQL + iTripID);
//   // lstTripData = lstTripData[0];
//   let lstTripData = dictAllTrips[iTripID];
//   let iProgramID = lstTripData[3];
//   let iDeparturePortID = lstTripData[6];
//   let iReturnPortID = lstTripData[8];
//   let iVesselID = lstTripData[1];
//   let iUserCreatedByID = lstTripData[13];
//   let iUserModifiedByID = lstTripData[15];
//   let iObserverID = lstTripData[2];


//   let SpeciesSightings: SightingEvent[] = null; 
//   let SpeciesInteractions: InteractionEvent[] = null;
//   //let [, SpeciesInteractions] = await BuildMmsbt(iTripID);
//   [SpeciesSightings, SpeciesInteractions] = await BuildMmsbt(iTripID); 


//   //let HlfcConfig = null;
//   let HlfcConfig: WcgopHlfcConfiguration[] = await BuildHlfc(iTripID);

//   //let FishTickets = null;
//   let FishTickets = await BuildFishTickets(odb, iTripID);

//   let Fishery = await GetDocFromDict(dictFishery, lstTripData[23], 'fishery-lookup', 'LookupDocs');
//   if (Fishery != null){
//     Fishery = {
//       description: Fishery.description,
//       _id: Fishery._id
//     }
//   }


//   let FirstReceiver = await GetDocFromDict(dictFirstReceivers, lstTripData[28], 'first-receiver-lookup', 'LookupDocs');
//   if (FirstReceiver != null){
//     FirstReceiver.legacy = undefined;
//   }


//   let IntendedGearType = await GetDocFromDict(dictGearType, lstTripData[36], 'gear-type-lookup', 'LookupDocs')
//   if (IntendedGearType != null){
//     IntendedGearType = {
//       description: IntendedGearType.description,
//       _id: IntendedGearType._id
//     }
//   }


//   let Observer = iObserverID // await GetDocFromDict(dictUsers, iObserverID, 'legacy.userId');
//   let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId');
//   let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');
//   let Program = await GetDocFromDict(dictProgram, iProgramID, 'all-programs', 'MainDocs');
//   if (Program != null) {
//     Program.legacy = undefined;
//   }
//   let DeparturePort = await GetDocFromDict(dictPorts, iDeparturePortID, 'all-ports', 'MainDocs');
//   if (DeparturePort != null){
//     DeparturePort.legacy = undefined;
//   }
//   let ReturnPort = await GetDocFromDict(dictPorts, iReturnPortID, 'all-ports', 'MainDocs');
//   if (ReturnPort != null) {
//     ReturnPort.legacy = undefined;
//   }
//   let Vessel = await GetDocFromDict(dictVessels, iVesselID, 'all-vessels', 'MainDocs');
//   if (Vessel != null){
//     Vessel.legacy = undefined;
//   }
//   let TripStatus = await GetDocFromDict(dictTripStatus, lstTripData[5], 'trip-status-lookup', 'LookupDocs')

//   if (TripStatus != null){
//     TripStatus = {
//       description: TripStatus.description,
//       _id: TripStatus._id
//     }
//   }
//   let cTrip: WcgopTrip = ConstructTripWCGOP(lstTripData, CreatedBy, ModifiedBy, Vessel, DeparturePort, ReturnPort, Program, Observer, lstHaulIDs, HlfcConfig, TripStatus, SpeciesSightings, SpeciesInteractions, FishTickets, Fishery, FirstReceiver, IntendedGearType);

//   return cTrip
// }

// async function BuildTripCertificate(odb: any, iTripCertificate: number){
//   if ( iTripCertificate != undefined) {
//     let lstTripCertificateData = await ExecuteOracleSQL(odb, strTripCertificateSQL + iTripCertificate);
//     lstTripCertificateData = lstTripCertificateData[0];
//     let iUserCreatedByID = lstTripCertificateData[4];
//     let iUserModifiedByID = lstTripCertificateData[6];

//     let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId');
//     let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');
    
//     let cTripCertificate = ConstructTripCertificate(lstTripCertificateData, CreatedBy, ModifiedBy);
//     return cTripCertificate;

//   } else { 
//     return null;
//   }
// }

// // async function BuildUser(odb: any, iUserID: number){
// //   let lstUserData;
// //   try {
// //     if (iUserID != undefined){
// //       lstUserData = await ExecuteOracleSQL(odb, strUserSQL + iUserID); 
// //       if(lstUserData != null && lstUserData.length != 0){

// //         lstUserData = lstUserData[0];
// //         let cUser: User.UserWCGOP = User.ConstructUserWCGOP(lstUserData);
        
// //         return cUser;
// //       }
// //     } else {
// //       return null;
// //     }
// //   } catch (error) {
// //     console.log("build user failed", error, lstUserData, iUserID);
// //   }
// // }


// // async function BuildVesselContact(odb: any, iVesselContactID: number){
// //   if (iVesselContactID != undefined){
// //     let lstVesselContactData = await ExecuteOracleSQL(odb, strVesselContactSQL + iVesselContactID);
// //     lstVesselContactData = lstVesselContactData[0];    
// //     let iVesselID = lstVesselContactData[1];
// //     //let Vessel: Vessel.VesselWCGOP = await BuildVessel(odb, iVesselID);
// //     let Vessel;
// //     if(iVesselID in dictVessels){
// //       Vessel = dictVessels[iVesselID];
// //     } else {
// //       [,, Vessel] = await FetchDocument('vessel_id', iVesselID);
// //       dictVessels[iVesselID] = Vessel;
// //     }
// //     let iContactID = lstVesselContactData[2];
// //     //let ContactUser: Contact.Contact = await BuildContact(odb, iContactID);
// //     let Contact;
// //     if(iContactID in dictContacts){
// //       Contact = dictContacts[iContactID];
// //     } else {
// //       [,, Contact] = await FetchDocument('contact_id', iContactID);
// //       dictContacts[iContactID] = Contact;
// //     }
// //     let iUserCreatedByID = lstVesselContactData[5];
// //     //let CreatedBy: User.UserWCGOP = await BuildUser(odb, iUserCreatedByID);
// //     let CreatedBy;
// //     if(iUserCreatedByID in dictUsers){
// //       CreatedBy = dictUsers[iUserCreatedByID];
// //     } else {
// //       [,, CreatedBy] = await FetchDocument('user_id', iUserCreatedByID);
// //       dictUsers[iUserCreatedByID] = CreatedBy;
// //     }
// //     let iUserModifiedByID = lstVesselContactData[7];
// //     //let ModifiedBy: User.UserWCGOP = await BuildUser(odb, iUserModifiedByID);  
// //     let ModifiedBy;
// //     if(iUserModifiedByID in dictUsers){
// //       ModifiedBy = dictUsers[iUserModifiedByID];
// //     } else {
// //       [,, ModifiedBy] = await FetchDocument('user_id', iUserModifiedByID);
// //       dictUsers[iUserModifiedByID] = ModifiedBy;
// //     }

// //     let cVesselContact: Vessel_Contact.Vessel_Contact = Vessel_Contact.ConstructVesselContact(lstVesselContactData, CreatedBy, ModifiedBy, Contact, Vessel);
// //     return cVesselContact;

// //   } else {
// //     return null;
// //   }

// // }
// async function BuildVessel(odb: any, iVesselID: number){
//   if (iVesselID != undefined){
//     let lstVesselData = await ExecuteOracleSQL(odb, strVesselSQL + iVesselID);
//     lstVesselData = lstVesselData[0];
//     let iPortID = lstVesselData[1];
//     let iUserCreatedByID = lstVesselData[11];
//     let iUserModifiedByID = lstVesselData[13];

//     let Port: Port = await GetDocFromDict(dictPorts, iPortID, 'all-ports', 'MainDocs');
//     if (Port != null){
//       Port.legacy = undefined;
//     }
//     let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId');
//     let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');

//     let cVessel: Vessel = await ConstructVessel(lstVesselData, CreatedBy, ModifiedBy, Port);
//     return cVessel;
//   } else {
//     return null;
//   }
// }

// async function MigrateReceivers(strDateBegin: string, strDateEnd: string){
//   let odb = await OracleConnection();
//   let lstRawReceiverIDs = await ExecuteOracleSQL(odb, `SELECT IFQ_DEALER_ID FROM OBSPROD.IFQ_DEALERS`);
//   let lstReceiverIDs = [];

//   if (lstRawReceiverIDs != null){
//     for( let i = 0; i < lstRawReceiverIDs.length; i++){
//       lstReceiverIDs.push(lstRawReceiverIDs[i][0]);
//     }
//   }

//   let lstReceivers: FirstReceiver[] = [];
//   for ( let i = 0; i < lstReceiverIDs.length; i++){
    
//     let NewReceiver = await BuildReceiver(odb, lstReceiverIDs[i]); 
//     let [strDocID, strDocRev] = await FetchRevID('legacy.ifqDealerId', lstReceiverIDs[i], 'first-receiver-lookup');

//     if (strDocID != null){
//       NewReceiver._rev = strDocRev;
//     }
//     NewReceiver = RemoveDocNullVals(NewReceiver);
//     lstReceivers.push(NewReceiver);
//   }

//   await ReleaseOracle(odb);
//   return await InsertBulkCouchDB(lstReceivers);
// }



// // Function to be used for all look up documents, which Build function to use is passed in as a parameter, making this an easy multi use funtion.
// async function MigrateLookupDocuments(strPropertyID: string, strDocType: string, BuildDocument: Function, DateCompare: Date, strDateBegin: string, strDateEnd: string, strTableName: string, strTableID: string, ViewName: string){

//   let strSQL: string = oraclesql.AllNewAndModifiedLookups(strTableID, strTableName, strDateBegin, strDateEnd);
//   let odb = await OracleConnection(); // must be done syncronously
//   let lstRawDocumentIDs = await ExecuteOracleSQL(odb, strSQL);
//   let lstDocumentIDs = [];
  
//   if (lstRawDocumentIDs != null){
//     for( let i = 0; i < lstRawDocumentIDs.length; i++){
//       lstDocumentIDs.push(lstRawDocumentIDs[i][0]);
//     }
//   }
//   let lstDocuments = [];
//   for (let i = 0; i < lstDocumentIDs.length; i++){
//     let iDocumentID = lstDocumentIDs[i];
//     let cDocument = await BuildDocument(odb, iDocumentID);
//     cDocument = RemoveDocNullVals(cDocument);
//     // If record is newly created, add to list to be inserted in bulk
//     if(( moment(cDocument.createdDate, moment.ISO_8601) >  moment(DateCompare, moment.ISO_8601)) || ( moment(cDocument.legacy.obsprodLoadDate, moment.ISO_8601) >  moment(DateCompare, moment.ISO_8601))){
//       let [strDocID, strDocRev] = await FetchRevID(strPropertyID, iDocumentID, ViewName);
//       if(strDocID == null){
//         lstDocuments.push(cDocument)
//       }
//     }
//     else if( moment(cDocument.updatedDate, moment.ISO_8601) >  moment(DateCompare, moment.ISO_8601)){
//       // Else already exists in couch, recreate it
//       let [strDocID, strDocRev] = await FetchRevID(strPropertyID, iDocumentID, ViewName);
//       cDocument = JSON.parse(JSON.stringify(cDocument));
//       cDocument._id = strDocID;
//       cDocument._rev = strDocRev;
//       cDocument = RemoveDocNullVals(cDocument);
//       UpdateDocCouchDB(cDocument);
//     } 
//     else {
//       // Should never reach this. 
//       console.log("Error: Document neither newly created or modified, something is wrong. document type = " + strDocType + " document id = " + iDocumentID)
//     }
//   }
//   await ReleaseOracle(odb);
//   await InsertBulkCouchDB(lstDocuments);
// }

// // Haul logic is done in one single loop through a join of Haul and Catch records,
// // ordered by TripID then HaulID, to group all hauls together under each trip.
// // The trip ID and list of Hauls per Trip are added to an array to be used as a parameter for Trip ETL,
// // as this gives a simple indicator on which Trips to rebuild, as well as easily keeps on hand the list of 
// // couch IDs for the respective hauls.
// // Because a Haul doc must be rebuilt if there is a single new or updated Catch, every single record returned
// // correlates to a doc to build, so the Haul docs are built first, then a check is made whether to insert or update. 
// async function MigrateHaulDocuments(strDateBegin: string, strDateEnd: string){
//   let DateCompare = new Date(strDateBegin);
//   let strSQL = oraclesql.AllNewAndModifiedHauls(strDateBegin, strDateEnd);
//   let odb = await OracleConnection();
//   let HaulandCatchIDs = await ExecuteOracleSQL(odb, strSQL); 
//   let iCatchID, iLastTripID, iLastHaulID;
//   let lstNewHaulIDs = [], lstCreatedHauls = [], lstModifiedHauls = [], lstHaulIDs = [], lstCatches = [];
//   let iTripID, iHaulID;

//   if (HaulandCatchIDs.length > 0){
//     iTripID = HaulandCatchIDs[0][0];
//     iHaulID = HaulandCatchIDs[0][1];
//   }

//   for (let i = 0; i < HaulandCatchIDs.length; i++){
//     iLastTripID = iTripID;
//     iLastHaulID = iHaulID;
//     iTripID = HaulandCatchIDs[i][0], iHaulID = HaulandCatchIDs[i][1], iCatchID = HaulandCatchIDs[i][2];

//   // if this record is new trip, build last haul, bulk insert all hauls, save list of Couch IDs along side Trip ID
//     if (iTripID != iLastTripID || i == HaulandCatchIDs.length - 1){
//       let cHaul = await BuildHaul(odb, iLastHaulID, lstCatches);
//       cHaul = RemoveDocNullVals(cHaul);
//       let [strDocID, strDocRev] = await FetchRevID("legacy.operationId", cHaul.legacy.fishingActivityId, 'all-operations');

//       if (strDocID == null){
//         lstCreatedHauls.push(cHaul);
//       } else {
//         cHaul._id = strDocID;
//         cHaul._rev = strDocRev;
//         lstModifiedHauls.push(cHaul);
//       }

//       lstHaulIDs = await InsertBulkCouchDB(lstCreatedHauls);      
//       await InsertBulkCouchDB(lstModifiedHauls);
//       lstNewHaulIDs.push([iLastTripID, lstHaulIDs]);
//       lstCreatedHauls = [], lstModifiedHauls = [], lstHaulIDs = [], lstCatches = [];
//     } 
//     // if this record is new haul, construct last haul, insert into couch, create new catch list
//     else if (iHaulID != iLastHaulID){
//       let cHaul = await BuildHaul(odb, iLastHaulID, lstCatches);
//       cHaul = RemoveDocNullVals(cHaul);
//       let [strDocID, strDocRev] = await FetchRevID("legacy.operationId", cHaul.legacy.fishingActivityId, 'all-operations');
//       if (strDocID == null){
//         lstCreatedHauls.push(cHaul);
//       } else {
//         cHaul._id = strDocID;
//         cHaul._rev = strDocRev;
//         lstModifiedHauls.push(cHaul);
//       }
//       lstCatches = [];
//     }
//     if( iCatchID != null){
//       let cCatch = await BuildCatch(odb, iCatchID)
//       lstCatches.push(cCatch);
//     }
//   }
//   await ReleaseOracle(odb);
//   return lstNewHaulIDs;
// }


// // Trip logic is done in two sections. Creation and then modified, unlike hauls where both were done simultaneously. Create is straightforward, update is more complex.
// // The basic logic is that a list of all trips that have been modified (if there are any) are concatenated together with a list (returned from MigrateHauls) 
// // of trip ids that have had new hauls added. The passed in list is of length-2 arrays, position [0] is the OBSPROD trip ID, position [1] is a list of couch haul IDs. 
// // This 2d array is transposed to obtain a single dimensional array of just the trip IDs, of which is concatenated with the list of modified trips. 
// // This combined list is then looped through, each iteration making a request from couchdb to obtain the list of hauls already in the trip document (if it exists), 
// // then combining that list with the new list (if it exists), then rebuilds the trip document and updates.  
// async function MigrateTripDocuments(lstNewTripHauls: any[], strDateBegin: string, strDateEnd: string){
//   let strSQL = oraclesql.AllNewTripsSQL(strDateBegin, strDateEnd);
//   let odb = await OracleConnection();
//   // Create 
//   let lstRawNewTripIDs = await ExecuteOracleSQL(odb, strSQL);
//   let lstNewTripIDs = [],  lstTrips = [];
//   // this is just to get all the IDs into a 1d array, as Oracle does not return it in the format needed here
//   if (lstRawNewTripIDs != null){
//     for( let i = 0; i < lstRawNewTripIDs.length; i++){
//       lstNewTripIDs.push(lstRawNewTripIDs[i][0]);
//     }
//   }
//   for (let i = 0; i < lstNewTripIDs.length; i++){
//     let cTrip = await BuildTrip(odb, lstNewTripIDs[i], []);
//     cTrip = RemoveDocNullVals(cTrip);
//     lstTrips.push(cTrip);

//     if (100 % i == 1 || i == lstNewTripIDs.length - 1){
//       await InsertBulkCouchDB(lstTrips);
//     }
//   }

//   // Set up update 
//   strSQL = oraclesql.AllModifiedTripsSQL(strDateBegin, strDateEnd);
//   let lstRawModifiedTripIDs = await ExecuteOracleSQL(odb, strSQL); // must be done syncronously  
//   await ReleaseOracle(odb);
//   let lstModifiedTripIDs = [];

//   // get all the IDs returned by oracle into a 1d array for ease of use
//   if (lstRawModifiedTripIDs != null){
//     for( let i = 0; i < lstRawModifiedTripIDs.length; i++){
//       lstModifiedTripIDs.push(lstRawModifiedTripIDs[i][0]);
//     }
//   }
//   // Gets the trip ids from passed in list into 1d array
//   var lstTripIDsWithNewHauls: any[];
//   if (lstNewTripHauls.length > 0){
//     lstTripIDsWithNewHauls = Transpose(lstNewTripHauls);
//     lstTripIDsWithNewHauls = lstTripIDsWithNewHauls[0];
//   } else {
//     lstTripIDsWithNewHauls = [];
//   }
//   // Merge lists, using a Set to get ensure no duplicates
//   let lstTripIDsMerged = Array.from(new Set(lstTripIDsWithNewHauls.concat(lstModifiedTripIDs)));
  
//   // Ensure trip index is finished updating before doing updates by ensuring there is no timeout error
//   let bIndexUpdated = false;
//   while(bIndexUpdated == false && lstTripIDsMerged.length != 0){
//     let [strDocID,,] = await FetchHaulsAndRevID(lstTripIDsMerged[0], 'all-trips');
//     if (strDocID != null){
//       bIndexUpdated = true;
//     }
//   }
//   // Actual update logic
//   // By this point, all trips in OBSPROD should exist in Couch, thus, every one of IDs represents an update that must happen.
//   for(let i = 0; i < lstTripIDsMerged.length; i++){
//     let iTripID =  lstTripIDsMerged[i];
//     let [strDocID, strDocRev, lstCurrentHaulIDs] = await FetchHaulsAndRevID(iTripID, 'all-trips');
    
//     // Simple check to ensure it exists, but SHOULD never be null
//     if( strDocID != null){
//       let lstNewHauls;
//       // Checks if ID has new hauls or not, then gets the index of where the haul is in the list, or defines the variable as empty if not, ensuring the concat works.
//       let iIndexForHauls = lstTripIDsWithNewHauls.indexOf(iTripID);
//       if(iIndexForHauls > -1){
//         lstNewHauls = lstNewTripHauls[iIndexForHauls][1];
//       } else {
//         lstNewHauls = [];
//       }
//       let lstHaulIDsMerged: string[] =  Array.from(new Set(lstNewHauls.concat(lstCurrentHaulIDs)));
//       console.log()
//       let cTrip = await BuildTrip(odb, iTripID, lstHaulIDsMerged);
//       JSON.parse(JSON.stringify(cTrip));
//       cTrip._id = strDocID;
//       cTrip._rev = strDocRev;
//       cTrip = RemoveDocNullVals(cTrip);
//       console.log()
//       UpdateDocCouchDB(cTrip);
//     } 
//     else {
//       console.log("document doesnt exist, trip id = " + iTripID, "docID = " + strDocID);
//     }
//   }
// }


// async function MigrateAllFromLookupTable(strDateBegin: string, strDateEnd: string, DateCompare: Date){
//   let odb = await OracleConnection();
//   let AllLookupDocs: any = [];

//   let Docs: any = await BuildLookups(odb, 'BEAUFORT_VALUE', BeaufortTypeName, strDateBegin, strDateEnd, DateCompare, 'beaufort-lookup');
//   //AllLookupDocs.push(Doc);
//   await InsertBulkCouchDB(Docs);

//   Docs = await BuildLookups(odb, 'DISCARD_REASON', DiscardReasonTypeName, strDateBegin, strDateEnd, DateCompare, 'discard-reason-lookup');
//   await InsertBulkCouchDB(Docs);
  
//   Docs = await BuildLookups(odb, 'DISSECTION_TYPE', BiostructureTypeTypeName, strDateBegin, strDateEnd, DateCompare, 'biostructure-type-lookup');
//   await InsertBulkCouchDB(Docs);
  
//   Docs = await BuildLookups(odb, 'BODY_LENGTH', BodyLengthTypeName, strDateBegin, strDateEnd, DateCompare, 'body-length-lookup');
//   await InsertBulkCouchDB(Docs);
  
//   Docs = await BuildLookups(odb, 'CONFIDENCE', ConfidenceTypeName, strDateBegin, strDateEnd, DateCompare, 'confidence-lookup');
//   await InsertBulkCouchDB(Docs);
  
//   Docs = await BuildLookups(odb, 'CONTACT_TYPE', ContactTypeTypeName, strDateBegin, strDateEnd, DateCompare, 'contact-type-lookup');
//   await InsertBulkCouchDB(Docs);
  
//   Docs = await BuildLookups(odb, 'CONTACT_CATEGORY', ContactCategoryTypeName, strDateBegin, strDateEnd, DateCompare, 'contact-category-lookup');
//   await InsertBulkCouchDB(Docs);
  
//   Docs = await BuildLookups(odb, 'INTERACTION_BEHAVIOR', InteractionTypeTypeName, strDateBegin, strDateEnd, DateCompare, 'interaction-type-lookup');
//   await InsertBulkCouchDB(Docs);
  
//   Docs = await BuildLookups(odb, 'INTERACTION_OUTCOME', InteractionOutcomeTypeName, strDateBegin, strDateEnd, DateCompare, 'interaction-outcome-lookup');
//   await InsertBulkCouchDB(Docs);
  
//   Docs = await BuildLookups(odb, 'RELATIONSHIP', RelationshipTypeName, strDateBegin, strDateEnd, DateCompare, 'relationship-lookup');
//   await InsertBulkCouchDB(Docs);
  
//   Docs = await BuildLookups(odb, 'TRIP_STATUS', TripStatusTypeName, strDateBegin, strDateEnd, DateCompare, 'trip-status-lookup');
//   await InsertBulkCouchDB(Docs);
  
//   Docs = await BuildLookups(odb, 'VESSEL_STATUS', VesselStatusTypeName, strDateBegin, strDateEnd, DateCompare, 'vessel-status-lookup');
//   await InsertBulkCouchDB(Docs);

//   Docs = await BuildLookups(odb, 'VESSEL_TYPE', VesselTypeTypeName, strDateBegin, strDateEnd, DateCompare, 'vessel-type-lookup');
//   await InsertBulkCouchDB(Docs);

//   Docs = await BuildLookups(odb, 'WAIVER_TYPE', WaiverTypeTypeName, strDateBegin, strDateEnd, DateCompare, 'waiver-type-lookup');
//   await InsertBulkCouchDB(Docs);
  
//   Docs = await BuildLookups(odb, 'WEIGHT_METHOD', WeightMethodTypeName, strDateBegin, strDateEnd, DateCompare, 'weight-method-lookup');
//   await InsertBulkCouchDB(Docs);

//   Docs = await BuildLookups(odb, 'BS_SAMPLE_METHOD', BiosampleSampleMethodTypeName, strDateBegin, strDateEnd, DateCompare, 'biospecimen-sample-method-lookup');
//   await InsertBulkCouchDB(Docs);
  
//   Docs = await BuildLookups(odb, 'SPECIES_CATEGORY', SpeciesCategoryTypeName, strDateBegin, strDateEnd, DateCompare, 'species-category-lookup');
//   await InsertBulkCouchDB(Docs);

//   Docs = await BuildLookups(odb, 'SPECIES_SUB_CATEGORY', SpeciesSubCategoryTypeName, strDateBegin, strDateEnd, DateCompare, 'species-sub-category-lookup');
//   await InsertBulkCouchDB(Docs);

//   Docs = await BuildLookups(odb, 'GEAR_PERFORMANCE', GearPerformanceTypeName, strDateBegin, strDateEnd, DateCompare, 'gear-performance-lookup');
//   await InsertBulkCouchDB(Docs);

//   Docs = await BuildLookups(odb, 'CATCH_DISPOSITION', CatchDispositionTypeName, strDateBegin, strDateEnd, DateCompare, 'catch-disposition-lookup');
//   await InsertBulkCouchDB(Docs);

//   //console.log(GearTypeTypeName); i have no idea why this is undefined
//   Docs = await BuildLookups(odb, 'TRAWL_GEAR_TYPE', 'gear-type', strDateBegin, strDateEnd, DateCompare, 'gear-type-lookup');
//   await InsertBulkCouchDB(Docs);

//   Docs = await BuildLookups(odb, 'FG_GEAR_TYPE', 'gear-type', strDateBegin, strDateEnd, DateCompare, 'gear-type-lookup');
//   await InsertBulkCouchDB(Docs);

//   Docs = await BuildLookups(odb, 'SIGHTING_CONDITION', 'sighting-condition', strDateBegin, strDateEnd, DateCompare, 'sighting-condition-lookup');
//   await InsertBulkCouchDB(Docs);


//   Docs = await BuildLookups(odb, 'FISHING_INTERACTION', 'interaction-type', strDateBegin, strDateEnd, DateCompare, 'interaction-type-lookup');
//   await InsertBulkCouchDB(Docs);

//   Docs = await BuildLookups(odb, 'INTERACTION_BEHAVIOR', 'behavior-type', strDateBegin, strDateEnd, DateCompare, 'behavior-type-lookup');
//   await InsertBulkCouchDB(Docs);

//   Docs = await BuildLookups(odb, 'FISHERY', 'fishery', strDateBegin, strDateEnd, DateCompare, 'fishery-lookup');
//   await InsertBulkCouchDB(Docs);

//   Docs = await BuildLookups(odb, 'WAIVER_REASON', 'waiver-reason', strDateBegin, strDateEnd, DateCompare, 'waiver-reason-lookup');
//   await InsertBulkCouchDB(Docs);
  
//   await ReleaseOracle(odb);

// }

// async function FillDictionaryWithTable(dictToFill: { [id: number] : any; }, TableData: any){
//   for ( let i = 0; i < TableData.length; i++){
//     dictToFill[TableData[i][0]] = TableData[i];
//   }
// }

// // No longer use, passing in each list led to memory leak / running out due to list passing by value rather than ref
// function FillDictByForeignKey(dictToFill: { [id: number] : any; }, TableData: any, iForeignKeyPosition: number){
  
//   for (let i = 0; i < TableData.length; i++){
//     let ForeignKey = TableData[i][iForeignKeyPosition];
//     if (ForeignKey in dictToFill){
//       dictToFill[ForeignKey].push(TableData[i]);
//     } else {
//       dictToFill[ForeignKey] = [TableData[i]];
//     }
//   }
// }

// async function LoadTablesIntoMemory(strDateBegin: string, strDateEnd: string){
//   let odb = await OracleConnection();

//   let DissectionsSQL = DissectionsTableSQL(strDateBegin, strDateEnd);
//   let DissectionData: any = await ExecuteOracleSQL(odb, DissectionsSQL);
//   //FillDictByForeignKey(dictAllDissections, DissectionData, 1);
//   for (let i = 0; i < DissectionData.length; i++){
//     let ForeignKey = DissectionData[i][1];
//     if (ForeignKey in dictAllDissections){
//       dictAllDissections[ForeignKey].push(DissectionData[i]);
//     } else {
//       dictAllDissections[ForeignKey] = [DissectionData[i]];
//     }
//   }
//   DissectionData = null;
//   console.log('Dissection by BSI dict length = ' + Object.keys(dictAllDissections).length);
//   console.log(new Date().toLocaleTimeString());


//   let BiospecimenItemsSQL = BioSpecimenItemsTableSQL(strDateBegin, strDateEnd);
//   let BiospecimenItemsData: any = await ExecuteOracleSQL(odb, BiospecimenItemsSQL);
//   //FillDictByForeignKey(dictAllBiospecimenItems, BiospecimenItemsData, 1);  
//   for (let i = 0; i < BiospecimenItemsData.length; i++){
//     let ForeignKey = BiospecimenItemsData[i][1];
//     if (ForeignKey in dictAllBiospecimenItems){
//       dictAllBiospecimenItems[ForeignKey].push(BiospecimenItemsData[i]);
//     } else {
//       dictAllBiospecimenItems[ForeignKey] = [BiospecimenItemsData[i]];
//     }
//   }
//   console.log('BSI by BS dict length = ' + Object.keys(dictAllBiospecimenItems).length);
//   console.log(new Date().toLocaleTimeString());  

//   BiospecimenItemsData = null;


//   let BiospecimensSQL = BioSpecimensTableSQL(strDateBegin, strDateEnd);
//   let BiospecimensData: any = await ExecuteOracleSQL(odb, BiospecimensSQL);
//   //FillDictByForeignKey(dictAllBiospecimens, BiospecimensData, 1);
//   for (let i = 0; i < BiospecimensData.length; i++){
//     let ForeignKey = BiospecimensData[i][1];
//     if (ForeignKey in dictAllBiospecimens){
//       dictAllBiospecimens[ForeignKey].push(BiospecimensData[i]);
//     } else {
//       dictAllBiospecimens[ForeignKey] = [BiospecimensData[i]];
//     }
//   }

//   console.log('BS by catch dict length = ' + Object.keys(dictAllBiospecimens).length);
//   console.log(new Date().toLocaleTimeString());  
//   BiospecimensData = null;
  

//   let LengthFrequenciesSQL = LengthFrequenciesTableSQL(strDateBegin, strDateEnd);
//   let LengthFrequenciesData: any = await ExecuteOracleSQL(odb, LengthFrequenciesSQL);
//   //FillDictByForeignKey(dictAllLengthFrequencies, LengthFrequenciesData, 10);
//   for (let i = 0; i < LengthFrequenciesData.length; i++){
//     let ForeignKey = LengthFrequenciesData[i][10];
//     if (ForeignKey in dictAllLengthFrequencies){
//       dictAllLengthFrequencies[ForeignKey].push(LengthFrequenciesData[i]);
//     } else {
//       dictAllLengthFrequencies[ForeignKey] = [LengthFrequenciesData[i]];
//     }
//   }

//   console.log('LF by BS dict length = ' + Object.keys(dictAllLengthFrequencies).length);
//   console.log(new Date().toLocaleTimeString());  
//   LengthFrequenciesData = null;


//   let SpeciesCompSQL = SpeciesCompositionsAndItemsTableSQL(strDateBegin, strDateEnd);
//   let SpeciesCompData: any = await ExecuteOracleSQL(odb, SpeciesCompSQL);
//   //FillDictByForeignKey(dictAllSpeciesCompositions, SpeciesCompData, 1);
//   for (let i = 0; i < SpeciesCompData.length; i++){
//     let ForeignKey = SpeciesCompData[i][1];
//     if (ForeignKey in dictAllSpeciesCompositions){
//       dictAllSpeciesCompositions[ForeignKey].push(SpeciesCompData[i]);
//     } else {
//       dictAllSpeciesCompositions[ForeignKey] = [SpeciesCompData[i]];
//     }
//   }
//   console.log('species comp/items by catch dict length = ' + Object.keys(dictAllSpeciesCompositions).length);
//   console.log(new Date().toLocaleTimeString());  
//   SpeciesCompData = null;

//   let FishingLocationsSQL = FishingLocationsTableSQL();
//   let FishingLocationsData: any = await ExecuteOracleSQL(odb, FishingLocationsSQL);
//   //FillDictByForeignKey(dictAllFishingLocations, FishingLocationsData, 1);

//   for (let i = 0; i < FishingLocationsData.length; i++){
//     let ForeignKey = FishingLocationsData[i][1];
//     if (ForeignKey in dictAllFishingLocations){
//       dictAllFishingLocations[ForeignKey].push(FishingLocationsData[i]);
//     } else {
//       dictAllFishingLocations[ForeignKey] = [FishingLocationsData[i]];
//     }
//   }

//   console.log('fishing locations by haul dict length = ' + Object.keys(dictAllFishingLocations).length);
//   console.log(new Date().toLocaleTimeString());  

//   FishingLocationsData = null;  


//   let BasketsSQL = strSpeciesCompBasketsSQL;
//   let BasketData: any = await ExecuteOracleSQL(odb, BasketsSQL);
//   //FillDictByForeignKey(dictAllFishingLocations, FishingLocationsData, 1);

//   for (let i = 0; i < BasketData.length; i++){
//     let ForeignKey = BasketData[i][1];
//     if (ForeignKey in dictAllBaskets){
//       dictAllBaskets[ForeignKey].push(BasketData[i]);
//     } else {
//       dictAllBaskets[ForeignKey] = [BasketData[i]];
//     }
//   }

//   strSpeciesCompBasketsSQL

  

//   // TABLES FOR TRIP DATA =============================
  


//   let strSpeciesSightinsSQL = SpeciesSightingsTableSQL();
//   let SpeciesSightingData: any = await ExecuteOracleSQL(odb, strSpeciesSightinsSQL);
//   //FillDictByForeignKey(dictAllSpeciesSightings, SpeciesSightingData, 1);

  
//   for (let i = 0; i < SpeciesSightingData.length; i++){
//     let ForeignKey = SpeciesSightingData[i][1];
//     if (ForeignKey in dictAllSpeciesSightings){
//       dictAllSpeciesSightings[ForeignKey].push(SpeciesSightingData[i]);
//     } else {
//       dictAllSpeciesSightings[ForeignKey] = [SpeciesSightingData[i]];
//     }
//   }

//   for (let i = 0; i < SpeciesSightingData.length; i++){
//     if (!(SpeciesSightingData[i][1] in dictAllSpeciesSightings)){
//       console.log('trip id = ' + SpeciesSightingData[i][1] + ' is not in dictionary');
//     }
//   }  

//   console.log('species sightings by trip dict length = ' + Object.keys(dictAllSpeciesSightings).length);
//   console.log(new Date().toLocaleTimeString());
//   SpeciesSightingData = null; 

  
//   let strSpeciesInteractionsSQL = SpeciesInteractionsTableSQL();
//   let SpeciesInteractionData: any = await ExecuteOracleSQL(odb, strSpeciesInteractionsSQL);
//   //FillDictByForeignKey(dictAllSpeciesInteractions, SpeciesInteractionData, 1);
//   for (let i = 0; i < SpeciesInteractionData.length; i++){
//     let ForeignKey = SpeciesInteractionData[i][1];
//     if (ForeignKey in dictAllSpeciesInteractions){
//       dictAllSpeciesInteractions[ForeignKey].push(SpeciesInteractionData[i]);
//     } else {
//       dictAllSpeciesInteractions[ForeignKey] = [SpeciesInteractionData[i]];
//     }
//   }

//   console.log('species interactions by sighting dict length = ' + Object.keys(dictAllSpeciesInteractions).length);
//   console.log(new Date().toLocaleTimeString());  
//   SpeciesInteractionData = null; 

  
//   // let strSpeciesInteractionHaulsXREFSQL = SpeciesInteractionHaulsXREFTableSQL();
//   // let SpeciesInteractionHaulsXREFData: any = await ExecuteOracleSQL(odb, strSpeciesInteractionHaulsXREFSQL);

//   // iLastSpeciesSightingID = SpeciesInteractionHaulsXREFData[0][1];
//   // iCurrentSpeciesSightingID = SpeciesInteractionHaulsXREFData[0][1];
//   // let lstSpeciesIntractionHaulsXREFBySightingID: any = [];

//   // for ( let i = 1; i <= SpeciesInteractionHaulsXREFData.length; i++){
//   //   iLastSpeciesSightingID = iCurrentSpeciesSightingID;
//   //   iCurrentSpeciesSightingID = SpeciesInteractionHaulsXREFData[i-1][1];

//   //   if (iCurrentSpeciesSightingID != iLastSpeciesSightingID || i == SpeciesInteractionHaulsXREFData.length){
//   //     dictAllSpeciesSightingsHaulsXREF[iLastSpeciesSightingID] = lstSpeciesIntractionHaulsXREFBySightingID;
//   //     lstSpeciesIntractionHaulsXREFBySightingID = [];
//   //   } 
//   //   else {
//   //     lstSpeciesIntractionHaulsXREFBySightingID.push(SpeciesInteractionHaulsXREFData[i-1]);
//   //   }
//   // }
//   // SpeciesInteractionHaulsXREFData = null; 


//   let strFishTicketSQL = FishTicketsTableSQL();
//   let FishTicketData: any = await ExecuteOracleSQL(odb, strFishTicketSQL);
//   //FillDictByForeignKey(dictAllFishTickets, FishTicketData, 6);

//   for (let i = 0; i < FishTicketData.length; i++){
//     let ForeignKey = FishTicketData[i][6];
//     if (ForeignKey in dictAllFishTickets){
//       dictAllFishTickets[ForeignKey].push(FishTicketData[i]);
//     } else {
//       dictAllFishTickets[ForeignKey] = [FishTicketData[i]];
//     }
//   }
//   for (let i = 0; i < FishTicketData.length; i++){
//     if (!(FishTicketData[i][6] in dictAllFishTickets)){
//       console.log('trip id = ' + FishTicketData[i][6] + ' is not in dictionary');
//     }
//   }
//   console.log('fish tickets by trip dict length = ' + Object.keys(dictAllFishTickets).length);
//   console.log(new Date().toLocaleTimeString());  

//   FishTicketData = null; 
  

//   let HlfcSQL = HlfcTableSQL();
//   let HlfcData: any = await ExecuteOracleSQL(odb, HlfcSQL);
//   //FillDictByForeignKey(dictAllHlfc, HlfcData, 1);
//   for (let i = 0; i < HlfcData.length; i++){
//     let ForeignKey = HlfcData[i][1];
//     if (ForeignKey in dictAllHlfc){
//       dictAllHlfc[ForeignKey].push(HlfcData[i]);
//     } else {
//       dictAllHlfc[ForeignKey] = [HlfcData[i]];
//     }
//   }
  
//   console.log('HLFC by trip dict length = ' + Object.keys(dictAllHlfc).length);
//   console.log(new Date().toLocaleTimeString());  

//   HlfcData = null; 


//   let CatchesSQL = CatchesTableSQL(strDateBegin, strDateEnd);
//   let CatchesData: any = await ExecuteOracleSQL(odb, CatchesSQL);
//   FillDictionaryWithTable(dictAllCatches, CatchesData);
//   CatchesData = null;

//   let HaulSQL = HaulsTableSQL(strDateBegin, strDateEnd);
//   let HaulData: any = await ExecuteOracleSQL(odb, HaulSQL);
//   FillDictionaryWithTable(dictAllHauls, HaulData);
//   HaulData = null;

//   let TripSQL = TripTableSQL(strDateBegin, strDateEnd);
//   let TripData: any = await ExecuteOracleSQL(odb, TripSQL);
//   FillDictionaryWithTable(dictAllTrips, TripData);
//   TripData = null;

//   //let CatchCatSQL = 
//   let CatchCatData: any = await ExecuteOracleSQL(odb, strCatchCategorySQL);
//   FillDictionaryWithTable(dictAllCatchCategory, CatchCatData);
//   CatchCatData = null;

//   await ReleaseOracle(odb);

// }

// async function Initialize(){
//   // format = yyy-MM-dd HH24:MI:SS

//   // let strDateCompare = '2019-04-19 13:31:00';
//   // let DateCompare = new Date(strDateCompare);
//   // let strDateLimit = '2019-04-23 9:18:00';

//   let strDateCompare = '1000-01-01 00:00:00';
//   let DateCompare = new Date(strDateCompare);
//   let strDateLimit = '2019-06-18 15:40:00';

//   //'2019-04-17 14:19:00';
//   UploadedDate = moment(strDateLimit, moment.ISO_8601).format();

  

//   // let odb = await OracleConnection();

//   // let testdata = await ExecuteOracleSQL(odb, 'SELECT CREATED_DATE, RECORD_COMPUTER_LOAD_ON_DATE FROM OBSPROD.FISHING_ACTIVITIES WHERE FISHING_ACTIVITY_ID = 150912');
//   // ReleaseOracle(odb);

//   // let CreatedDate: string = testdata[0][0];
//   // console.log(CreatedDate);
//   // console.log(moment(CreatedDate, moment.ISO_8601).format())
//   // let ComputerLoadDate: string = testdata[0][1];
//   // console.log(ComputerLoadDate);
//   // console.log(moment(ComputerLoadDate, moment.ISO_8601).format())


//   // let momentTime = moment('2011-06-26 12:32:03', moment.ISO_8601).format();
//   // let momentString: string;
//   // momentString = momentTime;
//   // console.log(momentTime);
//   // console.log(momentString);

//   // console.log();

  
//   // let [strDocID, strDocRev, lstCurrentHaulIDs] = await FetchHaulsAndRevID(22089 , 'all-trips');

//   // console.log(strDocID);
//   // console.log(strDocRev);

//   // let [strDocID, strDocRev, lstCurrentHaulIDs] = await FetchHaulsAndRevID(2147202337, 'all-trips');

//   // let Document: any;
  
//   // [,, Document] = await FetchDocument( 31187, 'all-operations', 'MainDocs');


//   // if (new Date('2014-08-05T18:33:30.069Z') > DateCompare){
//   //   console.log('success')
//   // } else {
//   //   console.log('no fail')
//   // }

//   // Document = JSON.stringify(Document);
//   // console.log(Document);
//   // Document = RemoveDocNullVals(Document);
//   // Document = JSON.stringify(Document);
//   // console.log(Document);
// // 


//   console.log("Initial start Time: ")
//   console.log(new Date().toLocaleTimeString());

//   await LoadTablesIntoMemory(strDateCompare, strDateLimit);
  
//   console.log("Tables loaded into memory")
//   console.log(new Date().toLocaleTimeString());

//   await CreateViews();

  
//   console.log("Views created, beginning lookup table records")
//   console.log(new Date().toLocaleTimeString());

//   await MigrateAllFromLookupTable(strDateCompare, strDateLimit, DateCompare);


//   console.log("Lookup records moved, starting migrate on other lookup docs")
//   console.log(new Date().toLocaleTimeString());


//   //await MigrateLookupDocuments('user_id', 'User', BuildUser, DateCompare, strDateCompare, strDateLimit, 'USERS', 'USER_ID');
  
//   await MigrateLookupDocuments('legacy.portId', 'port', BuildPort, DateCompare, strDateCompare, strDateLimit, 'PORTS', 'PORT_ID', 'all-ports');

//   let receiverids = await MigrateReceivers(strDateCompare, strDateLimit);
//   //console.log(receiverids[0], receiverids[1])

//   await MigrateLookupDocuments('legacy.speciesId', 'species', BuildSpecies, DateCompare, strDateCompare, strDateLimit, 'SPECIES', 'SPECIES_ID', 'all-species');

//   //await MigrateLookupDocuments('legacy.speciesId', 'species', BuildSpecies, DateCompare, strDateCompare, strDateLimit, 'SPECIES', 'SPECIES_ID', 'all-species');

//   await MigrateLookupDocuments('legacy.programId', 'program', BuildProgram, DateCompare, strDateCompare, strDateLimit, 'PROGRAMS', 'PROGRAM_ID', 'all-programs');
  
//   //await MigrateLookupDocuments('catch_category_id', 'Catch_Category', BuildCatchCategory, DateCompare, strDateCompare, strDateLimit, 'CATCH_CATEGORIES', 'CATCH_CATEGORY_ID');
  
//   await MigrateLookupDocuments('legacy.vesselId', 'vessel', BuildVessel, DateCompare, strDateCompare, strDateLimit, 'VESSELS', 'VESSEL_ID', 'all-vessels');
  
//   await MigrateLookupDocuments('legacy.contactId', 'contact', BuildContact, DateCompare, strDateCompare, strDateLimit, 'CONTACTS', 'CONTACT_ID', 'all-contacts');

//   //await MigrateLookupDocuments('vessel_contact_id', 'Vessel_Contact', BuildVesselContact, DateCompare, strDateCompare, strDateLimit, 'VESSEL_CONTACTS', 'VESSEL_CONTACT_ID');

//   //strSQL = `SELECT LOOKUP_ID FROM OBSPROD.LOOKUPS WHERE LOOKUPS.CREATED_DATE >= TO_DATE('` + strDateCompare + `', 'yyyy-MM-dd HH24:MI:SS') OR LOOKUPS.MODIFIED_DATE >= TO_DATE('` + strDateCompare + `', 'yyyy-MM-dd HH24:MI:SS')`;
//   //MigrateLookupDocuments('lookup_id', 'Lookup', strSQL, BuildLookup, DateCompare);

//   console.log("Lookup Docs finished at")
//   console.log(new Date().toLocaleTimeString());

//   let lstNewHaulIDs: any[];

//   console.log("Starting Migrate Haul Docs")
//   console.log(new Date().toLocaleTimeString());

//   lstNewHaulIDs = await MigrateHaulDocuments(strDateCompare, strDateLimit);
  
//   console.log("Haul docs finished at")
//   console.log(new Date().toLocaleTimeString());

//   console.log("Starting Migrate Trip Docs")
//   console.log(new Date().toLocaleTimeString());

//   await MigrateTripDocuments(lstNewHaulIDs, strDateCompare, strDateLimit);

//   console.log("Trip docs finished at")
//   console.log(new Date().toLocaleTimeString());

//   return "Success";
  
// }

// async function vReplaceVesselsAndContacts(){
  
//   const dbName = couchDB.use(CouchDBName);
//   let lstDocsToDelete: any[] = []

//   await dbName.view('MainDocs', 'all-vessels', {
//     'include_docs': true
//   }).then((data: any) => {
//     if (data.rows.length > 0){   
//       for(let i = 0; i < data.rows.length; i++){
//         let newDoc: object = {
//           _id: data.rows[i].doc._id,
//           _rev: data.rows[i].doc._rev,
//           type: 'vessel',
//           _deleted: true
//         }
//         // let newDoc = data.rows[i].doc;
//         // newDoc._deleted = true;
//         lstDocsToDelete.push(newDoc);
//       }   
//     }
//   }).catch((error: any) => {
//     console.log(error);
//   });

  
//   await dbName.view('MainDocs', 'all-contacts', {
//     'include_docs': true
//   }).then((data: any) => {
//     if (data.rows.length > 0){   
//       for(let i = 0; i < data.rows.length; i++){
//         // let newDoc = {
//         //   _id: data.rows[i].doc._id,
//         //   _rev: data.rows[i].doc._rev,
//         //   _deleted: true
//         // }
//         let newDoc = data.rows[i].doc;
//         newDoc._deleted = true;
//         lstDocsToDelete.push(newDoc);
//       }   
//     }
//   }).catch((error: any) => {
//     console.log(error);
//   });

//   await dbName.bulk({docs:lstDocsToDelete}).then((body: any) => {
//     console.log(body);
//   });


//   let connWcgop = await OracleConnection();

//   // let strGetVesselIDs = `
//   //   SELECT DISTINCT VESSEL_ID
//   //   FROM OBSPROD.SELECTION_HISTORY JOIN OBSPROD.SELECTION_PERIODS ON SELECTION_HISTORY.SELECTION_PERIOD_ID = SELECTION_PERIODS.SELECTION_PERIOD_ID
//   //   WHERE 
//   //     SELECTION_PERIODS.START_DATE >= '01-JAN-19' AND
//   //     SELECTION_HISTORY.VESSEL_ID IS NOT NULL
//   //   `;
  
//     let strGetVesselIDs = `
//       SELECT DISTINCT VESSEL_ID
//       FROM OBSPROD.VESSELS
//       `;

//   let strGetContactIDs = `
//     SELECT CONTACT_ID
//     FROM OBSPROD.VESSEL_CONTACTS
//     WHERE 
//       VESSEL_CONTACTS.CONTACT_STATUS = 'A' AND 
//       VESSEL_CONTACTS.CONTACT_TYPE IN (1,3)
//     `;

//   let strGetActiveVessels = `
//     SELECT DISTINCT VESSEL_ID
//     FROM OBSPROD.VESSEL_CONTACTS
//     WHERE 
//       VESSEL_CONTACTS.CONTACT_STATUS = 'A'
//     `;

//   let strGetVesselContactsByContactID = `
//     SELECT VESSEL_ID, CONTACT_STATUS
//     FROM OBSPROD.VESSEL_CONTACTS 
//     WHERE 
//       CONTACT_ID = `;

//   let strGetVesselContactsByVesselID = `
//   SELECT VESSEL_ID, CONTACT_STATUS, CONTACT_ID 
//   FROM OBSPROD.VESSEL_CONTACTS 
//   WHERE 
//     CONTACT_ID in (
//       SELECT CONTACT_ID
//       FROM OBSPROD.VESSEL_CONTACTS
//       WHERE 
//         VESSEL_CONTACTS.CONTACT_STATUS = 'A' AND 
//         VESSEL_CONTACTS.CONTACT_TYPE IN (1,3)
//     ) AND
//     VESSEL_ID = `;

//   let lstVesselIDs = await ExecuteOracleSQL(connWcgop, strGetVesselIDs);
//   let lstContactIDs = await ExecuteOracleSQL(connWcgop, strGetContactIDs);
//   let lstActiveVessels = await ExecuteOracleSQL(connWcgop, strGetActiveVessels);
//   let lstNewContacts: VesselCaptain[] = [];

//   for(let i = 0; i < lstContactIDs.length; i++){
//     let newContact: any = await BuildContact(connWcgop, lstContactIDs[i]);
//     newContact.isLegacy = true;    
//     RemoveDocNullVals(newContact);
//     lstNewContacts.push(newContact);
//   };
  
//   await InsertBulkCouchDB(lstNewContacts);
//   let lstNewVessels: Vessel[] = []

//   for(let i = 0; i < lstVesselIDs.length; i++){
//     let newVessel: any = await BuildVessel(connWcgop, lstVesselIDs[i]);
//     if(newVessel.vesselStatus){
//       if(newVessel.vesselStatus.description == 'Active'){
//         newVessel.isActive = true;
//       }
//     }
//     // if(lstActiveVessels.indexOf(lstVesselIDs[i]) > -1){
//     //   newVessel.isActive = true;
//     // }
//     let lstVesselContactData = await ExecuteOracleSQL(connWcgop, strGetVesselContactsByVesselID + lstVesselIDs[i]);
//     let lstCaptains: Person[] = [];

//     for(let i = 0; i < lstVesselContactData.length; i++){
//       if(lstVesselContactData[i][1] == 'A'){
//         let objNewCaptain: Person = await GetDocFromDict(dictContacts, lstVesselContactData[i][2], 'all-contacts', 'MainDocs')
//         RemoveDocNullVals(objNewCaptain);
//         lstCaptains.push(objNewCaptain);
//       }
//     }
//     if(lstCaptains.length > 0){
//       newVessel.captains = lstCaptains;
//     }
    
//     RemoveDocNullVals(newVessel);
//     newVessel._deleted = false;
//     lstNewVessels.push(newVessel);    
//   };

//   console.log('test')
//   await InsertBulkCouchDB(lstNewVessels);
  
//   // let lstContactsToUpdate: any[] = [];
//   // await dbName.view('MainDocs', 'all-contacts', {
//   //   'include_docs': true
//   // }).then((data: any) => {
//   //   if (data.rows.length > 0){   
//   //     for(let i = 0; i < data.rows.length; i++){
//   //       lstContactsToUpdate.push(data.rows[i].doc);
//   //     }   
//   //   }
//   // }).catch((error: any) => {
//   //   console.log(error);
//   // });

//   // for(let i = 0; i < lstContactsToUpdate.length; i++){
//   //   let lstVesselContactData = await ExecuteOracleSQL(connWcgop, strGetVesselContactsByContactID + lstContactsToUpdate[i].legacy.PersonId.toString());

//   //   for(let i = 0; i < lstVesselContactData.length; i++){
//   //     if(lstVesselContactData[i][1] == 'A'){
//   //       let objActiveVessel: Vessel = await GetDocFromDict(dictVessels, lstVesselContactData[i][0], 'all-vessels', 'MainDocs')
//   //       lstContactsToUpdate[i].activeVessel = objActiveVessel;
//   //       lstContactsToUpdate[i].isCaptainActive = true;
//   //       break;
//   //     }
//   //   }
//   // }

//   // await InsertBulkCouchDB(lstContactsToUpdate);
//   await ReleaseOracle(connWcgop);

// }

// async function viewtest(){
    
//   const dbName = couchDB.use('taxonomy-test');
//   let lstDocs: any[] = []

//   // await dbName.view('optecs_trawl', 'all_vessel_names', {
//   await dbName.view('Taxonomy', 'taxonomy-with-no-children-1', {
//     'include_docs': true
//   }).then((data: any) => {
//     if (data.rows.length > 0){   
//       for(let i = 0; i < data.rows.length; i++){
//         lstDocs.push(data.rows[i].doc);
//       }   
//     }
//   }).catch((error: any) => {
//     console.log(error);
//   });


//   let lstIDS: string[] = [];
//   for(let i = 0; i < lstDocs.length; i++){
//     console.log(lstDocs[i].vesselName);
//   }

  
//   // let lstIDS: string[] = [];
//   // for(let i = 0; i < lstDocs.length; i++){
//   //   if(lstIDS.indexOf(lstDocs[i]._id) > -1){
//   //     lstIDS.push(lstDocs[i]._id)
//   //   } else {
//   //     console.log("duplicated doc in view: " + lstDocs[i]._id)
//   //   }
//   // }


// }

// // vReplaceVesselsAndContacts();

// // viewtest();


// // Initialize();
// //TestAllDocs();
// //UpdateCouchIndexes();



// async function RemoveEverything(){

  
//   const dbName = couchDB.use(CouchDBName);
//   let RemoveAll: any = {
//     "_id": "_design/RemoveAll",
//     "views": {
//       "all-docs": {
//         "map": "function (doc) {\r\n  emit(doc._id, doc._rev);\r\n}"
//       }
      
//     },
//     "language": "javascript"
//   }
  
//   await dbName.get('_design/RemoveAll').then((body: any) => {
//     RemoveAll._rev = body._rev;
//   }).catch((error: any) => {
//   });
  
  
//   await dbName.insert(RemoveAll).then((data: any) => {
//     console.log(data)
//   }).catch((error: any) => {
//     console.log("update failed", error, RemoveAll);
  
//   });


//   let lstDocsToDelete: any[] = [];
//   await dbName.view('RemoveAll', 'all-docs', {
//     'include_docs': true
//   }).then((data: any) => {
//     if (data.rows.length > 0){   
//       for(let i = 0; i < data.rows.length; i++){
//         let newDoc = data.rows[i].doc;
//         newDoc._deleted = true;
//         lstDocsToDelete.push(newDoc);
//       }   
//     }
//   }).catch((error: any) => {
//     console.log(error);
//   });

//   await dbName.bulk({docs:lstDocsToDelete}).then((body: any) => {
//     console.log(body);
//   });


// }


// RemoveEverything();






















//   //let NewDoc = await BuildLookup(odb, `'VESSEL_TYPE'`, 'vessel-type')



// //TODO double check all .createdBy  vs .obsprodLoadDate




// //TODO Use cron and get program to run on a self contained timer

// //TODO find module that lets me email myself on run time (success/failure, log)




// //TODO fix insecurity caused by: process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
// //    possible solution to explore: 
// //       https://stackoverflow.com/questions/20433287/node-js-request-cert-has-expired#answer-29397100

