import * as oraclesql from './oracle-sql'
import { ExecuteOracleSQL, RemoveDocNullVals, ReleaseOracle, InsertBulkCouchDB, Transpose, WcgopConnection, CreateWcgopViews, GetDocFromDict, GenerateCouchID, GenerateCouchIDs, RemoveAllFromView } from '../Common/common-functions';
import { UploadedBy, UploadedDate, CreatedDate } from '../Common/common-variables';
import { couchConnection, couchDB } from '../Common/db-connection-variables';
import { BuildTrip } from './build-trip';
import { BuildHaul } from './build-haul';
import { BuildCatch } from './build-catch';
import { BuildPort } from './build-port';
import { BuildProgram } from './build-program';
import { BuildLookups } from './build-lookups';
import { BuildReceiver } from './build-first-receiver';
import { vReplaceVesselsAndContacts } from './build-vessels-and-contacts';
import { MigrateAllWcgopObservers } from '../Lookups/observer-etl';
import { InitializeAllTaxonomyETL } from '../Taxonomy/taxonomy-etl';
import { WcgopCatchGroupingsETL } from '../CatchGroupings/catch-groupings-etl';
import { Program, Species, FirstReceiver, BeaufortTypeName, DiscardReasonTypeName, BiostructureTypeTypeName, BodyLengthTypeName, ConfidenceTypeName, ContactTypeTypeName, ContactCategoryTypeName, InteractionTypeTypeName, InteractionOutcomeTypeName, RelationshipTypeName, TripStatusTypeName, VesselStatusTypeName, VesselTypeTypeName, WaiverTypeTypeName, WeightMethodTypeName, BiosampleSampleMethodTypeName, SpeciesCategoryTypeName, SpeciesSubCategoryTypeName, GearPerformanceTypeName, CatchDispositionTypeName } from '@boatnet/bn-models/lib';
import { BuildAndMigrateWaivers } from './build-wavers';



var dictCatchCat: { [id: number]: any; } = {};
var dictUsers: { [id: number]: any; } = {};
export var dictPorts: { [id: number]: any; } = {};
export var dictProgram: { [id: number]: Program; } = {};
export var dictVessels: { [id: number]: any; } = {};
export var dictContacts: { [id: number]: any; } = {};
export var dictDiscardReasons: { [id: number]: any; } = {};
// export var dictSpecies: { [id: number]: any; } = {};
export var dictTaxonomyAliases: { [id: number]: any; } = {};

export var dictViability: { [id: number]: any; } = {};
export var dictMaturity: { [id: number]: any; } = {};
export var dictRelation: { [id: number]: any; } = {};
export var dictContactCategory: { [id: number]: any; } = {};
export var dictContactType: { [id: number]: any; } = {};
export var dictBiostructureType: { [id: number]: any; } = {};
export var dictVesselType: { [id: number]: any; } = {};
export var dictVesselStatus: { [id: number]: any; } = {};
export var dictTripStatus: { [id: number]: any; } = {};
export var dictHlfcProductDelivery: { [id: number]: any; } = {};
export var dictHlfcMitigationTypes: { [id: number]: any; } = {};
export var dictHlfcAerialEtent: { [id: number]: any; } = {};
export var dictHlfcHorizontalExtent: { [id: number]: any; } = {};
export var dictSpeciesSubCategory: { [id: number]: any; } = {};
export var dictSpeciesCategory: { [id: number]: any; } = {};
export var dictBiospecimenSampleMethod: { [id: number]: any; } = {};
export var dictWeightMethod: { [id: number]: any; } = {};
export var dictDisposition: { [id: number]: any; } = {};
export var dictGearPerformance: { [id: number]: any; } = {};
export var dictGearType: { [id: number]: any; } = {};
export var dictSightingCondition: { [id: number]: any; } = {};
export var dictFishingInteraction: { [id: number]: any; } = {};
export var dictInteractionBehaviors: { [id: number]: any; } = {};
export var dictInteractionOutcome: { [id: number]: any; } = {};
export var dictConfidence: { [id: number]: any; } = {};
export var dictBodyLength: { [id: number]: any; } = {};
export var dictBeaufort: { [id: number]: any; } = {};
export var dictFishery: { [id: number]: any; } = {};
export var dictFirstReceivers: { [id: number]: any; } = {};
export var dictAllBaskets: { [id: number]: any; } = {};
export var dictObservers: { [id: number]: any; } = {};
export var dictWaiverReason: { [id: number]: any; } = {};


// ENTIRE TABLES LOADED INTO MEMORY HERE
// id = table ID, value = array of returned fields (from oraclesql file)
export var dictAllDissections: { [id: number]: any; } = {};
export var dictAllBiospecimenItems: { [id: number]: any; } = {};
export var dictAllBiospecimens: { [id: number]: any; } = {};
export var dictAllLengthFrequencies: { [id: number]: any; } = {};
export var dictAllSpeciesCompositions: { [id: number]: any; } = {};
export var dictAllHlfc: { [id: number]: any; } = {};
export var dictAllSpeciesSightings: { [id: number]: any; } = {};
export var dictAllSpeciesInteractions: { [id: number]: any; } = {};
export var dictAllSpeciesSightingsHaulsXREF: { [id: number]: any; } = {};
export var dictAllFishTickets: { [id: number]: any; } = {};
export var dictAllFishingLocations: { [id: number]: any; } = {};
export var dictAllCatchCategory: { [id: number]: any; } = {};
export var dictAllTripCertificates: { [id: number]: any; } = {};


export var dictAllCatches: { [id: number]: any; } = {};
export var dictAllHauls: { [id: number]: any; } = {};
export var dictAllTrips: { [id: number]: any; } = {};

var moment = require('moment');

var strCatchSQL: string = oraclesql['strCatchSQL']
var strCatchCategorySQL: string = oraclesql['strCatchCategorySQL']
var strContactSQL: string = oraclesql['strContactSQL']
var strHaulSQL: string = oraclesql['strHaulSQL']
var strTripSQL: string = oraclesql['strTripSQL']
var strPortSQL: string = oraclesql['strPortSQL']
var strVesselContactSQL: string = oraclesql['strVesselContactSQL']
var strVesselSQL: string = oraclesql['strVesselSQL']
var strUserSQL: string = oraclesql['strUserSQL']
var strProgramSQL: string = oraclesql['strProgramSQL']
var strLookupSQL: string = oraclesql['strLookupSQL']
var strReceiverSQL: string = oraclesql['strReceiverSQL'];

var strFishTicketSQL: string = oraclesql['strFishTicketSQL']
var strTripCertificateSQL: string = oraclesql['strTripCertificateSQL']
var strHLFCSQL: string = oraclesql['strHLFCSQL']
var strBRDSQL: string = oraclesql['strBRDSQL']
var strSpeciesSightingSQL: string = oraclesql['strSpeciesSightingSQL']


// Setting this process var to "0" is extremely unsafe in most situations, use with care.
// It is unsafe because Node does not like self signed TLS (SSL) certificates, 
// this setting disables Node's rejection of invalid or unauthorized certificates, and allows them.
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
// console.log('CouchDB connection configured successfully.');

export async function FetchRevID(strProperty: string, iOldID: number, ViewName: string) {
    let strDocID;
    let strDocRev;

    await couchConnection.view('wcgop', ViewName, {
        'key': iOldID,
        'include_docs': true
    }).then((data: any) => {
        if (data.rows.length == 0) {
            strDocID = null;
            strDocRev = null;
        }
        else {
            strDocID = data.rows[0].id;
            strDocRev = data.rows[0].value;
        }
    }).catch((error: any) => {
        console.log(error, ViewName, iOldID);
    });


    return [strDocID, strDocRev];
}

async function FetchHaulsAndRevID(iOldTripID: number, ViewName: string) {
    let strDocID;
    let strDocRev;
    let lstHaulIDs;

    await couchConnection.view('wcgop', ViewName, {
        'key': iOldTripID,
        'include_docs': true
    }).then((data: any) => {
        if (data.rows.length == 0) {
            strDocID = null;
            strDocRev = null;
            lstHaulIDs = null;
        }
        else {
            strDocID = data.rows[0].id;
            strDocRev = data.rows[0].value;
            lstHaulIDs = data.rows[0].doc.operationIDs
        }
    }).catch((error: any) => {
        console.log(error, ViewName, iOldTripID);
    });



    // const Params = {
    //   selector: {
    //     'legacy.tripId': { "$eq": iOldTripID}
    //   },
    //   fields: [ "_id", "_rev", "operationIDs"],
    //   limit:50
    // };
    // await dbName.find(Params).then((data: any) => {
    //   //console.log(data);
    //   if (data.docs.length == 0){
    //     strDocID = null;
    //     strDocRev = null;
    //     lstHaulIDs = null;
    //   } 
    //   else {
    //     strDocID = data.docs[0]._id;
    //     strDocRev = data.docs[0]._rev;
    //     lstHaulIDs = data.docs[0].hauls;
    //   }

    // }).catch((error: any) => {
    //   console.log("FetchHaulsandRevID failed", error, OldTripID);
    //   strDocID = null;
    //   strDocRev = null;
    //   lstHaulIDs = null;
    // });

    return [strDocID, strDocRev, lstHaulIDs];
}

// Each function beginning with "Build" refers to a document or sub document built from a table in OBSPROD
async function BuildBRD(odb: any, iBRDID: number) {


}

async function BuildSpecies(odb: any, iSpeciesID: number) {
    if (iSpeciesID != undefined) {
        let SpeciesData = await ExecuteOracleSQL(odb, oraclesql.strSpeciesSQL + iSpeciesID);
        SpeciesData = SpeciesData[0];
        let iUserCreatedByID = SpeciesData[5];
        let iUserModifiedByID = SpeciesData[7];

        let SpeciesCategory = await GetDocFromDict(dictSpeciesCategory, SpeciesData[10], 'species-category-lookup', 'wcgop')
        if (SpeciesCategory != null) {
            SpeciesCategory = {
                description: SpeciesCategory.description,
                _id: SpeciesCategory._id
            }
        }
        let SpeciesSubCategory = await GetDocFromDict(dictSpeciesSubCategory, SpeciesData[11], 'species-sub-category-lookup', 'wcgop')
        if (SpeciesSubCategory != null) {
            SpeciesSubCategory = {
                description: SpeciesSubCategory.description,
                _id: SpeciesSubCategory._id
            }
        }
        let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId'); 
        let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');

        let cSpecies: Species = null;
        // let cSpecies = ConstructSpecies(SpeciesData, SpeciesCategory, SpeciesSubCategory);
        return cSpecies;

    } else {
        return null;
    }
}

// async function BuildUser(odb: any, iUserID: number){
//   let lstUserData;
//   try {
//     if (iUserID != undefined){
//       lstUserData = await ExecuteOracleSQL(odb, strUserSQL + iUserID); 
//       if(lstUserData != null && lstUserData.length != 0){

//         lstUserData = lstUserData[0];
//         let cUser: User.UserWCGOP = User.ConstructUserWCGOP(lstUserData);

//         return cUser;
//       }
//     } else {
//       return null;
//     }
//   } catch (error) {
//     console.log("build user failed", error, lstUserData, iUserID);
//   }
// }


// async function BuildVesselContact(odb: any, iVesselContactID: number){
//   if (iVesselContactID != undefined){
//     let lstVesselContactData = await ExecuteOracleSQL(odb, strVesselContactSQL + iVesselContactID);
//     lstVesselContactData = lstVesselContactData[0];    
//     let iVesselID = lstVesselContactData[1];
//     //let Vessel: Vessel.VesselWCGOP = await BuildVessel(odb, iVesselID);
//     let Vessel;
//     if(iVesselID in dictVessels){
//       Vessel = dictVessels[iVesselID];
//     } else {
//       [,, Vessel] = await FetchDocument('vessel_id', iVesselID);
//       dictVessels[iVesselID] = Vessel;
//     }
//     let iContactID = lstVesselContactData[2];
//     //let ContactUser: Contact.Contact = await BuildContact(odb, iContactID);
//     let Contact;
//     if(iContactID in dictContacts){
//       Contact = dictContacts[iContactID];
//     } else {
//       [,, Contact] = await FetchDocument('contact_id', iContactID);
//       dictContacts[iContactID] = Contact;
//     }
//     let iUserCreatedByID = lstVesselContactData[5];
//     //let CreatedBy: User.UserWCGOP = await BuildUser(odb, iUserCreatedByID);
//     let CreatedBy;
//     if(iUserCreatedByID in dictUsers){
//       CreatedBy = dictUsers[iUserCreatedByID];
//     } else {
//       [,, CreatedBy] = await FetchDocument('user_id', iUserCreatedByID);
//       dictUsers[iUserCreatedByID] = CreatedBy;
//     }
//     let iUserModifiedByID = lstVesselContactData[7];
//     //let ModifiedBy: User.UserWCGOP = await BuildUser(odb, iUserModifiedByID);  
//     let ModifiedBy;
//     if(iUserModifiedByID in dictUsers){
//       ModifiedBy = dictUsers[iUserModifiedByID];
//     } else {
//       [,, ModifiedBy] = await FetchDocument('user_id', iUserModifiedByID);
//       dictUsers[iUserModifiedByID] = ModifiedBy;
//     }

//     let cVesselContact: Vessel_Contact.Vessel_Contact = Vessel_Contact.ConstructVesselContact(lstVesselContactData, CreatedBy, ModifiedBy, Contact, Vessel);
//     return cVesselContact;

//   } else {
//     return null;
//   }

// }

async function MigrateReceivers(strDateBegin: string, strDateEnd: string) {
    let odb = await WcgopConnection();
    let lstRawReceiverIDs = await ExecuteOracleSQL(odb, `SELECT IFQ_DEALER_ID FROM OBSPROD.IFQ_DEALERS`);
    let lstReceiverIDs = [];

    if (lstRawReceiverIDs != null) {
        for (let i = 0; i < lstRawReceiverIDs.length; i++) {
            lstReceiverIDs.push(lstRawReceiverIDs[i][0]);
        }
    }

    let lstReceivers: FirstReceiver[] = [];
    for (let i = 0; i < lstReceiverIDs.length; i++) {

        let NewReceiver = await BuildReceiver(odb, lstReceiverIDs[i]);
        let [strDocID, strDocRev] = await FetchRevID('legacy.ifqDealerId', lstReceiverIDs[i], 'first-receiver-lookup');

        if (strDocID != null) {
            NewReceiver._rev = strDocRev;
        }
        NewReceiver = RemoveDocNullVals(NewReceiver);
        lstReceivers.push(NewReceiver);
    }

    await ReleaseOracle(odb);
    return await InsertBulkCouchDB(lstReceivers);
}

// Function to be used for all look up documents, which Build function to use is passed in as a parameter, making this an easy multi use funtion.
export async function MigrateLookupDocuments(strPropertyID: string, strDocType: string, BuildDocument: Function, DateCompare: Date, strDateBegin: string, strDateEnd: string, strTableName: string, strTableID: string, ViewName: string) {

    let strSQL: string = oraclesql.AllNewAndModifiedLookups(strTableID, strTableName, strDateBegin, strDateEnd);
    let odb = await WcgopConnection(); // must be done syncronously
    let lstRawDocumentIDs = await ExecuteOracleSQL(odb, strSQL);
    let lstDocumentIDs = [];

    if (lstRawDocumentIDs != null) {
        for (let i = 0; i < lstRawDocumentIDs.length; i++) {
            lstDocumentIDs.push(lstRawDocumentIDs[i][0]);
        }
    }
    let lstDocuments = [];
    for (let i = 0; i < lstDocumentIDs.length; i++) {
        let iDocumentID = lstDocumentIDs[i];
        let cDocument = await BuildDocument(odb, iDocumentID);
        cDocument = RemoveDocNullVals(cDocument);
        // If record is newly created, add to list to be inserted in bulk
        if ((moment(cDocument.createdDate, moment.ISO_8601) > moment(DateCompare, moment.ISO_8601)) || (moment(cDocument.legacy.obsprodLoadDate, moment.ISO_8601) > moment(DateCompare, moment.ISO_8601))) {
            let [strDocID, strDocRev] = await FetchRevID(strPropertyID, iDocumentID, ViewName);
            if (strDocID == null) {
                lstDocuments.push(cDocument)
            }
        }
        else if (moment(cDocument.updatedDate, moment.ISO_8601) > moment(DateCompare, moment.ISO_8601)) {
            // Else already exists in couch, recreate it
            let [strDocID, strDocRev] = await FetchRevID(strPropertyID, iDocumentID, ViewName);
            cDocument = JSON.parse(JSON.stringify(cDocument));
            cDocument._id = strDocID;
            cDocument._rev = strDocRev;
            cDocument = RemoveDocNullVals(cDocument);
            await InsertBulkCouchDB([cDocument]); // todo double check, may just be able to bulk insert with the rest
        }
        else {
            // Should never reach this. 
            console.log("Error: Document neither newly created or modified, something is wrong. document type = " + strDocType + " document id = " + iDocumentID)
        }
    }
    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstDocuments);
}

// Haul logic is done in one single loop through a join of Haul and Catch records,
// ordered by TripID then HaulID, to group all hauls together under each trip.
// The trip ID and list of Hauls per Trip are added to an array to be used as a parameter for Trip ETL,
// as this gives a simple indicator on which Trips to rebuild, as well as easily keeps on hand the list of 
// couch IDs for the respective hauls.
// Because a Haul doc must be rebuilt if there is a single new or updated Catch, every single record returned
// correlates to a doc to build, so the Haul docs are built first, then a check is made whether to insert or update. 
async function MigrateHaulDocuments(strDateBegin: string, strDateEnd: string) {
    let DateCompare = new Date(strDateBegin);
    let strSQL = oraclesql.AllNewAndModifiedHauls(strDateBegin, strDateEnd);
    let odb = await WcgopConnection();
    let HaulandCatchIDs = await ExecuteOracleSQL(odb, strSQL);
    let iCatchID, iLastTripID, iLastHaulID;
    let lstNewHaulIDs = [], lstCreatedHauls = [], lstModifiedHauls = [], lstHaulIDs = [], lstCatches = [];
    let iTripID, iHaulID;

    if (HaulandCatchIDs.length > 0) {
        iTripID = HaulandCatchIDs[0][0];
        iHaulID = HaulandCatchIDs[0][1];
    }

    for (let i = 0; i < HaulandCatchIDs.length; i++) {
        iLastTripID = iTripID;
        iLastHaulID = iHaulID;
        iTripID = HaulandCatchIDs[i][0], iHaulID = HaulandCatchIDs[i][1], iCatchID = HaulandCatchIDs[i][2];

        // if this record is new trip, build last haul, bulk insert all hauls, save list of Couch IDs along side Trip ID
        if (iTripID != iLastTripID || i == HaulandCatchIDs.length - 1) {
            let cHaul = await BuildHaul(odb, iLastHaulID, lstCatches);
            cHaul = RemoveDocNullVals(cHaul);
            let [strDocID, strDocRev] = await FetchRevID("legacy.operationId", cHaul.legacy.fishingActivityId, 'all-operations');

            if (strDocID == null) {
                lstCreatedHauls.push(cHaul);
            } else {
                cHaul._id = strDocID;
                cHaul._rev = strDocRev;
                lstModifiedHauls.push(cHaul);
            }

            lstHaulIDs = await InsertBulkCouchDB(lstCreatedHauls);
            await InsertBulkCouchDB(lstModifiedHauls);
            console.log(lstHaulIDs)
            console.log(lstModifiedHauls)
            console.log(lstCreatedHauls)
            lstNewHaulIDs.push([iLastTripID, lstHaulIDs]);
            lstCreatedHauls = [], lstModifiedHauls = [], lstHaulIDs = [], lstCatches = [];
        }
        // if this record is new haul, construct last haul, insert into couch, create new catch list
        else if (iHaulID != iLastHaulID) {
            let cHaul = await BuildHaul(odb, iLastHaulID, lstCatches);
            cHaul = RemoveDocNullVals(cHaul);
            let [strDocID, strDocRev] = await FetchRevID("legacy.operationId", cHaul.legacy.fishingActivityId, 'all-operations');
            if (true) { //FIX THIS LATER BACK TO strDocID == null
                lstCreatedHauls.push(cHaul);
            } else {
                cHaul._id = strDocID;
                cHaul._rev = strDocRev;
                lstModifiedHauls.push(cHaul);
            }
            lstCatches = [];
        }
        if (iCatchID != null) {
            let cCatch = await BuildCatch(odb, iCatchID)
            lstCatches.push(cCatch);
        }
    }
    await ReleaseOracle(odb);
    return lstNewHaulIDs;
}

// Trip logic is done in two sections. Creation and then modified, unlike hauls where both were done simultaneously. Create is straightforward, update is more complex.
// The basic logic is that a list of all trips that have been modified (if there are any) are concatenated together with a list (returned from MigrateHauls) 
// of trip ids that have had new hauls added. The passed in list is of length-2 arrays, position [0] is the OBSPROD trip ID, position [1] is a list of couch haul IDs. 
// This 2d array is transposed to obtain a single dimensional array of just the trip IDs, of which is concatenated with the list of modified trips. 
// This combined list is then looped through, each iteration making a request from couchdb to obtain the list of hauls already in the trip document (if it exists), 
// then combining that list with the new list (if it exists), then rebuilds the trip document and updates.  
async function MigrateTripDocuments(lstNewTripHauls: any[], strDateBegin: string, strDateEnd: string) {
    let strSQL = oraclesql.AllNewTripsSQL(strDateBegin, strDateEnd);
    let odb = await WcgopConnection();
    // Create 
    let lstRawNewTripIDs = await ExecuteOracleSQL(odb, strSQL);
    let lstNewTripIDs = [], lstTrips = [];
    // this is just to get all the IDs into a 1d array, as Oracle does not return it in the format needed here
    if (lstRawNewTripIDs != null) {
        for (let i = 0; i < lstRawNewTripIDs.length; i++) {
            lstNewTripIDs.push(lstRawNewTripIDs[i][0]);
        }
    }
    for (let i = 0; i < lstNewTripIDs.length; i++) {
        let cTrip = await BuildTrip(odb, lstNewTripIDs[i], []);
        cTrip = RemoveDocNullVals(cTrip);
        lstTrips.push(cTrip);

        if (100 % i == 1 || i == lstNewTripIDs.length - 1) {
            await InsertBulkCouchDB(lstTrips);
        }
    }

    // Set up update 
    strSQL = oraclesql.AllModifiedTripsSQL(strDateBegin, strDateEnd);
    let lstRawModifiedTripIDs = await ExecuteOracleSQL(odb, strSQL); // must be done syncronously  
    await ReleaseOracle(odb);
    let lstModifiedTripIDs = [];

    // get all the IDs returned by oracle into a 1d array for ease of use
    if (lstRawModifiedTripIDs != null) {
        for (let i = 0; i < lstRawModifiedTripIDs.length; i++) {
            lstModifiedTripIDs.push(lstRawModifiedTripIDs[i][0]);
        }
    }
    // Gets the trip ids from passed in list into 1d array
    var lstTripIDsWithNewHauls: any[];
    if (lstNewTripHauls.length > 0) {
        lstTripIDsWithNewHauls = Transpose(lstNewTripHauls);
        lstTripIDsWithNewHauls = lstTripIDsWithNewHauls[0];
    } else {
        lstTripIDsWithNewHauls = [];
    }
    // Merge lists, using a Set to get ensure no duplicates
    let lstTripIDsMerged = Array.from(new Set(lstTripIDsWithNewHauls.concat(lstModifiedTripIDs)));

    // Ensure trip index is finished updating before doing updates by ensuring there is no timeout error
    let bIndexUpdated = false;
    while (bIndexUpdated == false && lstTripIDsMerged.length != 0) {
        let [strDocID, ,] = await FetchHaulsAndRevID(lstTripIDsMerged[0], 'all-trips');
        if (strDocID != null) {
            bIndexUpdated = true;
        }
    }
    // Actual update logic
    // By this point, all trips in OBSPROD should exist in Couch, thus, every one of IDs represents an update that must happen.
    for (let i = 0; i < lstTripIDsMerged.length; i++) {
        let iTripID = lstTripIDsMerged[i];
        let [strDocID, strDocRev, lstCurrentHaulIDs] = await FetchHaulsAndRevID(iTripID, 'all-trips');

        // Simple check to ensure it exists, but SHOULD never be null
        if (strDocID != null) {
            let lstNewHauls;
            // Checks if ID has new hauls or not, then gets the index of where the haul is in the list, or defines the variable as empty if not, ensuring the concat works.
            let iIndexForHauls = lstTripIDsWithNewHauls.indexOf(iTripID);
            if (iIndexForHauls > -1) {
                lstNewHauls = lstNewTripHauls[iIndexForHauls][1];
            } else {
                lstNewHauls = [];
            }
            let lstHaulIDsMerged: string[] = Array.from(new Set(lstNewHauls.concat(lstCurrentHaulIDs)));
            console.log()
            let cTrip = await BuildTrip(odb, iTripID, lstHaulIDsMerged);
            JSON.parse(JSON.stringify(cTrip));
            cTrip._id = strDocID;
            cTrip._rev = strDocRev;
            cTrip = RemoveDocNullVals(cTrip);
            console.log()
            InsertBulkCouchDB([cTrip]);
        }
        else {
            console.log("document doesnt exist, trip id = " + iTripID, "docID = " + strDocID);
        }
    }
}

async function MigrateAllFromLookupTable(strDateBegin: string, strDateEnd: string, DateCompare: Date) {
    let odb = await WcgopConnection();
    let AllLookupDocs: any = [];

    let Docs: any = await BuildLookups(odb, 'BEAUFORT_VALUE', BeaufortTypeName, strDateBegin, strDateEnd, DateCompare, 'beaufort-lookup');
    //AllLookupDocs.push(Doc);
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'DISCARD_REASON', DiscardReasonTypeName, strDateBegin, strDateEnd, DateCompare, 'discard-reason-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'DISSECTION_TYPE', BiostructureTypeTypeName, strDateBegin, strDateEnd, DateCompare, 'biostructure-type-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'BODY_LENGTH', BodyLengthTypeName, strDateBegin, strDateEnd, DateCompare, 'body-length-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'CONFIDENCE', ConfidenceTypeName, strDateBegin, strDateEnd, DateCompare, 'confidence-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'CONTACT_TYPE', ContactTypeTypeName, strDateBegin, strDateEnd, DateCompare, 'contact-type-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'CONTACT_CATEGORY', ContactCategoryTypeName, strDateBegin, strDateEnd, DateCompare, 'contact-category-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'INTERACTION_BEHAVIOR', InteractionTypeTypeName, strDateBegin, strDateEnd, DateCompare, 'interaction-type-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'INTERACTION_OUTCOME', InteractionOutcomeTypeName, strDateBegin, strDateEnd, DateCompare, 'interaction-outcome-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'RELATIONSHIP', RelationshipTypeName, strDateBegin, strDateEnd, DateCompare, 'relationship-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'TRIP_STATUS', TripStatusTypeName, strDateBegin, strDateEnd, DateCompare, 'trip-status-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'VESSEL_STATUS', VesselStatusTypeName, strDateBegin, strDateEnd, DateCompare, 'vessel-status-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'VESSEL_TYPE', VesselTypeTypeName, strDateBegin, strDateEnd, DateCompare, 'vessel-type-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'WAIVER_TYPE', WaiverTypeTypeName, strDateBegin, strDateEnd, DateCompare, 'waiver-type-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'WEIGHT_METHOD', WeightMethodTypeName, strDateBegin, strDateEnd, DateCompare, 'weight-method-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'BS_SAMPLE_METHOD', BiosampleSampleMethodTypeName, strDateBegin, strDateEnd, DateCompare, 'biospecimen-sample-method-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'SPECIES_CATEGORY', SpeciesCategoryTypeName, strDateBegin, strDateEnd, DateCompare, 'species-category-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'SPECIES_SUB_CATEGORY', SpeciesSubCategoryTypeName, strDateBegin, strDateEnd, DateCompare, 'species-sub-category-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'GEAR_PERFORMANCE', GearPerformanceTypeName, strDateBegin, strDateEnd, DateCompare, 'gear-performance-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'CATCH_DISPOSITION', CatchDispositionTypeName, strDateBegin, strDateEnd, DateCompare, 'catch-disposition-lookup');
    await InsertBulkCouchDB(Docs);

    //console.log(GearTypeTypeName); i have no idea why this is undefined
    Docs = await BuildLookups(odb, 'TRAWL_GEAR_TYPE', 'gear-type', strDateBegin, strDateEnd, DateCompare, 'gear-type-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'FG_GEAR_TYPE', 'gear-type', strDateBegin, strDateEnd, DateCompare, 'gear-type-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'SIGHTING_CONDITION', 'sighting-condition', strDateBegin, strDateEnd, DateCompare, 'sighting-condition-lookup');
    await InsertBulkCouchDB(Docs);


    Docs = await BuildLookups(odb, 'FISHING_INTERACTION', 'interaction-type', strDateBegin, strDateEnd, DateCompare, 'interaction-type-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'INTERACTION_BEHAVIOR', 'behavior-type', strDateBegin, strDateEnd, DateCompare, 'behavior-type-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'FISHERY', 'fishery', strDateBegin, strDateEnd, DateCompare, 'fishery-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'WAIVER_REASON', 'waiver-reason', strDateBegin, strDateEnd, DateCompare, 'waiver-reason-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'VIABILITY', 'viability', strDateBegin, strDateEnd, DateCompare, 'viability-lookup');
    await InsertBulkCouchDB(Docs);

    Docs = await BuildLookups(odb, 'MATURITY', 'maturity', strDateBegin, strDateEnd, DateCompare, 'maturity-lookup');
    await InsertBulkCouchDB(Docs);

    await ReleaseOracle(odb);

}

async function FillDictionaryWithTable(dictToFill: { [id: number]: any; }, TableData: any) {
    for (let i = 0; i < TableData.length; i++) {
        dictToFill[TableData[i][0]] = TableData[i];
    }
}

// No longer use, passing in each list led to memory leak / running out due to list passing by value rather than ref
function FillDictByForeignKey(dictToFill: { [id: number]: any; }, TableData: any, iForeignKeyPosition: number) {

    for (let i = 0; i < TableData.length; i++) {
        let ForeignKey = TableData[i][iForeignKeyPosition];
        if (ForeignKey in dictToFill) {
            dictToFill[ForeignKey].push(TableData[i]);
        } else {
            dictToFill[ForeignKey] = [TableData[i]];
        }
    }
}

async function LoadTablesIntoMemory(strDateBegin: string, strDateEnd: string) {
    let odb = await WcgopConnection();

    let DissectionsSQL = oraclesql.DissectionsTableSQL(strDateBegin, strDateEnd);
    console.log(DissectionsSQL)
    console.log()
    let DissectionData: any = await ExecuteOracleSQL(odb, DissectionsSQL);
    //FillDictByForeignKey(dictAllDissections, DissectionData, 1);
    for (let i = 0; i < DissectionData.length; i++) {
        let ForeignKey = DissectionData[i][1];
        if (ForeignKey in dictAllDissections) {
            dictAllDissections[ForeignKey].push(DissectionData[i]);
        } else {
            dictAllDissections[ForeignKey] = [DissectionData[i]];
        }
    }
    DissectionData = null;
    console.log('Dissection by BSI dict length = ' + Object.keys(dictAllDissections).length);
    console.log(new Date().toLocaleTimeString());


    let BiospecimenItemsSQL = oraclesql.BioSpecimenItemsTableSQL(strDateBegin, strDateEnd);
    let BiospecimenItemsData: any = await ExecuteOracleSQL(odb, BiospecimenItemsSQL);
    //FillDictByForeignKey(dictAllBiospecimenItems, BiospecimenItemsData, 1);  
    for (let i = 0; i < BiospecimenItemsData.length; i++) {
        let ForeignKey = BiospecimenItemsData[i][1];
        if (ForeignKey in dictAllBiospecimenItems) {
            dictAllBiospecimenItems[ForeignKey].push(BiospecimenItemsData[i]);
        } else {
            dictAllBiospecimenItems[ForeignKey] = [BiospecimenItemsData[i]];
        }
    }
    console.log('BSI by BS dict length = ' + Object.keys(dictAllBiospecimenItems).length);
    console.log(new Date().toLocaleTimeString());

    BiospecimenItemsData = null;


    let BiospecimensSQL = oraclesql.BioSpecimensTableSQL(strDateBegin, strDateEnd);
    let BiospecimensData: any = await ExecuteOracleSQL(odb, BiospecimensSQL);
    //FillDictByForeignKey(dictAllBiospecimens, BiospecimensData, 1);
    for (let i = 0; i < BiospecimensData.length; i++) {
        let ForeignKey = BiospecimensData[i][1];
        if (ForeignKey in dictAllBiospecimens) {
            dictAllBiospecimens[ForeignKey].push(BiospecimensData[i]);
        } else {
            dictAllBiospecimens[ForeignKey] = [BiospecimensData[i]];
        }
    }

    console.log('BS by catch dict length = ' + Object.keys(dictAllBiospecimens).length);
    console.log(new Date().toLocaleTimeString());
    BiospecimensData = null;


    let LengthFrequenciesSQL = oraclesql.LengthFrequenciesTableSQL(strDateBegin, strDateEnd);
    let LengthFrequenciesData: any = await ExecuteOracleSQL(odb, LengthFrequenciesSQL);
    //FillDictByForeignKey(dictAllLengthFrequencies, LengthFrequenciesData, 10);
    for (let i = 0; i < LengthFrequenciesData.length; i++) {
        let ForeignKey = LengthFrequenciesData[i][10];
        if (ForeignKey in dictAllLengthFrequencies) {
            dictAllLengthFrequencies[ForeignKey].push(LengthFrequenciesData[i]);
        } else {
            dictAllLengthFrequencies[ForeignKey] = [LengthFrequenciesData[i]];
        }
    }

    console.log('LF by BS dict length = ' + Object.keys(dictAllLengthFrequencies).length);
    console.log(new Date().toLocaleTimeString());
    LengthFrequenciesData = null;


    let SpeciesCompSQL = oraclesql.SpeciesCompositionsAndItemsTableSQL(strDateBegin, strDateEnd);
    let SpeciesCompData: any = await ExecuteOracleSQL(odb, SpeciesCompSQL);
    //FillDictByForeignKey(dictAllSpeciesCompositions, SpeciesCompData, 1);
    for (let i = 0; i < SpeciesCompData.length; i++) {
        let ForeignKey = SpeciesCompData[i][1];
        if (ForeignKey in dictAllSpeciesCompositions) {
            dictAllSpeciesCompositions[ForeignKey].push(SpeciesCompData[i]);
        } else {
            dictAllSpeciesCompositions[ForeignKey] = [SpeciesCompData[i]];
        }
    }
    console.log('species comp/items by catch dict length = ' + Object.keys(dictAllSpeciesCompositions).length);
    console.log(new Date().toLocaleTimeString());
    SpeciesCompData = null;

    let FishingLocationsSQL = oraclesql.FishingLocationsTableSQL();
    let FishingLocationsData: any = await ExecuteOracleSQL(odb, FishingLocationsSQL);
    //FillDictByForeignKey(dictAllFishingLocations, FishingLocationsData, 1);

    for (let i = 0; i < FishingLocationsData.length; i++) {
        let ForeignKey = FishingLocationsData[i][1];
        if (ForeignKey in dictAllFishingLocations) {
            dictAllFishingLocations[ForeignKey].push(FishingLocationsData[i]);
        } else {
            dictAllFishingLocations[ForeignKey] = [FishingLocationsData[i]];
        }
    }

    console.log('fishing locations by haul dict length = ' + Object.keys(dictAllFishingLocations).length);
    console.log(new Date().toLocaleTimeString());

    FishingLocationsData = null;


    let BasketsSQL = oraclesql.strSpeciesCompBasketsSQL;
    let BasketData: any = await ExecuteOracleSQL(odb, BasketsSQL);
    //FillDictByForeignKey(dictAllFishingLocations, FishingLocationsData, 1);

    for (let i = 0; i < BasketData.length; i++) {
        let ForeignKey = BasketData[i][1];
        if (ForeignKey in dictAllBaskets) {
            dictAllBaskets[ForeignKey].push(BasketData[i]);
        } else {
            dictAllBaskets[ForeignKey] = [BasketData[i]];
        }
    }

    oraclesql.strSpeciesCompBasketsSQL



    // TABLES FOR TRIP DATA =============================



    let strSpeciesSightinsSQL = oraclesql.SpeciesSightingsTableSQL();
    let SpeciesSightingData: any = await ExecuteOracleSQL(odb, strSpeciesSightinsSQL);
    //FillDictByForeignKey(dictAllSpeciesSightings, SpeciesSightingData, 1);


    for (let i = 0; i < SpeciesSightingData.length; i++) {
        let ForeignKey = SpeciesSightingData[i][1];
        if (ForeignKey in dictAllSpeciesSightings) {
            dictAllSpeciesSightings[ForeignKey].push(SpeciesSightingData[i]);
        } else {
            dictAllSpeciesSightings[ForeignKey] = [SpeciesSightingData[i]];
        }
    }

    for (let i = 0; i < SpeciesSightingData.length; i++) {
        if (!(SpeciesSightingData[i][1] in dictAllSpeciesSightings)) {
            console.log('trip id = ' + SpeciesSightingData[i][1] + ' is not in dictionary');
        }
    }

    console.log('species sightings by trip dict length = ' + Object.keys(dictAllSpeciesSightings).length);
    console.log(new Date().toLocaleTimeString());
    SpeciesSightingData = null;


    let strSpeciesInteractionsSQL = oraclesql.SpeciesInteractionsTableSQL();
    let SpeciesInteractionData: any = await ExecuteOracleSQL(odb, strSpeciesInteractionsSQL);
    //FillDictByForeignKey(dictAllSpeciesInteractions, SpeciesInteractionData, 1);
    for (let i = 0; i < SpeciesInteractionData.length; i++) {
        let ForeignKey = SpeciesInteractionData[i][1];
        if (ForeignKey in dictAllSpeciesInteractions) {
            dictAllSpeciesInteractions[ForeignKey].push(SpeciesInteractionData[i]);
        } else {
            dictAllSpeciesInteractions[ForeignKey] = [SpeciesInteractionData[i]];
        }
    }

    console.log('species interactions by sighting dict length = ' + Object.keys(dictAllSpeciesInteractions).length);
    console.log(new Date().toLocaleTimeString());
    SpeciesInteractionData = null;


    // let strSpeciesInteractionHaulsXREFSQL = SpeciesInteractionHaulsXREFTableSQL();
    // let SpeciesInteractionHaulsXREFData: any = await ExecuteOracleSQL(odb, strSpeciesInteractionHaulsXREFSQL);

    // iLastSpeciesSightingID = SpeciesInteractionHaulsXREFData[0][1];
    // iCurrentSpeciesSightingID = SpeciesInteractionHaulsXREFData[0][1];
    // let lstSpeciesIntractionHaulsXREFBySightingID: any = [];

    // for ( let i = 1; i <= SpeciesInteractionHaulsXREFData.length; i++){
    //   iLastSpeciesSightingID = iCurrentSpeciesSightingID;
    //   iCurrentSpeciesSightingID = SpeciesInteractionHaulsXREFData[i-1][1];

    //   if (iCurrentSpeciesSightingID != iLastSpeciesSightingID || i == SpeciesInteractionHaulsXREFData.length){
    //     dictAllSpeciesSightingsHaulsXREF[iLastSpeciesSightingID] = lstSpeciesIntractionHaulsXREFBySightingID;
    //     lstSpeciesIntractionHaulsXREFBySightingID = [];
    //   } 
    //   else {
    //     lstSpeciesIntractionHaulsXREFBySightingID.push(SpeciesInteractionHaulsXREFData[i-1]);
    //   }
    // }
    // SpeciesInteractionHaulsXREFData = null; 


    let strFishTicketSQL = oraclesql.FishTicketsTableSQL();
    let FishTicketData: any = await ExecuteOracleSQL(odb, strFishTicketSQL);
    //FillDictByForeignKey(dictAllFishTickets, FishTicketData, 6);

    for (let i = 0; i < FishTicketData.length; i++) {
        let ForeignKey = FishTicketData[i][6];
        if (ForeignKey in dictAllFishTickets) {
            dictAllFishTickets[ForeignKey].push(FishTicketData[i]);
        } else {
            dictAllFishTickets[ForeignKey] = [FishTicketData[i]];
        }
    }
    for (let i = 0; i < FishTicketData.length; i++) {
        if (!(FishTicketData[i][6] in dictAllFishTickets)) {
            console.log('trip id = ' + FishTicketData[i][6] + ' is not in dictionary');
        }
    }
    console.log('fish tickets by trip dict length = ' + Object.keys(dictAllFishTickets).length);
    console.log(new Date().toLocaleTimeString());

    FishTicketData = null;


    let HlfcSQL = oraclesql.HlfcTableSQL();
    let HlfcData: any = await ExecuteOracleSQL(odb, HlfcSQL);
    //FillDictByForeignKey(dictAllHlfc, HlfcData, 1);
    for (let i = 0; i < HlfcData.length; i++) {
        let ForeignKey = HlfcData[i][1];
        if (ForeignKey in dictAllHlfc) {
            dictAllHlfc[ForeignKey].push(HlfcData[i]);
        } else {
            dictAllHlfc[ForeignKey] = [HlfcData[i]];
        }
    }

    console.log('HLFC by trip dict length = ' + Object.keys(dictAllHlfc).length);
    console.log(new Date().toLocaleTimeString());

    HlfcData = null;


    

    let TripCertificateSQL: string = oraclesql.TripCertificateTableSQL();
    let TripCertificateData: any = await ExecuteOracleSQL(odb, TripCertificateSQL);
    //FillDictByForeignKey(dictAllHlfc, HlfcData, 1);
    for (let i = 0; i < TripCertificateData.length; i++) {
        let ForeignKey = TripCertificateData[i][1];
        if (ForeignKey in dictAllTripCertificates) {
            dictAllTripCertificates[ForeignKey].push(TripCertificateData[i]);
        } else {
            dictAllTripCertificates[ForeignKey] = [TripCertificateData[i]];
        }
    }

    console.log('Trip Certificates by trip id dict length = ' + Object.keys(dictAllTripCertificates).length);
    console.log(new Date().toLocaleTimeString());

    TripCertificateData = null;


    let CatchesSQL = oraclesql.CatchesTableSQL(strDateBegin, strDateEnd);
    let CatchesData: any = await ExecuteOracleSQL(odb, CatchesSQL);
    FillDictionaryWithTable(dictAllCatches, CatchesData);
    CatchesData = null;

    let HaulSQL = oraclesql.HaulsTableSQL(strDateBegin, strDateEnd);
    let HaulData: any = await ExecuteOracleSQL(odb, HaulSQL);
    FillDictionaryWithTable(dictAllHauls, HaulData);
    HaulData = null;

    let TripSQL = oraclesql.TripTableSQL(strDateBegin, strDateEnd);
    let TripData: any = await ExecuteOracleSQL(odb, TripSQL);
    FillDictionaryWithTable(dictAllTrips, TripData);
    TripData = null;


    console.log(dictAllTrips)
    // //let CatchCatSQL = 
    // let CatchCatData: any = await ExecuteOracleSQL(odb, strCatchCategorySQL);
    // FillDictionaryWithTable(dictAllCatchCategory, CatchCatData);
    // CatchCatData = null;

    await ReleaseOracle(odb);

}

async function InitializeWcgopETL() {
    // format = yyy-MM-dd HH24:MI:SS is used from the database

    // let strDateCompare = '2019-04-19 13:31:00';
    // let DateCompare = new Date(strDateCompare);
    // let strDateLimit = '2019-04-23 9:18:00';

    let strDateCompare: string = '2017-01-01 00:00:00';
    let DateCompare: Date = new Date(strDateCompare);
    console.log(CreatedDate);
    // console.log(moment().toISOString(true))
    let strDateLimit: string = CreatedDate;
    //strDateLimit = moment(CreatedDate, moment.ISO_8601).format('YYYY-MM-DD HH:mm:ss');
    strDateLimit = '2018-01-01 00:00:00';
    console.log('stop here');

    // if (new Date('2014-08-05T18:33:30.069Z') > DateCompare){
    //   console.log('success')
    // } else {
    //   console.log('no fail')
    // }

    console.log("Initializing Wcgop ETL")
    console.log("Start Time: ")
    console.log(new Date().toLocaleTimeString());


    //none of these tables are looips
    await LoadTablesIntoMemory(strDateCompare, strDateLimit);

    console.log("Tables loaded into memory")
    console.log(new Date().toLocaleTimeString());

    console.log("Views created, beginning lookup table records")
    console.log(new Date().toLocaleTimeString());



    //await MigrateLookupDocuments('user_id', 'User', BuildUser, DateCompare, strDateCompare, strDateLimit, 'USERS', 'USER_ID');

    //////await MigrateLookupDocuments('legacy.portId', 'port', BuildPort, DateCompare, strDateCompare, strDateLimit, 'PORTS', 'PORT_ID', 'all-ports');

    //////let receiverids = await MigrateReceivers(strDateCompare, strDateLimit);
    //console.log(receiverids[0], receiverids[1])

    // await MigrateLookupDocuments('legacy.speciesId', 'species', BuildSpecies, DateCompare, strDateCompare, strDateLimit, 'SPECIES', 'SPECIES_ID', 'all-species');

    //await MigrateLookupDocuments('legacy.speciesId', 'species', BuildSpecies, DateCompare, strDateCompare, strDateLimit, 'SPECIES', 'SPECIES_ID', 'all-species');

    ////////await MigrateLookupDocuments('legacy.programId', 'program', BuildProgram, DateCompare, strDateCompare, strDateLimit, 'PROGRAMS', 'PROGRAM_ID', 'all-programs');

    //await MigrateLookupDocuments('catch_category_id', 'Catch_Category', BuildCatchCategory, DateCompare, strDateCompare, strDateLimit, 'CATCH_CATEGORIES', 'CATCH_CATEGORY_ID');

    //   await MigrateLookupDocuments('legacy.vesselId', 'vessel', BuildVessel, DateCompare, strDateCompare, strDateLimit, 'VESSELS', 'VESSEL_ID', 'all-vessels');

    // await MigrateLookupDocuments('legacy.contactId', 'contact', BuildContact, DateCompare, strDateCompare, strDateLimit, 'CONTACTS', 'CONTACT_ID', 'all-contacts');

    //await MigrateLookupDocuments('vessel_contact_id', 'Vessel_Contact', BuildVesselContact, DateCompare, strDateCompare, strDateLimit, 'VESSEL_CONTACTS', 'VESSEL_CONTACT_ID');

    //strSQL = `SELECT LOOKUP_ID FROM OBSPROD.LOOKUPS WHERE LOOKUPS.CREATED_DATE >= TO_DATE('` + strDateCompare + `', 'yyyy-MM-dd HH24:MI:SS') OR LOOKUPS.MODIFIED_DATE >= TO_DATE('` + strDateCompare + `', 'yyyy-MM-dd HH24:MI:SS')`;
    //MigrateLookupDocuments('lookup_id', 'Lookup', strSQL, BuildLookup, DateCompare);





    // await vReplaceVesselsAndContacts();

    // await MigrateAllWcgopObservers();

    // await BuildAndMigrateWaivers();





    console.log("Lookup Docs finished at")
    console.log(new Date().toLocaleTimeString());

    let lstNewHaulIDs: any[];

    console.log("Starting Migrate Haul Docs")
    console.log(new Date().toLocaleTimeString());

    lstNewHaulIDs = await MigrateHaulDocuments(strDateCompare, strDateLimit);

    console.log("Haul docs finished at")
    console.log(new Date().toLocaleTimeString());

    console.log("Starting Migrate Trip Docs")
    console.log(new Date().toLocaleTimeString());

    await MigrateTripDocuments(lstNewHaulIDs, strDateCompare, strDateLimit);

    console.log("Trip docs finished at")
    console.log(new Date().toLocaleTimeString());

    return "Success";

}


async function viewtest() {

    let lstDocs: any[] = []

    // await dbName.view('optecs_trawl', 'all_vessel_names', {
    await couchConnection.view('Taxonomy', 'taxonomy-with-no-children-1', {
        'include_docs': true
    }).then((data: any) => {
        if (data.rows.length > 0) {
            for (let i = 0; i < data.rows.length; i++) {
                lstDocs.push(data.rows[i].doc);
            }
        }
    }).catch((error: any) => {
        console.log(error);
    });


    let lstIDS: string[] = [];
    for (let i = 0; i < lstDocs.length; i++) {
        console.log(lstDocs[i].vesselName);
    }


    // let lstIDS: string[] = [];
    // for(let i = 0; i < lstDocs.length; i++){
    //   if(lstIDS.indexOf(lstDocs[i]._id) > -1){
    //     lstIDS.push(lstDocs[i]._id)
    //   } else {
    //     console.log("duplicated doc in view: " + lstDocs[i]._id)
    //   }
    // }


}

// vReplaceVesselsAndContacts();

// viewtest();



// RemoveAllFromView('Taxonomy', 'catch-grouping-by-catch-category-id');

// WcgopCatchGroupingsETL();



//InitializeWcgopETL();










//TestAllDocs();
//UpdateCouchIndexes();






//TODO double check all .createdBy  vs .obsprodLoadDate

//TODO find module that lets me email myself on run time (success/failure, log)


//TODO fix insecurity caused by: process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
//    possible solution to explore: 
//       https://stackoverflow.com/questions/20433287/node-js-request-cert-has-expired#answer-29397100

