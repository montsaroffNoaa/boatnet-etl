import { ExecuteOracleSQL } from "../Common/common-functions";
import { strProgramSQL } from "./oracle-sql";
import { Program, Person, ProgramTypeName } from "../../../boatnet/libs/bn-models";
import moment = require("moment");

export async function BuildProgram(odb: any, iProgramID: number) {
    if (iProgramID != undefined) {
        let lstProgramData = await ExecuteOracleSQL(odb, strProgramSQL + iProgramID);
        lstProgramData = lstProgramData[0];
        let iUserCreatedByID = lstProgramData[3];
        let iUserModifiedByID = lstProgramData[5];

        let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId');
        let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');

        let cProgram: Program = ConstructProgram(lstProgramData, CreatedBy, ModifiedBy);

        return cProgram;
    } else {
        return null;
    }
}

function ConstructProgram(ProgramData: any, CreatedBy: Person, ModifiedBy: Person) {
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