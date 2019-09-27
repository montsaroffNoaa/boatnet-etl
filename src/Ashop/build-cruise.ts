import { AshopTrip, AshopCruise, AshopCruiseTypeName } from "../../../boatnet/libs/bn-models/models/ashop";

import { ExecuteOracleSQL } from "../Common/common-functions";

import { strCruiseSQL } from "./norpac-sql";

import { UploadedBy, UploadedDate } from "../Common/common-variables";

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