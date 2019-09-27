import { SightingEvent, InteractionEvent, WcgopHlfcConfiguration, WcgopTrip, Port, Person, WcgopFishTicket, GearType, WcgopTripTypeName, Vessel, Program, TripStatus, FirstReceiver, Fishery } from "../../../boatnet/libs/bn-models";
import { GetDocFromDict } from "../Common/common-functions";
import moment = require("moment");
import { UploadedBy, UploadedDate } from "../Common/common-variables";
import { dictAllTrips, dictFishery, dictFirstReceivers, dictGearType, dictTripStatus, dictPorts, dictProgram, dictVessels } from "./wcgop-etl";
import { BuildMmsbt } from "./build-mmsbt";
import { BuildHlfc } from "./build-hlfc";
import { BuildFishTickets } from "./build-fish-tickets";

export async function BuildTrip(odb: any, iTripID: number, lstHaulIDs: string[]) {
    // let lstTripData = await ExecuteOracleSQL(odb, strTripSQL + iTripID);
    // lstTripData = lstTripData[0];
    let lstTripData = dictAllTrips[iTripID];
    let iProgramID = lstTripData[3];
    let iDeparturePortID = lstTripData[6];
    let iReturnPortID = lstTripData[8];
    let iVesselID = lstTripData[1];
    let iUserCreatedByID = lstTripData[13];
    let iUserModifiedByID = lstTripData[15];
    let iObserverID = lstTripData[2];


    let SpeciesSightings: SightingEvent[] = null;
    let SpeciesInteractions: InteractionEvent[] = null;
    //let [, SpeciesInteractions] = await BuildMmsbt(iTripID);
    [SpeciesSightings, SpeciesInteractions] = await BuildMmsbt(iTripID);


    //let HlfcConfig = null;
    let HlfcConfig: WcgopHlfcConfiguration[] = await BuildHlfc(iTripID);

    //let FishTickets = null;
    let FishTickets = await BuildFishTickets(odb, iTripID);

    let Fishery = await GetDocFromDict(dictFishery, lstTripData[23], 'fishery-lookup', 'LookupDocs');
    if (Fishery != null) {
        Fishery = {
            description: Fishery.description,
            _id: Fishery._id
        }
    }


    let FirstReceiver = await GetDocFromDict(dictFirstReceivers, lstTripData[28], 'first-receiver-lookup', 'LookupDocs');
    if (FirstReceiver != null) {
        FirstReceiver.legacy = undefined;
    }


    let IntendedGearType = await GetDocFromDict(dictGearType, lstTripData[36], 'gear-type-lookup', 'LookupDocs')
    if (IntendedGearType != null) {
        IntendedGearType = {
            description: IntendedGearType.description,
            _id: IntendedGearType._id
        }
    }


    let Observer = iObserverID // await GetDocFromDict(dictUsers, iObserverID, 'legacy.userId');
    let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId');
    let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');
    let Program = await GetDocFromDict(dictProgram, iProgramID, 'all-programs', 'MainDocs');
    if (Program != null) {
        Program.legacy = undefined;
    }
    let DeparturePort = await GetDocFromDict(dictPorts, iDeparturePortID, 'all-ports', 'MainDocs');
    if (DeparturePort != null) {
        DeparturePort.legacy = undefined;
    }
    let ReturnPort = await GetDocFromDict(dictPorts, iReturnPortID, 'all-ports', 'MainDocs');
    if (ReturnPort != null) {
        ReturnPort.legacy = undefined;
    }
    let Vessel = await GetDocFromDict(dictVessels, iVesselID, 'all-vessels', 'MainDocs');
    if (Vessel != null) {
        Vessel.legacy = undefined;
    }
    let TripStatus = await GetDocFromDict(dictTripStatus, lstTripData[5], 'trip-status-lookup', 'LookupDocs')

    if (TripStatus != null) {
        TripStatus = {
            description: TripStatus.description,
            _id: TripStatus._id
        }
    }
    let cTrip: WcgopTrip = ConstructTripWCGOP(lstTripData, CreatedBy, ModifiedBy, Vessel, DeparturePort, ReturnPort, Program, Observer, lstHaulIDs, HlfcConfig, TripStatus, SpeciesSightings, SpeciesInteractions, FishTickets, Fishery, FirstReceiver, IntendedGearType);

    return cTrip
}


function ConstructTripWCGOP(TripData: any, CreatedBy: any, ModifiedBy: any, Vessel: Vessel,
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
        // captain: TripData[22],
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