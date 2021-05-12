import axios from 'axios';
import { GetItisTsnsByScientificName, GetFullHierarchyByTsn } from './taxonomy-etl';
import { GenerateCouchID } from '../Common/common-functions';
import { couchConnection } from '../Common/db-connection-variables';
import { Taxonomy } from '@boatnet/bn-models/lib';

const pacfinPrefix = 'https://reports.psmfc.org/pacfin/';
const pacfinHomePage = pacfinPrefix + 'f?p=501:1000::::::';
const downloadURLPrefix = pacfinPrefix + 'f?p=501:810:'; // 901 for fish tickets, 810 for species codes. this is a "variable" that needs changed for different pages, found in link
// const downloadURLPrefix = pacfinPrefix + 'f?p=501:901:'; // 901 for fish tickets, 810 for species codes. this is a "variable" that needs changed for different pages, found in link
const downloadURLSuffix = ':CSVDOWNLOAD::::';


var dictTaxonomyByItisID: { [id: number]: any; } = {};


function parseSpeciesCodeLink(response: string) {
    let beginningIdentifier = '"id":"14"';
    let endingIdentifier = "},";

    let info = response.substr(response.search(beginningIdentifier) - 1);
    info = info.substr(0, info.search(endingIdentifier) + 1);
    // info = info + "}";
    let infoObj = JSON.parse(info);
    return decodeURI(infoObj.link);
}

export async function getPacfinSpeciesTable() {
    // query home page
    const response = await axios.get(pacfinHomePage);

    let cookie = response.headers["set-cookie"][0];
    cookie = cookie.substr(0, cookie.search(";"));

    let fishTicketLink = parseSpeciesCodeLink(response.data);
    let token = fishTicketLink.split(':')[2];
    // "f?p=501:901:16674512408233:INITIAL:::F601_SELECTED_NODE:70&cs=3gaWwvKoLAia81SDS15a8tHOtCbrSfpHZqILXKehJW5A-LW3ZYXfouSInKTbCYqom74TnOSDOBcKNSJhm2jWh7w"

    // query fish ticket complete report page
    // (needed to fetch csv data otherwise it will respond with no data)
    let test = await axios.get(pacfinPrefix + fishTicketLink, {
        headers: { Cookie: cookie }
    });

    // download csv
    let downloadURL = downloadURLPrefix + token + downloadURLSuffix;
    let report = await axios.get(downloadURL, {
        headers: { Cookie: cookie }
    });

    let reportArr = report.data.split('\n');
    reportArr.splice(0, 1);
    let lstSpeciesData: string[][] = [];

    // compares the date last updated from the three state and gets the latest date
    for (let i = 0; i < reportArr.length; i++) {
        let lstSpeciesRecord = replaceAll(reportArr[i], `"`, '').split(',');
        // splicing the record into an array incorrectly splices the "complex" field, this fixes that by re-concatenating and popping
        if (lstSpeciesRecord.length > 5) {
            for (let j = 5; j < lstSpeciesRecord.length; j++) {
                lstSpeciesRecord[4] += ',' + lstSpeciesRecord[j];
            }
            for (let j = 5; j <= lstSpeciesRecord.length; j++) {
                lstSpeciesRecord.pop();
            }
        }
        lstSpeciesData.push(lstSpeciesRecord);
    }
    return lstSpeciesData;
}

function replaceAll(str: string, find: string, replace: string) {
    return str.replace(new RegExp(find, 'g'), replace);
}

async function processHierarchy(lstHierarchy: any[], strPacfinSpeciesCode: string) {

    let strParentID: string = null;
    for (let i = 0; i < lstHierarchy.length; i++) {
        // For taxonomy, an Id must be grabed ahead of time, due to taxonomyId and _id both existing. REVIEW.
        let strCouchID = await GenerateCouchID();

        // get parent id, if exists
        if (lstHierarchy[i].parentTsn) {
            if (lstHierarchy[i].parentTsn._text in dictTaxonomyByItisID) {
                strParentID = dictTaxonomyByItisID[lstHierarchy[i].parentTsn._text]._id;
            }
        }

        // build tax document
        let objNewTaxDocument: Taxonomy = {
            _id: strCouchID,
            type: 'taxonomy',
            taxonomyId: strCouchID,
            level: lstHierarchy[i].rankName._text,
            taxonomyName: lstHierarchy[i].taxonName._text,
            scientificName: lstHierarchy[i].taxonName._text,
            parent: strParentID,
            // wcgopTallyShortCode: null,
            // pacfinNomCode: null,
            itisTSN: parseInt(lstHierarchy[i].tsn._text),
            wormsAphiaId: null,
            isInactive: null,

            legacy: {
                wcgopSpeciesId: null,
                ashopSpeciesId: null,
                dwId: null
            }
        }

        // variables for insert logic
        let strDocID: string = null;
        let iItisID: number = objNewTaxDocument.itisTSN;
        let bNeedsUpdate: boolean = false;
        if (!(iItisID in dictTaxonomyByItisID) && i == lstHierarchy.length - 1) {
            // if not exists and is last item, add code from parameter to new doc
            objNewTaxDocument.pacfinSpeciesCode = strPacfinSpeciesCode;

        } else if (iItisID in dictTaxonomyByItisID && i == lstHierarchy.length - 1) {
            // if in dictionary and is last item, add code from parameter to existing doc
            strDocID = dictTaxonomyByItisID[iItisID]._id;
            objNewTaxDocument = dictTaxonomyByItisID[iItisID];
            objNewTaxDocument.pacfinSpeciesCode = strPacfinSpeciesCode;
            bNeedsUpdate = true;

        } else if (iItisID in dictTaxonomyByItisID && i < lstHierarchy.length - 1) {
            // if exists and not last item, set doc id
            strDocID = dictTaxonomyByItisID[iItisID]._id
        }

        if (bNeedsUpdate) {
            // if document needs to be updated with dw info
            await couchConnection.insert(objNewTaxDocument).then((data: any) => {
                strParentID = data._id;
                objNewTaxDocument._rev = data.rev;
                dictTaxonomyByItisID[iItisID] = objNewTaxDocument;
            }).catch((error: any) => {
                console.log("insert failed", error, objNewTaxDocument);
            });
        } else if (strDocID != null) {
            // if exists and no updated is needed
            strParentID = strDocID;
        } else {
            // if not exists, create
            await couchConnection.insert(objNewTaxDocument).then((data: any) => {
                strParentID = data._id;
                objNewTaxDocument._rev = data.rev;
                dictTaxonomyByItisID[iItisID] = objNewTaxDocument;
            }).catch((error: any) => {
                console.log("insert failed", error, objNewTaxDocument);
            });
        }
    }
}

async function fillTaxonomyDictionary() {

    await couchConnection.view('Taxonomy', 'taxonomy-by-itisTSN', {
        'include_docs': true
    }).then((data: any) => {
        if (data.rows.length > 0) {
            for (let i = 0; i < data.rows.length; i++) {
                dictTaxonomyByItisID[data.rows[i].doc.itisTSN] = data.rows[i].doc;
            }
        }
    }).catch((error: any) => {
        console.log(error);
    });

}

export async function PacfinSpeciesETL() {
    let lstSpeciesData = await getPacfinSpeciesTable();
    let lstBadNameRecords = [];

    await fillTaxonomyDictionary();

    for (let i = 0; i < lstSpeciesData.length; i++) {
        let lstReturnedTsns = await GetItisTsnsByScientificName(lstSpeciesData[i][2]);
        if (lstReturnedTsns.length == 1) {
            let lstHierarchy = await GetFullHierarchyByTsn(lstReturnedTsns[0]);
            if (lstHierarchy.length < 2) {
                console.log('invalid tsn: ', lstReturnedTsns[0]);
            }
            await processHierarchy(lstHierarchy, lstSpeciesData[i][0]);

        } else if (lstReturnedTsns.length == 0) {
            lstBadNameRecords.push(lstSpeciesData[i]);

        } else if (lstReturnedTsns.length > 1) {
            // only one record here has multiple hierarchies, it has two, and one is invalid:
            // "167353" - invalid
            // "692068" - valid
            let lstHierarchy = await GetFullHierarchyByTsn('692068');
            await processHierarchy(lstHierarchy, lstSpeciesData[i][0]);
        }
    }

    // const createCsvWriter = await require('csv-writer').createArrayCsvWriter;
    // const csvWriter = await createCsvWriter({
    //     header: ['Species Code', 'Species Common Name', 'Species Scientific Name', 'Management Group Code', 'Complex'],
    //     path: "C:\\Users\\Nicholas.Shaffer\\Desktop\\BadPacfinSpeciesNames.csv"
    // });

    // csvWriter
    //     .writeRecords(lstBadNameRecords)
    //     .then(() => console.log('The CSV file was written successfully'));

}








