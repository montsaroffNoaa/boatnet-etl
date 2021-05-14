import moment = require("moment");
import { Certificate } from "@boatnet/bn-models/lib";
import { dictAllTripCertificates } from "./wcgop-etl";
import { ConvertToMomentIso8601 } from "../Common/common-functions";

export async function BuildTripCertificate(tripId: number) {
    if (tripId) {
        try {
            
        // let tripCertificateData = await ExecuteOracleSQL(odb, strTripCertificateSQL + tripId);
        let tripCertifiates: any[] = dictAllTripCertificates[tripId];
        let tripCertificateDocs: Certificate[] = [];

        //catches undefined
        if(!tripCertifiates){
            tripCertifiates = [];
        }

        for(let i = 0; i < tripCertifiates.length; i++){
            let tripCertificateData: any[] = tripCertifiates[i];
            let userCreatedByID = tripCertificateData[4];
            let userModifiedByID = tripCertificateData[6];
    
            let recordCreatedBy = userCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId');
            let recordModifiedBy = userModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');
    
            let newTripCertificate: Certificate = {
                certificateNumber: tripCertificateData[2],
                certificationId: tripCertificateData[7],
                createdDate: ConvertToMomentIso8601(tripCertificateData[3]),
                createdBy: recordCreatedBy,
                updatedDate: ConvertToMomentIso8601(tripCertificateData[9]),
                updatedBy: recordModifiedBy,
                dataSource: tripCertificateData[10],
                legacy: {
                    tripCertificateId: tripCertificateData[0],
                    tripId: tripCertificateData[1],
                    obsprodLoadDate: ConvertToMomentIso8601(tripCertificateData[8]),
                }
            }
            tripCertificateDocs.push(newTripCertificate)
            
        }
        return tripCertificateDocs;
        } catch (error) {
            console.log(error)
        }
    } else {
        return null;
    }
}
