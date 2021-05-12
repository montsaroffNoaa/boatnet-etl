import moment = require("moment");
import * as oraclesql from '../Wcgop/oracle-sql'
import { WcgopConnection, ExecuteOracleSQL, RemoveDocNullVals, InsertBulkCouchDB, ReleaseOracle } from "../Common/common-functions";
import { FetchRevID } from "../Wcgop/wcgop-etl";







async function initializeLookupsETL(){

    let CreatedDate = moment().toISOString(true)

    let strDateCompare: string = '1000-01-01 00:00:00';
    let DateCompare: Date = new Date(strDateCompare);
    console.log(CreatedDate);
    // console.log(moment().toISOString(true))
    let strDateLimit: string = CreatedDate;
    strDateLimit = moment(CreatedDate, moment.ISO_8601).format('YYYY-MM-DD HH:mm:ss');
    console.log('stop here');



    
    // await MigrateAllFromLookupTable(strDateCompare, strDateLimit, DateCompare);

    console.log("Lookup records moved, starting migrate on other lookup docs")
    console.log(new Date().toLocaleTimeString());

}



// Function to be used for all look up documents, which Build function to use is passed in as a parameter, making this an easy multi use funtion.
async function MigrateLookupDocuments(strPropertyID: string, strDocType: string, BuildDocument: Function, DateCompare: Date, strDateBegin: string, strDateEnd: string, strTableName: string, strTableID: string, ViewName: string) {

    let strSQL: string = oraclesql.AllNewAndModifiedLookups(strTableID, strTableName, strDateBegin, strDateEnd);
    let odb = await WcgopConnection(); // must be done syncronously
    let lstRawDocumentIDs = await ExecuteOracleSQL(odb, strSQL);
    let lstDocumentIDs = [];

    if (lstRawDocumentIDs != null) {
        for (let i = 0; i < lstRawDocumentIDs.length; i++) {
            lstDocumentIDs.push(lstRawDocumentIDs[i][0]);
        }
    }
    let lstDocuments = [];
    for (let i = 0; i < lstDocumentIDs.length; i++) {
        let iDocumentID = lstDocumentIDs[i];
        let cDocument = await BuildDocument(odb, iDocumentID);
        cDocument = RemoveDocNullVals(cDocument);
        // If record is newly created, add to list to be inserted in bulk
        if ((moment(cDocument.createdDate, moment.ISO_8601) > moment(DateCompare, moment.ISO_8601)) || (moment(cDocument.legacy.obsprodLoadDate, moment.ISO_8601) > moment(DateCompare, moment.ISO_8601))) {
            let [strDocID, strDocRev] = await FetchRevID(strPropertyID, iDocumentID, ViewName);
            if (strDocID == null) {
                lstDocuments.push(cDocument)
            }
        }
        else if (moment(cDocument.updatedDate, moment.ISO_8601) > moment(DateCompare, moment.ISO_8601)) {
            // Else already exists in couch, recreate it
            let [strDocID, strDocRev] = await FetchRevID(strPropertyID, iDocumentID, ViewName);
            cDocument = JSON.parse(JSON.stringify(cDocument));
            cDocument._id = strDocID;
            cDocument._rev = strDocRev;
            cDocument = RemoveDocNullVals(cDocument);
            await InsertBulkCouchDB([cDocument]); // todo double check, may just be able to bulk insert with the rest
        }
        else {
            // Should never reach this. 
            console.log("Error: Document neither newly created or modified, something is wrong. document type = " + strDocType + " document id = " + iDocumentID)
        }
    }
    await ReleaseOracle(odb);
    await InsertBulkCouchDB(lstDocuments);
}




