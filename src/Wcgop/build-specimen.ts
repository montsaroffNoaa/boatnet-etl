import moment = require("moment");
import { GetDocFromDict } from "../Common/common-functions";
import { dictViability } from "./wcgop-etl";
import { TaxonomyAlias, Biostructure, BiospecimenSampleMethod, WcgopSpecimen, WcgopSpecimenTypeName, DiscardReason, Viability } from '@boatnet/bn-models';

// Biospecimen data
export async function ConstructWcgopSpecimenFromItems(CouchID: string, SpecimenItemData: any, Species: TaxonomyAlias, Dissections: Biostructure[], DiscardReason: DiscardReason, BioSampleMethod: BiospecimenSampleMethod, CatchID: number) {

    let bIsAdiposePresent: boolean;
    if (SpecimenItemData[13] == 'Y') {
        bIsAdiposePresent = true;
    } else if (SpecimenItemData[13] == 'N') {
        bIsAdiposePresent = false;
    } else {
        bIsAdiposePresent = null;
    }

    let ModifiedDate = SpecimenItemData[10];
    let ComputerEditedDate = SpecimenItemData[17];
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = SpecimenItemData[18];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = SpecimenItemData[11];
    }

    let Length: any;
    if (SpecimenItemData[4] == null) {
        Length = null;
    } else {
        Length = {
            measurementType: 'length',
            value: SpecimenItemData[4],
            units: SpecimenItemData[5]
        }
    }

    let Weight;
    if (SpecimenItemData[2] == null) {
        Weight = null;
    } else {
        if (SpecimenItemData[3] == 'LB') {
            SpecimenItemData[3] = 'lbs';
        }
        Weight = {
            measurementType: 'weight',
            value: SpecimenItemData[2],
            units: SpecimenItemData[3]
        }
    }

    let docViability: Viability = await GetDocFromDict(dictViability, SpecimenItemData[12], 'viability-lookup', 'wcgop')
    let viabilityDescription: string = null;

    if(docViability != null){
        viabilityDescription = docViability.description;
    }

    let NewWcgopSpecimen: WcgopSpecimen = {
        _id: CouchID,
        type: WcgopSpecimenTypeName,
        specimenNumber: null, // TODO 
        sex: SpecimenItemData[6],
        length: Length,
        weight: Weight,
        viability: viabilityDescription,
        visualMaturity: SpecimenItemData[14],
        biostructures: Dissections,
        biosampleMethod: BioSampleMethod,
        discardReason: DiscardReason,
        isAdiposePresent: bIsAdiposePresent,
        tags: [SpecimenItemData[19]],
        createdBy: SpecimenItemData[8],
        createdDate: moment(SpecimenItemData[9], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        notes: SpecimenItemData[7],
        dataSource: SpecimenItemData[15],

        legacy: {
            biospecimenId: SpecimenItemData[1],
            biospecimenItemId: SpecimenItemData[0],
            catchId: CatchID,
            obsprodLoadDate: moment(SpecimenItemData[16], moment.ISO_8601).format()
        }
    }
    return NewWcgopSpecimen;
}

// TODO combine records with identical bsID, sex, length, length um and increase frequency count
export function ConstructWcgopSpecimenFromFreq(CouchID: string, LengthFreqData: any, Species: TaxonomyAlias, DiscardReason: DiscardReason, BioSampleMethod: BiospecimenSampleMethod, CatchID: number) {

    let ModifiedDate = LengthFreqData[9];
    let ComputerEditedDate = LengthFreqData[13];
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = LengthFreqData[12];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = LengthFreqData[8];
    }

    let Length: any;
    if (LengthFreqData[1] == null) {
        Length = null;
    } else {
        Length = {
            measurementType: 'length',
            value: LengthFreqData[1],
            units: LengthFreqData[2]
        }
    }

    let NewWcgopSpecimen: WcgopSpecimen = {
        _id: CouchID,

        specimenNumber: null, // TODO
        tags: null, // TODO 

        type: WcgopSpecimenTypeName,
        sex: LengthFreqData[4],
        discardReason: DiscardReason,
        biosampleMethod: BioSampleMethod,
        length: Length,
        createdBy: LengthFreqData[6],
        createdDate: moment(LengthFreqData[7], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        dataSource: LengthFreqData[14],

        legacy: {
            lengthFrequencyId: LengthFreqData[0],
            biospecimenId: LengthFreqData[10],
            obsprodLoadDate: moment(LengthFreqData[11], moment.ISO_8601).format()
        }
    }
    return NewWcgopSpecimen;
}
