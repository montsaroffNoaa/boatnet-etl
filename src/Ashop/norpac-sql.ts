export function AllHaulsSQL() {
    return `
    SELECT 
		CRUISE,
		PERMIT,
		TRIP_SEQ,
		HAUL_SEQ

    FROM NORPAC.ATL_HAUL

    WHERE
        ATL_HAUL.DEPLOY_LATITUDE_DEGREES < 49 AND
        HAUL_PURPOSE_CODE = 'HAK'

    ORDER BY CRUISE, PERMIT, TRIP_SEQ, HAUL_SEQ
    `;
    // FETCH FIRST 10000 ROWS ONLY
}

export function AllCruisesSQL() {
    return `
    SELECT 
		CRUISE,
		PERMIT,
		TRIP_SEQ

    FROM NORPAC.ATL_FMA_TRIP

    WHERE
        (CRUISE, PERMIT, TRIP_SEQ) IN (
            SELECT CRUISE, PERMIT, TRIP_SEQ
            FROM ATL_HAUL
            WHERE
                ATL_HAUL.DEPLOY_LATITUDE_DEGREES < 49 AND
                ATL_HAUL.HAUL_PURPOSE_CODE = 'HAK'
        )

    ORDER BY CRUISE, PERMIT, TRIP_SEQ
    `;
}
export function strCruiseSQL(iCruiseID: number) {
    return `
    SELECT 
        CRUISE,
        FIRST_NAME,
        LAST_NAME,
        CREATE_DATE,
        ATLAS_VERSION

    FROM 
        NORPAC.ATL_OBSERVER_CRUISE 

    WHERE
        CRUISE = ` + iCruiseID
        ;
}
export function strTripSQL(iCruiseID: number, iTripID: number, strPermit: string) {
    return `
    SELECT
        ATL_FMA_TRIP.CRUISE,
        ATL_FMA_TRIP.TRIP_SEQ,
        ATL_FMA_TRIP.CRUISE_VESSEL_SEQ,
        ATL_FMA_TRIP.TRIP_NUMBER,
        ATL_FMA_TRIP.EMBARKED_PORT_CODE,
        ATL_FMA_TRIP.DISEMBARKED_PORT_CODE,
        ATL_FMA_TRIP.BAIT_USED_SEQ,
        ATL_FMA_TRIP.START_DATE,
        ATL_FMA_TRIP.START_LATITUDE_DEGREE,
        ATL_FMA_TRIP.START_LATITUDE_MIN,
        ATL_FMA_TRIP.START_LATITUDE_SEC,
        ATL_FMA_TRIP.START_LONGITUDE_DEGREE,
        ATL_FMA_TRIP.START_LONGITUDE_MIN,
        ATL_FMA_TRIP.START_LONGITUDE_SEC,
        ATL_FMA_TRIP.START_EW,
        ATL_FMA_TRIP.END_DATE,
        ATL_FMA_TRIP.END_LATITUDE_DEGREE,
        ATL_FMA_TRIP.END_LATITUDE_MIN,
        ATL_FMA_TRIP.END_LATITUDE_SEC,
        ATL_FMA_TRIP.END_LONGITUDE_DEGREE,
        ATL_FMA_TRIP.END_LONGITUDE_MIN,
        ATL_FMA_TRIP.END_LONGITUDE_SEC,
        ATL_FMA_TRIP.END_EW,
        ATL_FMA_TRIP.CREW_SIZE,
        ATL_FMA_TRIP.DID_FISHING_OCCUR_FLAG,
        ATL_FMA_TRIP.FISH_IN_HOLD_AT_START_FLAG,
        ATL_FMA_TRIP.ATLAS_VERSION_NUMBER,
        ATL_FMA_TRIP.COMMENTS,
        ATL_FMA_TRIP.PERMIT,
        ATL_FMA_TRIP.CAPTIAN_NAME,
        ATL_CRUISE_VESSEL.VESSEL_SEQ,
        ATL_CRUISE_VESSEL.STATUS,
        ATL_CRUISE_VESSEL.STATUS_DATE,
        ATL_CRUISE_VESSEL.STATUS_USER,
        ATL_CRUISE_VESSEL.COMMENTS

    FROM 
        NORPAC.ATL_FMA_TRIP JOIN 
        NORPAC.ATL_CRUISE_VESSEL ON ATL_FMA_TRIP.CRUISE_VESSEL_SEQ = ATL_CRUISE_VESSEL.CRUISE_VESSEL_SEQ AND ATL_FMA_TRIP.PERMIT = ATL_CRUISE_VESSEL.PERMIT AND ATL_FMA_TRIP.CRUISE = ATL_CRUISE_VESSEL.CRUISE
    
    WHERE
        ATL_FMA_TRIP.CRUISE = ` + iCruiseID + ` AND
        ATL_FMA_TRIP.TRIP_SEQ = ` + iTripID + ` AND
        ATL_FMA_TRIP.PERMIT = ` + strPermit
        ;
}

export function strAllSampledBySQL(iCruiseID: number, strPermit: string, iTripID: number) {
    return `
    SELECT DISTINCT ATL_HAUL.SAMPLED_BY

    FROM 
        ATL_HAUL 
    
    WHERE
        ATL_HAUL.CRUISE = ` + iCruiseID + ` AND
        ATL_HAUL.PERMIT = ` + strPermit + ` AND
        ATL_HAUL.TRIP_SEQ = ` + iTripID;
}

export function strObserverSQL(iCruiseID: number) {
    return `
    SELECT 

        OLS_OBSERVER.OBSERVER_SEQ,
        OLS_OBSERVER.FIRST_NAME,
        OLS_OBSERVER.LAST_NAME,
        OLS_OBSERVER.MIDDLE_NAME,
        OLS_OBSERVER.LAST_PHYSICAL_DATE,
        OLS_OBSERVER.REHIRE_STATUS_CODE,
        OLS_OBSERVER.RESUME_ON_FILE_FLAG,
        OLS_OBSERVER.CREATE_DATE,
        OLS_OBSERVER.LAST_UPDATE_DATE,
        OLS_OBSERVER.LAST_UPDATED_BY,
        OLS_OBSERVER.CON_AGREE_DATE,
        OLS_OBSERVER.LETTER_UNDERSTAND_DATE,
        OLS_OBSERVER.DATE_OF_BIRTH,
        OLS_OBSERVER.SEX_CODE,
        OLS_OBSERVER.FINGERPRINT_CLEAR_DATE,
        OLS_OBSERVER.LAST_CWT_DATE,
        OLS_OBSERVER.PRIVACY_ACT_ACK_DATE
        
    FROM
        OLS_OBSERVER_CRUISE 
        JOIN
        OLS_OBSERVER_CONTRACT ON
            OLS_OBSERVER_CRUISE.CONTRACT_NUMBER = OLS_OBSERVER_CONTRACT.CONTRACT_NUMBER 
        JOIN
        OLS_OBSERVER ON 
            OLS_OBSERVER_CONTRACT.OBSERVER_SEQ = OLS_OBSERVER.OBSERVER_SEQ
            
    WHERE
        OLS_OBSERVER_CRUISE.CRUISE = ` + iCruiseID
        ;
}

export function strMammalSightingSQL(iCruiseID: number, strPermit: string, iTripID: number) {
    return `
    SELECT 

        ATL_MAMMAL.CRUISE,
        ATL_MAMMAL.MAMMAL_SEQ,
        ATL_MAMMAL.MAMMAL_SPECIES_CODE,
        ATL_MAMMAL.OFFLOAD_SEQ,
        ATL_MAMMAL.TRIP_SEQ,
        ATL_MAMMAL.HAUL_SEQ,
        ATL_MAMMAL.NUMBER_OF_ANIMALS,
        ATL_MAMMAL.PERMIT
    
    FROM
        NORPAC.ATL_FMA_TRIP join 
        NORPAC.ATL_HAUL on ATL_FMA_TRIP.CRUISE = ATL_HAUL.CRUISE and ATL_FMA_TRIP.PERMIT = ATL_HAUL.PERMIT and ATL_FMA_TRIP.TRIP_SEQ = ATL_HAUL.TRIP_SEQ join 
        NORPAC.ATL_MAMMAL on ATL_HAUL.PERMIT = ATL_MAMMAL.PERMIT AND ATL_HAUL.CRUISE = ATL_MAMMAL.CRUISE AND ATL_HAUL.HAUL_SEQ = ATL_MAMMAL.HAUL_SEQ

    WHERE 
        DEPLOY_LATITUDE_DEGREES <= 49 AND
        ATL_FMA_TRIP.CRUISE = ` + iCruiseID + ` AND
        ATL_FMA_TRIP.PERMIT = '` + strPermit + `' AND
        ATL_FMA_TRIP.TRIP_SEQ = ` + iTripID + ` AND  
        (CRUISE, PERMIT, MAMMAL_SEQ) NOT IN (
            SELECT CRUISE, PERMIT, MAMMAL_SEQ
            FROM NORPAC.ATL_MAMMAL_INTERACTION
        )`
        ;
}
export function strMammalInteractionSQL(iCruiseID: number, strPermit: string, iTripID: number) {
    return `
    SELECT    

        ATL_MAMMAL.CRUISE,
        ATL_MAMMAL.MAMMAL_SEQ,
        ATL_MAMMAL.MAMMAL_SPECIES_CODE,
        ATL_MAMMAL.OFFLOAD_SEQ,
        ATL_MAMMAL.TRIP_SEQ,
        ATL_MAMMAL.HAUL_SEQ,
        ATL_MAMMAL.NUMBER_OF_ANIMALS,
        ATL_MAMMAL.PERMIT,

        ATL_MAMMAL_INTERACTION.CRUISE,
        ATL_MAMMAL_INTERACTION.INTERACTION_SEQ,
        ATL_MAMMAL_INTERACTION.MAMMAL_SEQ,
        ATL_MAMMAL_INTERACTION.SPECIES_CODE,
        ATL_MAMMAL_INTERACTION.DETERRENCE_ANIMAL_TYPE,
        ATL_MAMMAL_INTERACTION.DETERRENCE_CODE,
        ATL_MAMMAL_INTERACTION.DETERRENCE_SUCCESS_FLAG,
        ATL_MAMMAL_INTERACTION.MAMMAL_INTERACT_CODE,
        ATL_MAMMAL_INTERACTION.CONDITION_CODE,
        ATL_MAMMAL_INTERACTION.CONDITION_ANIMAL_TYPE,
        ATL_MAMMAL_INTERACTION.INTERACTION_DATE,
        ATL_MAMMAL_INTERACTION.OBSERVATION_FLAG,
        ATL_MAMMAL_INTERACTION.NUMBER_OF_ANIMALS,
        ATL_MAMMAL_INTERACTION.LATITUDE_DEGREES,
        ATL_MAMMAL_INTERACTION.LATITUDE_MINUTES,
        ATL_MAMMAL_INTERACTION.LATITUDE_SECONDS,
        ATL_MAMMAL_INTERACTION.LONGITUDE_DEGREES,
        ATL_MAMMAL_INTERACTION.LONGITUDE_MINUTES,
        ATL_MAMMAL_INTERACTION.LONGITUDE_SECONDS,
        ATL_MAMMAL_INTERACTION.LONGITUDE_EW,
        ATL_MAMMAL_INTERACTION.COMMENTS,
        ATL_MAMMAL_INTERACTION.PERMIT,
        ATL_MAMMAL_INTERACTION.ANIMAL_INJURED

    FROM 
        NORPAC.ATL_MAMMAL JOIN 
        NORPAC.ATL_MAMMAL_INTERACTION ON ATL_MAMMAL.CRUISE = ATL_MAMMAL_INTERACTION.CRUISE AND ATL_MAMMAL.PERMIT = ATL_MAMMAL_INTERACTION.PERMIT AND ATL_MAMMAL.MAMMAL_SEQ = ATL_MAMMAL_INTERACTION.MAMMAL_SEQ

    WHERE
        ATL_MAMMAL.CRUISE = ` + iCruiseID + ` AND
        ATL_MAMMAL.PERMIT = '` + strPermit + `' AND
        ATL_MAMMAL.TRIP_SEQ = ` + iTripID
        ;
}

export function strMammalSpecimenSQL(iCruiseID: number, strPermit: string, iMammalInteractionID: number) {
    return `
    SELECT
        CRUISE,
        MAMMAL_SPECIMEN_SEQ,
        ANIMAL_NUMBER,
        SPECIMEN_TYPE_SEQ,
        INTERACTION_SEQ,
        SPECIMEN_NUMBER,
        SEX,
        VALUE,
        COMMENTS,
        PERMIT

    FROM 
        NORPAC.ATL_MAMMAL_SPECIMEN 

    WHERE
        CRUISE = ` + iCruiseID + ` AND
        PERMIT = '` + strPermit + `' AND
        INTERACTION_SEQ = ` + iMammalInteractionID
        ;
}

export function strBirdEventSQL(iCruiseID: number, strPermit: string, iTripID: number) {
    return `
    SELECT 
        ATL_BIRD_EVENT.BIRD_EVENT_SEQ,
        ATL_BIRD_EVENT.CRUISE,
        ATL_BIRD_EVENT.PERMIT,
        ATL_BIRD_EVENT.EVENT_NUMBER,
        ATL_BIRD_EVENT.TRIP_SEQ,
        ATL_BIRD_EVENT.OFFLOAD_SEQ,
        ATL_BIRD_EVENT.HAUL_SEQ,
        ATL_BIRD_EVENT.DETERRENT_USED_CODE,
        ATL_BIRD_EVENT.BEAUFORT_CODE,
        ATL_BIRD_EVENT.LOCATION_CODE,
        ATL_BIRD_EVENT.WEATHER_CODE,
        ATL_BIRD_EVENT.FISHERY_CODE,
        ATL_BIRD_EVENT.LATITUDE_DEGREE,
        ATL_BIRD_EVENT.LATITUDE_MINUTES,
        ATL_BIRD_EVENT.LATITUDE_SECONDS,
        ATL_BIRD_EVENT.LONGITUDE_DEGREE,
        ATL_BIRD_EVENT.LONGITUDE_MINUTES,
        ATL_BIRD_EVENT.LONGITUDE_SECONDS,
        ATL_BIRD_EVENT.LONGITUDE_EW,
        ATL_BIRD_EVENT.INTERACTION_DATE_TIME,
        ATL_BIRD_EVENT.COMMENTS
    
    FROM 
        NORPAC.ATL_BIRD_EVENT
    
    WHERE
        DEPLOY_LATITUDE_DEGREES <= 49 AND
        ATL_BIRD_EVENT.CRUISE = ` + iCruiseID + ` AND
        ATL_BIRD_EVENT.PERMIT = '` + strPermit + `' AND
        ATL_BIRD_EVENT.TRIP_SEQ = ` + iTripID
        ;
}

export function strBirdInteractionSQL(iCruiseID: number, strPermit: string, iBirdEventID: number) {
    return `

    SELECT
        ATL_BIRD_INTERAC_SPECIES.INTERACTION_SPECIES_SEQ,
        ATL_BIRD_INTERAC_SPECIES.CRUISE,
        ATL_BIRD_INTERAC_SPECIES.PERMIT,
        ATL_BIRD_INTERAC_SPECIES.BIRD_EVENT_SEQ,
        ATL_BIRD_INTERAC_SPECIES.COUNT_TYPE_CODE,
        ATL_BIRD_INTERAC_SPECIES.SPECIES_COMPOSITION_SEQ,
        ATL_BIRD_INTERAC_SPECIES.SPECIES_CODE,
        ATL_BIRD_INTERAC_SPECIES.NUMBER_OF_ANIMALS,
        ATL_BIRD_INTERAC_SPECIES.GOOD_LOOK_CODE,
        ATL_BIRD_INTERAC_SPECIES.SPECIES_CONFIDENCE_CODE,
        ATL_BIRD_INTERAC_SPECIES.COMMENTS
    
    
    FROM 
        NORPAC.ATL_BIRD_INTERAC_SPECIES
    
    WHERE
        ATL_BIRD_INTERAC_SPECIES.CRUISE = ` + iCruiseID + ` AND
        ATL_BIRD_INTERAC_SPECIES.PERMIT = '` + strPermit + `' AND
        ATL_BIRD_INTERAC_SPECIES.BIRD_EVENT_SEQ = ` + iBirdEventID
        ;
}

export function strBirdInteractOutcomeSQL(iCruiseID: number, strPermit: string, iInteractSpeciesID: number) {
    return `
    SELECT
        CRUISE,
        PERMIT,
        INTERACTION_OUTCOME_SEQ,
        INTERACTION_SPECIES_SEQ,
        OUTCOME_CODE,
        INTERACTION_CODE,
        COMMENTS

    FROM 
        NORPAC.ATL_BIRD_INTERAC_OUTCOME
        
    WHERE
        ATL_BIRD_INTERAC_OUTCOME.CRUISE = ` + iCruiseID + ` AND
        ATL_BIRD_INTERAC_OUTCOME.PERMIT = '` + strPermit + `' AND
        ATL_BIRD_INTERAC_OUTCOME.INTERACTION_SPECIES_SEQ = ` + iInteractSpeciesID

        ;
}

export function strHaulSQL(iCruiseID: number, iHaulID: number, strPermit: string) {

    return `
    SELECT 
        
    
    
        
        CRUISE,
        HAUL_SEQ,
        HAUL_NUMBER,
        HAUL_PURPOSE_CODE,
        CDQ_CODE,
        DELIVERY_VESSEL_ADFG,
        TRIP_SEQ,
        VESSEL_TYPE,
        GEAR_PERFORMANCE_CODE,
        GEARTYPE_FORM,
        GEAR_TYPE_CODE,
        RBT_CODE,
        RST_CODE,
        DETERRENCE_CODE,
        ANIMAL_TYPE_CODE,
        LOCATION_CODE,
        RETRV_DATE_TIME,
        RETRV_LATITUDE_DEGREES,
        RETRV_LATITUDE_MINUTES,
        RETRV_LATITUDE_SECONDS,
        RETRV_EW,
        RETRV_LONGITUDE_DEGREES,
        RETRV_LONGITUDE_MINUTES,
        RETRV_LONGITUDE_SECONDS,
        NMFS_AREA,
        DEPLOY_DATE_TIME,
        DEPLOY_LATITUDE_DEGREES,
        DEPLOY_LATITUDE_MINUTES,
        DEPLOY_LATITUDE_SECONDS,
        DEPLOY_EW,
        DEPLOY_LONGITUDE_DEGREES,
        DEPLOY_LONGITUDE_MINUTES,
        DEPLOY_LONGITUDE_SECONDS,
        BOTTOM_DEPTH,
        FISHING_DEPTH,
        DEPTH_METER_FATHOM,
        VESSEL_EST_CATCH,
        OBSVR_EST_CATCH,
        OBSVR_EST_METHOD,
        OBSVR_EST_DISCARDS,
        DENSITY,
        INDIV_FISHING_QUOTA_FLAG,
        SAMPLED_BY,
        NUMBER_OF_SKATES,
        NUMBER_OF_HOOKS_PER_SKATE,
        TOTAL_HOOKS,
        TOTAL_POTS,
        MMAMMAL_MONITR_PCT,
        PERMIT,
        VOLUME,
        DATE_OF_ENTRY,
        SAMPLE_SYSTEM_CODE,
        SAMPLE_UNIT_CODE,
        TOTAL_HOOKS_OVERIDE_FLAG,
        BIRD_HAULBACK_CODE,
        BIRD_SHORTWIRED_FLAG,
        FLOW_SCALE_WEIGHT
    
    FROM
        NORPAC.ATL_HAUL
    
    WHERE
        CRUISE = ` + iCruiseID + ` AND
        HAUL_SEQ = ` + iHaulID + ` AND
        PERMIT = '` + strPermit + `'`
        ;
}

export function strFlowScaleWeightSQL(iCruiseID: number, strPermit: string, iHaulID: number) {
    return `
    SELECT

        FLOW_SCALE_WEIGHT_SEQ,
        CRUISE,
        PERMIT,
        HAUL_SEQ,
        FLOW_SCALE_START_WT,
        FLOW_SCALE_END_WT,
        MCP_SCALE_WT,
        FLOW_SCALE_COMMENT,
        SAMPLE_NUMBER,
        SAMPLE_DATE
    
    FROM
        ATL_FLOW_SCALE_WEIGHT
    
    WHERE 
        CRUISE = ` + iCruiseID + ` AND
        PERMIT = '` + strPermit + `' AND
        HAUL_SEQ = ` + iHaulID
        ;
}


export function strSamplesByHaulSQL(iCruiseID: number, iHaulID: number, strPermit: string) {
    return `
    SELECT 

        CRUISE,
        SAMPLE_SEQ,
        PARENT_SAMPLE_SEQ,
        SAMPLE_NUMBER,
        OFFLOAD_SEQ,
        HAUL_SEQ,
        COMBINED_SAMPLE_FLAG,
        PRESORTED_FLAG,
        TOTAL_SAMPLE_WEIGHT,
        SAMPLE_HOOKS_POTS,
        PERMIT,
        SPECIES_COMP_IN_SAMPLE,
        SAMPLE_DESIGN_FLAG,
        NUMBER_OF_SEGMENTS_SAMPLED,
        SAMPLE_HOOKS_OVERIDE_FLAG,
        SAMPLED_BY
    
    FROM 
        NORPAC.ATL_SAMPLE
    
    WHERE
        CRUISE = ` + iCruiseID + ` AND
        HAUL_SEQ = ` + iHaulID + ` AND
        PERMIT = '` + strPermit + `' AND
        PARENT_SAMPLE_SEQ IS NULL`
        ;
}

export function strSubSamplesByParentSQL(iCruiseID: number, iParentID: number, strPermit: string) {
    return `
    SELECT 

        CRUISE,
        SAMPLE_SEQ,
        PARENT_SAMPLE_SEQ,
        SAMPLE_NUMBER,
        OFFLOAD_SEQ,
        HAUL_SEQ,
        COMBINED_SAMPLE_FLAG,
        PRESORTED_FLAG,
        TOTAL_SAMPLE_WEIGHT,
        SAMPLE_HOOKS_POTS,
        PERMIT,
        SPECIES_COMP_IN_SAMPLE,
        SAMPLE_DESIGN_FLAG,
        NUMBER_OF_SEGMENTS_SAMPLED,
        SAMPLE_HOOKS_OVERIDE_FLAG,
        SAMPLED_BY
    
    FROM 
        NORPAC.ATL_SAMPLE
    
    WHERE
        CRUISE = ` + iCruiseID + ` AND
        PARENT_SAMPLE_SEQ = '` + iParentID + `' AND 
        PERMIT = '` + strPermit + `'`
        ;
}
// from atl_species_compositions
export function strSampleSpeciesSQL(iCruiseID: number, strPermit: string, iSampleID: number) {
    return `

    SELECT 
        CRUISE,
        SPECIES_COMPOSITION_SEQ,
        SAMPLE_SEQ,
        SPECIES_CODE,
        SPECIES_WEIGHT,
        SPECIES_NUMBER,
        SEX_CODE,
        PERMIT

    FROM 
        NORPAC.ATL_SPECIES_COMPOSITION

    WHERE
        CRUISE = ` + iCruiseID + ` AND
        PERMIT = '` + strPermit + `' AND
        SAMPLE_SEQ = ` + iSampleID
        ;
}
// from atl_length
export function strSpecimensSQL(iCruiseID: number, strPermit: string, iCompositionID: number) {
    return `
    
    SELECT 
        CRUISE,
        LENGTH_SEQ,
        SPECIES_COMPOSITION_SEQ,
        HAUL_SEQ,
        OFFLOAD_SEQ,
        CONDITION_CODE,
        SAMPLE_SYSTEM_CODE,
        ANIMAL_TYPE_CODE,
        SPECIES_CODE,
        SEX_CODE,
        LENGTH_SIZE,
        FREQUENCY,
        EGGS_IND,
        VIABILITY,
        SPECIAL_PROJECT_CODE,
        PERMIT

    FROM 
        NORPAC.ATL_LENGTH

    WHERE
        CRUISE = ` + iCruiseID + ` AND
        PERMIT = '` + strPermit + `' AND
        SPECIES_COMPOSITION_SEQ =  ` + iCompositionID
        ;
}
// from atl_fish_inv_specimen
export function strBiostructuresSQL(iCruiseID: number, strPermit: string, iLengthID: number) {
    return `
    SELECT
        CRUISE,
        SPECIMEN_SEQ,
        SPECIES_CODE,
        MATURITY_SEQ,
        LENGTH_SEQ,
        SPECIMEN_TYPE,
        SPECIMEN_NUMBER,
        WEIGHT,
        AGE,
        SPECIAL_PROJECT_CODE,
        PERMIT,
        BARCODE,
        ADIPOSE_PRESENT

    FROM 
        NORPAC.ATL_FISH_INV_SPECIMEN
        
    WHERE
        CRUISE = ` + iCruiseID + ` AND
        PERMIT = '` + strPermit + `' AND
        LENGTH_SEQ =  ` + iLengthID
        ;
}
export function strAllSpeciesSQL() {
    return `
    SELECT 
        SPECIES_CODE,
        PROHIB_SPECIES_GROUP_CODE,
        EGGS_REQUIRED_FLAG,
        SPECIES_COMP_SEX_REQUIRED_FLAG,
        WEIGHT_AND_NUMBER_REQD,
        COMMON_NAME,
        SCIENTIFIC_NAME,
        LENGTH_ACCEPTED_FLAG,
        AVIAN_SPECIES_CODE,
        SPECIES_ACCEPTANCE_CODE,
        ITIS_CODE,
        RACE_SPECIES_NUM
    
    FROM 
        NORPAC.ATL_LOV_SPECIES_CODE 
    
    WHERE SPECIES_CODE IN ( 
        SELECT DISTINCT ATL_SPECIES_COMPOSITION.SPECIES_CODE 
        FROM 
        NORPAC.ATL_SPECIES_COMPOSITION 
            JOIN 
            NORPAC.ATL_SAMPLE ON 
                ATL_SPECIES_COMPOSITION.CRUISE = ATL_SAMPLE.CRUISE AND 
                ATL_SPECIES_COMPOSITION.PERMIT = ATL_SAMPLE.PERMIT AND 
                ATL_SPECIES_COMPOSITION.SAMPLE_SEQ = ATL_SAMPLE.SAMPLE_SEQ 
            JOIN 
            NORPAC.ATL_HAUL ON 
                ATL_SAMPLE.CRUISE = ATL_HAUL.CRUISE AND 
                ATL_SAMPLE.PERMIT = ATL_HAUL.PERMIT AND 
                ATL_SAMPLE.HAUL_SEQ = ATL_HAUL.HAUL_SEQ 
        WHERE ATL_HAUL.DEPLOY_LATITUDE_DEGREES < 49
    
    )
    `;
}

export function strConditionLookupSQL() {
    return `SELECT * 
    FROM ATL_LOV_CONDITION 
    WHERE CONDITION_CODE IN (
    
        SELECT DISTINCT ATL_LENGTH.CONDITION_CODE 
        FROM 
            ATL_LENGTH 
            JOIN
            ATL_SPECIES_COMPOSITION ON 
                ATL_LENGTH.CRUISE = ATL_SPECIES_COMPOSITION.CRUISE AND
                ATL_LENGTH.PERMIT = ATL_SPECIES_COMPOSITION.PERMIT AND
                ATL_LENGTH.SPECIES_COMPOSITION_SEQ = ATL_SPECIES_COMPOSITION.SPECIES_COMPOSITION_SEQ
            JOIN 
            ATL_SAMPLE ON 
                ATL_SPECIES_COMPOSITION.CRUISE = ATL_SAMPLE.CRUISE AND 
                ATL_SPECIES_COMPOSITION.PERMIT = ATL_SAMPLE.PERMIT AND 
                ATL_SPECIES_COMPOSITION.SAMPLE_SEQ = ATL_SAMPLE.SAMPLE_SEQ 
            JOIN 
            ATL_HAUL ON 
                ATL_SAMPLE.CRUISE = ATL_HAUL.CRUISE AND 
                ATL_SAMPLE.PERMIT = ATL_HAUL.PERMIT AND 
                ATL_SAMPLE.HAUL_SEQ = ATL_HAUL.HAUL_SEQ 
        WHERE ATL_HAUL.DEPLOY_LATITUDE_DEGREES < 49
    
    )
    `;
}