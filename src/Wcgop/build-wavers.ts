import { ExecuteOracleSQL, InsertBulkCouchDB, ConvertToMomentIso8601, GetDocFromDict, WcgopConnection, ReleaseOracle } from "../Common/common-functions";
import { WaiversTableSQL } from "./oracle-sql";
import { Waiver, WaiverTypeName, Vessel, Fishery, Port } from "@boatnet/bn-models/lib";
import { UploadedBy, UploadedDate } from "../Common/common-variables";
import { dictWaiverReason, dictVessels, dictFishery, dictPorts } from "./wcgop-etl";

export async function BuildAndMigrateWaivers() {
    let connWcgop = await WcgopConnection();
    let waiverTableSQL = WaiversTableSQL();
    let waiversTable: any[] = await ExecuteOracleSQL(connWcgop, waiverTableSQL);
    await ReleaseOracle(connWcgop);
    let newWaiverDocs: Waiver[] = [];

    for (let i = 0; i < waiversTable.length; i++) {
        let waiverRecord = waiversTable[i];

        let iUserCreatedByID = waiverRecord[8];
        let iUserModifiedByID = waiverRecord[10];
        let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId');
        let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');

        let waiverReasonDoc: any = await GetDocFromDict(dictWaiverReason, waiverRecord[2], 'waiver-reason-lookup', 'wcgop')
        let vesselDoc: Vessel = await GetDocFromDict(dictVessels, waiverRecord[1], 'all-vessels', 'wcgop');
        let fisheryDoc: Fishery = await GetDocFromDict(dictFishery, waiverRecord[13], 'fishery-lookup', 'wcgop');
        let landingPortDoc: Port = await GetDocFromDict(dictPorts, waiverRecord[15], 'all-ports', 'wcgop');

        // waiver-reason-lookup

        let WaiverDoc: Waiver = {
            type: WaiverTypeName,
            createdBy: CreatedBy,
            createdDate: ConvertToMomentIso8601(waiverRecord[9]),
            updatedBy: ModifiedBy,
            updatedDate: ConvertToMomentIso8601(waiverRecord[11]),
            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,
            notes: waiverRecord[7],

            reason: waiverReasonDoc,
            waiverType: waiverRecord[3],
            issueDate: ConvertToMomentIso8601(waiverRecord[4]),
            startDate: ConvertToMomentIso8601(waiverRecord[5]),
            endDate: ConvertToMomentIso8601(waiverRecord[6]),
            vessel: vesselDoc,
            fishery: fisheryDoc,
            certificateNumber: waiverRecord[14],
            landingPort: landingPortDoc
        };

        newWaiverDocs.push(WaiverDoc);
    }

    await InsertBulkCouchDB(newWaiverDocs)
}
