
// todo: animal interactions and sightings
// export async function BuildAnimalInteractions(odb: any, iCruiseID: number, strPermit: string, iTripID: number) {

//     // mammal sighting data 
//     let lstMammalSightingData = await ExecuteOracleSQL(odb, strMammalSightingSQL(iCruiseID, strPermit, iTripID));
//     let lstSightings: SightingEvent[] = [];
//     for (let i = 0; i < lstMammalSightingData.length; i++) {
//         let docSighting: SightingEvent = {

//         }
//         lstSightings.push(docSighting);

//     }

//     // mammal interactions
//     let lstInteractions: InteractionEvent[] = [];
//     let lstMammalInteractionData = await ExecuteOracleSQL(odb, strMammalInteractionSQL(iCruiseID, strPermit, iTripID))
//     for (let i = 0; i < lstMammalInteractionData.length; i++) {
//         let iMammalInteractionID = lstMammalInteractionData[i][9];
//         let lstMammalSpecimenData = await ExecuteOracleSQL(odb, strMammalSpecimenSQL(iCruiseID, strPermit, iMammalInteractionID));
//         let lstMammalSpecimens: any[] = [];
//         for (let j = 0; j < lstMammalSpecimenData.length; j++) {
//             // TODO - create mammal specimen model, seems different than normal specimen
//             let docNewMammalSpecimen = {
//                 specimenType: lstMammalSpecimenData[j][3],
//                 sex: lstMammalSpecimenData[j][6],
//                 value: lstMammalSpecimenData[j][7],
//                 notes: lstMammalSpecimenData[j][8],
//                 permit: lstMammalSpecimenData[j][9], // todo - probable lookup

//                 legacy: {
//                     cruiseNum: lstMammalSpecimenData[j][0],
//                     mammalSpecimenSeq: lstMammalSpecimenData[j][1],
//                     animalNum: lstMammalSpecimenData[j][2],
//                     interactionSeq: lstMammalSpecimenData[j][4],
//                     specimenNum: lstMammalSpecimenData[j][5]
//                 }

//             }
//             lstMammalSpecimens.push(docNewMammalSpecimen);
//         }

//         let docInteraction: InteractionEvent = {
//             type: InteractionEventTypeName,
//             createdBy: null,
//             createdDate: null,
//             updatedBy: null,
//             updatedDate: null,
//             uploadedBy: UploadedBy,
//             uploadedDate: UploadedDate,
//             notes: null,

//             operations: null,
//             catchSpecies: null,
//             specimens: null,
//             species: lstMammalInteractionData[i][2], // todo lookup
//             date: null,
//             location: null,
//             beaufort: null,
//             confidenceOfSpecies: null,
//             minAnimalCountEstimate: null,
//             maxAnimalCountEstimate: null,
//             animalCount: lstMammalInteractionData[i][6],

//             take: {
//                 isTake: null,
//                 reviewer: null,
//                 comments: null
//             },

//             closestApproach: null,
//             deterrents: null,
//             areAnimalsInjured: null,
//             areAnimalsDead: null,
//             animalBehavior: null,
//             interactions: null,
//             outcome: null,
//             bodyLength: null,
//             mediaTaken: null,
//             weather: null,
//             vesselActivity: null,

//             legacy: {
//                 cruiseNum: lstMammalInteractionData[i][0],
//                 permit: lstMammalInteractionData[i][7],
//                 mammalSeq: lstMammalInteractionData[i][1],
//                 offloadSeq: lstMammalInteractionData[i][4],

//                 waterTemp: null,
//                 sightingCondition: null,
//                 eventNumber: null,
//                 birdLocation: null,
//                 numBirds: null,
//                 countType: null,
//                 goodLookAtBird: null,
//                 duration: null,
//                 albatrossData: {
//                     numAdults: null,
//                     numSubAdults: null,
//                     numImmatures: null,
//                     numJuveniles: null,
//                     identifyingCharacteristics: null,
//                     specimenTaken: null,
//                     specimensAndTags: null
//                 },

//                 numMammalsInInteraction: null,
//                 mammalCondition: null
//             }

//         }
//         lstInteractions.push(docInteraction);
//     }





//     // bird data

//     let lstBirdEventData = await ExecuteOracleSQL(odb, strBirdEventSQL(iCruiseID, strPermit, iTripID));
//     for (let i = 0; i < lstBirdEventData.length; i++) {
//         let iBirdEventID = lstBirdEventData[i][0];


//         let lstBirdInteractSpeciesData = await ExecuteOracleSQL(odb, strBirdInteractionSQL(iCruiseID, strPermit, iBirdEventID));
//         for (let j = 0; j < lstBirdInteractSpeciesData.length; j++) {
//             let iInteractSpeciesID = lstBirdInteractSpeciesData[j][0];
//             let lstInteractOutcomeData = await ExecuteOracleSQL(odb, strBirdInteractOutcomeSQL(iCruiseID, strPermit, iInteractSpeciesID));
//             lstInteractOutcomeData.push(null);
//             let iLastOutcome, iCurrentOutcome;
//             for (let k = 0; k < lstInteractOutcomeData.length; k++) {
//                 // check if interaction code = 1 (sighting only)
//             }

//             let SpecimenData = [];
//             for (let k = 0; k < SpecimenData.length; k++) {
//                 // todo - low priority, uncertain about tag data
//             }

//             let BirdAgeData = [];
//             for (let k = 0; k < BirdAgeData.length; k++) {
//                 // todo - edge case involving short tailed albatross, lower priority 
//             }


//             let docBirdInteraction: InteractionEvent = {
//                 type: InteractionEventTypeName,
//                 createdBy: null,
//                 createdDate: null,
//                 updatedBy: null,
//                 updatedDate: null,
//                 uploadedBy: UploadedBy,
//                 uploadedDate: UploadedDate,
//                 notes: null,

//                 operations: null,
//                 catchSpecies: null,
//                 specimens: null,
//                 species: null,
//                 date: null,
//                 location: null,
//                 beaufort: null,
//                 confidenceOfSpecies: null,
//                 minAnimalCountEstimate: null,
//                 maxAnimalCountEstimate: null,
//                 animalCount: null,

//                 take: {
//                     isTake: null,
//                     reviewer: null,
//                     comments: null
//                 },

//                 closestApproach: null,
//                 deterrents: null,
//                 areAnimalsInjured: null,
//                 areAnimalsDead: null,
//                 animalBehavior: null,
//                 interactions: null,
//                 outcome: null,
//                 bodyLength: null,
//                 mediaTaken: null,
//                 weather: null,
//                 vesselActivity: null,

//                 legacy: {
//                     waterTemp: null,
//                     sightingCondition: null,
//                     eventNumber: null,
//                     birdLocation: null,
//                     numBirds: null,
//                     countType: null,
//                     goodLookAtBird: null,
//                     duration: null,
//                     albatrossData: {
//                         numAdults: null,
//                         numSubAdults: null,
//                         numImmatures: null,
//                         numJuveniles: null,
//                         identifyingCharacteristics: null,
//                         specimenTaken: null,
//                         specimensAndTags: null
//                     },

//                     numMammalsInInteraction: null,
//                     mammalCondition: null
//                 }

//             }
//             lstInteractions.push(docBirdInteraction);
//         }

//     }

//     return [lstSightings, lstInteractions]
// }