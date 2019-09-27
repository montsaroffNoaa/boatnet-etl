import { ExecuteOracleSQL, AshopConnection, ReleaseOracle, InsertBulkCouchDB } from "../Common/common-functions";
import { strFlowScaleWeightSQL } from "./norpac-sql";


export async function BuildFlowScaleWeight(odb: any, iCruiseID: number, strPermit: string, iHaulID: number) {

    let lstFlowScaleWeightData = await ExecuteOracleSQL(odb, strFlowScaleWeightSQL(iCruiseID, strPermit, iHaulID));

    for (let i = 0; i < lstFlowScaleWeightData.length; i++) {
        // possible to do
    }


}


export async function MigratePorts() {
    let odb = await AshopConnection();
    let PortData = await ExecuteOracleSQL(odb, `SELECT PORT_CODE, NAME, STATE_CODE FROM NORPAC.ATL_LOV_PORT_CODE WHERE STATE_CODE != 'AK'`)
    let lstPorts = [];

    for (let i = 0; i < PortData.length; i++) {
        let docPort = {
            type: 'ashop-port',
            portCode: PortData[i][0],
            name: PortData[i][1],
            state: PortData[i][2]
        }
        lstPorts.push(docPort);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstPorts);
}

export async function MigrateVesselType() {
    let odb = await AshopConnection();
    let VesselTypeData = await ExecuteOracleSQL(odb, `SELECT VESSEL_TYPE, DESCRIPTION FROM NORPAC.ATL_LOV_VESSEL_TYPE WHERE VESSEL_TYPE IN (SELECT VESSEL_TYPE FROM ATL_HAUL WHERE DEPLOY_LATITUDE_DEGREES < 49)`)
    let lstVesselTypes = [];

    for (let i = 0; i < VesselTypeData.length; i++) {
        let docVesselType = {
            type: 'ashop-vessel-type',
            vesselType: VesselTypeData[i][0],
            description: VesselTypeData[i][1]
        };
        lstVesselTypes.push(docVesselType);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstVesselTypes);
}

export async function MigrateCdqCodes() {
    let odb = await AshopConnection();
    let CdqData = await ExecuteOracleSQL(odb, `SELECT CDQ_CODE, DESCRIPTION FROM NORPAC.ATL_LOV_CDQ WHERE CDQ_CODE IN (SELECT CDQ_CODE FROM ATL_HAUL WHERE DEPLOY_LATITUDE_DEGREES < 49)`)
    let lstCdqCodes = [];

    for (let i = 0; i < CdqData.length; i++) {
        let docCdq = {
            type: 'ashop-tribal-delivery',
            cdqCode: CdqData[i][0],
            description: CdqData[i][1]
        };
        lstCdqCodes.push(docCdq);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstCdqCodes);
}

export async function MigrateGearTypeAndPerformance() {

    let odb = await AshopConnection();
    let GearPerformanceData = await ExecuteOracleSQL(odb, 'SELECT * FROM NORPAC.ATL_LOV_GEAR_PERFORMANCE WHERE GEAR_PERFORMANCE_CODE IN (SELECT GEAR_PERFORMANCE_CODE FROM NORPAC.ATL_HAUL WHERE DEPLOY_LATITUDE_DEGREES < 49)')
    // todo make proper gear type and performance
    let lstGearPerformances: any[] = [];

    for (let i = 0; i < GearPerformanceData.length; i++) {
        let docGearPerformance = {
            type: 'ashop-gear-performance',
            gearPerformanceCode: GearPerformanceData[i][0],
            description: GearPerformanceData[i][1].substring(2)
        }
        lstGearPerformances.push(docGearPerformance);
    }

    await InsertBulkCouchDB(lstGearPerformances);

    let GearTypeData = await ExecuteOracleSQL(odb, 'SELECT * FROM NORPAC.ATL_LOV_GEAR_TYPE WHERE GEAR_TYPE_CODE IN (SELECT GEAR_TYPE_CODE FROM NORPAC.ATL_HAUL WHERE DEPLOY_LATITUDE_DEGREES < 49)');
    let lstGearTypes: any[] = [];

    for (let i = 0; i < GearTypeData.length; i++) {
        let docGearType = {
            type: 'ashop-gear-type',
            gearTypeCode: GearTypeData[i][0],
            gearTypeForm: GearTypeData[i][1],
            description: GearTypeData[i][2]
        }
        lstGearTypes.push(docGearType);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstGearTypes);



}



export async function MigrateCondition() {

    let odb = await AshopConnection();
    let ConditionData = await ExecuteOracleSQL(odb, `SELECT CONDITION_CODE, ATL_LOV_CONDITION.DESCRIPTION, ATL_LOV_ANIMAL_TYPE.ANIMAL_TYPE_CODE, ATL_LOV_ANIMAL_TYPE.DESCRIPTION FROM NORPAC.ATL_LOV_CONDITION JOIN NORPAC.ATL_LOV_ANIMAL_TYPE ON ATL_LOV_CONDITION.ANIMAL_TYPE_CODE = ATL_LOV_ANIMAL_TYPE.ANIMAL_TYPE_CODE`);
    let lstConditions = [];

    for (let i = 0; i < ConditionData.length; i++) {
        let docCondition = {
            type: 'ashop-condition',
            conditionCode: ConditionData[i][0],
            description: ConditionData[i][1],
            animalCode: ConditionData[i][2],
            animalDescription: ConditionData[i][3]
        };
        lstConditions.push(docCondition);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstConditions);
}

export async function MigrateSampleSystem() {

    let odb = await AshopConnection();
    let SampleSystemData = await ExecuteOracleSQL(odb, `SELECT * FROM ATL_LOV_SAMPLE_SYSTEM_CODE WHERE SAMPLE_SYSTEM_CODE IN ( SELECT SAMPLE_SYSTEM_CODE FROM NORPAC.ATL_HAUL WHERE DEPLOY_LATITUDE_DEGREES < 49)`)
    let lstSampleSystems = [];

    for (let i = 0; i < SampleSystemData.length; i++) {
        let docNewSampleSystem = {
            type: 'ashop-sample-system',
            sampleSystemCode: SampleSystemData[i][0],
            description: SampleSystemData[i][1]
        }
        lstSampleSystems.push(docNewSampleSystem);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstSampleSystems);

}

export async function MigrateMaturity() {
    let odb = await AshopConnection();
    let MaturityData = await ExecuteOracleSQL(odb, `SELECT MATURITY_SEQ, CODE, DESCRIPTION FROM NORPAC.ATL_LOV_MATURITY`)
    let lstMaturities = [];

    for (let i = 0; i < MaturityData.length; i++) {
        let docNewMaturity = {
            type: 'ashop-maturity',
            maturitySeq: MaturityData[i][0],
            code: MaturityData[i][1],
            description: MaturityData[i][2]
        }
        lstMaturities.push(docNewMaturity);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstMaturities);
}

export async function MigrateSpecimenType() {
    let odb = await AshopConnection();
    let SpecimenType = await ExecuteOracleSQL(odb, `SELECT MATURITY_SEQ, CODE, DESCRIPTION FROM NORPAC.ATL_LOV_MATURITY`)
    let lstSpecimenTypes = [];

    for (let i = 0; i < SpecimenType.length; i++) {
        let docNewSpecimenType = {
            type: 'ashop-specimen-type',
            specimenType: SpecimenType[i][0],
            isValueRequired: SpecimenType[i][1],
            description: SpecimenType[i][2]
        }
        lstSpecimenTypes.push(docNewSpecimenType);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstSpecimenTypes);
}

export async function MigrateSampleUnit() {
    let odb = await AshopConnection();
    let SampleUnitData = await ExecuteOracleSQL(odb, `SELECT SAMPLE_UNIT_CODE, DESCRIPTION FROM NORPAC.ATL_LOV_SAMPLE_UNIT`)
    let lstSampleUnits = [];

    for (let i = 0; i < SampleUnitData.length; i++) {
        let docNewSampleUnit = {
            type: 'ashop-sample-unit',
            sampleUnitCode: SampleUnitData[i][0],
            description: SampleUnitData[i][1]
        }
        lstSampleUnits.push(docNewSampleUnit);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstSampleUnits);
}

export async function MigrateAnimalTypes() {
    let odb = await AshopConnection();
    let AnimalTypeData = await ExecuteOracleSQL(odb, `SELECT ANIMAL_TYPE_CODE, DESCRIPTION FROM ATL_LOV_ANIMAL_TYPE`)
    let lstAnimalTypes = [];

    for (let i = 0; i < AnimalTypeData.length; i++) {
        let docNewAnimalType = {
            type: 'ashop-animal-type',
            animalTypeCode: AnimalTypeData[i][0],
            description: AnimalTypeData[i][1]
        }
        lstAnimalTypes.push(docNewAnimalType);
    }

    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstAnimalTypes);
}