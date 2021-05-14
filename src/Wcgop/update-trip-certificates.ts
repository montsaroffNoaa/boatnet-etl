import { RetrieveEntireViewCouchDB, ExecuteOracleSQL, WcgopConnection, ReleaseOracle, InsertBulkCouchDB } from "../Common/common-functions";
import * as oraclesql from './oracle-sql'
import { Certificate } from "@boatnet/bn-models/lib/models/_common/certificate";
import { dictAllTripCertificates } from "./wcgop-etl";
import { BuildTripCertificate } from "./build-trip-certificates";


async function UpdateTripCertificates(){

    let wcgopConn = await WcgopConnection();
    let tripCertificateSQL: string = oraclesql.TripCertificateTableSQL();
    let tripCertificateData: any = await ExecuteOracleSQL(wcgopConn, tripCertificateSQL);
    let docsToBeUpdated: any[] = [];

    await ReleaseOracle(wcgopConn)

    
    for (let i = 0; i < tripCertificateData.length; i++) {
        let ForeignKey = tripCertificateData[i][1];
        if (ForeignKey in dictAllTripCertificates) {
            dictAllTripCertificates[ForeignKey].push(tripCertificateData[i]);
        } else {
            dictAllTripCertificates[ForeignKey] = [tripCertificateData[i]];
        }
        //console.log(dictAllTripCertificates[ForeignKey])
    }

    let Trips = await RetrieveEntireViewCouchDB('wcgop', 'all-trips');

    for(let i = 0; i < Trips.length; i++){
        if(Trips[i].legacy){

            let tripID = Trips[i].legacy.tripId;
            let TripCertificates: Certificate[] = await BuildTripCertificate(tripID);
            //console.log(TripCertificates);
            Trips[i].certificates = TripCertificates;

            docsToBeUpdated.push(Trips[i]);
        }
    }

    console.log(docsToBeUpdated.length);
    await InsertBulkCouchDB(docsToBeUpdated)

}


//UpdateTripCertificates();



