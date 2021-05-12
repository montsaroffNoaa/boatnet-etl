import { dictAllSpeciesSightings, dictConfidence, dictBodyLength, dictSightingCondition, dictBeaufort, dictInteractionOutcome, dictInteractionBehaviors, dictAllSpeciesInteractions, dictFishingInteraction, FetchRevID, dictTaxonomyAliases } from "./wcgop-etl";
import { GetDocFromDict, GenerateCouchID } from "../Common/common-functions";
import { Point } from "geojson";
import moment = require("moment");
import { UploadedBy, UploadedDate } from "../Common/common-variables";
import { SightingEvent, InteractionEvent, TaxonomyAlias, Behavior, InteractionType, Beaufort, Measurement, SightingEventTypeName, InteractionOutcome, InteractionEventTypeName,
            BodyLength, Confidence, SightingCondition,  } from "@boatnet/bn-models/lib";

export async function BuildMmsbt(iTripID: number): Promise<[SightingEvent[], InteractionEvent[]]> {
    try {

        if (iTripID != null && iTripID in dictAllSpeciesSightings) {

            let SpeciesSightingData = dictAllSpeciesSightings[iTripID];
            let lstSightingEvents: SightingEvent[] = [];
            let lstInteractionEvents: InteractionEvent[] = [];

            for (let i = 0; i < SpeciesSightingData.length; i++) {
                let SpeciesSightingID = SpeciesSightingData[i][0];
                let MmsbtItem: InteractionEvent | SightingEvent;

                let taxonomyAlias: TaxonomyAlias = await GetDocFromDict(dictTaxonomyAliases, SpeciesSightingData[i][2], 'taxonomy-alias-by-wcgop-id', 'taxonomy-views');
                if (taxonomyAlias == null) {
                    console.log('error, wcgop species not in taxonomy, id = ' + SpeciesSightingData[i][2]);
                }
                
                let Confidence = await GetDocFromDict(dictConfidence, SpeciesSightingData[i][11], 'confidence-lookup', 'wcgop');
                if (Confidence != null) {
                    Confidence = {
                        description: Confidence.description,
                        _id: Confidence._id
                    }
                }
                let BodyLength = await GetDocFromDict(dictBodyLength, SpeciesSightingData[i][12], 'body-length-lookup', 'wcgop')
                if (BodyLength != null) {
                    BodyLength = {
                        description: BodyLength.description,
                        _id: BodyLength._id
                    }
                }
                let SightingCondition = await GetDocFromDict(dictSightingCondition, SpeciesSightingData[i][13], 'sighting-condition-lookup', 'wcgop');
                if (SightingCondition != null) {
                    SightingCondition = {
                        description: SightingCondition.description,
                        _id: SightingCondition._id
                    }
                }
                let BeaufortValue = await GetDocFromDict(dictBeaufort, SpeciesSightingData[i][13], 'beaufort-lookup', 'wcgop');
                if (BeaufortValue != null) {
                    BeaufortValue = {
                        description: BeaufortValue.description,
                        _id: BeaufortValue._id
                    }
                }
                let Outcome = await GetDocFromDict(dictInteractionOutcome, SpeciesSightingData[i][27], 'interaction-outcome-lookup', 'wcgop')
                if (Outcome != null) {
                    Outcome = {
                        description: Outcome.description,
                        _id: Outcome._id
                    }
                }

                let lstHaulIDs = [];
                if (SpeciesSightingData[i][22] != null) {
                    lstHaulIDs = SpeciesSightingData[i][22].split(',');
                }
                let lstHaulCouchIDs: string[] = [];
                for (let HaulNum = 0; HaulNum < lstHaulIDs.length; HaulNum++) {
                    let [strDocID,] = await FetchRevID("legacy.operationId", lstHaulIDs[HaulNum], 'all-operations');
                    lstHaulCouchIDs.push(strDocID);
                }

                let BehaviorIDs = [];
                if (SpeciesSightingData[i][28] != null) {
                    BehaviorIDs = SpeciesSightingData[i][28].split(',');
                }
                let Behaviors: Behavior[] = [];
                for (let BehaveNum = 0; BehaveNum < BehaviorIDs.length; BehaveNum++) {
                    let docBehavior = await GetDocFromDict(dictInteractionBehaviors, BehaviorIDs[BehaveNum], 'behavior-type-lookup', 'wcgop');
                    if (docBehavior != null) {
                        docBehavior = {
                            description: docBehavior.description,
                            _id: docBehavior._id
                        }
                    }
                    Behaviors.push(docBehavior);
                }

                // if species_interaction record exists, check if its interaction type was sighting only, build interact or sighting respectively
                if (SpeciesSightingID in dictAllSpeciesInteractions) {
                    let InteractionData = dictAllSpeciesInteractions[SpeciesSightingID];
                    let lstInteractionTypes: InteractionType[] = []

                    for (let j = 0; j < InteractionData.length; j++) {
                        // if record has interaction type 101 (sighting only), it will be the only record in InteractionData, else get list of interaction types
                        if (InteractionData[j][2] == 101) {
                            MmsbtItem = await ConstructSightingEvent(SpeciesSightingData[i], Behaviors, Confidence, BodyLength, SightingCondition, BeaufortValue, taxonomyAlias, lstHaulCouchIDs);
                            lstSightingEvents.push(MmsbtItem);
                        } else {
                            let FishingInteraction = await GetDocFromDict(dictFishingInteraction, InteractionData[j][2], 'interaction-type-lookup', 'wcgop');
                            if (FishingInteraction != null) {
                                FishingInteraction = {
                                    description: FishingInteraction.description,
                                    _id: FishingInteraction._id
                                }
                            }
                            lstInteractionTypes.push(FishingInteraction);
                        }
                    }
                    let Interaction = await ConstructInteractionEvent(lstInteractionTypes, SpeciesSightingData[i], Behaviors, Confidence, BodyLength, SightingCondition, BeaufortValue, taxonomyAlias, lstHaulCouchIDs, Outcome);
                    lstInteractionEvents.push(Interaction);
                } else {
                    let Sighting = await ConstructSightingEvent(SpeciesSightingData[i], Behaviors, Confidence, BodyLength, SightingCondition, BeaufortValue, taxonomyAlias, lstHaulCouchIDs);
                    lstSightingEvents.push(Sighting)
                }
            }
            if (lstSightingEvents.length == 0) {
                lstSightingEvents = null;
            }
            if (lstInteractionEvents.length == 0) {
                lstInteractionEvents = null;
            }
            let ReturnTuple: [SightingEvent[], InteractionEvent[]] = [lstSightingEvents, lstInteractionEvents]
            return ReturnTuple
        } else {
            return [null, null];
        }

    } catch (error) {
        console.log(error)
    }


}

async function ConstructSightingEvent(SightingData: any, AnimalBehaviors: Behavior[], Confidence: Confidence, BodyLength: BodyLength, SightingCondition: SightingCondition, BeaufortValue: Beaufort, taxonomyAlias: TaxonomyAlias, lstHaulCouchIDs: string[]) {
    let CouchID = await GenerateCouchID();
    let SightingLocation: Point = {
        type: "Point",
        coordinates: [SightingData[4], SightingData[5]]
    }

    let ModifiedDate = SightingData[21];
    let ComputerEditedDate = SightingData[25]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = SightingData[24];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = SightingData[20];
    }

    let ClosestApproach: Measurement;

    if (SightingData[9] != null) {
        ClosestApproach = {
            measurementType: 'length',
            value: SightingData[9],
            units: SightingData[10]
        }
    } else {
        ClosestApproach = null;
    }

    let WaterTemp: Measurement;
    if (SightingData[15] != null) {
        WaterTemp = {
            measurementType: 'temperature',
            value: SightingData[15],
            units: SightingData[16]
        }
    } else {
        WaterTemp = null;
    }

    let NewSighting: SightingEvent = {
        _id: CouchID,
        type: SightingEventTypeName,
        createdBy: SightingData[18],
        createdDate: moment(SightingData[19], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate,
        notes: SightingData[17],
        dataSource: SightingData[26],

        operationIDs: lstHaulCouchIDs,
        species: taxonomyAlias,
        confidentOfSpecies: Confidence,
        sightingDate: moment(SightingData[3], moment.ISO_8601).format(),
        location: SightingLocation,
        beaufort: BeaufortValue,
        sightingConditions: SightingCondition,
        minNumSighted: SightingData[6],
        maxNumSighted: SightingData[7],
        bestNumSighted: SightingData[8],
        closestApproach: ClosestApproach,
        animalBehavior: AnimalBehaviors,
        bodyLengthEstimates: [BodyLength],

        //gearPresent: GearPresentComment;

        legacy: {
            waterTemp: WaterTemp,
            // TODO
            // obsprodLoadDate: moment(SightingData[23], moment.ISO_8601).format()
        }
    }
    return NewSighting;
}

async function ConstructInteractionEvent(Interactions: InteractionType[], SightingData: any, AnimalBehaviors: Behavior[], Confidence: Confidence, BodyLength: BodyLength, SightingCondition: SightingCondition, BeaufortValue: Beaufort, taxonomyAlias: TaxonomyAlias, lstHaulCouchIDs: string[], Outcome: InteractionOutcome) {

    let CouchID = await GenerateCouchID();
    let SightingLocation: Point = {
        type: "Point",
        coordinates: [SightingData[4], SightingData[5]]
    }

    let ModifiedDate = SightingData[21];
    let ComputerEditedDate = SightingData[25]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = SightingData[24];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = SightingData[20];
    }

    let ClosestApproach: Measurement;

    if (SightingData[9] != null) {
        ClosestApproach = {
            measurementType: 'length',
            value: SightingData[9],
            units: SightingData[10]
        }
    } else {
        ClosestApproach = null;
    }

    let WaterTemp: Measurement;
    if (SightingData[15] != null) {
        WaterTemp = {
            measurementType: 'temperature',
            value: SightingData[15],
            units: SightingData[16]
        }
    } else {
        WaterTemp = null;
    }

    let NewInteraction: InteractionEvent = {
        _id: CouchID,
        type: InteractionEventTypeName,
        createdBy: SightingData[18],
        createdDate: moment(SightingData[19], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        uploadedBy: UploadedBy,
        uploadedDate: UploadedDate,
        notes: SightingData[17],
        dataSource: SightingData[26],

        operations: lstHaulCouchIDs,
        species: taxonomyAlias,
        confidenceOfSpecies: Confidence,
        date: moment(SightingData[3], moment.ISO_8601).format(),
        location: SightingLocation,
        beaufort: BeaufortValue,
        minAnimalCountEstimate: SightingData[6],
        maxAnimalCountEstimate: SightingData[7],
        animalCount: SightingData[8],
        closestApproach: ClosestApproach,
        animalBehavior: AnimalBehaviors,
        interactions: Interactions,
        outcome: Outcome,
        bodyLength: BodyLength,

        //gearPresent: GearPresentComment;

        legacy: {
            sightingCondition: SightingCondition,
            waterTemp: WaterTemp,
            //obsprodLoadDate: moment(SightingData[23], moment.ISO_8601).format()
        }
    }
    return NewInteraction;
}

