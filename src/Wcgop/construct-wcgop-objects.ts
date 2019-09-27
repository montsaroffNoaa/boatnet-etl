
import { dictBiostructureType } from "./wcgop-etl";
import { BoatnetUser } from '../../../boatnet/libs/bn-auth';
import { Point } from "geojson";
import { WcgopCatch, WcgopCatchTypeName, WcgopOperation, WcgopOperationTypeName, WcgopHlfcConfiguration, SightingEvent, InteractionEvent, WcgopFishTicket, WcgopTrip, WcgopTripTypeName, Measurement, SightingEventTypeName, InteractionEventTypeName, WcgopSpecimen, WcgopDiscardReason, Biostructure, WcgopSpecimenTypeName, BiostructureTypeName, WcgopHlfcConfigurationTypeName, WeightMethod, GearPerformance, TripStatus, FirstReceiver, Species, Confidence, BodyLength } from "../../../boatnet/libs/bn-models/models";
import { CatchDisposition, Person, PersonTypeName, Port, PortTypeName, Program, ProgramTypeName, GearType, Behavior, Beaufort, InteractionType, InteractionOutcome, Vessel, VesselTypeName, Basket, BiospecimenSampleMethod, BasketTypeName, HlfcProductDeliveryState, HlfcMitigationType, HlfcAerialExtent, HlfcHorizontalExtent, Fishery, SightingCondition, DiscardReason } from "../../../boatnet/libs/bn-models";
import { UploadedBy, UploadedDate } from "../Common/common-variables";
import { FishingLocation, FishingLocationTypeName } from "../../../boatnet/libs/bn-models/models/_common/fishing-location";
import { GenerateCouchID, GetDocFromDict } from "../Common/common-functions";

var moment = require('moment');





export function ConstructUserWCGOP(UserData: any) {
    // let NewUser: UserWCGOP = {
    //     type: 'User',
    //     user_id: UserData[0],
    //     first_name: UserData[1],
    //     last_name: UserData[2],
    //     status: UserData[3],
    //     created_by_user_id: UserData[4],
    //     created_date: UserData[5],
    //     modified_by_user_id: UserData[6],
    //     modified_date: UserData[7],
    //     created_by_first_name: UserData[8],
    //     created_by_last_name: UserData[9],
    //     modified_by_first_name: UserData[10],
    //     modified_by_last_name: UserData[11]
    // }
    // return NewUser;
}


// TODO
// export function ConstructSpecies(SpeciesData: any, SpeciesCategory: SpeciesCategory, SpeciesSubcategory: SpeciesSubCategory) {
//     let bActive: boolean;
//     let bPrioritySpecies: boolean;
//     let bBsSpecies: boolean;
//     let bFormRequired: boolean;

//     if (SpeciesData[17] == 0) {
//         bActive = false;
//     } else {
//         bActive = true;
//     }
//     if (SpeciesData[12] == 'Y') {
//         bPrioritySpecies = true;
//     }
//     if (SpeciesData[13] == 'Y') {
//         bBsSpecies = true;
//     }
//     if (SpeciesData[14] == 'Y') {
//         bFormRequired = true;
//     }


//     let ModifiedDate = SpeciesData[8];
//     let ComputerEditedDate = SpeciesData[16]
//     let UpdatedDate = null;
//     let UpdatedBy = null;

//     if (ComputerEditedDate != null) {
//         UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
//         UpdatedBy = SpeciesData[7];
//     } else if (ModifiedDate != null) {
//         UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
//         UpdatedBy = SpeciesData[18];
//     }

//     let NewSpecies: Species = {
//         type: SpeciesTypeName,
//         scientificName: SpeciesData[1],
//         commonName: SpeciesData[2],
//         pacfinCode: SpeciesData[4],
//         isActive: bActive,
//         createdBy: SpeciesData[5],
//         createdDate: moment(SpeciesData[6], moment.ISO_8601).format(),
//         updatedBy: UpdatedBy,
//         updatedDate: UpdatedDate,

//         legacy: {
//             raceCode: SpeciesData[3],
//             speciesCode: SpeciesData[9],
//             speciesId: SpeciesData[0],
//             speciesCategory: SpeciesCategory,
//             speciesSubcategory: SpeciesSubcategory,
//             prioritySpecies: bPrioritySpecies,
//             bsSpecies: bBsSpecies,
//             formRequired: bFormRequired,
//             obsprodLoadDate: moment(SpeciesData[15], moment.ISO_8601).format()
//         }
//     }
//     return NewSpecies;
// }


export function ConstructTripCertificate(TripCertificateData: any[], CreatedBy: any, ModifiedBy: any) {
    // todo, fix this
    let NewTripCertificate: any = {
        certificateNumber: TripCertificateData[2],
        createdDate: moment(TripCertificateData[3], moment.ISO_8601).format(),
        createdBy: CreatedBy,
        updatedDate: moment(TripCertificateData[9], moment.ISO_8601).format(),
        updatedBy: ModifiedBy,
        certificationId: TripCertificateData[7],
        dataSource: TripCertificateData[10],
        legacy: {
            tripCertificateId: TripCertificateData[0],
            tripId: TripCertificateData[1],
            obsprodLoadDate: moment(TripCertificateData[8], moment.ISO_8601).format()
        }
    }
    return NewTripCertificate;
}

// Biospecimen data
export function ConstructWcgopSpecimenFromItems(CouchID: string, SpecimenItemData: any, Species: Species, Dissections: Biostructure[], DiscardReason: DiscardReason, BioSampleMethod: BiospecimenSampleMethod, CatchID: number) {

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

    let NewWcgopSpecimen: WcgopSpecimen = {
        _id: CouchID,
        type: WcgopSpecimenTypeName,
        specimenNumber: null, // TODO 
        sex: SpecimenItemData[6],
        length: Length,
        weight: Weight,
        viability: SpecimenItemData[12],
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
export function ConstructWcgopSpecimenFromFreq(CouchID: string, LengthFreqData: any, Species: Species, DiscardReason: DiscardReason, BioSampleMethod: BiospecimenSampleMethod, CatchID: number) {

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

export async function ConstructDissections(CouchIDs: string[], AllDissectionData: any) {
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

        let BiostructureType = await GetDocFromDict(dictBiostructureType, AllDissectionData[i][2], 'biostructure-type-lookup', 'LookupDocs');
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

export function ConstructBaskets(CouchIDs: string[], BasketData: any) {
    let Baskets: Basket[] = [];
    for (let i = 0; i < BasketData.length; i++) {

        let Weight;
        if (BasketData[i][2] == null) {
            Weight = null;
        } else (
            Weight = {
                measurementType: 'weight',
                value: BasketData[i][2],
                units: 'UNKNOWN' // TODO
            }

        )

        let ModifiedDate = BasketData[i][6];
        let ComputerEditedDate = BasketData[i][8]
        let UpdatedDate = null;
        let UpdatedBy = null;
        if (ComputerEditedDate != null) {
            UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
            UpdatedBy = BasketData[i][10];
        } else if (ModifiedDate != null) {
            UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
            UpdatedBy = BasketData[i][6];
        }

        let NewBasket: Basket = {
            _id: CouchIDs[i],
            type: BasketTypeName,
            count: BasketData[i][3],
            weight: Weight,
            createdBy: BasketData[i][5],
            createdDate: moment(BasketData[i][4], moment.ISO_8601).format(),
            updatedBy: UpdatedBy,
            updatedDate: UpdatedDate,
            dataSource: BasketData[i][9],

            legacy: {
                speciesCompItemId: BasketData[i][1],
                speciesCompBasketId: BasketData[i][0]
            }
        }
        Baskets.push(NewBasket);
    }

    if (Baskets.length == 0) {
        Baskets = null;
    }

    return Baskets;
}

