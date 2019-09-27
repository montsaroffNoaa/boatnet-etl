import { WcgopCatch, WcgopOperation, WcgopOperationTypeName, GearPerformance, GearType, WeightMethod } from "../../../boatnet/libs/bn-models";
import { dictAllHauls, dictWeightMethod, dictGearPerformance, dictGearType } from "./wcgop-etl";
import { FishingLocation } from "../../../boatnet/libs/bn-models/models/_common/fishing-location";
import { GetDocFromDict } from "../Common/common-functions";
import moment = require("moment");
import { UploadedBy, UploadedDate } from "../Common/common-variables";
import { BuildFishingLocations } from "./build-fishing-locations";

export async function BuildHaul(odb: any, iHaulID: number, lstCatches: WcgopCatch[]) {
    if (iHaulID != undefined) {
        //let lstHaulData = await ExecuteOracleSQL(odb, strHaulSQL + iHaulID);
        let lstHaulData = dictAllHauls[iHaulID];
        //lstHaulData = lstHaulData[0]

        if (lstHaulData == null) {
            console.log('lstHaulData is null, error')
        }

        let iUserCreatedbyID = lstHaulData[14];
        let iUserModifiedByID = lstHaulData[16];

        let lstFishingLocations: FishingLocation[] = await BuildFishingLocations(odb, iHaulID);

        let WeightMethod = await GetDocFromDict(dictWeightMethod, lstHaulData[4], 'weight-method-lookup', 'LookupDocs')
        if (WeightMethod != null) {
            WeightMethod = {
                description: WeightMethod.description,
                _id: WeightMethod._id
            }
        }

        let GearPerformance = await GetDocFromDict(dictGearPerformance, lstHaulData[7], 'gear-performance-lookup', 'LookupDocs')
        if (GearPerformance != null) {
            GearPerformance = {
                description: GearPerformance.description,
                _id: GearPerformance._id
            }
        }

        let GearType = await GetDocFromDict(dictGearType, lstHaulData[6], 'gear-type-lookup', 'LookupDocs')
        if (GearType != null) {
            GearType = {
                description: GearType.description,
                _id: GearType._id
            }
        }

        let CreatedBy = iUserCreatedbyID // await GetDocFromDict(dictUsers, iUserCreatedbyID, 'legacy.userId');
        let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');

        let cHaul: WcgopOperation = ConstructHaulWCGOP(lstHaulData, CreatedBy, ModifiedBy, lstCatches, WeightMethod, GearPerformance, GearType, lstFishingLocations);

        return cHaul;
    } else {
        return null;
    }
}

function ConstructHaulWCGOP(HaulData: any, CreatedBy: any, ModifiedBy: any, Catches: WcgopCatch[], WeightMethod:
    WeightMethod, GearPerformance: GearPerformance, GearType: GearType, FishingLocations: FishingLocation[]) {
    let bEFP: boolean;
    let bDataQuality: boolean;
    //let bBRDPresent: boolean;

    if (HaulData[22] == 'EFP') {
        bEFP = true;
    } else {
        bEFP = false;
    }

    if (HaulData[32] == '2') {
        bDataQuality = true;
    } else if (HaulData[32] == '1') {
        bDataQuality = false;
    } else {
        bDataQuality = undefined;
    }

    //TODO migrate to mmsbt?
    // if (HaulData[35] == '1') {
    //     bBRDPresent = true;
    // } else if (HaulData[35] = '0') {
    //     bBRDPresent = false;
    // } else {
    //     bBRDPresent = undefined;
    // }


    let ModifiedDate = HaulData[37];
    let ComputerEditedDate = HaulData[17]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = HaulData[38];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = HaulData[16];
    }

    let ObserverTotalCatch;
    if (HaulData[2] == null) {
        ObserverTotalCatch = null;
    } else {

        if (HaulData[3] == 'LB') {
            HaulData[3] = 'lbs';
        }
        ObserverTotalCatch = {
            measurement: {
                measurementType: 'weight',
                value: HaulData[2],
                units: HaulData[3]
            },
            weightMethod: WeightMethod
        }
    }

    let Volume;
    if (HaulData[9] == null) {
        Volume = null;
    } else {
        Volume = {
            measurementType: 'volume',
            value: HaulData[9],
            units: HaulData[10]
        }
    }

    let Density;
    if (HaulData[11] == null) {
        Density = null;
    } else {
        Density = {
            measurementType: 'density',
            value: HaulData[11],
            units: HaulData[12]
        }
    }

    let NewHaul: WcgopOperation = {
        type: WcgopOperationTypeName,
        createdBy: HaulData[14],
        createdDate: moment(HaulData[15], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate,
        notes: HaulData[13],
        dataSource: HaulData[31],

        operationNum: HaulData[1],
        locations: FishingLocations,
        observerTotalCatch: ObserverTotalCatch,
        gearType: GearType,
        gearPerformance: GearPerformance,
        beaufortValue: HaulData[8],
        //targetStrategy: null, // TODO

        isEfpUsed: bEFP,
        isDeterrentUsed: HaulData[25], // TODO double check its boolean, migrate to mmsbt?
        calWeight: HaulData[33],
        fit: HaulData[34],
        //isHaulUnsampled: null, // TODO 
        isGearLost: HaulData[28], // is not boolean, unsure what num repesents
        isDataQualityPassing: bDataQuality,
        catches: Catches,

        legacy: {
            obsprodLoadDate: moment(HaulData[39], moment.ISO_8601).format(),
            fishingActivityId: HaulData[0],
            excluderType: HaulData[30],
            tripId: HaulData[36],
            volume: Volume,
            density: Density
        }

        // total_hooks: HaulData[5],
        // catch_category: CatchCategory,
        // catch_weight_kp: HaulData[19],
        // catch_count_kp: HaulData[20],
        // hooks_sampled_kp: HaulData[21],
        // sample_weight_kp: HaulData[23],
        // sample_count_kp: HaulData[24],
        // deterrent_used: HaulData[25],
        // avg_soak_time: HaulData[26],
        // tot_gear_segments: HaulData[27],
        // total_hooks_lost: HaulData[29],
        // brd_present: bBRDPresent,
    }
    return NewHaul;
}