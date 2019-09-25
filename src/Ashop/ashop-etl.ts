
import { AllHaulsSQL, strHaulSQL, strSamplesByHaulSQL, strSubSamplesByParentSQL, strTripSQL, AllCruisesSQL, strCruiseSQL, strFlowScaleWeightSQL, strMammalInteractionSQL, strMammalSpecimenSQL, strMammalSightingSQL, strBirdInteractionSQL, strBirdEventSQL, strBirdInteractOutcomeSQL, strSampleSpeciesSQL, strSpecimensSQL, strBiostructuresSQL, strAllSampledBySQL, strAllSpeciesSQL, strConditionLookupSQL } from './norpac-sql';
import { Point } from 'geojson';
import { AshopTrip, AshopCruise, AshopCatch, AshopHaul, AshopHaulTypeName, AshopTripTypeName, AshopCruiseTypeName, AshopCatchTypeName } from '../../../boatnet/libs/bn-models/models/ashop/'
import { dbName } from '../Common/db-connection-variables';
import { ExecuteOracleSQL, GenerateCouchID, InsertBulkCouchDB, ReleaseOracle, RemoveDocNullVals, AshopConnection, DmsToDD } from '../Common/common-functions';
import { SightingEvent, InteractionEvent, InteractionEventTypeName } from '../../../boatnet/libs/bn-models';
import { UploadedBy, UploadedDate } from '../Common/common-variables';

var dictPorts: { [id: number]: any; } = {};
var dictGearTypes: { [id: number]: any; } = {};
var dictGearPerformances: { [id: number]: any; } = {};
var dictConditions: { [id: number]: any; } = {};
var dictMaturities: { [id: number]: any; } = {};
var dictSampleSystems: { [id: number]: any; } = {};
var dictSpecies: { [id: number]: any; } = {};
var dictTribalDeliveries: { [id: number]: any; } = {};
var dictVesselTypes: { [id: number]: any; } = {};
var dictSampleUnits: { [id: number]: any; } = {};
var dictAnimalTypes: { [id: number]: any; } = {};
var dictSpecimenTypes: { [id: number]: any; } = {};

var moment = require('moment');

// Setting this process var to "0" is extremely unsafe in most situations, use with care.
// It is unsafe because Node does not like self signed TLS (SSL) certificates, 
// this setting disables Node's rejection of invalid or unauthorized certificates, and allows them.
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
// console.log('CouchDB connection configured successfully.');


// Checks if subdocument exists in dictionary instance, if not, fetches from couch and adds to global dict passed in
async function GetDocFromDict(dictDocuments: { [id: number]: any; }, iID: any, DesignName: string, ViewName: string) {
    let Document;
    if (iID != null) {
        if (iID in dictDocuments) {
            Document = dictDocuments[iID];
        } else {
            [, , Document] = await FetchDocument(iID, DesignName, ViewName);
            dictDocuments[iID] = Document;
        }
    } else {
        Document = null;
    }
    return Document;
}

async function FetchDocument(iOldID: number, DesignName: string, ViewName: string) {

    let strDocID;
    let strDocRev;
    let Document;

    await dbName.view(DesignName, ViewName, {
        'key': iOldID,
        'include_docs': true
    }).then((data: any) => {
        if (data.rows.length > 0) {
            strDocID = data.rows[0].id;
            strDocRev = data.rows[0].value;
            Document = data.rows[0].doc
        }
    }).catch((error: any) => {
        console.log(error, DesignName, ViewName);
    });


    return [strDocID, strDocRev, Document];
}

async function CreateViews() {

    let LookupDocs: any = {
        "_id": "_design/ETL-LookupDocs",
        "views": {
            "ashop-gear-performance-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-gear-performance') { \r\n    emit(doc.gearPerformanceCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-gear-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-gear-type') { \r\n    emit(doc.gearTypeCode.toString() + ',' + doc.gearTypeForm.toString(), doc._rev);\r\n  }\r\n}"
            },
            "ashop-port-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-port') { \r\n    emit(doc.portCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-vessel-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-vessel-type') { \r\n    emit(doc.vesselType, doc._rev);\r\n  }\r\n}"
            },
            "ashop-tribal-delivery-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-tribal-delivery') { \r\n    emit(doc.cdqCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-species-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-species') { \r\n    emit(doc.speciesCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-condition-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-condition') { \r\n    emit(doc.conditionCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-sample-system-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-sample-system') { \r\n    emit(doc.sampleSystemCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-maturity-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-maturity') { \r\n    emit(doc.maturitySeq, doc._rev);\r\n  }\r\n}"
            },
            "ashop-specimen-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-specimen-type') { \r\n    emit(doc.specimenType, doc._rev);\r\n  }\r\n}"
            },
            "ashop-sample-unit-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-sample-unit') { \r\n    emit(doc.sampleUnitCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-animal-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-animal-type') { \r\n    emit(doc.animalTypeCode, doc._rev);\r\n  }\r\n}"
            }




        },
        "language": "javascript"
    }

    await dbName.get('_design/ETL-LookupDocs').then((body: any) => {
        LookupDocs._rev = body._rev;
    }).catch((error: any) => {
    });

    await dbName.insert(LookupDocs).then((data: any) => {
        console.log(data)
    }).catch((error: any) => {
        console.log("update failed", error, LookupDocs);

    });



    let MainDocs: any = {
        "_id": "_design/ETL-MainDocs",
        "views": {
            "all-operations": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-haul') { \r\n    emit(doc.legacy.cruiseNum.toString() + ',' + doc.legacy.permit.toString() + ',' + doc.legacy.haulSeq.toString(), doc._rev);\r\n  }\r\n}"
            },
            "all-cruises": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-cruise') { \r\n    emit(doc.cruiseNum, doc._rev);\r\n  }\r\n}"
            }
        },
        "language": "javascript"
    }

    await dbName.get('_design/ETL-MainDocs').then((body: any) => {
        MainDocs._rev = body._rev;
    }).catch((error: any) => {
    });

    await dbName.insert(MainDocs).then((data: any) => {
        console.log(data)
    }).catch((error: any) => {
        console.log("update failed", error, MainDocs);

    });

}

async function FetchRevID(iOldID: string | number, ViewName: string) {
    let strDocID;
    let strDocRev;
    await dbName.view('ETL-MainDocs', ViewName, {
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


async function BuildCruise(odb: any, iCruiseID: number, lstTrips: AshopTrip[]) {

    let lstCruiseData = await ExecuteOracleSQL(odb, strCruiseSQL(iCruiseID));
    lstCruiseData = lstCruiseData[0];

    let docNewCruise: AshopCruise = {
        type: AshopCruiseTypeName,
        createdBy: null,
        createdDate: lstCruiseData[3],
        updatedBy: null,
        updatedDate: null,
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate,
        cruiseNum: lstCruiseData[0],
        vessel: null, // unknown
        trips: lstTrips,
        debriefer: null


    };

    return docNewCruise;

}

async function BuildTrip(odb: any, iCruiseID: number, iTripID: number, strPermit: string, lstHaulIDs: any[]) {

    let lstTripData = await ExecuteOracleSQL(odb, strTripSQL(iCruiseID, iTripID, strPermit))
    lstTripData = lstTripData[0];

    let geoStartLocation: Point = {
        type: "Point",
        coordinates: [DmsToDD(lstTripData[8], lstTripData[9], lstTripData[10], null), DmsToDD(lstTripData[11], lstTripData[12], lstTripData[13], lstTripData[14])]
    }
    let geoEndLocation: Point = {
        type: "Point",
        coordinates: [DmsToDD(lstTripData[16], lstTripData[17], lstTripData[18], null), DmsToDD(lstTripData[19], lstTripData[20], lstTripData[21], lstTripData[22])]
    }

    let bDidFishingOccur: boolean = null;
    if (lstTripData[24] == 'Y') {
        bDidFishingOccur = true;
    } else if (lstTripData[24] == 'N') {
        bDidFishingOccur = false;
    }
    let lstAllSampledBy = await ExecuteOracleSQL(odb, strAllSampledBySQL(iCruiseID, strPermit, iTripID));
    let lstObserverCruiseIDs = Array.from(new Set([lstTripData[0]].concat(lstAllSampledBy)));

    let lstObservers = lstObserverCruiseIDs; // todo lookups

    let DeparturePort = await GetDocFromDict(dictPorts, lstTripData[5], 'ETL-LookupDocs', 'ashop-port-lookup');
    let ReturnPort = await GetDocFromDict(dictPorts, lstTripData[4], 'ETL-LookupDocs', 'ashop-port-lookup');


    let docNewTrip: AshopTrip = {
        type: AshopTripTypeName,
        createdBy: null,
        createdDate: null,
        updatedBy: null,
        updatedDate: null,
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate,
        notes: lstTripData[34] + lstTripData[27],
        operationIDs: lstHaulIDs,
        captain: lstTripData[29], // todo transform into person record
        vessel: lstTripData[30], // todo lookup -- why is this in the trip level, its stored in the haul level
        vesselType: null, // possibly in vessel lookup
        crew: null,
        departureDate: moment(lstTripData[7], moment.ISO_8601).format(),
        returnDate: moment(lstTripData[15], moment.ISO_8601).format(),
        departurePort: DeparturePort,
        returnPort: ReturnPort,
        isExpanded: null, // unknown
        tripNum: lstTripData[3],
        observers: lstObservers,
        fishingDays: null, // lookup
        fishery: null, // todo - defualt to 'A-SHOP'
        crewSize: lstTripData[23],
        didFishingOccur: bDidFishingOccur,
        sightingEvents: null, // todo
        ineractionEvents: null, // todo
        brd: null, // todo / unknown

        legacy: {
            cruiseNum: lstTripData[0],
            tripSeq: lstTripData[1],
            cruiseVesselSeq: lstTripData[2],
            portCode: null, // theres two codes, which one?
            fishingTimeLostHours: null // todo lookup
        }


    };

    return docNewTrip;
}

// todo: animal interactions and sightings
// async function BuildAnimalInteractions(odb: any, iCruiseID: number, strPermit: string, iTripID: number) {

//     // mammal sighting data 
//     let lstMammalSightingData = await ExecuteOracleSQL(odb, strMammalSightingSQL(iCruiseID, strPermit, iTripID));
//     let lstSightings: SightingEvent[] = [];
//     for (let i = 0; i < lstMammalSightingData.length; i++) {
//         let docSighting: SightingEvent = {

//         }
//         lstSightings.push(docSighting);

//     }

//     // mammal interactions
//     let lstInteractions: InteractionEvent[] = [];
//     let lstMammalInteractionData = await ExecuteOracleSQL(odb, strMammalInteractionSQL(iCruiseID, strPermit, iTripID))
//     for (let i = 0; i < lstMammalInteractionData.length; i++) {
//         let iMammalInteractionID = lstMammalInteractionData[i][9];
//         let lstMammalSpecimenData = await ExecuteOracleSQL(odb, strMammalSpecimenSQL(iCruiseID, strPermit, iMammalInteractionID));
//         let lstMammalSpecimens: any[] = [];
//         for (let j = 0; j < lstMammalSpecimenData.length; j++) {
//             // TODO - create mammal specimen model, seems different than normal specimen
//             let docNewMammalSpecimen = {
//                 specimenType: lstMammalSpecimenData[j][3],
//                 sex: lstMammalSpecimenData[j][6],
//                 value: lstMammalSpecimenData[j][7],
//                 notes: lstMammalSpecimenData[j][8],
//                 permit: lstMammalSpecimenData[j][9], // todo - probable lookup

//                 legacy: {
//                     cruiseNum: lstMammalSpecimenData[j][0],
//                     mammalSpecimenSeq: lstMammalSpecimenData[j][1],
//                     animalNum: lstMammalSpecimenData[j][2],
//                     interactionSeq: lstMammalSpecimenData[j][4],
//                     specimenNum: lstMammalSpecimenData[j][5]
//                 }

//             }
//             lstMammalSpecimens.push(docNewMammalSpecimen);
//         }

//         let docInteraction: InteractionEvent = {
//             type: InteractionEventTypeName,
//             createdBy: null,
//             createdDate: null,
//             updatedBy: null,
//             updatedDate: null,
//             uploadedBy: UploadedBy,
//             uploadedDate: UploadedDate,
//             notes: null,

//             operations: null,
//             catchSpecies: null,
//             specimens: null,
//             species: lstMammalInteractionData[i][2], // todo lookup
//             date: null,
//             location: null,
//             beaufort: null,
//             confidenceOfSpecies: null,
//             minAnimalCountEstimate: null,
//             maxAnimalCountEstimate: null,
//             animalCount: lstMammalInteractionData[i][6],

//             take: {
//                 isTake: null,
//                 reviewer: null,
//                 comments: null
//             },

//             closestApproach: null,
//             deterrents: null,
//             areAnimalsInjured: null,
//             areAnimalsDead: null,
//             animalBehavior: null,
//             interactions: null,
//             outcome: null,
//             bodyLength: null,
//             mediaTaken: null,
//             weather: null,
//             vesselActivity: null,

//             legacy: {
//                 cruiseNum: lstMammalInteractionData[i][0],
//                 permit: lstMammalInteractionData[i][7],
//                 mammalSeq: lstMammalInteractionData[i][1],
//                 offloadSeq: lstMammalInteractionData[i][4],

//                 waterTemp: null,
//                 sightingCondition: null,
//                 eventNumber: null,
//                 birdLocation: null,
//                 numBirds: null,
//                 countType: null,
//                 goodLookAtBird: null,
//                 duration: null,
//                 albatrossData: {
//                     numAdults: null,
//                     numSubAdults: null,
//                     numImmatures: null,
//                     numJuveniles: null,
//                     identifyingCharacteristics: null,
//                     specimenTaken: null,
//                     specimensAndTags: null
//                 },

//                 numMammalsInInteraction: null,
//                 mammalCondition: null
//             }

//         }
//         lstInteractions.push(docInteraction);
//     }





//     // bird data

//     let lstBirdEventData = await ExecuteOracleSQL(odb, strBirdEventSQL(iCruiseID, strPermit, iTripID));
//     for (let i = 0; i < lstBirdEventData.length; i++) {
//         let iBirdEventID = lstBirdEventData[i][0];


//         let lstBirdInteractSpeciesData = await ExecuteOracleSQL(odb, strBirdInteractionSQL(iCruiseID, strPermit, iBirdEventID));
//         for (let j = 0; j < lstBirdInteractSpeciesData.length; j++) {
//             let iInteractSpeciesID = lstBirdInteractSpeciesData[j][0];
//             let lstInteractOutcomeData = await ExecuteOracleSQL(odb, strBirdInteractOutcomeSQL(iCruiseID, strPermit, iInteractSpeciesID));
//             lstInteractOutcomeData.push(null);
//             let iLastOutcome, iCurrentOutcome;
//             for (let k = 0; k < lstInteractOutcomeData.length; k++) {
//                 // check if interaction code = 1 (sighting only)
//             }

//             let SpecimenData = [];
//             for (let k = 0; k < SpecimenData.length; k++) {
//                 // todo - low priority, uncertain about tag data
//             }

//             let BirdAgeData = [];
//             for (let k = 0; k < BirdAgeData.length; k++) {
//                 // todo - edge case involving short tailed albatross, lower priority 
//             }


//             let docBirdInteraction: InteractionEvent = {
//                 type: InteractionEventTypeName,
//                 createdBy: null,
//                 createdDate: null,
//                 updatedBy: null,
//                 updatedDate: null,
//                 uploadedBy: UploadedBy,
//                 uploadedDate: UploadedDate,
//                 notes: null,

//                 operations: null,
//                 catchSpecies: null,
//                 specimens: null,
//                 species: null,
//                 date: null,
//                 location: null,
//                 beaufort: null,
//                 confidenceOfSpecies: null,
//                 minAnimalCountEstimate: null,
//                 maxAnimalCountEstimate: null,
//                 animalCount: null,

//                 take: {
//                     isTake: null,
//                     reviewer: null,
//                     comments: null
//                 },

//                 closestApproach: null,
//                 deterrents: null,
//                 areAnimalsInjured: null,
//                 areAnimalsDead: null,
//                 animalBehavior: null,
//                 interactions: null,
//                 outcome: null,
//                 bodyLength: null,
//                 mediaTaken: null,
//                 weather: null,
//                 vesselActivity: null,

//                 legacy: {
//                     waterTemp: null,
//                     sightingCondition: null,
//                     eventNumber: null,
//                     birdLocation: null,
//                     numBirds: null,
//                     countType: null,
//                     goodLookAtBird: null,
//                     duration: null,
//                     albatrossData: {
//                         numAdults: null,
//                         numSubAdults: null,
//                         numImmatures: null,
//                         numJuveniles: null,
//                         identifyingCharacteristics: null,
//                         specimenTaken: null,
//                         specimensAndTags: null
//                     },

//                     numMammalsInInteraction: null,
//                     mammalCondition: null
//                 }

//             }
//             lstInteractions.push(docBirdInteraction);
//         }

//     }



//     return [lstSightings, lstInteractions]
// }

async function BuildHaul(odb: any, iCruiseID: number, iHaulID: number, strPermit: string) {


    let docNewSamples: AshopCatch[] = await BuildSamples(odb, iCruiseID, iHaulID, null, strPermit);

    let lstHaulData = await ExecuteOracleSQL(odb, strHaulSQL(iCruiseID, iHaulID, strPermit));
    lstHaulData = lstHaulData[0];

    let geoStartLocation: Point = {
        type: "Point",
        coordinates: [DmsToDD(lstHaulData[26], lstHaulData[27], lstHaulData[28], null), DmsToDD(lstHaulData[30], lstHaulData[31], lstHaulData[32], lstHaulData[29])]
    }
    let geoEndLocation: Point = {
        type: "Point",
        coordinates: [DmsToDD(lstHaulData[17], lstHaulData[18], lstHaulData[19], null), DmsToDD(lstHaulData[21], lstHaulData[22], lstHaulData[23], lstHaulData[20])]
    }

    // 0.54680664916885

    let FishingDepth = lstHaulData[34];
    let BottomDepth = lstHaulData[33];
    // todo refine num of dec places
    if (lstHaulData[35] == 'M') {
        FishingDepth = FishingDepth * 0.54680664916885;
        BottomDepth = BottomDepth * 0.54680664916885;
    }

    let ObserverEstimatedCatch: any;
    if (lstHaulData[37] != null) {
        ObserverEstimatedCatch = {
            measurement: {
                measurementType: 'weight',
                value: lstHaulData[37],
                units: 'kg'
            },
            weightMethod: lstHaulData[38] // maybe lookup
        }
    } else {
        ObserverEstimatedCatch = null;
    }

    let VesselEstimatedCatch;
    if (lstHaulData[36] != null) {
        VesselEstimatedCatch = {
            measurement: {
                measurementType: 'weight',
                value: lstHaulData[36],
                units: 'kg'
            },
            weightMethod: null // TODO
        }
    } else {
        VesselEstimatedCatch = null;
    }

    let OfficialTotalCatch;
    if (ObserverEstimatedCatch != null) {
        OfficialTotalCatch = ObserverEstimatedCatch;
    } else if (VesselEstimatedCatch != null) {
        OfficialTotalCatch = VesselEstimatedCatch
    } else {
        OfficialTotalCatch = null;
    }

    let GearType = await GetDocFromDict(dictGearTypes, lstHaulData[10].toString() + ',' + lstHaulData[9].toString(), 'ETL-LookupDocs', 'ashop-gear-type-lookup')
    let GearPerformance = await GetDocFromDict(dictGearPerformances, lstHaulData[8], 'ETL-LookupDocs', 'ashop-gear-performance-lookup')
    let TribalDelivery = await GetDocFromDict(dictTribalDeliveries, lstHaulData[4], 'ETL-LookupDocs', 'ashop-tribal-delivery-lookup')
    let SampleSystem = await GetDocFromDict(dictSampleSystems, lstHaulData[51], 'ETL-LookupDocs', 'ashop-sample-system-lookup');
    let SampleUnit = await GetDocFromDict(dictSampleUnits, lstHaulData[52], 'ETL-LookupDocs', 'ashop-sample-unit-lookup');
    let VesselType = await GetDocFromDict(dictVesselTypes, lstHaulData[7], 'ETL-LookupDocs', 'ashop-vessel-type-lookup');

    let docNewHaul: AshopHaul = {
        type: AshopHaulTypeName,
        createdBy: null, // todo
        createdDate: null, // todo - query history table, if not exists use DATE_OF_ENTRY
        updatedBy: null, // todo
        updatedDate: null, // todo, if history record exists, use DATE_OF_ENTRY, else null
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate,

        haulNum: lstHaulData[2],
        startFishingLocation: geoStartLocation,
        endFishingLocation: geoEndLocation,
        bottomDepth: {
            measurementType: 'depth',
            value: BottomDepth,
            units: 'fathoms'
        },
        fishingDepth: {
            measurementType: 'depth',
            value: FishingDepth,
            units: 'fathoms'
        },
        observerEstimatedCatch: ObserverEstimatedCatch,
        vesselEstimatedCatch: VesselEstimatedCatch,
        officialTotalCatch: OfficialTotalCatch,
        observerEstimatedDiscards: [lstHaulData[38]], // array for going forward data? and missing method
        totalEstimatedDiscard: null, // unknown
        gearType: GearType,
        gearPerformance: GearPerformance,
        mammalMonitorPercent: lstHaulData[47],
        isBirdShortwired: lstHaulData[55],
        isGearLost: null, // ETL from lookup? ie if gear perfromance == lost
        tribalDelivery: TribalDelivery,
        sampleDesignType: SampleSystem, // is this correct?
        samples: docNewSamples,
        vesselType: VesselType,

        legacy: {
            cruiseNum: lstHaulData[0],
            permit: lstHaulData[48],
            tripSeq: lstHaulData[6],
            haulSeq: lstHaulData[1],
            deliveryVesselAdfg: lstHaulData[5],
            locationCode: lstHaulData[15],
            volume: {
                measurementType: 'volume',
                value: lstHaulData[49],
                units: null // TODO unknown
            },
            density: {
                measurementType: 'density',
                value: lstHaulData[40],
                units: 'kgs per m3' // todo - how to write this?
            },
            haulPurposeCode: lstHaulData[3],
            cdqCode: lstHaulData[4],
            rbtCode: lstHaulData[11],
            rstCode: lstHaulData[12],
            birdHaulbackCode: lstHaulData[54],
            sampleUnit: SampleUnit
        }


    };

    return docNewHaul;
}

async function BuildFlowScaleWeight(odb: any, iCruiseID: number, strPermit: string, iHaulID: number) {

    let lstFlowScaleWeightData = await ExecuteOracleSQL(odb, strFlowScaleWeightSQL(iCruiseID, strPermit, iHaulID));

    for (let i = 0; i < lstFlowScaleWeightData.length; i++) {
        // possible to do
    }


}

async function BuildSamples(odb: any, iCruiseID: number, iHaulID: number, iParentID: number, strPermit: string) {
    let lstSampleData = [];
    let lstSamples: AshopCatch[] = []
    let bIsSubsample: boolean;

    // if this is the initial call of this function
    if (iParentID == null) {
        lstSampleData = await ExecuteOracleSQL(odb, strSamplesByHaulSQL(iCruiseID, iHaulID, strPermit))
        bIsSubsample = false;
        // else if this function was called recursively
    } else {
        lstSampleData = await ExecuteOracleSQL(odb, strSubSamplesByParentSQL(iCruiseID, iParentID, strPermit))
        bIsSubsample = true;
    }
    // if no sub samples exist, it will not get into this loop, should be finite
    for (let i = 0; i < lstSampleData.length; i++) {
        let lstSubsamples: AshopCatch[] = await BuildSamples(odb, iCruiseID, iHaulID, lstSampleData[i][1], lstSampleData[i][10]);
        let strCouchID = await GenerateCouchID();
        let bIsPresorted: boolean;
        if (lstSampleData[i][7] == 'Y') {
            bIsPresorted = true;
        } else if (lstSampleData[i][7] == 'N') {
            bIsPresorted = false;
        } else {
            bIsPresorted = null;
        }
        let iSampleID = lstSampleData[i][1];
        let lstSampleSpecies: AshopSampleSpecies[] = await BuildSampleSpecies(odb, iCruiseID, iSampleID, strPermit);

        let docNewSample: AshopCatch = {
            _id: strCouchID,
            type: AshopCatchTypeName,
            createdBy: null, // todo
            createdDate: null, // todo - query history table, if not exists use DATE_OF_ENTRY
            updatedBy: null, // todo
            updatedDate: null, // todo, if history record exists, use DATE_OF_ENTRY, else null
            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,

            sampleNum: lstSampleData[i][3],
            isSubsample: bIsSubsample,
            isPresorted: bIsPresorted,
            //isTruncated: null, // only going forward
            species: lstSampleSpecies,
            subsamples: lstSubsamples,
            totalSampleWeight: {
                measurementType: 'weight',
                value: lstSampleData[i][8],
                units: 'kg'
            },
            flowScaleStart: null, // unknown
            flowScaleEnd: null, // unknown

            legacy: {
                parentSequence: lstSampleData[i][2],
                cruiseNum: lstSampleData[i][0],
                permit: lstSampleData[i][10],
                sampleSequence: lstSampleData[i][1]
            }

        };
        lstSamples.push(docNewSample);
    }

    if (lstSamples.length == 0) {
        lstSamples = null;
    }
    return lstSamples;
}

async function BuildSampleSpecies(odb: any, iCruiseID: number, iSampleID: number, strPermit: string) {
    // from species comp table
    let lstSampleSpecies: AshopSampleSpecies[] = [];
    let lstSampleSpeciesData = await ExecuteOracleSQL(odb, strSampleSpeciesSQL(iCruiseID, strPermit, iSampleID));

    for (let i = 0; i < lstSampleSpeciesData.length; i++) {
        let iCompositionID = lstSampleSpeciesData[i][1];
        let lstSpecimens: AshopSpecimen[] = await BuildSpecimens(odb, iCruiseID, iCompositionID, strPermit);
        let strCouchID = await GenerateCouchID();
        let Species = await GetDocFromDict(dictSpecies, lstSampleSpeciesData[i][3], 'ETL-LookupDocs', 'ashop-species-lookup')

        let docNewSampleSpecies: AshopSampleSpecies = {
            _id: strCouchID,
            type: AshopSampleSpeciesTypeName,
            createdBy: null, // todo
            createdDate: null, // todo - query history table, if not exists use DATE_OF_ENTRY
            updatedBy: null, // todo
            updatedDate: null, // todo, if history record exists, use DATE_OF_ENTRY, else null
            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,

            species: Species, // todo lookup
            isPredominantSpecies: null, // uncertain
            isNotFlowScaleWeighed: null, // uncertain
            percentRetained: null, // uncertain
            //baskets: null, // doesnt exist
            specimens: lstSpecimens,
            sightingEventIds: null,
            sex: lstSampleSpeciesData[i][6], // doesnt appear to have a lookup table, just the value
            weight: {
                measurementType: 'weight',
                value: lstSampleSpeciesData[i][4],
                units: 'kg'
            },

            legacy: {
                cruiseNum: lstSampleSpeciesData[i][0],
                permit: lstSampleSpeciesData[i][71],
                sampleSeq: lstSampleSpeciesData[i][2],
                speciesCompSeq: lstSampleSpeciesData[i][1]
            }

        }
        lstSampleSpecies.push(docNewSampleSpecies);
    }

    return lstSampleSpecies;
}

async function BuildSpecimens(odb: any, iCruiseID: number, iCompositionID: number, strPermit: string) {
    // from atl_length table
    let lstSpecimens: AshopSpecimen[] = [];
    let lstSpecimensData = await ExecuteOracleSQL(odb, strSpecimensSQL(iCruiseID, strPermit, iCompositionID));

    for (let i = 0; i < lstSpecimensData.length; i++) {

        let strViability = null; // transform into lookup?
        if (lstSpecimensData[i][13] == 'E') {
            strViability = 'Excellent'
        } else if (lstSpecimensData[i][13] == 'P') {
            strViability = 'Poor'
        } else if (lstSpecimensData[i][13] == 'D') {
            strViability = 'Dead'
        } else if (lstSpecimensData[i][13] == 'U') {
            strViability = 'Unknown'
        }

        let Condition = await GetDocFromDict(dictConditions, lstSpecimensData[i][5], 'ETL-LookupDocs', 'ashop-condition-lookup')

        let AnimalType = await GetDocFromDict(dictAnimalTypes, lstSpecimensData[i][7], 'ETL-LookupDocs', 'ashop-animal-type-lookup')

        let SampleSystem = await GetDocFromDict(dictSampleSystems, lstSpecimensData[i][6], 'ETL-LookupDocs', 'ashop-sample-system-lookup')


        let iLengthID = lstSpecimensData[i][1];
        let lstBiostructures: AshopBiostructure[] = await BuildBiostructures(odb, iCruiseID, iLengthID, strPermit);
        let strCouchID = await GenerateCouchID();
        let docNewSpecimen: AshopSpecimen = {
            _id: strCouchID,
            type: AshopSpecimenTypeName,
            createdBy: null, // todo
            createdDate: null, // todo - query history table, if not exists use DATE_OF_ENTRY
            updatedBy: null, // todo
            updatedDate: null, // todo, if history record exists, use DATE_OF_ENTRY, else null
            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,

            sex: lstSpecimensData[i][9],
            length: {
                measurementType: 'length',
                value: lstSpecimensData[i][10],
                units: 'cm'
            },
            width: null, // probaby n/a
            weight: null, // stored at higher level?
            lifeStage: null, // n/a?
            population: null, // n/a?
            maturity: null, // n/a?
            biostructures: lstBiostructures,
            numSpecimensInBag: null, // n/a?
            location: null, // n/a?
            protocol: null, // n/a?
            //specialProjects: null, // n/a? all ashop records have a null in this
            frequency: lstSpecimensData[i][11],
            //mediaData: null, // n/a?

            condition: Condition, // lookup
            animalType: AnimalType,
            sampleSystem: SampleSystem, // lookup
            viability: lstSpecimensData[i][13], // not a lookup?

            legacy: {
                cruiseNum: lstSpecimensData[i][0],
                permit: lstSpecimensData[i][15],
                haulSeq: lstSpecimensData[i][3], // probably useless here
                offloadSeq: lstSpecimensData[i][4],
                lengthSeq: lstSpecimensData[i][1]
            }


        }
        lstSpecimens.push(docNewSpecimen);
    }

    return lstSpecimens;
}

async function BuildBiostructures(odb: any, iCruiseID: number, iLengthID: number, strPermit: string) {
    let lstBiostructures: AshopBiostructure[] = [];
    let lstBiostructureData = await ExecuteOracleSQL(odb, strBiostructuresSQL(iCruiseID, strPermit, iLengthID));


    for (let i = 0; i < lstBiostructureData.length; i++) {
        let strCouchID = await GenerateCouchID();
        let Species = await GetDocFromDict(dictSpecies, lstBiostructureData[i][2], 'ETL-LookupDocs', 'ashop-species-lookup');
        let Maturity = await GetDocFromDict(dictMaturities, lstBiostructureData[i][3], 'ETL-LookupDocs', 'ashop-maturity-lookup');
        let SpecimenType = await GetDocFromDict(dictSpecimenTypes, lstBiostructureData[i][5], 'ETL-LookupDocs', 'ashop-specimen-type-lookup');
        let docNewBiostructure: AshopBiostructure = {
            _id: strCouchID,
            type: AshopBiostructureTypeName,
            createdBy: null, // todo
            createdDate: null, // todo - query history table, if not exists use DATE_OF_ENTRY
            updatedBy: null, // todo
            updatedDate: null, // todo, if history record exists, use DATE_OF_ENTRY, else null
            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,

            species: Species,
            maturity: Maturity,
            length: null, // doesnt exist at this level
            specimenType: SpecimenType,
            weight: {
                measurementType: 'weight',
                value: lstBiostructureData[i][7],
                units: 'kg'
            },
            age: {
                measurementType: 'age',
                value: lstBiostructureData[i][8],
                units: 'years'
            },
            specimenNum: lstBiostructureData[i][6],
            barcode: lstBiostructureData[i][11],
            isAdiposePresent: lstBiostructureData[i][12],

            legacy: {
                cruiseNum: lstBiostructureData[i][0],
                permit: lstBiostructureData[i][10],
                specimenSeq: lstBiostructureData[i][1],
                lengthSeq: lstBiostructureData[i][4]
            }
        }
        lstBiostructures.push(docNewBiostructure);
    }

    return lstBiostructures;
}


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

async function MigrateGearTypeAndPerformance() {

    let odb = await AshopConnection();
    let GearPerformanceData = await ExecuteOracleSQL(odb, 'SELECT * FROM NORPAC.ATL_LOV_GEAR_PERFORMANCE WHERE GEAR_PERFORMANCE_CODE IN (SELECT GEAR_PERFORMANCE_CODE FROM NORPAC.ATL_HAUL WHERE DEPLOY_LATITUDE_DEGREES < 49)')
    // todo make proper gear type and performance
    let lstGearPerformances: any[] = [];

    for (let i = 0; i < GearPerformanceData.length; i++) {
        let docGearPerformance = {
            type: 'ashop-gear-performance',
            gearPerformanceCode: GearPerformanceData[i][0],
            description: GearPerformanceData[i][1].substring(2)
        }
        lstGearPerformances.push(docGearPerformance);
    }

    await InsertBulkCouchDB(lstGearPerformances);

    let GearTypeData = await ExecuteOracleSQL(odb, 'SELECT * FROM NORPAC.ATL_LOV_GEAR_TYPE WHERE GEAR_TYPE_CODE IN (SELECT GEAR_TYPE_CODE FROM NORPAC.ATL_HAUL WHERE DEPLOY_LATITUDE_DEGREES < 49)');
    let lstGearTypes: any[] = [];

    for (let i = 0; i < GearTypeData.length; i++) {
        let docGearType = {
            type: 'ashop-gear-type',
            gearTypeCode: GearTypeData[i][0],
            gearTypeForm: GearTypeData[i][1],
            description: GearTypeData[i][2]
        }
        lstGearTypes.push(docGearType);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstGearTypes);



}

async function MigratePorts() {
    let odb = await AshopConnection();
    let PortData = await ExecuteOracleSQL(odb, `SELECT PORT_CODE, NAME, STATE_CODE FROM NORPAC.ATL_LOV_PORT_CODE WHERE STATE_CODE != 'AK'`)
    let lstPorts = [];

    for (let i = 0; i < PortData.length; i++) {
        let docPort = {
            type: 'ashop-port',
            portCode: PortData[i][0],
            name: PortData[i][1],
            state: PortData[i][2]
        }
        lstPorts.push(docPort);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstPorts);
}

async function MigrateVesselType() {
    let odb = await AshopConnection();
    let VesselTypeData = await ExecuteOracleSQL(odb, `SELECT VESSEL_TYPE, DESCRIPTION FROM NORPAC.ATL_LOV_VESSEL_TYPE WHERE VESSEL_TYPE IN (SELECT VESSEL_TYPE FROM ATL_HAUL WHERE DEPLOY_LATITUDE_DEGREES < 49)`)
    let lstVesselTypes = [];

    for (let i = 0; i < VesselTypeData.length; i++) {
        let docVesselType = {
            type: 'ashop-vessel-type',
            vesselType: VesselTypeData[i][0],
            description: VesselTypeData[i][1]
        };
        lstVesselTypes.push(docVesselType);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstVesselTypes);
}

async function MigrateCdqCodes() {
    let odb = await AshopConnection();
    let CdqData = await ExecuteOracleSQL(odb, `SELECT CDQ_CODE, DESCRIPTION FROM NORPAC.ATL_LOV_CDQ WHERE CDQ_CODE IN (SELECT CDQ_CODE FROM ATL_HAUL WHERE DEPLOY_LATITUDE_DEGREES < 49)`)
    let lstCdqCodes = [];

    for (let i = 0; i < CdqData.length; i++) {
        let docCdq = {
            type: 'ashop-tribal-delivery',
            cdqCode: CdqData[i][0],
            description: CdqData[i][1]
        };
        lstCdqCodes.push(docCdq);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstCdqCodes);
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

async function MigrateCondition() {

    let odb = await AshopConnection();
    let ConditionData = await ExecuteOracleSQL(odb, `SELECT CONDITION_CODE, ATL_LOV_CONDITION.DESCRIPTION, ATL_LOV_ANIMAL_TYPE.ANIMAL_TYPE_CODE, ATL_LOV_ANIMAL_TYPE.DESCRIPTION FROM NORPAC.ATL_LOV_CONDITION JOIN NORPAC.ATL_LOV_ANIMAL_TYPE ON ATL_LOV_CONDITION.ANIMAL_TYPE_CODE = ATL_LOV_ANIMAL_TYPE.ANIMAL_TYPE_CODE`);
    let lstConditions = [];

    for (let i = 0; i < ConditionData.length; i++) {
        let docCondition = {
            type: 'ashop-condition',
            conditionCode: ConditionData[i][0],
            description: ConditionData[i][1],
            animalCode: ConditionData[i][2],
            animalDescription: ConditionData[i][3]
        };
        lstConditions.push(docCondition);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstConditions);
}

async function MigrateSampleSystem() {

    let odb = await AshopConnection();
    let SampleSystemData = await ExecuteOracleSQL(odb, `SELECT * FROM ATL_LOV_SAMPLE_SYSTEM_CODE WHERE SAMPLE_SYSTEM_CODE IN ( SELECT SAMPLE_SYSTEM_CODE FROM NORPAC.ATL_HAUL WHERE DEPLOY_LATITUDE_DEGREES < 49)`)
    let lstSampleSystems = [];

    for (let i = 0; i < SampleSystemData.length; i++) {
        let docNewSampleSystem = {
            type: 'ashop-sample-system',
            sampleSystemCode: SampleSystemData[i][0],
            description: SampleSystemData[i][1]
        }
        lstSampleSystems.push(docNewSampleSystem);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstSampleSystems);

}

async function MigrateMaturity() {
    let odb = await AshopConnection();
    let MaturityData = await ExecuteOracleSQL(odb, `SELECT MATURITY_SEQ, CODE, DESCRIPTION FROM NORPAC.ATL_LOV_MATURITY`)
    let lstMaturities = [];

    for (let i = 0; i < MaturityData.length; i++) {
        let docNewMaturity = {
            type: 'ashop-maturity',
            maturitySeq: MaturityData[i][0],
            code: MaturityData[i][1],
            description: MaturityData[i][2]
        }
        lstMaturities.push(docNewMaturity);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstMaturities);
}

async function MigrateSpecimenType() {
    let odb = await AshopConnection();
    let SpecimenType = await ExecuteOracleSQL(odb, `SELECT MATURITY_SEQ, CODE, DESCRIPTION FROM NORPAC.ATL_LOV_MATURITY`)
    let lstSpecimenTypes = [];

    for (let i = 0; i < SpecimenType.length; i++) {
        let docNewSpecimenType = {
            type: 'ashop-specimen-type',
            specimenType: SpecimenType[i][0],
            isValueRequired: SpecimenType[i][1],
            description: SpecimenType[i][2]
        }
        lstSpecimenTypes.push(docNewSpecimenType);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstSpecimenTypes);
}

async function MigrateSampleUnit() {
    let odb = await AshopConnection();
    let SampleUnitData = await ExecuteOracleSQL(odb, `SELECT SAMPLE_UNIT_CODE, DESCRIPTION FROM NORPAC.ATL_LOV_SAMPLE_UNIT`)
    let lstSampleUnits = [];

    for (let i = 0; i < SampleUnitData.length; i++) {
        let docNewSampleUnit = {
            type: 'ashop-sample-unit',
            sampleUnitCode: SampleUnitData[i][0],
            description: SampleUnitData[i][1]
        }
        lstSampleUnits.push(docNewSampleUnit);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstSampleUnits);
}

async function MigrateAnimalTypes() {
    let odb = await AshopConnection();
    let AnimalTypeData = await ExecuteOracleSQL(odb, `SELECT ANIMAL_TYPE_CODE, DESCRIPTION FROM ATL_LOV_ANIMAL_TYPE`)
    let lstAnimalTypes = [];

    for (let i = 0; i < AnimalTypeData.length; i++) {
        let docNewAnimalType = {
            type: 'ashop-animal-type',
            animalTypeCode: AnimalTypeData[i][0],
            description: AnimalTypeData[i][1]
        }
        lstAnimalTypes.push(docNewAnimalType);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstAnimalTypes);
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

    await CreateViews();

    await MigrateAllLookups();


    // await InsertBulkCouchDB(lstTest);

    let strDateCompare = '1000-01-01 00:00:00';
    let DateCompare = new Date(strDateCompare);
    let strDateLimit = '2019-05-29 12:13:00';

    UploadedDate = moment(strDateLimit, moment.ISO_8601).format();

    let dictNewHaulIDsByTrip = await MigrateHaulDocs(strDateCompare, strDateLimit);
    await MigrateCruises(dictNewHaulIDsByTrip, strDateCompare, strDateLimit);


}



Initialize();




// TODO everything