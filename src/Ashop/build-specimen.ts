import { ExecuteOracleSQL, GetDocFromDict, GenerateCouchID } from "../Common/common-functions";
import { strSpecimensSQL } from "./norpac-sql";
import { dictConditions, dictAnimalTypes, dictSampleSystems } from "./ashop-etl";
import { BuildBiostructures } from "./build-bio-structure";
import { UploadedBy, UploadedDate } from "../Common/common-variables";
import { Biostructure, SpecimenTypeName, AshopSpecimen } from "@boatnet/bn-models/lib";

export async function BuildSpecimens(odb: any, iCruiseID: number, iCompositionID: number, strPermit: string) {
    // from atl_length table
    let lstSpecimens: AshopSpecimen[] = [];
    let lstSpecimensData = await ExecuteOracleSQL(odb, strSpecimensSQL(iCruiseID, strPermit, iCompositionID));

    for (let i = 0; i < lstSpecimensData.length; i++) {

        let strViability = null; // transform into lookup?
        if (lstSpecimensData[i][13] == 'E') {
            strViability = 'Excellent'
        } else if (lstSpecimensData[i][13] == 'P') {
            strViability = 'Poor'
        } else if (lstSpecimensData[i][13] == 'D') {
            strViability = 'Dead'
        } else if (lstSpecimensData[i][13] == 'U') {
            strViability = 'Unknown'
        }

        let Condition = await GetDocFromDict(dictConditions, lstSpecimensData[i][5], 'ashop-condition-lookup', 'ashop-views');
        let AnimalType = await GetDocFromDict(dictAnimalTypes, lstSpecimensData[i][7], 'ashop-animal-type-lookup', 'ashop-views');
        let SampleSystem = await GetDocFromDict(dictSampleSystems, lstSpecimensData[i][6], 'ashop-sample-system-lookup', 'ashop-views');


        let iLengthID = lstSpecimensData[i][1];
        let lstBiostructures: Biostructure[] = await BuildBiostructures(odb, iCruiseID, iLengthID, strPermit);
        let strCouchID = await GenerateCouchID();
        let docNewSpecimen: AshopSpecimen = {
            _id: strCouchID,
            type: SpecimenTypeName,
            specimenNumber: i,
            createdBy: null, // todo
            createdDate: null, // todo - query history table, if not exists use DATE_OF_ENTRY
            updatedBy: null, // todo
            updatedDate: null, // todo, if history record exists, use DATE_OF_ENTRY, else null
            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,

            sex: lstSpecimensData[i][9],
            viability: strViability,
            // length: {
            //     measurementType: 'length',
            //     value: lstSpecimensData[i][10],
            //     units: 'cm'
            // },
            width: null, // probaby n/a
            weight: null, // stored at higher level?
            lifeStage: null, // n/a?
            // population: null, // n/a?
            visualMaturity: null, // n/a?
            biostructures: lstBiostructures,
            numSpecimensInBag: null, // n/a?
            location: null, // n/a?
            protocolIndex: null, // n/a?
            frequency: lstSpecimensData[i][11],

            condition: Condition, // lookup
            // animalType: AnimalType,
            sampleSystem: SampleSystem, // lookup

            
            //mediaData: null, // n/a?
            //specialProjects: null, // n/a? all ashop records have a null in this

            legacy: {
                cruiseNum: lstSpecimensData[i][0],
                permit: lstSpecimensData[i][15],
                haulSeq: lstSpecimensData[i][3], // probably useless here
                offloadSeq: lstSpecimensData[i][4],
                lengthSeq: lstSpecimensData[i][1]
            }


        }
        lstSpecimens.push(docNewSpecimen);
    }

    return lstSpecimens;
}