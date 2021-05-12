import { dictAllFishTickets } from "./wcgop-etl";
import moment = require("moment");
import { WcgopFishTicket } from "@boatnet/bn-models/lib";
import { ConvertToMomentIso8601 } from "../Common/common-functions";


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
        createdDate: ConvertToMomentIso8601(FishData[3]),
        updatedBy: ModifiedBy,
        updatedDate: ConvertToMomentIso8601(FishData[10]),
        tripId: FishData[6],
        stateAgency: FishData[7],
        fishTicketDate: FishData[8],
        dataSoure: FishData[11],

        legacy: {
            fishTicketId: FishData[0],
            obsprodLoadDate: ConvertToMomentIso8601(FishData[9])
        }
    }
    return NewFishTicket;
}