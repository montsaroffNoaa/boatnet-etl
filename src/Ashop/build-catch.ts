import { AshopCatch, AshopCatchTypeName } from "../../../boatnet/libs/bn-models/models/ashop";
import { ExecuteOracleSQL, GenerateCouchID, GetDocFromDict } from "../Common/common-functions";
import { strSamplesByHaulSQL, strSubSamplesByParentSQL, strSampleSpeciesSQL } from "./norpac-sql";
import { UploadedBy, UploadedDate } from "../Common/common-variables";
import { BuildSpecimens } from "./ashop-build-functions";
import { dictSpecies } from "./ashop-etl";

export async function BuildSamples(odb: any, iCruiseID: number, iHaulID: number, iParentID: number, strPermit: string) {
    let lstSampleData = [];
    let lstSamples: AshopCatch[] = []
    let bIsSubsample: boolean;

    // if this is the initial call of this function
    if (iParentID == null) {
        lstSampleData = await ExecuteOracleSQL(odb, strSamplesByHaulSQL(iCruiseID, iHaulID, strPermit))
        bIsSubsample = false;
        // else if this function was called recursively
    } else {
        lstSampleData = await ExecuteOracleSQL(odb, strSubSamplesByParentSQL(iCruiseID, iParentID, strPermit))
        bIsSubsample = true;
    }
    // if no sub samples exist, it will not get into this loop, should be finite
    for (let i = 0; i < lstSampleData.length; i++) {
        let lstSubsamples: AshopCatch[] = await BuildSamples(odb, iCruiseID, iHaulID, lstSampleData[i][1], lstSampleData[i][10]);
        let strCouchID = await GenerateCouchID();
        let bIsPresorted: boolean;
        if (lstSampleData[i][7] == 'Y') {
            bIsPresorted = true;
        } else if (lstSampleData[i][7] == 'N') {
            bIsPresorted = false;
        } else {
            bIsPresorted = null;
        }
        let iSampleID = lstSampleData[i][1];
        let lstSampleSpecies: AshopSampleSpecies[] = await BuildSampleSpecies(odb, iCruiseID, iSampleID, strPermit);

        let docNewSample: AshopCatch = {
            _id: strCouchID,
            type: AshopCatchTypeName,
            createdBy: null, // todo
            createdDate: null, // todo - query history table, if not exists use DATE_OF_ENTRY
            updatedBy: null, // todo
            updatedDate: null, // todo, if history record exists, use DATE_OF_ENTRY, else null
            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,

            sampleNum: lstSampleData[i][3],
            isSubsample: bIsSubsample,
            isPresorted: bIsPresorted,
            //isTruncated: null, // only going forward
            species: lstSampleSpecies,
            subsamples: lstSubsamples,
            totalSampleWeight: {
                measurementType: 'weight',
                value: lstSampleData[i][8],
                units: 'kg'
            },
            flowScaleStart: null, // unknown
            flowScaleEnd: null, // unknown

            legacy: {
                parentSequence: lstSampleData[i][2],
                cruiseNum: lstSampleData[i][0],
                permit: lstSampleData[i][10],
                sampleSequence: lstSampleData[i][1]
            }

        };
        lstSamples.push(docNewSample);
    }

    if (lstSamples.length == 0) {
        lstSamples = null;
    }
    return lstSamples;
}

export async function BuildSampleSpecies(odb: any, iCruiseID: number, iSampleID: number, strPermit: string) {
    // from species comp table
    let lstSampleSpecies: AshopSampleSpecies[] = [];
    let lstSampleSpeciesData = await ExecuteOracleSQL(odb, strSampleSpeciesSQL(iCruiseID, strPermit, iSampleID));

    for (let i = 0; i < lstSampleSpeciesData.length; i++) {
        let iCompositionID = lstSampleSpeciesData[i][1];
        let lstSpecimens: AshopSpecimen[] = await BuildSpecimens(odb, iCruiseID, iCompositionID, strPermit);
        let strCouchID = await GenerateCouchID();
        let Species = await GetDocFromDict(dictSpecies, lstSampleSpeciesData[i][3], 'ETL-LookupDocs', 'ashop-species-lookup')

        let docNewSampleSpecies: AshopSampleSpecies = {
            _id: strCouchID,
            type: AshopSampleSpeciesTypeName,
            createdBy: null, // todo
            createdDate: null, // todo - query history table, if not exists use DATE_OF_ENTRY
            updatedBy: null, // todo
            updatedDate: null, // todo, if history record exists, use DATE_OF_ENTRY, else null
            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,

            species: Species, // todo lookup
            isPredominantSpecies: null, // uncertain
            isNotFlowScaleWeighed: null, // uncertain
            percentRetained: null, // uncertain
            //baskets: null, // doesnt exist
            specimens: lstSpecimens,
            sightingEventIds: null,
            sex: lstSampleSpeciesData[i][6], // doesnt appear to have a lookup table, just the value
            weight: {
                measurementType: 'weight',
                value: lstSampleSpeciesData[i][4],
                units: 'kg'
            },

            legacy: {
                cruiseNum: lstSampleSpeciesData[i][0],
                permit: lstSampleSpeciesData[i][71],
                sampleSeq: lstSampleSpeciesData[i][2],
                speciesCompSeq: lstSampleSpeciesData[i][1]
            }

        }
        lstSampleSpecies.push(docNewSampleSpecies);
    }

    return lstSampleSpecies;
}