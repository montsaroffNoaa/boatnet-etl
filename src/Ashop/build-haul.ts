import { ExecuteOracleSQL, DmsToDD, GetDocFromDict } from "../Common/common-functions";
import { strHaulSQL } from "./norpac-sql";
import { Point } from "geojson";
import { dictGearTypes, dictGearPerformances, dictTribalDeliveries, dictSampleSystems, dictSampleUnits, dictVesselTypes } from "./ashop-etl";
import { UploadedBy, UploadedDate } from "../Common/common-variables";
import { BuldUnsortedCatchesAndSubcatches } from "./build-catch";
import { AshopCatch, AshopHaulTypeName, LocationEvent, AshopHaul } from '@boatnet/bn-models/lib';
import moment = require("moment");

export async function BuildHaul(odb: any, iCruiseID: number, iHaulID: number, strPermit: string) {
    let docNewSamples: AshopCatch[] = await BuldUnsortedCatchesAndSubcatches(odb, iCruiseID, iHaulID, null, strPermit);

    let lstHaulData = await ExecuteOracleSQL(odb, strHaulSQL(iCruiseID, iHaulID, strPermit));
    lstHaulData = lstHaulData[0];

    let geoStartLocation: LocationEvent = {
        ddLocation: {
            type: "Point",
            coordinates: [DmsToDD(lstHaulData[26], lstHaulData[27], lstHaulData[28], null), DmsToDD(lstHaulData[30], lstHaulData[31], lstHaulData[32], lstHaulData[29])]
        },
        date: moment(lstHaulData[25], moment.ISO_8601).format()
    } 

    let geoEndLocation: LocationEvent = {
        ddLocation: {
            type: "Point",
            coordinates: [DmsToDD(lstHaulData[17], lstHaulData[18], lstHaulData[19], null), DmsToDD(lstHaulData[21], lstHaulData[22], lstHaulData[23], lstHaulData[20])]
        },
        date: moment(lstHaulData[16], moment.ISO_8601).format()
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
    if (lstHaulData[36] != null) {
        ObserverEstimatedCatch = {
            measurement: {
                measurementType: 'weight',
                value: lstHaulData[36],
                units: 'kg'
            },
            weightMethod: lstHaulData[37] // maybe lookup
        }
    } else {
        ObserverEstimatedCatch = null;
    }

    let VesselEstimatedCatch;
    if (lstHaulData[35] != null) {
        VesselEstimatedCatch = {
            measurement: {
                measurementType: 'weight',
                value: lstHaulData[35],
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

    let GearType = await GetDocFromDict(dictGearTypes, lstHaulData[10].toString() + ',' + lstHaulData[9].toString(), 'ashop-gear-type-lookup', 'ashop-views')
    let GearPerformance = await GetDocFromDict(dictGearPerformances, lstHaulData[8],'ashop-gear-performance-lookup', 'ashop-views')
    let TribalDelivery = await GetDocFromDict(dictTribalDeliveries, lstHaulData[4], 'ashop-tribal-delivery-lookup', 'ashop-views')
    let SampleSystem = await GetDocFromDict(dictSampleSystems, lstHaulData[51], 'ashop-sample-system-lookup', 'ashop-views');
    let SampleUnit = await GetDocFromDict(dictSampleUnits, lstHaulData[52], 'ashop-sample-unit-lookup', 'ashop-views');
    let VesselType = await GetDocFromDict(dictVesselTypes, lstHaulData[7], 'ashop-vessel-type-lookup', 'ashop-views');

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
        vesselEstimatedCatch: VesselEstimatedCatch,
        officialTotalCatch: OfficialTotalCatch,
        // observerEstimatedDiscards: [lstHaulData[38]], // array for going forward data? and missing method
        observerEstimatedDiscards: [{
            measurement: {
                measurementType: 'weight',
                value: lstHaulData[38],
                units: 'kilogram'
            },
            weightMethod: lstHaulData[37],
            source: 'norpac'
        }],
        totalEstimatedDiscard: {
            measurementType: 'weight',
            value: lstHaulData[38],
            units: 'kilogram'
        },
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
            observerEstimatedCatch: ObserverEstimatedCatch,
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