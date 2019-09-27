import { ExecuteOracleSQL, GetDocFromDict } from "../Common/common-functions";
import { strReceiverSQL } from "./oracle-sql";
import { Port, FirstReceiver, FirstReceiverTypeName } from "../../../boatnet/libs/bn-models";
import { dictPorts } from "../Ashop/ashop-etl";
import moment = require("moment");
import { UploadedBy, UploadedDate } from "../Common/common-variables";

export async function BuildReceiver(odb: any, iReceiverID: number) {
    if (iReceiverID != null) {
        let lstReceiverData = await ExecuteOracleSQL(odb, strReceiverSQL + iReceiverID);
        lstReceiverData = lstReceiverData[0];


        let PortID = await ExecuteOracleSQL(odb, 'SELECT PORT_ID FROM OBSPROD.PORTS WHERE IFQ_PORT_CODE = ' + lstReceiverData[5])
        PortID = PortID[0][0];
        let ReceiverPort: Port = await GetDocFromDict(dictPorts, PortID, 'all-ports', 'MainDocs');
        if (ReceiverPort != null) {
            ReceiverPort.legacy = undefined;
        }
        let bActive: boolean;

        if (lstReceiverData[9] == 1) {
            bActive = true;
        } else {
            bActive = false;
        }

        let NewReceiver: FirstReceiver = {
            type: FirstReceiverTypeName,
            dealerName: lstReceiverData[4],
            dealerNumber: lstReceiverData[3],
            port: ReceiverPort,
            createdDate: moment(lstReceiverData[6], moment.ISO_8601).format(),
            createdBy: lstReceiverData[7],
            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,

            legacy: {
                ifqDealerId: lstReceiverData[0],
                agencyId: lstReceiverData[1],
                receiverNum: lstReceiverData[2],
                receiverCode: lstReceiverData[8],
                active: bActive
            }
        }
        return NewReceiver;
    }
}
