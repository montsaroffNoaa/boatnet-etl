import { ExecuteOracleSQL, GenerateCouchID, GetDocFromDict } from "../Common/common-functions";
import { strSamplesByHaulSQL, strSubSamplesByParentSQL, strSampleSpeciesSQL } from "./norpac-sql";
import { UploadedBy, UploadedDate } from "../Common/common-variables";
import { dictSpecies, dictTaxonomyAliases, dictMissingTaxonomyIDs } from "./ashop-etl";
import { BuildSpecimens } from "./build-specimen";
import { AshopCatch, UnsortedCatch, UnsortedCatchTypeName, AshopCatchTypeName, Specimen, TaxonomyAlias } from "@boatnet/bn-models/lib";

// This is a recursive function that builds catch records and subcatch records from the recursive "atl_sample" table in norpac
export async function BuldUnsortedCatchesAndSubcatches(odb: any, iCruiseID: number, iHaulID: number, iParentID: number, strPermit: string) {
    let lstCatchData = [];
    let allCatches: AshopCatch[] = []
    let isSubsample: boolean;

    // if this is the initial call of this function
    if (iParentID == null) {
        lstCatchData = await ExecuteOracleSQL(odb, strSamplesByHaulSQL(iCruiseID, iHaulID, strPermit))
        isSubsample = false;
        // else if this function was called recursively
    } else {
        lstCatchData = await ExecuteOracleSQL(odb, strSubSamplesByParentSQL(iCruiseID, iParentID, strPermit))
        isSubsample = true;
    }
    // if no sub samples exist, it will not get into this loop, should be finite
    for (let i = 0; i < lstCatchData.length; i++) {
        let couchID = await GenerateCouchID();
        let isPresorted: boolean;
        if (lstCatchData[i][7] == 'Y') {
            isPresorted = true;
        } else if (lstCatchData[i][7] == 'N') {
            isPresorted = false;
        } else {
            isPresorted = null;
        }
        let sampleID = lstCatchData[i][1];
        let unsortedSubCatches: AshopCatch[] = await BuldUnsortedCatchesAndSubcatches(odb, iCruiseID, iHaulID, lstCatchData[i][1], lstCatchData[i][10]);
        let sortedCatchData: AshopCatch[] = await BuildSortedCatchContent(odb, iCruiseID, sampleID, strPermit);
        let allChildren = sortedCatchData.concat(unsortedSubCatches);
        let catchContent: UnsortedCatch = { 
            label: 'unsorted catch',
            type: UnsortedCatchTypeName
        };

        let docNewSample: AshopCatch = {
            _id: couchID,
            type: AshopCatchTypeName,

            catchContent: catchContent,

            createdBy: null, // todo
            createdDate: null, // todo - query history table, if not exists use DATE_OF_ENTRY
            updatedBy: null, // todo
            updatedDate: null, // todo, if history record exists, use DATE_OF_ENTRY, else null
            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,

            sampleNum: lstCatchData[i][3],
            isSubsample: isSubsample,
            isPresorted: isPresorted,
            //isTruncated: null, // only going forward
            // specimens: lstSampleSpecies,
            children: allChildren,
            totalSampleWeight: {
                measurementType: 'weight',
                value: lstCatchData[i][8],
                units: 'kg'
            },
            flowScaleStart: null, // unknown
            flowScaleEnd: null, // unknown

            legacy: {
                parentSequence: lstCatchData[i][2],
                cruiseNum: lstCatchData[i][0],
                permit: lstCatchData[i][10],
                sampleSequence: lstCatchData[i][1]
            }

        };
        allCatches.push(docNewSample);
    }

    if (allCatches.length == 0) {
        allCatches = null;
    }
    return allCatches;
}

// This function builds catch documents that are really "sub-sub-catch" level documents from the "atl_species_comp" table in norpac
// "sub-sub-catch" is purely a meta-data description here to differentiate the etl code, that term will not appear in the created documents
export async function BuildSortedCatchContent(odb: any, iCruiseID: number, iSampleID: number, strPermit: string) {
    // from species comp table
    let allCatches: AshopCatch[] = [];
    let catchSpeciesData = await ExecuteOracleSQL(odb, strSampleSpeciesSQL(iCruiseID, strPermit, iSampleID));

    for (let i = 0; i < catchSpeciesData.length; i++) {
        let compositionID = catchSpeciesData[i][1];
        let allSpecimens: Specimen[] = await BuildSpecimens(odb, iCruiseID, compositionID, strPermit);
        let couchID = await GenerateCouchID();
        // let Species = await GetDocFromDict(dictSpecies, catchSpeciesData[i][3], 'ETL-LookupDocs', 'ashop-species-lookup')
        let speciesCode: number = catchSpeciesData[i][3];
        let taxonomyAlias: TaxonomyAlias = await GetDocFromDict(dictTaxonomyAliases, speciesCode, 'taxonomy-alias-by-ashop-id', 'taxonomy-views');

        if(taxonomyAlias == null){
            if(!(speciesCode in dictMissingTaxonomyIDs)){
                dictMissingTaxonomyIDs[speciesCode] = 1;
                console.log('error, ashop species not in taxonomy, id = ' + speciesCode.toString());
            } else {
                dictMissingTaxonomyIDs[speciesCode] += 1;
            }
        } else{
            console.log() // test
        }

        

        let docNewSampleSpecies: AshopCatch = {
            _id: couchID,
            type: AshopCatchTypeName,

            catchContent: taxonomyAlias,

            createdBy: null, // todo
            createdDate: null, // todo - query history table, if not exists use DATE_OF_ENTRY
            updatedBy: null, // todo
            updatedDate: null, // todo, if history record exists, use DATE_OF_ENTRY, else null
            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,

            //species: Species, // todo lookup
            isPredominantSpecies: null, // uncertain
            isNotFlowScaleWeighed: null, // uncertain
            percentRetained: null, // uncertain
            //baskets: null, // doesnt exist
            specimens: allSpecimens,
            sightingEventIds: null,
            sex: catchSpeciesData[i][6], // doesnt appear to have a lookup table, just the value
            totalSampleWeight: {
                measurementType: 'weight',
                value: catchSpeciesData[i][4],
                units: 'kg'
            },

            legacy: {
                cruiseNum: catchSpeciesData[i][0],
                permit: catchSpeciesData[i][71],
                sampleSequence: catchSpeciesData[i][2],
                speciesCompSequence: catchSpeciesData[i][1]
            }
            
        }
        allCatches.push(docNewSampleSpecies);
    }

    return allCatches;
}