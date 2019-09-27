import { AshopTrip, AshopCruise, AshopCruiseTypeName, AshopTripTypeName, AshopCatch, AshopHaul, AshopHaulTypeName, AshopCatchTypeName } from "../../../boatnet/libs/bn-models/models/ashop";
import { ExecuteOracleSQL, DmsToDD, GenerateCouchID, GetDocFromDict } from "../Common/common-functions";
import { strCruiseSQL, strTripSQL, strAllSampledBySQL, strHaulSQL, strFlowScaleWeightSQL, strSamplesByHaulSQL, strSubSamplesByParentSQL, strSampleSpeciesSQL, strSpecimensSQL, strBiostructuresSQL } from "./norpac-sql";
import { UploadedBy, UploadedDate } from "../Common/common-variables";
import { Point } from "geojson";
import moment = require("moment");
import { dictPorts, dictGearTypes, dictGearPerformances, dictTribalDeliveries, dictSampleSystems, dictSampleUnits, dictVesselTypes, dictSpecies, dictConditions, dictAnimalTypes, dictMaturities, dictSpecimenTypes } from "./ashop-etl";

export async function BuildCruise(odb: any, iCruiseID: number, lstTrips: AshopTrip[]) {

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

export async function BuildTrip(odb: any, iCruiseID: number, iTripID: number, strPermit: string, lstHaulIDs: any[]) {

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
// export async function BuildAnimalInteractions(odb: any, iCruiseID: number, strPermit: string, iTripID: number) {

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

export async function BuildHaul(odb: any, iCruiseID: number, iHaulID: number, strPermit: string) {
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

export async function BuildFlowScaleWeight(odb: any, iCruiseID: number, strPermit: string, iHaulID: number) {

    let lstFlowScaleWeightData = await ExecuteOracleSQL(odb, strFlowScaleWeightSQL(iCruiseID, strPermit, iHaulID));

    for (let i = 0; i < lstFlowScaleWeightData.length; i++) {
        // possible to do
    }


}

export async function BuildSamples(odb: any, iCruiseID: number, iHaulID: number, iParentID: number, strPermit: string) {
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

export async function BuildSampleSpecies(odb: any, iCruiseID: number, iSampleID: number, strPermit: string) {
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

export async function BuildSpecimens(odb: any, iCruiseID: number, iCompositionID: number, strPermit: string) {
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

export async function BuildBiostructures(odb: any, iCruiseID: number, iLengthID: number, strPermit: string) {
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
