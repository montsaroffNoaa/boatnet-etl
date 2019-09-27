import { dictAllFishTickets } from "./wcgop-etl";
import { WcgopFishTicket } from "../../../boatnet/libs/bn-models";
import moment = require("moment");



export async function BuildFishTickets(odb: any, iTripID: number) {
    if (iTripID != null && iTripID in dictAllFishTickets) {
        let lstFishTicketData = dictAllFishTickets[iTripID];
        let lstFishTickets: WcgopFishTicket[] = [];
        for (let i = 0; i < lstFishTicketData.length; i++) {

            let iUserCreatedByID = lstFishTicketData[i][2];
            let iUserModifiedByID = lstFishTicketData[i][4];

            let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId'); 
            let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');

            let cFishTicket = ConstructFishTicket(lstFishTicketData[i], CreatedBy, ModifiedBy);
            lstFishTickets.push(cFishTicket);
        }

        return lstFishTickets;

    } else {
        return null;
    }
}


function ConstructFishTicket(FishData: any[], CreatedBy: any, ModifiedBy: any) {
    let NewFishTicket = {
        fishTicketNumber: FishData[1],
        createdBy: CreatedBy,
        createdDate: moment(FishData[3], moment.ISO_8601).format(),
        updatedBy: ModifiedBy,
        updatedDate: moment(FishData[10], moment.ISO_8601).format(),
        tripId: FishData[6],
        stateAgency: FishData[7],
        fishTicketDate: FishData[8],
        dataSoure: FishData[11],

        legacy: {
            fishTicketId: FishData[0],
            obsprodLoadDate: moment(FishData[9], moment.ISO_8601).format()
        }
    }
    return NewFishTicket;
}