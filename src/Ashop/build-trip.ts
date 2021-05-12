import { ExecuteOracleSQL, DmsToDD, GetDocFromDict, GenerateCouchID } from "../Common/common-functions";
import { strTripSQL, strAllSampledBySQL } from "./norpac-sql";
import { Point } from "geojson";
import { dictPorts, dictVessels, dictFishingDays, dictObservers, dictObserverSeqByCruise } from "./ashop-etl";
import { UploadedBy, UploadedDate } from "../Common/common-variables";
import moment = require("moment");
import { AshopTripTypeName, Vessel, Fishery, CouchID, Person, AshopTrip } from "@boatnet/bn-models/lib";

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

    // let lstObservers = lstObserverCruiseIDs; // todo lookups

    let lstObservers: any[] = await GetAshopObservers(lstObserverCruiseIDs);

    let DeparturePort = await GetDocFromDict(dictPorts, lstTripData[5], 'ashop-port-lookup', 'ashop-views');
    let ReturnPort = await GetDocFromDict(dictPorts, lstTripData[4], 'ashop-port-lookup', 'ashop-views');
    let Vessel: Vessel = await GetDocFromDict(dictVessels, lstTripData[30], 'ashop-vessel-lookup', 'ashop-views');

    let Fishery: Fishery = {
        name: 'A-SHOP',
        organization: 'Northwest Fisheries Science Center',
        isActive: true
    }

    let couchId: CouchID = await GenerateCouchID();


    let FishingDays = dictFishingDays[iCruiseID + ',' + iTripID + ',' +  strPermit]


    let docNewTrip: AshopTrip = {
        _id: couchId,
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
        vessel: Vessel,
        vesselType: null, // possibly in vessel lookup
        crew: null,
        departureDate: moment(lstTripData[7], moment.ISO_8601).format(),
        returnDate: moment(lstTripData[15], moment.ISO_8601).format(), // CALCULATE FISHING DAYS FROM THIS
        departurePort: DeparturePort,
        returnPort: ReturnPort,
        isExpanded: null, // unknown
        tripNum: lstTripData[3],
        observers: lstObservers,
        fishingDays: null, // lookup - calculate from every day that has a operation with a retrieval date (returnDate) on that day
        fishery: Fishery, // todo - defualt to 'A-SHOP'
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

async function GetAshopObservers(observerCruiseIDs: string[]){
    let observerRangeDocs: any[] = [];

    if(!(observerCruiseIDs)){
        observerCruiseIDs = [];
    }

    for(let i = 0; i < observerCruiseIDs.length; i++){
        let cruiseId = observerCruiseIDs[i];
        let observerSeq = dictObserverSeqByCruise[cruiseId];
        let ObserverDoc: Person = await GetDocFromDict(dictObservers, observerSeq, 'all_persons_by_ashop_id', 'obs-web');
        if(ObserverDoc){
            let ObserverRange = {
                ObserverDoc
            }
            observerRangeDocs.push(ObserverRange)
        }
    }

    return observerRangeDocs;
}
