import { ExecuteOracleSQL } from "../Common/common-functions";

import { strCruiseSQL } from "./norpac-sql";

import { UploadedBy, UploadedDate } from "../Common/common-variables";
import { AshopTrip, AshopCruise, AshopCruiseTypeName, CouchID } from "@boatnet/bn-models/lib";
import moment = require("moment");

export async function BuildCruise(odb: any, iCruiseID: number, lstTrips: CouchID[]) {

    let lstCruiseData = await ExecuteOracleSQL(odb, strCruiseSQL(iCruiseID));
    lstCruiseData = lstCruiseData[0];

    let docNewCruise: AshopCruise = {
        type: AshopCruiseTypeName,
        createdBy: null,
        createdDate: moment(lstCruiseData[3], moment.ISO_8601).format(),
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