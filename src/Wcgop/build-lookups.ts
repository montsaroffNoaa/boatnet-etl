import { ExecuteOracleSQL, GenerateCouchID, RemoveDocNullVals, QueryLookupView, ConvertToMomentIso8601 } from "../Common/common-functions";
import moment = require("moment");
import { NewLookups } from "./oracle-sql";

export async function BuildLookups(odb: any, strLookupType: string, strType: string, strDateBegin: string, strDateEnd: string, DateCompare: Date, ViewName: string) {
    let strSQL = NewLookups(strDateBegin, strDateEnd, strLookupType);
    let LookupData = await ExecuteOracleSQL(odb, strSQL);
    let lstLookups = [];
    for (let i = 0; i < LookupData.length; i++) {
        let strCouchID = await GenerateCouchID();
        let cLookup = ConstructLookup(LookupData[i], strType);

        let iLookupID = LookupData[i][0]; // TODO
        let [strDocID, strDocRev] = await QueryLookupView(ViewName, iLookupID);

        if ((cLookup.legacy.obsprodLoadDate > DateCompare || cLookup.createdDate > DateCompare) && strDocID == null) {
            cLookup._id = strCouchID;
        }
        else if (cLookup.updatedDate > DateCompare || strDocID != null) {
            // Else already exists in couch, recreate it
            [strDocID, strDocRev] = await QueryLookupView(ViewName, iLookupID);
            cLookup = JSON.parse(JSON.stringify(cLookup));
            cLookup._id = strDocID;
            cLookup._rev = strDocRev;
        }
        else {
            console.log('error, lookup record niether newly updated or created id = ' + iLookupID)
        }
        cLookup = RemoveDocNullVals(cLookup);
        lstLookups.push(cLookup);
    }
    return lstLookups;

}


// all lookup docs have same structure, this allows the use of the same repeated process
function ConstructLookup(LookupData: any, strType: string) {
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
        createdDate: ConvertToMomentIso8601(LookupData[5]),
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