import { ExecuteOracleSQL } from "../Common/common-functions";
import { strPortSQL } from "./oracle-sql";
import { Port, Person, PortTypeName } from "../../../boatnet/libs/bn-models";
import moment = require("moment");

export async function BuildPort(odb: any, iPortID: number) {
    if (iPortID != undefined) {
        let lstPortData = await ExecuteOracleSQL(odb, strPortSQL + iPortID);
        lstPortData = lstPortData[0];
        let iUserCreatedByID = lstPortData[5];
        let iUserModifiedByID = lstPortData[7];

        let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId');
        let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');

        let cPort: Port = ConstructPort(lstPortData, CreatedBy, ModifiedBy);
        return cPort;
    } else {
        return null;
    }
}

function ConstructPort(PortData: any, CreatedBy: Person, ModifiedBy: Person) {
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