import { dictAllCatches, dictAllCatchCategory, dictWeightMethod, dictDisposition, dictAllBiospecimens, dictAllBiospecimenItems, dictDiscardReasons, dictBiospecimenSampleMethod, dictAllDissections, dictAllLengthFrequencies, dictAllSpeciesCompositions, dictAllBaskets, dictTaxonomyAliases } from "./wcgop-etl";
import { GetDocFromDict, GenerateCouchIDs, GenerateCouchID } from "../Common/common-functions";
import moment = require("moment");
import { UploadedBy, UploadedDate } from "../Common/common-variables";
import { BuildBiostructures } from "./build-biostructures";
import { ConstructWcgopSpecimenFromItems, ConstructWcgopSpecimenFromFreq } from "./build-specimen";
import { BuildBaskets } from "./build-baskets";
import { WcgopCatch, CatchGrouping, CatchDisposition, WcgopCatchTypeName, WcgopSpecimen, Biostructure, Basket, TaxonomyAlias, WcgopDiscardReason, WeightMethod } from "@boatnet/bn-models/lib";


// todo get rid of species

export async function BuildOldCatch(odb: any, iCatchID: number) {
    if (iCatchID != undefined) {
        //let lstCatchData = await ExecuteOracleSQL(odb, strCatchSQL + iCatchID);
        let lstCatchData = dictAllCatches[iCatchID]
        //lstCatchData = lstCatchData[0]
        let iCatchCatID = lstCatchData[2];
        let iUserCreatedByID = lstCatchData[15];
        let iUserModifiedByID = lstCatchData[17];
        //let lstCatchCatData = await ExecuteOracleSQL(odb, strCatchCategorySQL + iCatchCatID);
        let lstCatchCatData;
        let strCatchName;
        let strCatchCode;

        let catchContent = await GetDocFromDict(dictAllCatchCategory, iCatchCatID, 'catch-grouping-by-catch-category-id', 'taxonomy-views');

        // if (iCatchCatID in dictAllCatchCategory) {
        //     lstCatchCatData = dictAllCatchCategory[iCatchCatID]
        //     strCatchName = lstCatchCatData[1];
        //     strCatchCode = lstCatchCatData[2];
        // } else {
        //     lstCatchCatData = null;
        // }

        let WeightMethod = await GetDocFromDict(dictWeightMethod, lstCatchData[5], 'weight-method-lookup', 'wcgop')
        if (WeightMethod != null) {
            WeightMethod = {
                description: WeightMethod.description,
                _id: WeightMethod._id
            }
        }

        let Disposition = await GetDocFromDict(dictDisposition, lstCatchData[7], 'catch-disposition-lookup', 'wcgop')
        if (Disposition != null) {
            Disposition = {
                description: Disposition.description,
                _id: Disposition._id
            }
        }

        let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId');
        let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');

        let SubCatch: WcgopCatch[] = await BuildCatchSpecies(odb, iCatchID);

        if (SubCatch.length == 0) {
            SubCatch = null;
        }
        let cCatch: WcgopCatch = ConstructCatchWCGOP(lstCatchData, CreatedBy, ModifiedBy, catchContent, SubCatch, WeightMethod, Disposition);
        return cCatch;
    } else {
        return null;
    }
}

function ConstructCatchWCGOP(CatchData: any, CreatedBy: any, ModifiedBy: any, catchContent: CatchGrouping, SubCatch: WcgopCatch[], WeightMethod: WeightMethod, Disposition: CatchDisposition) {
    let ModifiedDate = CatchData[38];
    let ComputerEditedDate = CatchData[18]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = CatchData[39];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = CatchData[17];
    }

    let Weight;
    if (CatchData[3] == null) {
        Weight = null;
    } else {
        if (CatchData[4] == 'LB') {
            CatchData[4] = 'lbs';
        }
        Weight = {
            measurementType: 'weight',
            value: CatchData[3],
            units: CatchData[4]
        }
    }

    let SampleWeight;
    if (CatchData[20] == null) {
        SampleWeight = null;
    } else {
        if (CatchData[21] == 'LB') {
            CatchData[21] = 'lbs';
        }
        SampleWeight = {
            measurementType: 'weight',
            value: CatchData[20],
            units: CatchData[21]
        }
    }

    let Volume;
    if (CatchData[10] == null) {
        Volume = null;
    } else {
        Volume = {
            measurementType: 'volume',
            value: CatchData[10],
            units: CatchData[11]
        }
    }

    let Density;
    if (CatchData[12] == null) {
        Density = null;
    } else {
        Density = {
            measurementType: 'density',
            value: CatchData[12],
            units: CatchData[13]
        }
    }

    let catchCategoryId: number = null;
    let catchCategoryName: string = null;
    let catchCategoryCode: string = null;
    
    if(catchContent && catchContent.legacy){
        catchCategoryId = catchContent.legacy.wcgopCatchCategoryId;
        catchCategoryCode = catchContent.legacy.wcgopCatchCategoryCode;
        catchCategoryName = catchContent.name;
    } else {
        console.log('catchcontent is null', CatchData)
    }

    let NewCatch: WcgopCatch = {
        type: WcgopCatchTypeName,
        catchContent: catchContent,
        createdBy: CatchData[15],
        createdDate: moment(CatchData[16], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate,
        notes: CatchData[14],
        dataSource: CatchData[37],
        catchNum: CatchData[1],
        disposition: Disposition,
        weightMethod: WeightMethod,
        children: SubCatch,
        weight: Weight,
        count: CatchData[6],
        sampleWeight: SampleWeight,
        sampleCount: CatchData[22],
        gearSegmentsSampled: CatchData[33], // TODO

        legacy: {

            catchId: CatchData[0],
            catchCategoryId: catchCategoryId,
            catchCategoryName: catchCategoryName,
            catchCategoryCode: catchCategoryCode,
            catchPurity: CatchData[9],

            volume: Volume,
            density: Density,

            basketsWeighedItq: CatchData[28],
            totalBasketsItq: CatchData[29],
            partialBasketWeightItq: CatchData[30],
            unitsSampledItq: CatchData[31],
            totalUnitsItq: CatchData[32],
            basketWeightKp: CatchData[34],
            addlBasketWeightKp: CatchData[35],
            basketWeightCountKp: CatchData[36],
            hooksSampled: CatchData[19]
        }
        //discard_reason: CatchData[8],
    }
    return NewCatch;
}

export async function BuildCatchSpecies(odb: any, iCatchID: number) {

    let CatchSpecies: WcgopCatch[] = [];
    //let CatchSpeciesData = await ExecuteOracleSQL(odb,  strBioSpecimensSQL + iCatchID);
    let BioSpecimenData: any[] = [];

    if (iCatchID in dictAllBiospecimens) {
        BioSpecimenData = dictAllBiospecimens[iCatchID];
    } else {
        BioSpecimenData = [];
    }

    // CatchSpecies from Biospecimen
    for (let i = 0; i < BioSpecimenData.length; i++) {
        let iBioSpecimenID = BioSpecimenData[i][0];
        //let SpecimenItemData = await ExecuteOracleSQL(odb, strBioSpecimenItemsSQL + iBioSpecimenID)
        let SpecimenItemData = [];
        if (iBioSpecimenID in dictAllBiospecimenItems) {
            SpecimenItemData = dictAllBiospecimenItems[iBioSpecimenID];
        }

        let lstSpecimens: WcgopSpecimen[] = [];
        let taxonomyAlias = await GetDocFromDict(dictTaxonomyAliases, BioSpecimenData[i][2], 'taxonomy-alias-by-wcgop-id', 'taxonomy-views')
        // if (taxonomyAlias != null) {
        //     taxonomyAlias = {
        //         scientificName: taxonomyAlias.scientificName,
        //         commonName: taxonomyAlias.commonName,
        //         _id: taxonomyAlias._id
        //     }
        // }
        let DiscardReason = await GetDocFromDict(dictDiscardReasons, BioSpecimenData[i][13], 'discard-reason-lookup', 'wcgop');
        if (DiscardReason != null) {
            DiscardReason = {
                description: DiscardReason.description,
                _id: DiscardReason._id
            }
        }
        //let BioSampleMethod = CatchSpeciesData[i][3];
        let BioSampleMethod = await GetDocFromDict(dictBiospecimenSampleMethod, BioSpecimenData[i][3], 'biospecimen-sample-method-lookup', 'wcgop')
        if (BioSampleMethod != null) {
            BioSampleMethod = {
                description: BioSampleMethod.description,
                _id: BioSampleMethod._id
            }
        }
        let iCatchID = BioSpecimenData[i][1];

        // biospecimen items data
        for (let j = 0; j < SpecimenItemData.length; j++) {
            let iSpecimenItemID = SpecimenItemData[j][0];
            //let AllDissectionData = await ExecuteOracleSQL(odb, strDissectionsSQL + iSpecimenItemID);
            let AllDissectionData = [];

            if (iSpecimenItemID in dictAllDissections) {
                AllDissectionData = dictAllDissections[iSpecimenItemID];
            }

            let CouchIDs: string[] = await GenerateCouchIDs(AllDissectionData.length);
            let Dissections: Biostructure[] = await BuildBiostructures(CouchIDs, AllDissectionData);
            let CouchID = await GenerateCouchID();
            let BioSpecimenItem: WcgopSpecimen = await ConstructWcgopSpecimenFromItems(CouchID, SpecimenItemData[j], taxonomyAlias, Dissections, DiscardReason, BioSampleMethod, iCatchID);
            lstSpecimens.push(BioSpecimenItem);
        }

        // length frequency data
        //let SpecimenItemFreqData = await ExecuteOracleSQL(odb, strLengthFrequenciesSQL + iBioSpecimenID)
        let SpecimenItemFreqData = [];

        if (iBioSpecimenID in dictAllLengthFrequencies) {
            SpecimenItemFreqData = dictAllLengthFrequencies[iBioSpecimenID];
        }

        for (let j = 0; j < SpecimenItemFreqData.length; j++) {
            let CouchID = await GenerateCouchID();
            let SpecimenFreq: WcgopSpecimen = ConstructWcgopSpecimenFromFreq(CouchID, SpecimenItemFreqData[j], taxonomyAlias, DiscardReason, BioSampleMethod, iCatchID)
            lstSpecimens.push(SpecimenFreq);
        }

        let CouchID = await GenerateCouchID();
        if (lstSpecimens.length == 0) {
            lstSpecimens = null;
        }
        let cCatchSpeciesItem: WcgopCatch = ConstructCatchSpeciesFromBio(CouchID, BioSpecimenData[i], lstSpecimens, taxonomyAlias, DiscardReason);
        CatchSpecies.push(cCatchSpeciesItem);
    }


    
    // CatchSpecies from SpeciesComp
    //CatchSpeciesData = await ExecuteOracleSQL(odb, strSpeciesCompSQL + iCatchID);
    if (iCatchID in dictAllSpeciesCompositions) {
        BioSpecimenData = dictAllSpeciesCompositions[iCatchID];
    } else {
        BioSpecimenData = [];
    }

    for (let i = 0; i < BioSpecimenData.length; i++) {
        let CouchID = await GenerateCouchID();
        let iSpeciesCompItemId = BioSpecimenData[i][15];
        //let BasketData = await ExecuteOracleSQL(odb, strSpeciesCompBasketsSQL + iSpeciesCompItemId);

        let Baskets: Basket[];
        if (iSpeciesCompItemId in dictAllBaskets) {
            let BasketData = dictAllBaskets[iSpeciesCompItemId];
            let iNumToGenerate = BasketData.length;
            let CouchIDs = await GenerateCouchIDs(iNumToGenerate);
            Baskets = BuildBaskets(CouchIDs, BasketData);
        } else {
            Baskets = null;
        }

        let taxonomyAlias = await GetDocFromDict(dictTaxonomyAliases, BioSpecimenData[i][16], 'taxonomy-alias-by-wcgop-id', 'taxonomy-views');
        // if (taxonomyAlias != null) {
        //     taxonomyAlias = {
        //         scientificName: taxonomyAlias.scientificName,
        //         commonName: taxonomyAlias.commonName,
        //         _id: taxonomyAlias._id
        //     }
        // }
        let DiscardReason = await GetDocFromDict(dictDiscardReasons, BioSpecimenData[i][22], 'discard-reason-lookup', 'wcgop');
        if (DiscardReason != null) {
            DiscardReason = {
                description: DiscardReason.description,
                _id: DiscardReason._id
            }
        }
        let cCatchSpeciesItem: WcgopCatch = ConstructCatchSpeciesFromComp(CouchID, BioSpecimenData[i], Baskets, taxonomyAlias, DiscardReason);
        CatchSpecies.push(cCatchSpeciesItem);
    }

    return CatchSpecies
}

function ConstructCatchSpeciesFromBio(CouchID: string, CatchSpeciesData: any, Specimens: WcgopSpecimen[], taxonomyAlias: TaxonomyAlias, DiscardReason: WcgopDiscardReason) {
    let ModifiedDate = CatchSpeciesData[8];
    let ComputerEditedDate = CatchSpeciesData[15]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = CatchSpeciesData[17];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = CatchSpeciesData[7];
    }

    // let catchContent: UnsortedCatch = { 
    //     label: 'unsorted catch',
    //     type: UnsortedCatchTypeName
    // };

    let NewCatchSpecies: WcgopCatch = {
        _id: CouchID,
        type: WcgopCatchTypeName,
        catchContent: taxonomyAlias,
        // species: Species,
        discardReason: DiscardReason, // [13]
        specimens: Specimens,
        createdBy: CatchSpeciesData[5],
        createdDate: moment(CatchSpeciesData[6], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate,
        notes: CatchSpeciesData[4],
        dataSource: CatchSpeciesData[16],

        legacy: {
            biospecimenId: CatchSpeciesData[0],
            catchId: CatchSpeciesData[1],
            speciesWeightKp: CatchSpeciesData[10],
            obsprodLoadDate: moment(CatchSpeciesData[14], moment.ISO_8601).format(),
            catchSampleMethod: CatchSpeciesData[3]
        }
    }
    return NewCatchSpecies;
}

function ConstructCatchSpeciesFromComp(CouchID: string, CatchSpeciesData: any, Baskets: Basket[], taxonomyAlias: TaxonomyAlias, DiscardReason: WcgopDiscardReason) {
    let UpdatedDate = null;
    let UpdatedBy = null;

    let SpeciesCompModifiedDate = CatchSpeciesData[7];
    let SpeciesCompComputerEditedOn = CatchSpeciesData[13]
    let SpeciesCompUpdatedDate = null;

    let SpeciesCompItemModifiedDate = CatchSpeciesData[26];
    let SpeciesCompItemsComputerEditedOn = CatchSpeciesData[31];
    let SpeciesCompItemUpdatedDate = null;

    if (SpeciesCompComputerEditedOn != null) {
        SpeciesCompUpdatedDate = SpeciesCompComputerEditedOn;
    } else if (SpeciesCompModifiedDate != null) {
        SpeciesCompUpdatedDate = SpeciesCompModifiedDate;
    }

    if (SpeciesCompItemsComputerEditedOn != null) {
        SpeciesCompItemUpdatedDate = SpeciesCompItemsComputerEditedOn;
    } else if (SpeciesCompItemModifiedDate != null) {
        SpeciesCompItemUpdatedDate = SpeciesCompItemModifiedDate;
    }

    if (SpeciesCompUpdatedDate != null) {
        if (SpeciesCompItemUpdatedDate != null) {
            if (moment(SpeciesCompUpdatedDate, moment.ISO_8601) > moment(SpeciesCompItemUpdatedDate, moment.ISO_8601)) {
                UpdatedDate = moment(SpeciesCompUpdatedDate, moment.ISO_8601).format();
                UpdatedBy = CatchSpeciesData[6];
            } else {
                UpdatedDate = moment(SpeciesCompItemUpdatedDate, moment.ISO_8601).format();
                UpdatedBy = CatchSpeciesData[25];
            }
        }
    } else if (SpeciesCompItemUpdatedDate != null) {
        UpdatedDate = moment(SpeciesCompItemUpdatedDate, moment.ISO_8601).format();
        UpdatedBy = CatchSpeciesData[25];
    }

    let SpeciesWeight;
    if (CatchSpeciesData[18] == null) {
        SpeciesWeight = null;
    } else {
        if (CatchSpeciesData[19] == 'LB') {
            CatchSpeciesData[19] = 'lbs';
        }
        SpeciesWeight = {
            measurementType: 'weight',
            value: CatchSpeciesData[18],
            units: CatchSpeciesData[19]
        }
    }

    let Notes;
    if (CatchSpeciesData[3] == null && CatchSpeciesData[21] == null) {
        Notes = null;
    } else if (CatchSpeciesData[3] == null && CatchSpeciesData[21] != null) {
        Notes = CatchSpeciesData[21];
    } else if (CatchSpeciesData[3] != null && CatchSpeciesData[21] == null) {
        Notes = CatchSpeciesData[3];
    } else {
        Notes = CatchSpeciesData[3] + ' ' + CatchSpeciesData[21]
    }

    let NewCatchSpecies: WcgopCatch = {
        _id: CouchID,
        type: WcgopCatchTypeName,
        catchContent: taxonomyAlias,
        // species: Species, TODO fix
        weight: SpeciesWeight,
        sampleCount: CatchSpeciesData[20],
        totalTally: CatchSpeciesData[28],
        discardReason: DiscardReason,
        baskets: Baskets,

        createdBy: CatchSpeciesData[4],
        createdDate: moment(CatchSpeciesData[5], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,

        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate, // uploaded to final CouchDB
        notes: Notes,

        legacy: {
            speciesCompId: CatchSpeciesData[0],
            speciesCompItemId: CatchSpeciesData[15],
            catchId: CatchSpeciesData[1],
            speciesWeightKp: CatchSpeciesData[8],
            speciesWeightKpItq: CatchSpeciesData[29],
            speciesNumberKp: CatchSpeciesData[9],
            speciesNumberKpItq: CatchSpeciesData[30],
            catchSampleMethod: CatchSpeciesData[2],
            basketNumber: CatchSpeciesData[10],
            speciesCompDataSource: CatchSpeciesData[14],
            speciesCompItemDataSource: CatchSpeciesData[33]
        }
    }
    return NewCatchSpecies;
}


export async function BuildCatch(odb: any, iCatchID: number){
    if (iCatchID != undefined) {
        //let lstCatchData = await ExecuteOracleSQL(odb, strCatchSQL + iCatchID);
        let lstCatchData = dictAllCatches[iCatchID]
        //lstCatchData = lstCatchData[0]
        let iCatchCatID = lstCatchData[2];
        let iUserCreatedByID = lstCatchData[15];
        let iUserModifiedByID = lstCatchData[17];
        //let lstCatchCatData = await ExecuteOracleSQL(odb, strCatchCategorySQL + iCatchCatID);
        let lstCatchCatData;
        let strCatchName;
        let strCatchCode;

        let catchContent = await GetDocFromDict(dictAllCatchCategory, iCatchCatID, 'catch-grouping-by-catch-category-id', 'taxonomy-views');

        // if (iCatchCatID in dictAllCatchCategory) {
        //     lstCatchCatData = dictAllCatchCategory[iCatchCatID]
        //     strCatchName = lstCatchCatData[1];
        //     strCatchCode = lstCatchCatData[2];
        // } else {
        //     lstCatchCatData = null;
        // }

        let WeightMethod = await GetDocFromDict(dictWeightMethod, lstCatchData[5], 'weight-method-lookup', 'wcgop')
        if (WeightMethod != null) {
            WeightMethod = {
                description: WeightMethod.description,
                _id: WeightMethod._id
            }
        }

        let Disposition = await GetDocFromDict(dictDisposition, lstCatchData[7], 'catch-disposition-lookup', 'wcgop')
        if (Disposition != null) {
            Disposition = {
                description: Disposition.description,
                _id: Disposition._id
            }
        }

        let SubCatch: WcgopCatch[] = await BuildCatchSpecies(odb, iCatchID);

        if (SubCatch.length == 0) {
            SubCatch = null;
        }

        let dispWmGroup: any = {

            disposition: Disposition,
            weightMethod:  WeightMethod,
            measuredWeight: null,
            calculatedWeight: null, // should this value be stored, or always calculated?
            count: 123,
            // expansionData:  WcgopExpansions,  // do any expansions get performed on the entire wm/disp?
        
            ratio: null, // decimal representation
            catchItems: SubCatch,
        
            legacy: {
                catchCategoryId: iCatchCatID,
                catchCategoryName: strCatchName,
                catchCategoryCode: strCatchCode
                // catchPurity: '',
                // obsProdLoadDate: 
            }
        };

        let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId');
        let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');

        let cCatch: WcgopCatch = ConstructNewCatchWCGOP(lstCatchData, CreatedBy, ModifiedBy, catchContent, null, WeightMethod, Disposition, dispWmGroup); // nll = subcatch
        return cCatch;
    } else {
        return null;
    }
}



function ConstructNewCatchWCGOP(CatchData: any, CreatedBy: any, ModifiedBy: any, catchContent: CatchGrouping, SubCatch: WcgopCatch[], WeightMethod: WeightMethod, Disposition: CatchDisposition, DispWmGroup: any) {
    let ModifiedDate = CatchData[38];
    let ComputerEditedDate = CatchData[18]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = CatchData[39];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = CatchData[17];
    }

    let Weight;
    if (CatchData[3] == null) {
        Weight = null;
    } else {
        if (CatchData[4] == 'LB') {
            CatchData[4] = 'lbs';
        }
        Weight = {
            measurementType: 'weight',
            value: CatchData[3],
            units: CatchData[4]
        }
    }

    let SampleWeight;
    if (CatchData[20] == null) {
        SampleWeight = null;
    } else {
        if (CatchData[21] == 'LB') {
            CatchData[21] = 'lbs';
        }
        SampleWeight = {
            measurementType: 'weight',
            value: CatchData[20],
            units: CatchData[21]
        }
    }

    let Volume;
    if (CatchData[10] == null) {
        Volume = null;
    } else {
        Volume = {
            measurementType: 'volume',
            value: CatchData[10],
            units: CatchData[11]
        }
    }

    let Density;
    if (CatchData[12] == null) {
        Density = null;
    } else {
        Density = {
            measurementType: 'density',
            value: CatchData[12],
            units: CatchData[13]
        }
    }

    let catchCategoryId: number = null;
    let catchCategoryName: string = null;
    let catchCategoryCode: string = null;

    DispWmGroup.measuredWeight = SampleWeight;
    DispWmGroup.calculatedWeight = Weight;
    
    if(catchContent && catchContent.legacy){
        catchCategoryId = catchContent.legacy.wcgopCatchCategoryId;
        catchCategoryCode = catchContent.legacy.wcgopCatchCategoryCode;
        catchCategoryName = catchContent.name;
    } else {
        console.log('catchcontent is null')
    }

    let NewCatch: WcgopCatch = {
        type: WcgopCatchTypeName,
        catchContent: DispWmGroup,
        createdBy: CatchData[15],
        createdDate: moment(CatchData[16], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate,
        notes: CatchData[14],
        dataSource: CatchData[37],
        catchNum: CatchData[1],
        disposition: Disposition,
        weightMethod: WeightMethod,
        // children: SubCatch,
        weight: Weight,
        count: CatchData[6],
        sampleWeight: SampleWeight,
        sampleCount: CatchData[22],
        gearSegmentsSampled: CatchData[33], // TODO

        legacy: {

            catchId: CatchData[0],
            catchCategoryId: catchCategoryId,
            catchCategoryName: catchCategoryName,
            catchCategoryCode: catchCategoryCode,
            catchPurity: CatchData[9],

            volume: Volume,
            density: Density,

            basketsWeighedItq: CatchData[28],
            totalBasketsItq: CatchData[29],
            partialBasketWeightItq: CatchData[30],
            unitsSampledItq: CatchData[31],
            totalUnitsItq: CatchData[32],
            basketWeightKp: CatchData[34],
            addlBasketWeightKp: CatchData[35],
            basketWeightCountKp: CatchData[36],
            hooksSampled: CatchData[19]
        }
        //discard_reason: CatchData[8],
    }
    return NewCatch;
}