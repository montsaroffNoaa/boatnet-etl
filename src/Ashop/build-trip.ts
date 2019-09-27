import { ExecuteOracleSQL, DmsToDD, GetDocFromDict } from "../Common/common-functions";
import { strTripSQL, strAllSampledBySQL } from "./norpac-sql";
import { Point } from "geojson";
import { dictPorts } from "./ashop-etl";
import { AshopTrip, AshopTripTypeName } from "../../../boatnet/libs/bn-models/models/ashop";
import { UploadedBy, UploadedDate } from "../Common/common-variables";
import moment = require("moment");

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