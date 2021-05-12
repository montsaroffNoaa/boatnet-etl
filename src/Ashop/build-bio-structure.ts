import { ExecuteOracleSQL, GenerateCouchID, GetDocFromDict } from "../Common/common-functions";
import { strBiostructuresSQL } from "./norpac-sql";
import { dictSpecies, dictMaturities, dictSpecimenTypes } from "./ashop-etl";
import { UploadedBy, UploadedDate } from "../Common/common-variables";
import { Biostructure, BiostructureTypeName } from "@boatnet/bn-models/lib";


export async function BuildBiostructures(odb: any, iCruiseID: number, iLengthID: number, strPermit: string) {
    let lstBiostructures: Biostructure[] = [];
    let lstBiostructureData = await ExecuteOracleSQL(odb, strBiostructuresSQL(iCruiseID, strPermit, iLengthID));


    for (let i = 0; i < lstBiostructureData.length; i++) {
        let strCouchID = await GenerateCouchID();
        let Species = await GetDocFromDict(dictSpecies, lstBiostructureData[i][2], 'ashop-species-lookup', 'ashop-views');
        let Maturity = await GetDocFromDict(dictMaturities, lstBiostructureData[i][3], 'ashop-maturity-lookup', 'ashop-views');
        let SpecimenType = await GetDocFromDict(dictSpecimenTypes, lstBiostructureData[i][5], 'ashop-specimen-type-lookup', 'ashop-views');
        let docNewBiostructure: Biostructure = {
            _id: strCouchID,
            type: BiostructureTypeName,
            createdBy: null, // todo
            createdDate: null, // todo - query history table, if not exists use DATE_OF_ENTRY
            updatedBy: null, // todo
            updatedDate: null, // todo, if history record exists, use DATE_OF_ENTRY, else null
            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,

            // species: Species,
            // maturity: Maturity,
            // length: null, // doesnt exist at this level
            structureType: SpecimenType,
            weight: {
                measurementType: 'weight',
                value: lstBiostructureData[i][7],
                units: 'kg'
            },
            age: {
                measurementType: 'age',
                value: lstBiostructureData[i][8],
                units: 'years'
            },
            label: lstBiostructureData[i][11],

            isAdiposePresent: lstBiostructureData[i][12],

            legacy: {
                age: lstBiostructureData[i][8],
                // cruiseNum: lstBiostructureData[i][0],
                // permit: lstBiostructureData[i][10],
                // specimenSequence: lstBiostructureData[i][1],
                // lengthSequence: lstBiostructureData[i][4],
                // specimenNum: lstBiostructureData[i][6]
            }
        }
        lstBiostructures.push(docNewBiostructure);
    }

    return lstBiostructures;
}
