import { ExecuteOracleSQL, GenerateCouchID, GetDocFromDict } from "../Common/common-functions";
import { strBiostructuresSQL } from "./norpac-sql";
import { dictSpecies, dictMaturities, dictSpecimenTypes } from "./ashop-etl";
import { UploadedBy, UploadedDate } from "../Common/common-variables";


export async function BuildBiostructures(odb: any, iCruiseID: number, iLengthID: number, strPermit: string) {
    let lstBiostructures: AshopBiostructure[] = [];
    let lstBiostructureData = await ExecuteOracleSQL(odb, strBiostructuresSQL(iCruiseID, strPermit, iLengthID));


    for (let i = 0; i < lstBiostructureData.length; i++) {
        let strCouchID = await GenerateCouchID();
        let Species = await GetDocFromDict(dictSpecies, lstBiostructureData[i][2], 'ETL-LookupDocs', 'ashop-species-lookup');
        let Maturity = await GetDocFromDict(dictMaturities, lstBiostructureData[i][3], 'ETL-LookupDocs', 'ashop-maturity-lookup');
        let SpecimenType = await GetDocFromDict(dictSpecimenTypes, lstBiostructureData[i][5], 'ETL-LookupDocs', 'ashop-specimen-type-lookup');
        let docNewBiostructure: AshopBiostructure = {
            _id: strCouchID,
            type: AshopBiostructureTypeName,
            createdBy: null, // todo
            createdDate: null, // todo - query history table, if not exists use DATE_OF_ENTRY
            updatedBy: null, // todo
            updatedDate: null, // todo, if history record exists, use DATE_OF_ENTRY, else null
            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,

            species: Species,
            maturity: Maturity,
            length: null, // doesnt exist at this level
            specimenType: SpecimenType,
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
            specimenNum: lstBiostructureData[i][6],
            barcode: lstBiostructureData[i][11],
            isAdiposePresent: lstBiostructureData[i][12],

            legacy: {
                cruiseNum: lstBiostructureData[i][0],
                permit: lstBiostructureData[i][10],
                specimenSeq: lstBiostructureData[i][1],
                lengthSeq: lstBiostructureData[i][4]
            }
        }
        lstBiostructures.push(docNewBiostructure);
    }

    return lstBiostructures;
}
