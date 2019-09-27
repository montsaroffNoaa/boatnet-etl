import { FishingLocation, FishingLocationTypeName } from "../../../boatnet/libs/bn-models/models/_common/fishing-location";
import { dictAllFishingLocations } from "./wcgop-etl";
import moment = require("moment");
import { GenerateCouchID } from "../Common/common-functions";

export async function BuildFishingLocations(odb: any, iHaulID: number) {
    let lstAllFishingLocations: FishingLocation[] = [];

    if (iHaulID in dictAllFishingLocations) {
        let lstLocationsByHaul = dictAllFishingLocations[iHaulID];

        for (let i = 0; i < lstLocationsByHaul.length; i++) {
            let NewLocation: FishingLocation = await ConstructFishingLocation(lstLocationsByHaul[i]);
            lstAllFishingLocations.push(NewLocation);
        }
    }
    return lstAllFishingLocations;
}


async function ConstructFishingLocation(FishingLocationData: any) {
    let ModifiedDate = FishingLocationData[11];
    let ComputerEditedDate = FishingLocationData[15]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = FishingLocationData[14];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = FishingLocationData[10];
    }

    let NewLocation: FishingLocation = {
        location: {
            type: "Point",
            coordinates: [FishingLocationData[3], FishingLocationData[4]]
        },
        depth: {
            measurementType: 'length',
            value: FishingLocationData[5],
            units: FishingLocationData[6]
        },
        position: FishingLocationData[7],
        locationDate: moment(FishingLocationData[2], moment.ISO_8601).format(),
        notes: FishingLocationData[12],

        _id: await GenerateCouchID(),
        type: FishingLocationTypeName,
        createdBy: FishingLocationData[8],
        createdDate: moment(FishingLocationData[9], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,

        legacy: {
            fishingLocationId: FishingLocationData[0],
            fishingActivityId: FishingLocationData[1]
        }
    }
    return NewLocation;
}
