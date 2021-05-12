import moment = require("moment");
import { Certificate } from "@boatnet/bn-models/lib";
import { dictAllTripCertificates } from "./wcgop-etl";

export async function BuildTripCertificate(tripId: number) {
    if (tripId != undefined) {
        try {
            
        } catch (error) {
            
        // let tripCertificateData = await ExecuteOracleSQL(odb, strTripCertificateSQL + tripId);
        let tripCertifiates: any[] = dictAllTripCertificates[tripId];
        let tripCertificateDocs: Certificate[] = [];

        //catches undefined
        if(!tripCertifiates){
            tripCertifiates = [];
        }

        for(let i = 0; i < tripCertifiates.length; i++){
            let tripCertificateData: any[] = tripCertifiates[i];
            tripCertificateData = tripCertificateData[0];
            let userCreatedByID = tripCertificateData[4];
            let userModifiedByID = tripCertificateData[6];
    
            let recordCreatedBy = userCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId');
            let recordModifiedBy = userModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');
    
            let newTripCertificate: Certificate = {
                certificateNumber: tripCertificateData[2],
                createdDate: moment(tripCertificateData[3], moment.ISO_8601).format(),
                createdBy: recordCreatedBy,
                updatedDate: moment(tripCertificateData[9], moment.ISO_8601).format(),
                updatedBy: recordModifiedBy,
                certificationId: tripCertificateData[7],
                dataSource: tripCertificateData[10],
                legacy: {
                    tripCertificateId: tripCertificateData[0],
                    tripId: tripCertificateData[1],
                    obsprodLoadDate: moment(tripCertificateData[8], moment.ISO_8601).format()
                }
            }
            tripCertificateDocs.push(newTripCertificate)
            
        }
        return tripCertificateDocs;
        }
    } else {
        return null;
    }
}
