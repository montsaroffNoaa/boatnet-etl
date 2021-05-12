
import moment = require("moment");
import { GetDocFromDict } from "../Common/common-functions";
import { dictBiostructureType } from "./wcgop-etl";
import { Biostructure, BiostructureTypeName } from "@boatnet/bn-models/lib";

export async function BuildBiostructures(CouchIDs: string[], AllDissectionData: any) {
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

        let BiostructureType = await GetDocFromDict(dictBiostructureType, AllDissectionData[i][2], 'biostructure-type-lookup', 'wcgop');
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