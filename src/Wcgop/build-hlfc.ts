import { dictAllHlfc, FetchRevID, dictHlfcProductDelivery, dictHlfcAerialEtent, dictHlfcHorizontalExtent, dictHlfcMitigationTypes } from "./wcgop-etl";
import { WcgopHlfcConfiguration, Measurement, HlfcProductDeliveryState, HlfcAerialExtent, HlfcHorizontalExtent, HlfcMitigationType, WcgopHlfcConfigurationTypeName } from "../../../boatnet/libs/bn-models";
import { GetDocFromDict, GenerateCouchID } from "../Common/common-functions";
import moment = require("moment");
import { UploadedBy, UploadedDate } from "../Common/common-variables";

export async function BuildHlfc(iTripID: number) {

    if (iTripID != null && iTripID in dictAllHlfc) {

        let lstHlfcData = dictAllHlfc[iTripID];
        let HLFCConfigurations: WcgopHlfcConfiguration[] = [];

        for (let i = 0; i < lstHlfcData.length; i++) {
            let AvgSpeed: Measurement;
            if (lstHlfcData[i][4] != null) {
                AvgSpeed = {
                    measurementType: 'speed',
                    value: lstHlfcData[i][4],
                    units: 'knots'
                }
            } else {
                AvgSpeed = null;
            }

            let WeightPerSinker: Measurement;
            if (lstHlfcData[i][9] != null) {
                WeightPerSinker = {
                    measurementType: 'weight',
                    value: lstHlfcData[i][9],
                    units: 'lbs'
                }
            } else {
                WeightPerSinker = null;
            }

            let RawHaulIDs = [];
            if (lstHlfcData[i][2] != null) {
                RawHaulIDs = lstHlfcData[i][2].split(',');
            }
            let CouchOperationIDs: string[] = [];
            for (let j = 0; j < RawHaulIDs.length; j++) {
                let OperationID: string;
                [OperationID,] = await FetchRevID(null, parseInt(RawHaulIDs[j]), 'all-operations')
                CouchOperationIDs.push(OperationID);
            }

            let ProductDelivery: HlfcProductDeliveryState = await GetDocFromDict(dictHlfcProductDelivery, lstHlfcData[i][3], 'hlfc-product-delivery-state-lookup', 'LookupDocs')

            if (ProductDelivery != null) {
                ProductDelivery = {
                    description: ProductDelivery.description,
                    _id: ProductDelivery._id
                }
            }
            let AerialExtent: HlfcAerialExtent = await GetDocFromDict(dictHlfcAerialEtent, lstHlfcData[i][13], 'hlfc-aerial-extent-lookup', 'LookupDocs')

            if (AerialExtent != null) {
                AerialExtent = {
                    description: AerialExtent.description,
                    _id: AerialExtent._id
                }
            }
            let HorizontalExtent: HlfcHorizontalExtent = await GetDocFromDict(dictHlfcHorizontalExtent, lstHlfcData[i][14], 'hlfc-horizontal-extent-lookup', 'LookupDocs')

            if (HorizontalExtent != null) {
                HorizontalExtent = {
                    description: HorizontalExtent.description,
                    _id: HorizontalExtent._id
                }
            }
            let MitigationConfig: HlfcMitigationType[] = [];

            let lstAvoidance = [];
            if (lstHlfcData[i][12] != null) {
                lstAvoidance = lstHlfcData[i][12].split(',');
            }

            for (let j = 0; j < lstAvoidance.length; j++) {
                let MitigationItem = await GetDocFromDict(dictHlfcMitigationTypes, lstAvoidance[j], 'hlfc-mitigation-type-lookup', 'LookupDocs')
                if (MitigationItem != null) {
                    MitigationItem = {
                        description: MitigationItem.description,
                        _id: MitigationItem._id
                    }
                    MitigationConfig.push(MitigationItem);
                }
            }
            if (lstAvoidance.length == 0) {
                lstAvoidance = null;
            }

            let bFloatsUsed: boolean;
            if (lstHlfcData[i][6] == 1) {
                bFloatsUsed = true;
            } else if (lstHlfcData[i][6] == 0) {
                bFloatsUsed = false
            } else {
                bFloatsUsed = null;
            }

            let bWeightsUsed: boolean;
            if (lstHlfcData[i][8] == 1) {
                bWeightsUsed = true;
            } else if (lstHlfcData[i][8] == 0) {
                bWeightsUsed = false
            } else {
                bWeightsUsed = null;
            }

            let CouchID = await GenerateCouchID();
            let HlfcItem = ConstructHLFC(CouchID, lstHlfcData, AvgSpeed, WeightPerSinker, ProductDelivery, MitigationConfig, AerialExtent, HorizontalExtent, CouchOperationIDs, bFloatsUsed, bWeightsUsed)
            HLFCConfigurations.push(HlfcItem);
        }
        return HLFCConfigurations;
    } else {
        return null;
    }


}

function ConstructHLFC(CouchID: string, HlfcData: any, AvgSpeed: Measurement, WeightPerSinker: Measurement, ProductDeliveryState: HlfcProductDeliveryState, MitigationTypes: HlfcMitigationType[], AvgAerialExtent: HlfcAerialExtent, AvgHorizontalExtent: HlfcHorizontalExtent, CouchOperationIDs: string[], bFloatsUsed: boolean, bWeightsUsed: boolean) {
    let NewHlfcItem: WcgopHlfcConfiguration = {
        _id: CouchID,
        type: WcgopHlfcConfigurationTypeName,
        createdBy: HlfcData[16],
        createdDate: moment(HlfcData[17], moment.ISO_8601).format(),
        updatedBy: HlfcData[18],
        updatedDate: moment(HlfcData[19], moment.ISO_8601).format(),
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate, // uploaded to final CouchDB
        notes: HlfcData[15],
        dataSource: HlfcData[20],
        operations: CouchOperationIDs,
        productDeliveryState: ProductDeliveryState,
        avgSpeed: AvgSpeed,
        floatsUsed: bFloatsUsed,
        floatsPerSegment: HlfcData[7],
        sinkersUsed: bWeightsUsed,
        weightPerSinker: WeightPerSinker,
        avgNumSinkersPerSegment: HlfcData[10],
        mitigationTypes: MitigationTypes,
        avgAerialExtent: AvgAerialExtent,
        avgHorizontalExtent: AvgHorizontalExtent,

        legacy: {
            avgNumHooksPerSegment: HlfcData[5]
        }
    }

    return NewHlfcItem;

}



