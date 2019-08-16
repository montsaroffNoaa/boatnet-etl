//import { UserWCGOP } from "./UserWCGOP";
//import { CatchCategory } from "./CatchCategory";

import {
    Certificate,
    WcgopCatch, WcgopTrip, Biostructure, BiostructureTypeName, BoatnetUser, SightingEvent, SightingEventTypeName, 
    WcgopOperation, WcgopOperationTypeName,
    WcgopCatchTypeName, WcgopTripTypeName, 
    WcgopSpecimen, WcgopDiscardReason, WcgopSpecimenTypeName, InteractionEvent,
    WcgopFishTicket, InteractionEventTypeName, Measurement, Basket, BasketTypeName
} from "../libs/bn-models";

//import { Lookup } from "./Lookup";

import { GetDocFromDict, dictBiostructureType, dictContactType, dictContactCategory, dictRelation, dictVesselStatus, UploadedDate, UploadedBy, GenerateCouchID } from ".";

import { Point } from "geojson";
import { WcgopHlfcConfiguration, WcgopHlfcConfigurationTypeName } from "../libs/bn-models/models/wcgop/wcgop-hlfc-configuration";
import { CatchDisposition, GearType, Behavior, Beaufort, InteractionType, InteractionOutcome, SpeciesSubCategory, BiospecimenSampleMethod, HlfcProductDeliveryState, HlfcMitigationType, HlfcAerialExtent, HlfcHorizontalExtent, Confidence, DiscardReason, FirstReceiver, GearPerformance } from "../libs/bn-models/models/_lookups";
import { Person, PersonTypeName, ProgramTypeName, Vessel, VesselTypeName, Species, SpeciesTypeName, BodyLength, SightingCondition, Fishery } from "../libs/bn-models/dist";
import { FishingLocation, FishingLocationTypeName } from "../libs/bn-models/models/_common/fishing-location";
import { Port, PortTypeName } from "../libs/bn-models/models/_lookups/port";
import { TripStatus } from "../libs/bn-models/models/_lookups/trip-status";
import { Program } from "../libs/bn-models/models/_lookups/program";
import { WeightMethod } from "../libs/bn-models/models/_lookups/weight-method";

var moment = require('moment');
//import { Vessel_Contact } from "./VesselContact";


export function ConstructCatchWCGOP(CatchData: any, CreatedBy: any, ModifiedBy: any, iCatchCatID: number, strCatchCatName: string, strCatchCatCode: string, SubCatch: WcgopCatch[], WeightMethod: WeightMethod, Disposition: CatchDisposition) {


    let ModifiedDate = CatchData[38];
    let ComputerEditedDate = CatchData[18]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = CatchData[39];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = CatchData[17];
    }

    let Weight;
    if (CatchData[3] == null) {
        Weight = null;
    } else {
        if (CatchData[4] == 'LB'){
            CatchData[4] = 'lbs';
        }
        Weight = {
            measurementType: 'weight',
            value: CatchData[3],
            units: CatchData[4]
        }
    }


    let SampleWeight;
    if (CatchData[20] == null) {
        SampleWeight = null;
    } else {
        if (CatchData[21] == 'LB'){
            CatchData[21] = 'lbs';
        }
        SampleWeight = {
            measurementType: 'weight',
            value: CatchData[20],
            units: CatchData[21]
        }
    }

    let Volume;
    if (CatchData[10] == null) {
        Volume = null;
    } else {
        Volume = {
            measurementType: 'volume',
            value: CatchData[10],
            units: CatchData[11]
        }
    }


    let Density;
    if (CatchData[12] == null) {
        Density = null;
    } else {
        Density = {
            measurementType: 'density',
            value: CatchData[12],
            units: CatchData[13]
        }
    }


    let NewCatch: WcgopCatch = {
        type: WcgopCatchTypeName,
        createdBy: CatchData[15],
        createdDate: moment(CatchData[16], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate,
        notes: CatchData[14],
        dataSource: CatchData[37],
        catchNum: CatchData[1],
        disposition: Disposition,
        weightMethod: WeightMethod,
        children: SubCatch,
        weight: Weight,
        count: CatchData[6],
        sampleWeight: SampleWeight,
        sampleCount: CatchData[22],
        gearSegmentsSampled: CatchData[33], // TODO


        legacy: {

            catchId: CatchData[0],
            catchCategoryId: iCatchCatID,
            catchCategoryName: strCatchCatName,
            catchCategoryCode: strCatchCatCode,
            catchPurity: CatchData[9],

            volume: Volume,
            density: Density,

            basketsWeighedItq: CatchData[28],
            totalBasketsItq: CatchData[29],
            partialBasketWeightItq: CatchData[30],
            unitsSampledItq: CatchData[31],
            totalUnitsItq: CatchData[32],
            basketWeightKp: CatchData[34],
            addlBasketWeightKp: CatchData[35],
            basketWeightCountKp: CatchData[36],
            hooksSampled: CatchData[19]

        }

        //discard_reason: CatchData[8],

    }
    return NewCatch;
}



export async function ConstructPerson(ContactData: any, ContactUser: Person, Port: Port, CreatedBy: BoatnetUser, ModifiedBy: BoatnetUser) {


    let ModifiedDate = ContactData[29];
    let ComputerEditedDate = ContactData[25]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = ContactData[30];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = ContactData[24];
    }

    let ContactType = await GetDocFromDict(dictContactType, ContactData[18], 'contact-type-lookup', 'LookupDocs');
    let ContactCategory = await GetDocFromDict(dictContactCategory, ContactData[19], 'contact-category-lookup', 'LookupDocs');
    let RelationToObserver = await GetDocFromDict(dictRelation, ContactData[20], 'relationship-lookup', 'LookupDocs');

    let NewPerson: Person = {
        type: PersonTypeName,
        firstName: ContactData[2],
        lastName: ContactData[3],
        addressLine1: ContactData[4],
        addressLine2: ContactData[5],
        city: ContactData[6],
        state: ContactData[7],
        zipCode: ContactData[8],
        country: ContactData[9],
        homePhone: ContactData[10],
        workPhone: ContactData[11],
        cellPhone: ContactData[12],
        workEmail: ContactData[13],
        homeEmail: ContactData[14],
        epirbNum: [ContactData[15], ContactData[16], ContactData[28]],
        port: Port,
        //contactType: ContactType, // LOOKUP
        //contactCategory: ContactCategory, // LOOKUP
        //relationToObserver: RelationToObserver, // LOOKUP
        notes: ContactData[21],
        createdBy: ContactData[22],
        createdDate: moment(ContactData[23], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        birthdate: ContactData[26],
        // license: ContactData[27], todo 
        

        // etl'd to array
        //epirbIdNum: ContactData[15],
        //epirbSerialNum: ContactData[16],
        //epirbIdNum_2: ContactData[28],

        legacy: {
            PersonId: ContactData[0],
            userId: ContactData[1]

        }
    }
    return NewPerson;

}



export function ConstructHaulWCGOP(HaulData: any, CreatedBy: any, ModifiedBy: any, Catches: WcgopCatch[], WeightMethod:
    WeightMethod, GearPerformance: GearPerformance, GearType: GearType, FishingLocations: FishingLocation[]) {
    let bEFP: boolean;
    let bDataQuality: boolean;
    //let bBRDPresent: boolean;


    if (HaulData[22] == 'EFP') {
        bEFP = true;
    } else {
        bEFP = false;
    }

    if (HaulData[32] == '2') {
        bDataQuality = true;
    } else if (HaulData[32] == '1') {
        bDataQuality = false;
    } else {
        bDataQuality = undefined;
    }

    //TODO migrate to mmsbt?
    // if (HaulData[35] == '1') {
    //     bBRDPresent = true;
    // } else if (HaulData[35] = '0') {
    //     bBRDPresent = false;
    // } else {
    //     bBRDPresent = undefined;
    // }


    let ModifiedDate = HaulData[37];
    let ComputerEditedDate = HaulData[17]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = HaulData[38];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = HaulData[16];
    }

    let ObserverTotalCatch;
    if (HaulData[2] == null) {
        ObserverTotalCatch = null;
    } else {
        
        if (HaulData[3] == 'LB'){
            HaulData[3] = 'lbs';
        }
        ObserverTotalCatch = {
            measurement: {
                measurementType: 'weight',
                value: HaulData[2],
                units: HaulData[3]
            },
            weightMethod: WeightMethod
        }
    }



    let Volume;
    if (HaulData[9] == null) {
        Volume = null;
    } else {
        Volume = {
            measurementType: 'volume',
            value: HaulData[9],
            units: HaulData[10]
        }
    }


    let Density;
    if (HaulData[11] == null) {
        Density = null;
    } else {
        Density = {
            measurementType: 'density',
            value: HaulData[11],
            units: HaulData[12]
        }
    }


    let NewHaul: WcgopOperation = {
        type: WcgopOperationTypeName,
        createdBy: HaulData[14],
        createdDate: moment(HaulData[15], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate,
        notes: HaulData[13],
        dataSource: HaulData[31],

        operationNum: HaulData[1],
        locations: FishingLocations,
        observerTotalCatch: ObserverTotalCatch,
        gearType: GearType,
        gearPerformance: GearPerformance,
        beaufortValue: HaulData[8],
        //targetStrategy: null, // TODO

        isEfpUsed: bEFP,
        isDeterrentUsed: HaulData[25], // TODO double check its boolean, migrate to mmsbt?
        calWeight: HaulData[33],
        fit: HaulData[34],
        //isHaulUnsampled: null, // TODO 
        isGearLost: HaulData[28], // is not boolean, unsure what num repesents
        isDataQualityPassing: bDataQuality,
        catches: Catches,

        legacy: {
            obsprodLoadDate: moment(HaulData[39], moment.ISO_8601).format(),
            fishingActivityId: HaulData[0],
            excluderType: HaulData[30],
            tripId: HaulData[36],
            volume: Volume,
            density: Density
        }

        // total_hooks: HaulData[5],
        // catch_category: CatchCategory,
        // catch_weight_kp: HaulData[19],
        // catch_count_kp: HaulData[20],
        // hooks_sampled_kp: HaulData[21],
        // sample_weight_kp: HaulData[23],
        // sample_count_kp: HaulData[24],
        // deterrent_used: HaulData[25],
        // avg_soak_time: HaulData[26],
        // tot_gear_segments: HaulData[27],
        // total_hooks_lost: HaulData[29],
        // brd_present: bBRDPresent,
    }
    return NewHaul;
}


// all lookup docs have same structure, this allows the use of the same repeated process
export function ConstructLookup(LookupData: any, strType: string) {

    let ModifiedDate = LookupData[12];
    let ComputerEditedDate = LookupData[7];
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = LookupData[13];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = LookupData[6];
    }

    let NewLookup: any = {
        type: strType,
        description: LookupData[3],
        createdBy: LookupData[4],
        createdDate: moment(LookupData[5], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,

        legacy: {
            lookupVal: LookupData[2],
            programId: LookupData[8],
            active: LookupData[9],
            sortOrder: LookupData[10],
            lookupId: LookupData[0],
            obsprodLoadDate: LookupData[11],
            lookupType: LookupData[1]
        }
    };

    return NewLookup;
}



export function ConstructPort(PortData: any, CreatedBy: Person, ModifiedBy: Person) {

    let ModifiedDate = PortData[11];
    let ComputerEditedDate = PortData[8]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = PortData[12];
    } else if (ModifiedDate! + null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = PortData[7];
    }

    let NewPort: Port = {
        type: PortTypeName,
        name: PortData[1],
        code: PortData[2],
        group: PortData[3],
        state: PortData[4],
        createdBy: PortData[5],
        createdDate: moment(PortData[6], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,

        legacy: {
            portId: PortData[0],
            obsprodLoadDate: moment(PortData[13], moment.ISO_8601).format(),
            ifqPortId: PortData[9],
            ifqPortCode: PortData[10]

        }
    }
    return NewPort;
}



export function ConstructProgram(ProgramData: any, CreatedBy: Person, ModifiedBy: Person) {


    let ModifiedDate = ProgramData[7];
    let ComputerEditedDate = ProgramData[6]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = ProgramData[8];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = ProgramData[5];
    }


    let NewProgram: Program = {
        type: ProgramTypeName,
        name: ProgramData[1],
        description: ProgramData[2],
        createdBy: ProgramData[3],
        createdDate: moment(ProgramData[4], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,

        legacy: {
            programId: ProgramData[0],
            obsprodLoadDate: moment(ProgramData[9], moment.ISO_8601).format()
        }
    }
    return NewProgram;
}



export function ConstructTripWCGOP(TripData: any, CreatedBy: any, ModifiedBy: any, Vessel: Vessel,
    DeparturePort: Port, ReturnPort: Port, Program: Program, Observer: Person, Hauls: string[],
    HlfcConfig: WcgopHlfcConfiguration[], TripStatus: TripStatus, SpeciesSightings: SightingEvent[], SpeciesInteractions: InteractionEvent[], FishTickets: WcgopFishTicket[],
    Fishery: Fishery, FirstReceiver: FirstReceiver, IntendedGearType: GearType) {
    let bFishProcessed: boolean;
    let bFishingActivity: boolean;

    if (TripData[34] == '1') {
        bFishProcessed = true;
    } else if (TripData[34] == '0') {
        bFishProcessed = false;
    } else {
        bFishProcessed = null;
    }

    if (TripData[35] == '1') {
        bFishingActivity = true;
    } else {
        bFishingActivity = false;
    }


    let ModifiedDate = TripData[38];
    let ComputerEditedDate = TripData[16]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = TripData[39];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = TripData[15];
    }

    let bDataQualityPassing;
    if (TripData[12] == 2) {
        bDataQualityPassing = true;
    } else if (TripData[12] == 1) {
        bDataQualityPassing = false;
    } else {
        bDataQualityPassing = null;
    }

    let bPartialTrip;
    if (TripData[21] == 'P' || TripData[21] == 'T') {
        bPartialTrip = true;
    } else {
        bPartialTrip = false;
    }




    let NewTrip: WcgopTrip = {
        type: WcgopTripTypeName,
        createdBy: TripData[13],
        createdDate: moment(TripData[14], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate,
        notes: TripData[11],
        dataSource: TripData[33],
        operationIDs: Hauls,
        captain: TripData[22],
        vessel: Vessel,

        departurePort: DeparturePort,
        departureDate: TripData[7],
        returnPort: ReturnPort,
        returnDate: TripData[9],
        //hlfc: HlfcConfig, todo

        observer: Observer, // todo
        program: Program,
        isPartialTrip: bPartialTrip,
        fishingDays: TripData[37],
        fishery: Fishery,
        crewSize: TripData[24],
        firstReceivers: [FirstReceiver],
        logbookNum: TripData[10],
        logbookType: TripData[27], // todo
        observerLogbookNum: TripData[19],
        isExpanded: null, // todo
        doExpand: TripData[31],
        isFishProcessed: bFishProcessed,
        tripStatus: TripStatus,
        // isDataQualityPassing: bDataQualityPassing, no longer capture
        debriefer: TripData[4],
        sightingEvents: SpeciesSightings,
        interactionEvents: SpeciesInteractions,

        //brd?: WcgopBrd[];

        fishTickets: FishTickets,
        certificates: null, // todo
        waiver: null, // todo
        intendedGearType: IntendedGearType,


        legacy: {
            tripId: TripData[0],
            otcKp: TripData[17],
            totalHooksKp: TripData[18],
            export: TripData[29], // status of expansion, ETL to isExpanded
            runTer: TripData[32],
            evaluationId: TripData[20], // TODO Evaluation parent
            permitNum: TripData[25], // ETL to Certificate
            licenseNum: TripData[26], // ETL to Certificate
            isNoFishingActivity: bFishingActivity, // did fishing NOT occur?
            obsprodLoadDate: moment(TripData[40], moment.ISO_8601).format()
        }
    }
    return NewTrip;
}


export async function ConstructFishingLocation(FishingLocationData: any) {



    let ModifiedDate = FishingLocationData[11];
    let ComputerEditedDate = FishingLocationData[15]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = FishingLocationData[14];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = FishingLocationData[10];
    }

    let NewLocation: FishingLocation = {
        location: {
            type: "Point",
            coordinates: [FishingLocationData[3], FishingLocationData[4]]
        },
        depth: {
            measurementType: 'length',
            value: FishingLocationData[5],
            units: FishingLocationData[6]
        },
        position: FishingLocationData[7],
        locationDate: moment(FishingLocationData[2], moment.ISO_8601).format(),
        notes: FishingLocationData[12],

        _id: await GenerateCouchID(),
        type: FishingLocationTypeName,
        createdBy: FishingLocationData[8],
        createdDate: moment(FishingLocationData[9], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,

        legacy: {
            fishingLocationId: FishingLocationData[0],
            fishingActivityId: FishingLocationData[1]
        }
    }
    return NewLocation;
}

export async function ConstructSightingEvent(SightingData: any, AnimalBehaviors: Behavior[], Confidence: Confidence, BodyLength: BodyLength, SightingCondition: SightingCondition, BeaufortValue: Beaufort, Species: Species, lstHaulCouchIDs: string[]) {

    let CouchID = await GenerateCouchID();
    let SightingLocation: Point = {
        type: "Point",
        coordinates: [SightingData[4], SightingData[5]]
    }


    let ModifiedDate = SightingData[21];
    let ComputerEditedDate = SightingData[25]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = SightingData[24];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = SightingData[20];
    }


    let ClosestApproach: Measurement;

    if (SightingData[9] != null) {
        ClosestApproach = {
            measurementType: 'length',
            value: SightingData[9],
            units: SightingData[10]
        }
    } else {
        ClosestApproach = null;
    }

    let WaterTemp: Measurement;
    if (SightingData[15] != null) {
        WaterTemp = {
            measurementType: 'temperature',
            value: SightingData[15],
            units: SightingData[16]
        }
    } else {
        WaterTemp = null;
    }


    let NewSighting: SightingEvent = {

        _id: CouchID,
        type: SightingEventTypeName,
        createdBy: SightingData[18],
        createdDate: moment(SightingData[19], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate,
        notes: SightingData[17],
        dataSource: SightingData[26],

        operations: lstHaulCouchIDs,
        species: Species,
        confidentOfSpecies: Confidence,
        sightingDate: moment(SightingData[3], moment.ISO_8601).format(),
        location: SightingLocation,
        beaufort: BeaufortValue,
        sightingConditions: SightingCondition,
        minNumSighted: SightingData[6],
        maxNumSighted: SightingData[7],
        bestNumSighted: SightingData[8],
        closestApproach: ClosestApproach,
        animalBehavior: AnimalBehaviors,
        bodyLengthEstimates: [BodyLength],

        //gearPresent: GearPresentComment;

        legacy: {
            waterTemp: WaterTemp,
            // TODO
            // obsprodLoadDate: moment(SightingData[23], moment.ISO_8601).format()
        }
    }

    return NewSighting;
}

export async function ConstructInteractionEvent(Interactions: InteractionType[], SightingData: any, AnimalBehaviors: Behavior[], Confidence: Confidence, BodyLength: BodyLength, SightingCondition: SightingCondition, BeaufortValue: Beaufort, Species: Species, lstHaulCouchIDs: string[], Outcome: InteractionOutcome) {

    let CouchID = await GenerateCouchID();
    let SightingLocation: Point = {
        type: "Point",
        coordinates: [SightingData[4], SightingData[5]]
    }


    let ModifiedDate = SightingData[21];
    let ComputerEditedDate = SightingData[25]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = SightingData[24];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = SightingData[20];
    }


    let ClosestApproach: Measurement;

    if (SightingData[9] != null) {
        ClosestApproach = {
            measurementType: 'length',
            value: SightingData[9],
            units: SightingData[10]
        }
    } else {
        ClosestApproach = null;
    }

    let WaterTemp: Measurement;
    if (SightingData[15] != null) {
        WaterTemp = {
            measurementType: 'temperature',
            value: SightingData[15],
            units: SightingData[16]
        }
    } else {
        WaterTemp = null;
    }



    let NewInteraction: InteractionEvent = {
        _id: CouchID,
        type: InteractionEventTypeName,
        createdBy: SightingData[18],
        createdDate: moment(SightingData[19], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate,
        notes: SightingData[17],
        dataSource: SightingData[26],

        operations: lstHaulCouchIDs,
        species: Species,
        confidenceOfSpecies: Confidence,
        date: moment(SightingData[3], moment.ISO_8601).format(),
        location: SightingLocation,
        beaufort: BeaufortValue,
        minAnimalCountEstimate: SightingData[6],
        maxAnimalCountEstimate: SightingData[7],
        animalCount: SightingData[8],
        closestApproach: ClosestApproach,
        animalBehavior: AnimalBehaviors,
        interactions: Interactions,
        outcome: Outcome,
        bodyLength: BodyLength,

        //gearPresent: GearPresentComment;

        legacy: {
            sightingCondition: SightingCondition,
            waterTemp: WaterTemp,
            //obsprodLoadDate: moment(SightingData[23], moment.ISO_8601).format()
        }
    }

    return NewInteraction;
}




export function ConstructUserWCGOP(UserData: any) {
    // let NewUser: UserWCGOP = {
    //     type: 'User',
    //     user_id: UserData[0],
    //     first_name: UserData[1],
    //     last_name: UserData[2],
    //     status: UserData[3],
    //     created_by_user_id: UserData[4],
    //     created_date: UserData[5],
    //     modified_by_user_id: UserData[6],
    //     modified_date: UserData[7],
    //     created_by_first_name: UserData[8],
    //     created_by_last_name: UserData[9],
    //     modified_by_first_name: UserData[10],
    //     modified_by_last_name: UserData[11]
    // }
    // return NewUser;
}




export async function ConstructVessel(VesselData: any, CreatedBy: Person, ModifiedBy: Person, Port: Port) {

    let ModifiedDate = VesselData[15];
    let ComputerEditedDate = VesselData[14]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = VesselData[16];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = VesselData[13];
    }

    let VesselType = await GetDocFromDict(dictVesselStatus, VesselData[3], 'vessel-type-lookup', 'LookupDocs');
    if (VesselType != null) {
        VesselType = {
            description: VesselType.description,
            _id: VesselType._id
        }
    }

    let VesselStatus = await GetDocFromDict(dictVesselStatus, VesselData[9], 'vessel-status-lookup', 'LookupDocs');
    if (VesselStatus != null) {
        VesselStatus = {
            description: VesselStatus.description,
            _id: VesselStatus._id
        }
    } else if(VesselData[9] == 'NA'){
        // do nothing
    } else {
        console.log('missing status')
    }

    let NewVessel: Vessel = {
        type: VesselTypeName,
        homePort: Port,
        vesselName: VesselData[2],
        vesselType: VesselType,
        coastGuardNumber: VesselData[4],
        stateRegulationNumber: VesselData[5],
        registeredLength: {
            measurementType: 'length',
            value: VesselData[6],
            units: VesselData[7]
        },
        vesselStatus: VesselStatus,
        notes: VesselData[10],
        createdBy: VesselData[11],
        createdDate: moment(VesselData[12], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        isActive: false,        

        legacy: {
            vesselId: VesselData[0],
            safetyDecalExpiration: VesselData[8],
            obsprodLoadDate: moment(VesselData[17], moment.ISO_8601).format()
        }
    }
    return NewVessel;
}


export function ConstructVesselContact(VesselContactData: any, CreatedBy: Person, ModifiedBy: Person, ContactUser: Person, Vessel: Vessel) {
    // let NewVesselContact: Vessel_Contact = {
    //     type: 'Vessel_Contact',
    //     vessel_contact_id: VesselContactData[0],
    //     vessel: Vessel,
    //     contact: ContactUser,
    //     contact_type: VesselContactData[3],
    //     contact_status: VesselContactData[4],
    //     created_by: CreatedBy,
    //     created_date: VesselContactData[6],
    //     modified_by: ModifiedBy,
    //     modified_date: VesselContactData[8]
    // }
    // return NewVesselContact;
}


export function ConstructCatchSpeciesFromBio(CouchID: string, CatchSpeciesData: any, Specimens: WcgopSpecimen[], Species: Species, DiscardReason: WcgopDiscardReason) {


    let ModifiedDate = CatchSpeciesData[8];
    let ComputerEditedDate = CatchSpeciesData[15]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = CatchSpeciesData[17];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = CatchSpeciesData[7];
    }

    let NewCatchSpecies: WcgopCatch = {
        _id: CouchID,
        type: WcgopCatchTypeName,
        // species: Species,
        discardReason: DiscardReason, // [13]
        specimens: Specimens,
        createdBy: CatchSpeciesData[5],
        createdDate: moment(CatchSpeciesData[6], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate,
        notes: CatchSpeciesData[4],
        dataSource: CatchSpeciesData[16],

        legacy: {
            biospecimenId: CatchSpeciesData[0],
            catchId: CatchSpeciesData[1],
            speciesWeightKp: CatchSpeciesData[10],
            obsprodLoadDate: moment(CatchSpeciesData[14], moment.ISO_8601).format(),
            catchSampleMethod: CatchSpeciesData[3]
        }
    }
    return NewCatchSpecies;
}

export function ConstructCatchSpeciesFromComp(CouchID: string, CatchSpeciesData: any, Baskets: Basket[], Species: Species, DiscardReason: WcgopDiscardReason) {
    let UpdatedDate = null;
    let UpdatedBy = null;

    let SpeciesCompModifiedDate = CatchSpeciesData[7];
    let SpeciesCompComputerEditedOn = CatchSpeciesData[13]
    let SpeciesCompUpdatedDate = null;

    let SpeciesCompItemModifiedDate = CatchSpeciesData[26];
    let SpeciesCompItemsComputerEditedOn = CatchSpeciesData[31];
    let SpeciesCompItemUpdatedDate = null;

    if (SpeciesCompComputerEditedOn != null) {
        SpeciesCompUpdatedDate = SpeciesCompComputerEditedOn;
    } else if (SpeciesCompModifiedDate != null) {
        SpeciesCompUpdatedDate = SpeciesCompModifiedDate;
    }

    if (SpeciesCompItemsComputerEditedOn != null) {
        SpeciesCompItemUpdatedDate = SpeciesCompItemsComputerEditedOn;
    } else if (SpeciesCompItemModifiedDate != null) {
        SpeciesCompItemUpdatedDate = SpeciesCompItemModifiedDate;
    }

    if (SpeciesCompUpdatedDate != null) {
        if (SpeciesCompItemUpdatedDate != null) {
            if (moment(SpeciesCompUpdatedDate, moment.ISO_8601) > moment(SpeciesCompItemUpdatedDate, moment.ISO_8601)) {
                UpdatedDate = moment(SpeciesCompUpdatedDate, moment.ISO_8601).format();
                UpdatedBy = CatchSpeciesData[6];
            } else {
                UpdatedDate = moment(SpeciesCompItemUpdatedDate, moment.ISO_8601).format();
                UpdatedBy = CatchSpeciesData[25];
            }
        }
    } else if (SpeciesCompItemUpdatedDate != null) {
        UpdatedDate = moment(SpeciesCompItemUpdatedDate, moment.ISO_8601).format();
        UpdatedBy = CatchSpeciesData[25];
    }

    let SpeciesWeight;
    if (CatchSpeciesData[18] == null) {
        SpeciesWeight = null;
    } else {
        if (CatchSpeciesData[19] == 'LB'){
            CatchSpeciesData[19] = 'lbs';
        }
        SpeciesWeight = {
            measurementType: 'weight',
            value: CatchSpeciesData[18],
            units: CatchSpeciesData[19]
        }
    }

    let Notes;
    if (CatchSpeciesData[3] == null && CatchSpeciesData[21] == null) {
        Notes = null;
    } else if (CatchSpeciesData[3] == null && CatchSpeciesData[21] != null) {
        Notes = CatchSpeciesData[21];
    } else if (CatchSpeciesData[3] != null && CatchSpeciesData[21] == null) {
        Notes = CatchSpeciesData[3];
    } else {
        Notes = CatchSpeciesData[3] + ' ' + CatchSpeciesData[21]
    }

    let NewCatchSpecies: WcgopCatch = {
        _id: CouchID,
        type: WcgopCatchTypeName,
        // species: Species, TODO fix
        weight: SpeciesWeight,
        sampleCount: CatchSpeciesData[20],
        totalTally: CatchSpeciesData[27],
        discardReason: DiscardReason,
        baskets: Baskets,

        createdBy: CatchSpeciesData[4],
        createdDate: moment(CatchSpeciesData[5], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,

        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate, // uploaded to final CouchDB
        notes: Notes,

        legacy: {
            speciesCompId: CatchSpeciesData[0],
            speciesCompItemId: CatchSpeciesData[15],
            catchId: CatchSpeciesData[1],
            speciesWeightKp: CatchSpeciesData[8],
            speciesWeightKpItq: CatchSpeciesData[28],
            speciesNumberKp: CatchSpeciesData[9],
            speciesNumberKpItq: CatchSpeciesData[29],
            catchSampleMethod: CatchSpeciesData[2],
            basketNumber: CatchSpeciesData[10],
            speciesCompDataSource: CatchSpeciesData[14],
            speciesCompItemDataSource: CatchSpeciesData[33]
        }
    }
    return NewCatchSpecies;
}

// TODO
// export function ConstructSpecies(SpeciesData: any, SpeciesCategory: SpeciesCategory, SpeciesSubcategory: SpeciesSubCategory) {
//     let bActive: boolean;
//     let bPrioritySpecies: boolean;
//     let bBsSpecies: boolean;
//     let bFormRequired: boolean;

//     if (SpeciesData[17] == 0) {
//         bActive = false;
//     } else {
//         bActive = true;
//     }
//     if (SpeciesData[12] == 'Y') {
//         bPrioritySpecies = true;
//     }
//     if (SpeciesData[13] == 'Y') {
//         bBsSpecies = true;
//     }
//     if (SpeciesData[14] == 'Y') {
//         bFormRequired = true;
//     }


//     let ModifiedDate = SpeciesData[8];
//     let ComputerEditedDate = SpeciesData[16]
//     let UpdatedDate = null;
//     let UpdatedBy = null;

//     if (ComputerEditedDate != null) {
//         UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
//         UpdatedBy = SpeciesData[7];
//     } else if (ModifiedDate != null) {
//         UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
//         UpdatedBy = SpeciesData[18];
//     }

//     let NewSpecies: Species = {
//         type: SpeciesTypeName,
//         scientificName: SpeciesData[1],
//         commonName: SpeciesData[2],
//         pacfinCode: SpeciesData[4],
//         isActive: bActive,
//         createdBy: SpeciesData[5],
//         createdDate: moment(SpeciesData[6], moment.ISO_8601).format(),
//         updatedBy: UpdatedBy,
//         updatedDate: UpdatedDate,

//         legacy: {
//             raceCode: SpeciesData[3],
//             speciesCode: SpeciesData[9],
//             speciesId: SpeciesData[0],
//             speciesCategory: SpeciesCategory,
//             speciesSubcategory: SpeciesSubcategory,
//             prioritySpecies: bPrioritySpecies,
//             bsSpecies: bBsSpecies,
//             formRequired: bFormRequired,
//             obsprodLoadDate: moment(SpeciesData[15], moment.ISO_8601).format()
//         }
//     }
//     return NewSpecies;
// }


export function ConstructFishTicket(FishData: any[], CreatedBy: any, ModifiedBy: any) {

    let NewFishTicket = {
        fishTicketNumber: FishData[1],
        createdBy: CreatedBy,
        createdDate: moment(FishData[3], moment.ISO_8601).format(),
        updatedBy: ModifiedBy,
        updatedDate: moment(FishData[10], moment.ISO_8601).format(),
        tripId: FishData[6],
        stateAgency: FishData[7],
        fishTicketDate: FishData[8],
        dataSoure: FishData[11],

        legacy: {
            fishTicketId: FishData[0],
            obsprodLoadDate: moment(FishData[9], moment.ISO_8601).format()
        }
    }
    return NewFishTicket;
}


export function ConstructTripCertificate(TripCertificateData: any[], CreatedBy: any, ModifiedBy: any) {
    let NewTripCertificate: Certificate = {
        certificateNumber: TripCertificateData[2],
        createdDate: moment(TripCertificateData[3], moment.ISO_8601).format(),
        createdBy: CreatedBy,
        updatedDate: moment(TripCertificateData[9], moment.ISO_8601).format(),
        updatedBy: ModifiedBy,
        certificationId: TripCertificateData[7],
        dataSource: TripCertificateData[10],
        legacy: {
            tripCertificateId: TripCertificateData[0],
            tripId: TripCertificateData[1],
            obsprodLoadDate: moment(TripCertificateData[8], moment.ISO_8601).format()
        }
    }

    return NewTripCertificate;

}



// Biospecimen data
export function ConstructWcgopSpecimenFromItems(CouchID: string, SpecimenItemData: any, Species: Species, Dissections: Biostructure[], DiscardReason: DiscardReason, BioSampleMethod: BiospecimenSampleMethod, CatchID: number) {

    let bIsAdiposePresent: boolean;
    if (SpecimenItemData[13] == 'Y') {
        bIsAdiposePresent = true;
    } else if (SpecimenItemData[13] == 'N') {
        bIsAdiposePresent = false;
    } else {
        bIsAdiposePresent = null;
    }


    let ModifiedDate = SpecimenItemData[10];
    let ComputerEditedDate = SpecimenItemData[17];
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = SpecimenItemData[18];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = SpecimenItemData[11];
    }



    let Length: any;
    if (SpecimenItemData[4] == null) {
        Length = null;
    } else {
        Length = {
            measurementType: 'length',
            value: SpecimenItemData[4],
            units: SpecimenItemData[5]
        }
    }

    let Weight;
    if (SpecimenItemData[2] == null) {
        Weight = null;
    } else {
        if (SpecimenItemData[3] == 'LB'){
            SpecimenItemData[3] = 'lbs';
        }
        Weight = {
            measurementType: 'weight',
            value: SpecimenItemData[2],
            units: SpecimenItemData[3]
        }
    }


    let NewWcgopSpecimen: WcgopSpecimen = {
        _id: CouchID,
        type: WcgopSpecimenTypeName,
        sex: SpecimenItemData[6],
        length: Length,
        weight: Weight,
        viability: SpecimenItemData[12],
        visualMaturity: SpecimenItemData[14],
        biostructures: Dissections,
        biosampleMethod: BioSampleMethod,
        discardReason: DiscardReason,
        isAdiposePresent: bIsAdiposePresent,
        tags: [SpecimenItemData[19]],
        createdBy: SpecimenItemData[8],
        createdDate: moment(SpecimenItemData[9], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        notes: SpecimenItemData[7],
        dataSource: SpecimenItemData[15],

        legacy: {
            biospecimenId: SpecimenItemData[1],
            biospecimenItemId: SpecimenItemData[0],
            catchId: CatchID,
            obsprodLoadDate: moment(SpecimenItemData[16], moment.ISO_8601).format()
        }

    }

    return NewWcgopSpecimen;
}


// TODO combine records with identical bsID, sex, length, length um and increase frequency count
export function ConstructWcgopSpecimenFromFreq(CouchID: string, LengthFreqData: any, Species: Species, DiscardReason: DiscardReason, BioSampleMethod: BiospecimenSampleMethod, CatchID: number) {

    let ModifiedDate = LengthFreqData[9];
    let ComputerEditedDate = LengthFreqData[13];
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = LengthFreqData[12];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = LengthFreqData[8];
    }

    let Length: any;
    if (LengthFreqData[1] == null) {
        Length = null;
    } else {
        Length = {
            measurementType: 'length',
            value: LengthFreqData[1],
            units: LengthFreqData[2]
        }
    }


    let NewWcgopSpecimen: WcgopSpecimen = {
        _id: CouchID,
        type: WcgopSpecimenTypeName,
        sex: LengthFreqData[4],
        discardReason: DiscardReason,
        biosampleMethod: BioSampleMethod,
        length: Length,
        createdBy: LengthFreqData[6],
        createdDate: moment(LengthFreqData[7], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        dataSource: LengthFreqData[14],

        legacy: {
            lengthFrequencyId: LengthFreqData[0],
            biospecimenId: LengthFreqData[10],
            obsprodLoadDate: moment(LengthFreqData[11], moment.ISO_8601).format()
        }
    }
    return NewWcgopSpecimen;
}









export async function ConstructDissections(CouchIDs: string[], AllDissectionData: any) {
    let AllDissections: Biostructure[] = [];


    for (let i = 0; i < AllDissectionData.length; i++) {
        let ModifiedDate = AllDissectionData[i][7];
        let ComputerEditedDate = AllDissectionData[i][22];
        let UpdatedDate = null;
        let UpdatedBy = null;

        if (ComputerEditedDate != null) {
            UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
            UpdatedBy = AllDissectionData[i][23];
        } else if (ModifiedDate != null) {
            UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
            UpdatedBy = AllDissectionData[i][6];
        }

        let BiostructureType = await GetDocFromDict(dictBiostructureType, AllDissectionData[i][2], 'biostructure-type-lookup', 'LookupDocs');
        if (BiostructureType != null) {
            BiostructureType = {
                description: BiostructureType.description,
                _id: BiostructureType._id
            }
        }

        let NewDissection: Biostructure = {
            _id: CouchIDs[i],
            type: BiostructureTypeName,
            structureType: BiostructureType,
            label: AllDissectionData[i][3],
            createdBy: AllDissectionData[i][4],
            createdDate: moment(AllDissectionData[i][5], moment.ISO_8601).format(),
            updatedBy: UpdatedBy,
            updatedDate: UpdatedDate,
            dataSource: AllDissectionData[i][24],

            legacy: {
                dissectionId: AllDissectionData[i][0],
                bioSpecimenItemId: AllDissectionData[i][1],
                rackId: AllDissectionData[i][8],
                rackPosition: AllDissectionData[i][9],
                bsResult: AllDissectionData[i][10],
                cwtCode: AllDissectionData[i][11],
                cwtStatus: AllDissectionData[i][12],
                cwtType: AllDissectionData[i][13],
                age: AllDissectionData[i][14],
                ageReader: AllDissectionData[i][15],
                ageDate: AllDissectionData[i][16],
                ageLocation: AllDissectionData[i][17],
                ageMethod: AllDissectionData[i][18],
                bandId: AllDissectionData[i][19]
            }
        }
        AllDissections.push(NewDissection);
    }

    if (AllDissections.length == 0) {
        return null;
    } else {
        return AllDissections;
    }

}


export function ConstructBaskets(CouchIDs: string[], BasketData: any) {
    let Baskets: Basket[] = [];
    for (let i = 0; i < BasketData.length; i++) {

        let Weight;
        if (BasketData[i][2] == null) {
            Weight = null;
        } else (
            Weight = {
                measurementType: 'weight',
                value: BasketData[i][2],
                units: 'UNKNOWN' // TODO
            }

        )

        let ModifiedDate = BasketData[i][6];
        let ComputerEditedDate = BasketData[i][8]
        let UpdatedDate = null;
        let UpdatedBy = null;
        if (ComputerEditedDate != null) {
            UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
            UpdatedBy = BasketData[i][10];
        } else if (ModifiedDate != null) {
            UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
            UpdatedBy = BasketData[i][6];
        }

        let NewBasket: Basket = {
            _id: CouchIDs[i],
            type: BasketTypeName,
            count: BasketData[i][3],
            weight: Weight,
            createdBy: BasketData[i][5],
            createdDate: moment(BasketData[i][4], moment.ISO_8601).format(),
            updatedBy: UpdatedBy,
            updatedDate: UpdatedDate,
            dataSource: BasketData[i][9],

            legacy: {
                speciesCompItemId: BasketData[i][1],
                speciesCompBasketId: BasketData[i][0]
            }
        }
        Baskets.push(NewBasket);
    }

    if (Baskets.length == 0) {
        Baskets = null;
    }

    return Baskets;

}






export function ConstructHLFC(CouchID: string, HlfcData: any, AvgSpeed: Measurement, WeightPerSinker: Measurement, ProductDeliveryState: HlfcProductDeliveryState, MitigationTypes: HlfcMitigationType[], AvgAerialExtent: HlfcAerialExtent, AvgHorizontalExtent: HlfcHorizontalExtent, CouchOperationIDs: string[], bFloatsUsed: boolean, bWeightsUsed: boolean) {

    let NewHlfcItem: WcgopHlfcConfiguration = {
        _id: CouchID,
        type: WcgopHlfcConfigurationTypeName,
        createdBy: HlfcData[16],
        createdDate: moment(HlfcData[17], moment.ISO_8601).format(),
        updatedBy: HlfcData[18],
        updatedDate: moment(HlfcData[19], moment.ISO_8601).format(),
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate, // uploaded to final CouchDB
        notes: HlfcData[15],
        dataSource: HlfcData[20],
        operations: CouchOperationIDs,
        productDeliveryState: ProductDeliveryState,
        avgSpeed: AvgSpeed,
        floatsUsed: bFloatsUsed,
        floatsPerSegment: HlfcData[7],
        sinkersUsed: bWeightsUsed,
        weightPerSinker: WeightPerSinker,
        avgNumSinkersPerSegment: HlfcData[10],
        mitigationTypes: MitigationTypes,
        avgAerialExtent: AvgAerialExtent,
        avgHorizontalExtent: AvgHorizontalExtent,

        legacy: {
            avgNumHooksPerSegment: HlfcData[5]
        }
    }

    return NewHlfcItem;
}














