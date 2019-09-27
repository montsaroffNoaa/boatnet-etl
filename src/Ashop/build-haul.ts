import { AshopCatch, AshopHaul, AshopHaulTypeName } from "../../../boatnet/libs/bn-models/models/ashop";
import { BuildSamples } from "./ashop-build-functions";
import { ExecuteOracleSQL, DmsToDD, GetDocFromDict } from "../Common/common-functions";
import { strHaulSQL } from "./norpac-sql";
import { Point } from "geojson";
import { dictGearTypes, dictGearPerformances, dictTribalDeliveries, dictSampleSystems, dictSampleUnits, dictVesselTypes } from "./ashop-etl";
import { UploadedBy, UploadedDate } from "../Common/common-variables";

export async function BuildHaul(odb: any, iCruiseID: number, iHaulID: number, strPermit: string) {
    let docNewSamples: AshopCatch[] = await BuildSamples(odb, iCruiseID, iHaulID, null, strPermit);

    let lstHaulData = await ExecuteOracleSQL(odb, strHaulSQL(iCruiseID, iHaulID, strPermit));
    lstHaulData = lstHaulData[0];

    let geoStartLocation: Point = {
        type: "Point",
        coordinates: [DmsToDD(lstHaulData[26], lstHaulData[27], lstHaulData[28], null), DmsToDD(lstHaulData[30], lstHaulData[31], lstHaulData[32], lstHaulData[29])]
    }
    let geoEndLocation: Point = {
        type: "Point",
        coordinates: [DmsToDD(lstHaulData[17], lstHaulData[18], lstHaulData[19], null), DmsToDD(lstHaulData[21], lstHaulData[22], lstHaulData[23], lstHaulData[20])]
    }

    // 0.54680664916885
    let FishingDepth = lstHaulData[34];
    let BottomDepth = lstHaulData[33];
    // todo refine num of dec places
    if (lstHaulData[35] == 'M') {
        FishingDepth = FishingDepth * 0.54680664916885;
        BottomDepth = BottomDepth * 0.54680664916885;
    }

    let ObserverEstimatedCatch: any;
    if (lstHaulData[37] != null) {
        ObserverEstimatedCatch = {
            measurement: {
                measurementType: 'weight',
                value: lstHaulData[37],
                units: 'kg'
            },
            weightMethod: lstHaulData[38] // maybe lookup
        }
    } else {
        ObserverEstimatedCatch = null;
    }

    let VesselEstimatedCatch;
    if (lstHaulData[36] != null) {
        VesselEstimatedCatch = {
            measurement: {
                measurementType: 'weight',
                value: lstHaulData[36],
                units: 'kg'
            },
            weightMethod: null // TODO
        }
    } else {
        VesselEstimatedCatch = null;
    }

    let OfficialTotalCatch;
    if (ObserverEstimatedCatch != null) {
        OfficialTotalCatch = ObserverEstimatedCatch;
    } else if (VesselEstimatedCatch != null) {
        OfficialTotalCatch = VesselEstimatedCatch
    } else {
        OfficialTotalCatch = null;
    }

    let GearType = await GetDocFromDict(dictGearTypes, lstHaulData[10].toString() + ',' + lstHaulData[9].toString(), 'ETL-LookupDocs', 'ashop-gear-type-lookup')
    let GearPerformance = await GetDocFromDict(dictGearPerformances, lstHaulData[8], 'ETL-LookupDocs', 'ashop-gear-performance-lookup')
    let TribalDelivery = await GetDocFromDict(dictTribalDeliveries, lstHaulData[4], 'ETL-LookupDocs', 'ashop-tribal-delivery-lookup')
    let SampleSystem = await GetDocFromDict(dictSampleSystems, lstHaulData[51], 'ETL-LookupDocs', 'ashop-sample-system-lookup');
    let SampleUnit = await GetDocFromDict(dictSampleUnits, lstHaulData[52], 'ETL-LookupDocs', 'ashop-sample-unit-lookup');
    let VesselType = await GetDocFromDict(dictVesselTypes, lstHaulData[7], 'ETL-LookupDocs', 'ashop-vessel-type-lookup');

    let docNewHaul: AshopHaul = {
        type: AshopHaulTypeName,
        createdBy: null, // todo
        createdDate: null, // todo - query history table, if not exists use DATE_OF_ENTRY
        updatedBy: null, // todo
        updatedDate: null, // todo, if history record exists, use DATE_OF_ENTRY, else null
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate,

        haulNum: lstHaulData[2],
        startFishingLocation: geoStartLocation,
        endFishingLocation: geoEndLocation,
        bottomDepth: {
            measurementType: 'depth',
            value: BottomDepth,
            units: 'fathoms'
        },
        fishingDepth: {
            measurementType: 'depth',
            value: FishingDepth,
            units: 'fathoms'
        },
        observerEstimatedCatch: ObserverEstimatedCatch,
        vesselEstimatedCatch: VesselEstimatedCatch,
        officialTotalCatch: OfficialTotalCatch,
        observerEstimatedDiscards: [lstHaulData[38]], // array for going forward data? and missing method
        totalEstimatedDiscard: null, // unknown
        gearType: GearType,
        gearPerformance: GearPerformance,
        mammalMonitorPercent: lstHaulData[47],
        isBirdShortwired: lstHaulData[55],
        isGearLost: null, // ETL from lookup? ie if gear perfromance == lost
        tribalDelivery: TribalDelivery,
        sampleDesignType: SampleSystem, // is this correct?
        samples: docNewSamples,
        vesselType: VesselType,

        legacy: {
            cruiseNum: lstHaulData[0],
            permit: lstHaulData[48],
            tripSeq: lstHaulData[6],
            haulSeq: lstHaulData[1],
            deliveryVesselAdfg: lstHaulData[5],
            locationCode: lstHaulData[15],
            volume: {
                measurementType: 'volume',
                value: lstHaulData[49],
                units: null // TODO unknown
            },
            density: {
                measurementType: 'density',
                value: lstHaulData[40],
                units: 'kgs per m3' // todo - how to write this?
            },
            haulPurposeCode: lstHaulData[3],
            cdqCode: lstHaulData[4],
            rbtCode: lstHaulData[11],
            rstCode: lstHaulData[12],
            birdHaulbackCode: lstHaulData[54],
            sampleUnit: SampleUnit
        }
    };

    return docNewHaul;
}