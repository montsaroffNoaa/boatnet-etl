import { AllHaulsSQL, AllCruisesSQL, strAllSpeciesSQL } from './norpac-sql';
import { AshopTrip, AshopCruise } from '../../../boatnet/libs/bn-models/models/ashop/'
import { ExecuteOracleSQL, InsertBulkCouchDB, ReleaseOracle, RemoveDocNullVals, AshopConnection, CreateAshopViews } from '../Common/common-functions';
import { BuildHaul, BuildTrip, BuildCruise } from './ashop-build-functions';
import { MigrateGearTypeAndPerformance, MigratePorts, MigrateVesselType, MigrateCdqCodes, MigrateCondition, MigrateSampleSystem, MigrateMaturity, MigrateSpecimenType, MigrateSampleUnit, MigrateAnimalTypes } from './build-lookups';

// dictionary objects to keep in memory json couch documents that will be often reused
export var dictPorts: { [id: number]: any; } = {};
export var dictGearTypes: { [id: number]: any; } = {};
export var dictGearPerformances: { [id: number]: any; } = {};
export var dictConditions: { [id: number]: any; } = {};
export var dictMaturities: { [id: number]: any; } = {};
export var dictSampleSystems: { [id: number]: any; } = {};
export var dictSpecies: { [id: number]: any; } = {};
export var dictTribalDeliveries: { [id: number]: any; } = {};
export var dictVesselTypes: { [id: number]: any; } = {};
export var dictSampleUnits: { [id: number]: any; } = {};
export var dictAnimalTypes: { [id: number]: any; } = {};
export var dictSpecimenTypes: { [id: number]: any; } = {};

var moment = require('moment');

// Setting this process var to "0" is extremely unsafe in most situations, use with care.
// It is unsafe because Node does not like self signed TLS (SSL) certificates, 
// this setting disables Node's rejection of invalid or unauthorized certificates, and allows them.
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
// console.log('CouchDB connection configured successfully.');


async function MigrateHaulDocs(strDateBegin: string, strDateEnd: string) {
    //let DateCompare = new Date(strDateBegin);
    let strSQL = AllHaulsSQL();
    let odb = await AshopConnection();
    let lstCruiseTripHaulIDs = await ExecuteOracleSQL(odb, strSQL);

    let iLastCruiseID, iLastTripID, iLastHaulID: number;
    let strLastPermit: string;
    let iCruiseID, iTripID, iHaulID: number;
    let strPermit: string;
    let lstCreatedHauls = [], lstModifiedHauls = [];
    let lstHaulIDs: any[] = [];
    let dictNewHaulIDsByTrip: { [id: string]: any; } = {};

    if (lstCruiseTripHaulIDs.length > 0) {
        iCruiseID = lstCruiseTripHaulIDs[0][0];
        strPermit = lstCruiseTripHaulIDs[0][1];
        iTripID = lstCruiseTripHaulIDs[0][2];
        iHaulID = lstCruiseTripHaulIDs[0][3];
    }
    // because I am always looking at + building the previous haul, this ensures the last record returned gets hit without causing an out of bounds exception
    lstCruiseTripHaulIDs.push([null, null, null]);

    for (let i = 0; i < lstCruiseTripHaulIDs.length; i++) {
        iLastCruiseID = iCruiseID;
        strLastPermit = strPermit;
        iLastTripID = iTripID;
        iLastHaulID = iHaulID;
        iCruiseID = lstCruiseTripHaulIDs[i][0], strPermit = lstCruiseTripHaulIDs[i][1], iTripID = lstCruiseTripHaulIDs[i][2], iHaulID = lstCruiseTripHaulIDs[i][3];
        // if(i == lstCruiseTripHaulIDs.length - 1){
        //   console.log('asd');
        // }

        // if this record is new trip, build last haul, bulk insert all hauls, save list of Couch IDs along side Trip ID
        if ((iCruiseID != iLastCruiseID && strPermit != strLastPermit && iTripID != iLastTripID) || i == lstCruiseTripHaulIDs.length - 1) {

            let cHaul = await BuildHaul(odb, iLastCruiseID, iLastHaulID, strLastPermit);
            cHaul = RemoveDocNullVals(cHaul);
            //let [strDocID, strDocRev] = await FetchRevID(cHaul.legacy.cruiseNum + ',' + cHaul.legacy.haulSeq, 'all-operations');
            let strDocID, strDocRev = null;
            if (strDocID == null) {
                lstCreatedHauls.push(cHaul);
            } else {
                cHaul._id = strDocID;
                cHaul._rev = strDocRev;
                lstModifiedHauls.push(cHaul);
            }
            lstHaulIDs = await InsertBulkCouchDB(lstCreatedHauls);
            // await InsertBulkCouchDB(lstModifiedHauls);
            dictNewHaulIDsByTrip[iLastCruiseID + ',' + strLastPermit + ',' + iLastTripID] = lstHaulIDs;
            lstCreatedHauls = [], lstModifiedHauls = [], lstHaulIDs = [];
        }
        // if this record is new haul, construct last haul, add to list to be inserted
        else if (iHaulID != iLastHaulID) {
            let cHaul = await BuildHaul(odb, iLastCruiseID, iLastHaulID, strLastPermit);
            cHaul = RemoveDocNullVals(cHaul);
            //let [strDocID, strDocRev] = await FetchRevID(cHaul.legacy.cruiseNum + ',' + cHaul.legacy.haulSeq, 'all-operations');
            let strDocID, strDocRev = null;
            if (strDocID == null) {
                lstCreatedHauls.push(cHaul);
            } else {
                cHaul._id = strDocID;
                cHaul._rev = strDocRev;
                lstModifiedHauls.push(cHaul);
            }
        }
    }
    await ReleaseOracle(odb);
    return dictNewHaulIDsByTrip;
}

async function MigrateCruises(dictNewHaulIDsByTrip: any, strDateBegin: string, strDateEnd: string) {

    //let DateCompare = new Date(strDateBegin);
    let strSQL = AllCruisesSQL();
    let odb = await AshopConnection();
    let lstCruiseTripIDs = await ExecuteOracleSQL(odb, strSQL);

    let iLastCruiseID, iLastTripID: number;
    let strLastPermit: string;
    let iCruiseID, iTripID: number;
    let strPermit: string;
    let lstTrips = [], lstCruises = [];

    if (lstCruiseTripIDs.length > 0) {
        iCruiseID = lstCruiseTripIDs[0][0];
        strPermit = lstCruiseTripIDs[0][1];
        iTripID = lstCruiseTripIDs[0][2];
    }
    // because I am always looking at + building the previous haul, this ensures the last record returned gets hit
    lstCruiseTripIDs.push([null, null, null]);

    for (let i = 0; i < lstCruiseTripIDs.length; i++) {
        iLastCruiseID = iCruiseID;
        strLastPermit = strPermit;
        iLastTripID = iTripID;
        iCruiseID = lstCruiseTripIDs[i][0], strPermit = lstCruiseTripIDs[i][1], iTripID = lstCruiseTripIDs[i][2];
        if (i == lstCruiseTripIDs.length - 1) {
            console.log('asd');
        }
        // new cruise and trip
        if (iCruiseID != iLastCruiseID || i == lstCruiseTripIDs.length - 1) {
            let lstNewHaulIDs: any[];
            if (iLastCruiseID + ',' + strLastPermit + ',' + iLastTripID in dictNewHaulIDsByTrip) {
                lstNewHaulIDs = dictNewHaulIDsByTrip[iLastCruiseID + ',' + strLastPermit + ',' + iLastTripID];
            } else {
                lstNewHaulIDs = null;
            }
            let cTrip: AshopTrip = await BuildTrip(odb, iLastCruiseID, iLastTripID, strLastPermit, lstNewHaulIDs);
            lstTrips.push(cTrip);
            let cCruise: AshopCruise = await BuildCruise(odb, iLastCruiseID, lstTrips);
            cCruise = RemoveDocNullVals(cCruise);
            lstTrips = [];
            lstCruises.push(cCruise);

        }
        // Else - new trip, same cruise
        else {
            // when adding update logic, need to query and sort through existing trips so as to not lose the unique ID
            let lstNewHaulIDsForTrip: any[];
            if (iLastCruiseID + ',' + strLastPermit + ',' + iLastTripID in dictNewHaulIDsByTrip) {
                lstNewHaulIDsForTrip = dictNewHaulIDsByTrip[iLastCruiseID + ',' + strLastPermit + ',' + iLastTripID];
            } else {
                lstNewHaulIDsForTrip = null;
            }
            let cTrip: AshopTrip = await BuildTrip(odb, iLastCruiseID, iLastTripID, strLastPermit, lstNewHaulIDsForTrip);
            lstTrips.push(cTrip);
        }
    }

    await ReleaseOracle(odb);
    return await InsertBulkCouchDB(lstCruises);
}

async function MigrateSpecies() {
    let odb = await AshopConnection();
    let strSQL = strAllSpeciesSQL();
    let SpeciesData = await ExecuteOracleSQL(odb, strSQL);
    let lstSpecies = [];

    for (let i = 0; i < SpeciesData.length; i++) {
        let docSpecies = {
            type: 'ashop-species',
            speciesCode: SpeciesData[i][0],
            prohibSpeciesGroupCode: SpeciesData[i][1],
            areEggsRequired: SpeciesData[i][2],
            IsSpeciesCompSexRequired: SpeciesData[i][3],
            weightAndNumberRequired: SpeciesData[i][4],
            commonName: SpeciesData[i][5],
            scientificName: SpeciesData[i][6],
            isLengthAccepted: SpeciesData[i][7],
            avianSpeciesCode: SpeciesData[i][8],
            speciesAcceptanceCode: SpeciesData[i][9],
            itisCode: SpeciesData[i][10],
            raceSpeciesNum: SpeciesData[i][11]
        };
        lstSpecies.push(docSpecies);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstSpecies);
}

async function MigrateAllLookups() {
    await MigrateGearTypeAndPerformance();
    await MigratePorts();
    await MigrateVesselType();
    await MigrateCdqCodes();
    await MigrateSpecies();
    await MigrateCondition();
    await MigrateSampleSystem();
    await MigrateMaturity();
    await MigrateSpecimenType();
    await MigrateSampleUnit();
    await MigrateAnimalTypes();
}

async function Initialize() {
    // format = yyy-MM-dd HH24:MI:SS
    // let odb = await AshopConnection();
    // let testdata = await ExecuteOracleSQL(odb, 'SELECT * FROM NORPAC.ATL_HAUL WHERE ROWNUM < 100')
    // await ReleaseOracle(odb);
    // const dbName = couchDB.use(CouchDBName);
    // await dbName.get('5b076e3c7958c88b2ef28cc6152c750c').then((body: any) => {
    //   console.log(body);
    // });

    //let testarray = [1, 2, 3];
    //let testarray = {};


    // let odb = await AshopConnection();
    // let testsamples = await BuildSamples(odb, 11579, 4, 7, 1276);
    // await ReleaseOracle(odb);


    // let DD = DmsToDD(176, 59, 15, 'W')

    // if (typeof (testarray) === 'object') {
    //   console.log('array is object');
    // } else {
    //   console.log('array is not object')
    // }

    // if (!(testarray instanceof Array)) {
    //   console.log('is not array');
    // } else {
    //   console.log('is array')
    // }

    // let lstTest = [];

    // lstTest.push({ testing: 123, testarray: [1, 2, 3] })
    // lstTest.push({ testing: 312, testarray: [3, 2, 1] })
    // lstTest.push({ testing: "135", testarray: ["2", 10, true] })

    await CreateAshopViews();
    await MigrateAllLookups();

    // await InsertBulkCouchDB(lstTest);

    let strDateCompare = '1000-01-01 00:00:00';
    let DateCompare = new Date(strDateCompare);
    let strDateLimit = '2019-05-29 12:13:00';

    let dictNewHaulIDsByTrip = await MigrateHaulDocs(strDateCompare, strDateLimit);
    await MigrateCruises(dictNewHaulIDsByTrip, strDateCompare, strDateLimit);


}

Initialize();

