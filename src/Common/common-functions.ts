import oracledb = require("oracledb");
import { NorpacUser, NorpacPass, IFQUser, IFQPass, DWUser, DWHost, DWInitialDB, DWPass, DWPort } from "../../../dbconnections";
import { strNorpacConnection, strIFQConnection, couchConnection, couchDB } from "./db-connection-variables";
import moment = require("moment");

const { Pool, Client } = require('pg')

export async function AshopConnection() {
    let odb = await oracledb.getConnection(
        {
            user: NorpacUser,
            password: NorpacPass,
            connectString: strNorpacConnection
        }
    ).catch((error: any) => {
        console.log("oracle connection failed", error);
    });
    return odb
}

export async function WcgopConnection() {
    let odb = await oracledb.getConnection(
        {
            user: IFQUser,
            password: IFQPass,
            connectString: strIFQConnection
        }
    ).catch((error: any) => {
        console.log("oracle connection failed", error);
    });
    return odb
}

export async function WarehouseConnectionClient() {
    const client = new Client({
        user: DWUser,
        host: DWHost,
        database: DWInitialDB,
        password: DWPass,
        port: DWPort,
    })
    client.connect()
    return client
}

export async function WarehouseConnectionPool() {
    const pool = new Pool({
        user: DWUser,
        host: DWHost,
        database: DWInitialDB,
        password: DWPass,
        port: DWPort,
    });

    pool.on('error', (error: any, client: any) => {
        console.error('Unexpected error on idle client', error);
        process.exit(-1);
    });

    return pool;
}

export async function ReleasePostgres(client: any) {
    await client.end()
}

export async function ReleaseOracle(connection: any) {
    await connection.close(
        function (err: Error) {
            if (err)
                console.error(err.message);
            else
                console.log('Oracle released successfully.')
        });
}

export async function ExecuteOracleSQL(dbconnection: any, strSQL: string) {
    let aData = await dbconnection.execute(strSQL).catch((error: any) => {
        console.log("oracle query failed", error, strSQL);
    });
    if (aData) {
        return aData.rows;
    } else {
        return null;
    }
}

export async function GenerateCouchID() {

    let CouchID: string;

    await couchDB.uuids(1).then((data: any) => {
        //console.log(data);
        CouchID = data.uuids[0]
    });

    return CouchID;
}

export async function GenerateCouchIDs(iNumToGenerate: number) {

    let CouchIDs: string[];

    await couchDB.uuids(iNumToGenerate).then((data: any) => {
        //console.log(data);
        CouchIDs = data.uuids
    });

    return CouchIDs;
}

export function RemoveDocNullVals(Document: any) {

    // setting property to undefined instead of deleting is much faster, and adequate for the purpose of migrating to couch
    for (let item in Document) {
        if (Document[item] == null) {
            //delete Document[item];
            Document[item] = undefined;
        } else if (typeof (Document[item]) === 'object') {
            let subdoc = RemoveDocNullVals(Document[item]);
            Document[item] = subdoc;
        } else if (typeof (Document[item]) === 'string') {
            if (!Document[item].replace(/\s/g, '').length) {
                // string only contains whitespace
                Document[item] = undefined;
            }
        }
    }

    return Document;
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function RetrieveEntireViewCouchDB(strDesignName: string, strViewName: string) {
    let lstDocsToReturn: any = [];
    await couchConnection.view(strDesignName, strViewName, {
        'include_docs': true
    }).then((data: any) => {
        if (data.rows.length > 0) {
            for (let i = 0; i < data.rows.length; i++) {
                lstDocsToReturn.push(data.rows[i].doc);
            }
        }
    }).catch((error: any) => {
        console.log(error);
    });
    return lstDocsToReturn
}

export async function InsertBulkCouchDB(lstDocuments: any[]) {
    let lstDocumentIDs: string[];
    lstDocumentIDs = [];

    await couchConnection.bulk({ docs: lstDocuments }).then((lstReturn: any) => {
        //console.log(lstReturn);
        for (let i = 0; i < lstReturn.length; i++) {
            lstDocumentIDs.push(lstReturn[i].id)
        }
    }).catch((error: any) => {
        console.log("bulk insert failed", error, lstDocuments);
    });

    return lstDocumentIDs;
}

export function ReplaceAll(str: string, find: string, replace: string) {
    return str.replace(new RegExp(find, 'g'), replace);
}

export function Transpose(aInput: any[][]) {
    return Object.keys(aInput[0]).map(function (c) {
        return aInput.map(function (r: any) { return r[c]; });
    });
}

export function DmsToDD(iDegrees: number, iMinutes: number, iSeconds: number, strEastOrWest: string) {
    if (strEastOrWest == 'W') {
        return - Math.round((iDegrees + (iMinutes / 60) + (iSeconds / 3600)) * 1000000) / 1000000;
    } else if (strEastOrWest == 'E') {
        return Math.round((iDegrees + (iMinutes / 60) + (iSeconds / 3600)) * 1000000) / 1000000;
    } else {
        return Math.round((iDegrees + (iMinutes / 60) + (iSeconds / 3600)) * 1000000) / 1000000;
    }
}

export async function CreateAshopViews() {

    let LookupDocs: any = {
        "_id": "_design/ETL-LookupDocs",
        "views": {
            "ashop-gear-performance-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-gear-performance') { \r\n    emit(doc.gearPerformanceCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-gear-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-gear-type') { \r\n    emit(doc.gearTypeCode.toString() + ',' + doc.gearTypeForm.toString(), doc._rev);\r\n  }\r\n}"
            },
            "ashop-port-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-port') { \r\n    emit(doc.portCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-vessel-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'vessel') { \r\n    emit(doc.portCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-vessel-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-vessel-type') { \r\n    emit(doc.vesselType, doc._rev);\r\n  }\r\n}"
            },
            "ashop-tribal-delivery-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-tribal-delivery') { \r\n    emit(doc.cdqCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-species-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-species') { \r\n    emit(doc.speciesCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-condition-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-condition') { \r\n    emit(doc.conditionCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-sample-system-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-sample-system') { \r\n    emit(doc.sampleSystemCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-maturity-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-maturity') { \r\n    emit(doc.maturitySeq, doc._rev);\r\n  }\r\n}"
            },
            "ashop-specimen-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-specimen-type') { \r\n    emit(doc.code, doc._rev);\r\n  }\r\n}"
            },
            "ashop-sample-unit-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-sample-unit') { \r\n    emit(doc.sampleUnitCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-animal-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-animal-type') { \r\n    emit(doc.animalTypeCode, doc._rev);\r\n  }\r\n}"
            },
            "taxonomy-alias-by-ashop-id": {
                "map": "function (doc) {\r\n  if (doc.type == 'taxonomy-alias' && doc.isAshop && doc.aliasType == 'common name' && doc.taxonomy.legacy.ashopSpeciesId) { \r\n    emit(doc.taxonomy.legacy.ashopSpeciesId, null);\r\n  }\r\n}"
            }

        },
        "language": "javascript"
    }

    await couchConnection.get('_design/ETL-LookupDocs').then((body: any) => {
        LookupDocs._rev = body._rev;
    }).catch((error: any) => {
    });

    await couchConnection.insert(LookupDocs).then((data: any) => {
        console.log(data)
    }).catch((error: any) => {
        console.log("update failed", error, LookupDocs);

    });

    let MainDocs: any = {
        "_id": "_design/ETL-MainDocs",
        "views": {
            "all-operations": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-haul') { \r\n    emit(doc.legacy.cruiseNum.toString() + ',' + doc.legacy.permit.toString() + ',' + doc.legacy.haulSeq.toString(), doc._rev);\r\n  }\r\n}"
            },
            "all-cruises": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-cruise') { \r\n    emit(doc.cruiseNum, doc._rev);\r\n  }\r\n}"
            }
        },
        "language": "javascript"
    }

    await couchConnection.get('_design/ETL-MainDocs').then((body: any) => {
        MainDocs._rev = body._rev;
    }).catch((error: any) => {
    });

    await couchConnection.insert(MainDocs).then((data: any) => {
        console.log(data)
    }).catch((error: any) => {
        console.log("update failed", error, MainDocs);

    });

}

export async function CreateWcgopViews() {

    let LookupDocs: any = {
        "_id": "_design/LookupDocs",
        "views": {
            "beaufort-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'beaufort') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "biostructure-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'biostructure-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "discard-reason-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'discard-reason') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "confidence-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'confidence') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "body-length-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'body-length') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "contact-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'contact-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "interaction-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'interaction-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "contact-category-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'contact-category') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "interaction-outcome-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'interaction-outcome') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "relationship-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'relationship') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "trip-status-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'trip-status') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "vessel-status-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'vessel-status') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "vessel-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'vessel-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "waiver-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'waiver-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "waiver-reason-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'waiver-reason-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "weight-method-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'weight-method') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "biospecimen-sample-method-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'biospecimen-sample-method') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "species-sub-category-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'species-sub-category') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "species-category-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'species-category') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "gear-performance-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'gear-performance') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "catch-disposition-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'catch-disposition') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "gear-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'gear-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "sighting-condition-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'sighting-condition') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "fishery-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'fishery') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "first-receiver-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'first-receiver') { \r\n    emit(doc.legacy.ifqDealerId, doc._rev);\r\n  }\r\n}"
            },
            "behavior-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'behavior-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "hlfc-mitigation-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'hlfc-mitigation-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "hlfc-horizontal-extent-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'hlfc-horizontal-extent') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "hlfc-aerial-extent-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'hlfc-aerial-extent') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "hlfc-product-delivery-state-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'hlfc-product-delivery-state') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "maturity-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'maturity') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "viability-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'viability') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "taxonomy-alias-by-wcgop-id": {
                "map": "function (doc) {\r\n  if (doc.type == 'taxonomy-alias' && doc.isWcgop && doc.aliasType == 'common name' && doc.taxonomy.legacy.wcgopSpeciesId) { \r\n    emit(doc.taxonomy.legacy.wcgopSpeciesId, null);\r\n  }\r\n}"
            },
            "observers-by-userid": {
                "map": "function (doc) {\r\n  if (doc.type == 'person') { \r\n    emit(doc.legacy.userId, doc._rev);\r\n  }\r\n}"
            }


        },
        "language": "javascript"
    }

    await couchConnection.get('_design/LookupDocs').then((body: any) => {
        LookupDocs._rev = body._rev;
    }).catch((error: any) => {
    });


    await couchConnection.insert(LookupDocs).then((data: any) => {
        console.log(data)
    }).catch((error: any) => {
        console.log("update failed", error, LookupDocs);

    });

    let MainDocs: any = {
        "_id": "_design/MainDocs",
        "views": {
            "all-operations": {
                "map": "function (doc) {\r\n  if (doc.type == 'wcgop-operation') { \r\n    emit(doc.legacy.fishingActivityId, doc._rev);\r\n  }\r\n}"
            },
            "all-trips": {
                "map": "function (doc) {\r\n  if (doc.type == 'wcgop-trip') { \r\n    emit(doc.legacy.tripId, doc._rev);\r\n  }\r\n}"
            },
            "all-vessels": {
                "map": "function (doc) {\r\n  if (doc.type == 'vessel') { \r\n    emit(doc.legacy.vesselId, doc._rev);\r\n  }\r\n}"
            },
            "all-contacts": {
                "map": "function (doc) {\r\n  if (doc.type == 'person') { \r\n    emit(doc.legacy.PersonId, doc._rev);\r\n  }\r\n}"
            },
            "all-ports": {
                "map": "function (doc) {\r\n  if (doc.type == 'port') { \r\n    emit(doc.legacy.portId, doc._rev);\r\n  }\r\n}"
            },
            "all-programs": {
                "map": "function (doc) {\r\n  if (doc.type == 'program') { \r\n    emit(doc.legacy.programId, doc._rev);\r\n  }\r\n}"
            },
            "all-species": {
                "map": "function (doc) {\r\n  if (doc.type == 'species') { \r\n    emit(doc.legacy.speciesId, doc._rev);\r\n  }\r\n}"
            },
            "vessels-by-name": {
                "map": "function (doc) {\r\n  if (doc.type == 'vessel') { \r\n    emit(doc.vesselName.toUpperCase(), doc._rev);\r\n  }\r\n}"
            }

        },
        "language": "javascript"
    }

    await couchConnection.get('_design/MainDocs').then((body: any) => {
        MainDocs._rev = body._rev;
    }).catch((error: any) => {
    });

    await couchConnection.insert(MainDocs).then((data: any) => {
        console.log(data)
    }).catch((error: any) => {
        console.log("update failed", error, MainDocs);

    });


}

export async function CreateMasterViews() {

    let DesignDocs: any[] = [];

    // ashop
    DesignDocs.push({
        "_id": "_design/ashop-docs",
        "views": {
            "all-operations": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-haul') { \r\n    emit(doc.legacy.cruiseNum.toString() + ',' + doc.legacy.permit.toString() + ',' + doc.legacy.haulSeq.toString(), doc._rev);\r\n  }\r\n}"
            },
            "all-cruises": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-cruise') { \r\n    emit(doc.cruiseNum, doc._rev);\r\n  }\r\n}"
            }
        },
        "language": "javascript"
    })

    DesignDocs.push({
        "_id": "_design/ashop-lookups",
        "views": {
            "ashop-gear-performance-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-gear-performance') { \r\n    emit(doc.gearPerformanceCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-gear-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-gear-type') { \r\n    emit(doc.gearTypeCode.toString() + ',' + doc.gearTypeForm.toString(), doc._rev);\r\n  }\r\n}"
            },
            "ashop-port-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-port') { \r\n    emit(doc.portCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-vessel-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-vessel-type') { \r\n    emit(doc.vesselType, doc._rev);\r\n  }\r\n}"
            },
            "ashop-tribal-delivery-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-tribal-delivery') { \r\n    emit(doc.cdqCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-species-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-species') { \r\n    emit(doc.speciesCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-condition-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-condition') { \r\n    emit(doc.conditionCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-sample-system-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-sample-system') { \r\n    emit(doc.sampleSystemCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-maturity-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-maturity') { \r\n    emit(doc.maturitySeq, doc._rev);\r\n  }\r\n}"
            },
            "ashop-specimen-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-specimen-type') { \r\n    emit(doc.code, doc._rev);\r\n  }\r\n}"
            },
            "ashop-sample-unit-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-sample-unit') { \r\n    emit(doc.sampleUnitCode, doc._rev);\r\n  }\r\n}"
            },
            "ashop-animal-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'ashop-animal-type') { \r\n    emit(doc.animalTypeCode, doc._rev);\r\n  }\r\n}"
            },
            "taxonomy-alias-by-ashop-id": {
                "map": "function (doc) {\r\n  if (doc.type == 'taxonomy-alias' && doc.isAshop && doc.aliasType == 'common name' && doc.taxonomy.legacy.ashopSpeciesId) { \r\n    emit(doc.taxonomy.legacy.ashopSpeciesId, null);\r\n  }\r\n}"
            }
        },
        "language": "javascript"
    })

    // wcgop
    DesignDocs.push({
        "_id": "_design/wcgop-docs",
        "views": {
            "all-operations": {
                "map": "function (doc) {\r\n  if (doc.type == 'wcgop-operation') { \r\n    emit(doc.legacy.fishingActivityId, doc._rev);\r\n  }\r\n}"
            },
            "all-trips": {
                "map": "function (doc) {\r\n  if (doc.type == 'wcgop-trip') { \r\n    emit(doc.legacy.tripId, doc._rev);\r\n  }\r\n}"
            },
            "all-vessels": {
                "map": "function (doc) {\r\n  if (doc.type == 'vessel') { \r\n    emit(doc.legacy.vesselId, doc._rev);\r\n  }\r\n}"
            },
            "all-contacts": {
                "map": "function (doc) {\r\n  if (doc.type == 'person') { \r\n    emit(doc.legacy.PersonId, doc._rev);\r\n  }\r\n}"
            },
            "all-ports": {
                "map": "function (doc) {\r\n  if (doc.type == 'port') { \r\n    emit(doc.legacy.portId, doc._rev);\r\n  }\r\n}"
            },
            "all-programs": {
                "map": "function (doc) {\r\n  if (doc.type == 'program') { \r\n    emit(doc.legacy.programId, doc._rev);\r\n  }\r\n}"
            },
            "all-species": {
                "map": "function (doc) {\r\n  if (doc.type == 'species') { \r\n    emit(doc.legacy.speciesId, doc._rev);\r\n  }\r\n}"
            },
            "vessels-by-name": {
                "map": "function (doc) {\r\n  if (doc.type == 'vessel') { \r\n    emit(doc.vesselName.toUpperCase(), doc._rev);\r\n  }\r\n}"
            }
        },
        "language": "javascript"
    })

    DesignDocs.push({
        "_id": "_design/wcgop-lookups",
        "views": {
            "beaufort-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'beaufort') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "biostructure-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'biostructure-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "discard-reason-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'discard-reason') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "confidence-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'confidence') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "body-length-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'body-length') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "contact-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'contact-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "interaction-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'interaction-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "contact-category-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'contact-category') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "interaction-outcome-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'interaction-outcome') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "relationship-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'relationship') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "trip-status-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'trip-status') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "vessel-status-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'vessel-status') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "vessel-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'vessel-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "waiver-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'waiver-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "waiver-reason-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'waiver-reason-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "weight-method-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'weight-method') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "biospecimen-sample-method-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'biospecimen-sample-method') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "species-sub-category-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'species-sub-category') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "species-category-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'species-category') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "gear-performance-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'gear-performance') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "catch-disposition-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'catch-disposition') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "gear-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'gear-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "sighting-condition-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'sighting-condition') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "fishery-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'fishery') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "first-receiver-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'first-receiver') { \r\n    emit(doc.legacy.ifqDealerId, doc._rev);\r\n  }\r\n}"
            },
            "behavior-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'behavior-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "hlfc-mitigation-type-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'hlfc-mitigation-type') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "hlfc-horizontal-extent-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'hlfc-horizontal-extent') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "hlfc-aerial-extent-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'hlfc-aerial-extent') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "hlfc-product-delivery-state-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'hlfc-product-delivery-state') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "maturity-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'maturity') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "viability-lookup": {
                "map": "function (doc) {\r\n  if (doc.type == 'viability') { \r\n    emit(doc.legacy.lookupVal, doc._rev);\r\n  }\r\n}"
            },
            "taxonomy-alias-by-wcgop-id": {
                "map": "function (doc) {\r\n  if (doc.type == 'taxonomy-alias' && doc.isWcgop && doc.aliasType == 'common name' && doc.taxonomy.legacy.wcgopSpeciesId) { \r\n    emit(doc.taxonomy.legacy.wcgopSpeciesId, null);\r\n  }\r\n}"
            },
            "observers-by-userid": {
                "map": "function (doc) {\r\n  if (doc.type == 'person') { \r\n    emit(doc.legacy.userId, doc._rev);\r\n  }\r\n}"
            }
        },
        "language": "javascript"
    })

    // hook and line 
    DesignDocs.push({
        "_id": "_design/hook-and-line-docs   ",
        "views": {
            "test": {
                "map": "function (doc) {\r\n  if (doc.type == 'test') { \r\n    emit(doc._id, doc._rev);\r\n  }\r\n}"
            }
        },
        "language": "javascript"
    })

    DesignDocs.push({
        "_id": "_design/hook-and-line-lookups",
        "views": {
            "test": {
                "map": "function (doc) {\r\n  if (doc.type == 'test') { \r\n    emit(doc._id, doc._rev);\r\n  }\r\n}"
            }
        },
        "language": "javascript"
    })

    // trawl
    DesignDocs.push({
        "_id": "_design/trawl-docs",
        "views": {
            "test": {
                "map": "function (doc) {\r\n  if (doc.type == 'test') { \r\n    emit(doc._id, doc._rev);\r\n  }\r\n}"
            }
        },
        "language": "javascript"
    })

    DesignDocs.push({
        "_id": "_design/trawl-lookups",
        "views": {
            "test": {
                "map": "function (doc) {\r\n  if (doc.type == 'test') { \r\n    emit(doc._id, doc._rev);\r\n  }\r\n}"
            }
        },
        "language": "javascript"
    })

    // acoustics
    DesignDocs.push({
        "_id": "_design/acoustics-docs",
        "views": {
            "test": {
                "map": "function (doc) {\r\n  if (doc.type == 'test') { \r\n    emit(doc._id, doc._rev);\r\n  }\r\n}"
            }
        },
        "language": "javascript"
    })

    DesignDocs.push({
        "_id": "_design/acoustics-lookups",
        "views": {
            "test": {
                "map": "function (doc) {\r\n  if (doc.type == 'test') { \r\n    emit(doc._id, doc._rev);\r\n  }\r\n}"
            }
        },
        "language": "javascript"
    })

    // common lookups
    DesignDocs.push({
        "_id": "_design/common-lookups",
        "views": {
            "test": {
                "map": "function (doc) {\r\n  if (doc.type == 'test') { \r\n    emit(doc._id, doc._rev);\r\n  }\r\n}"
            }
        },
        "language": "javascript"
    })

    // etl stuff
    DesignDocs.push({
        "_id": "_design/etl-stuff",
        "views": {
            "test": {
                "map": "function (doc) {\r\n  if (doc.type == 'test') { \r\n    emit(doc._id, doc._rev);\r\n  }\r\n}"
            }
        },
        "language": "javascript"
    })

    // taxonomy
    DesignDocs.push({
        "_id": "_design/taxonomy",
        "views": {
            "taxonomy-by-itisTSN": {
                "map": "function (doc) {\r\n  if (doc.type == 'taxonomy') { \r\n    emit(doc.itisTSN, doc._id);\r\n  }\r\n}"
              },
              "taxonomy-get-child-docs": {
                "map": "function (doc) {\r\n  if (doc.type == 'taxonomy') { \r\n    emit(doc.parent, doc._id);\r\n  }\r\n}"
              },
              "taxonomy-with-dwid": {
                "map": "function (doc) {\r\n  if (doc.type == 'taxonomy' && doc.legacy.dwId) { \r\n    emit(doc.legacy.dwId, null);\r\n  }\r\n}"
              },
              "taxonomy-with-no-children": {
                "map": "function (doc) {\r\n  if (doc.type == 'taxonomy' && !(doc.children)) { \r\n    emit(doc.itisTSN, null);\r\n  }\r\n}"
              },
              "all-taxonomy-aliases": {
                "map": "function (doc) {\r\n  if (doc.type == 'taxonomy-alias') { \r\n    emit(doc.alias, null);\r\n  }\r\n}"
              },
              "taxonomy-with-pacfin-code": {
                "map": "function (doc) {\r\n  if (doc.type == 'taxonomy') { \r\n    emit(doc.pacfinSpeciesCode, null);\r\n  }\r\n}"
              },
              "taxonomy-by-scientific-name": {
                "map": "function (doc) {\r\n  if (doc.type == 'taxonomy') { \r\n    emit(doc.scientificName, null);\r\n  }\r\n}"
              },
              "taxonomy-alias-by-taxonomy-id": {
                "map": "function (doc) {\r\n  if (doc.type == 'taxonomy-alias') { \r\n    emit(doc.taxonomy._id, null);\r\n  }\r\n}"
              },
              "taxonomy-by-wcgop-id": {
                "map": "function (doc) {\r\n  if (doc.type == 'taxonomy' && doc.legacy.wcgopSpeciesId) { \r\n    emit(doc.legacy.wcgopSpeciesId, null);\r\n  }\r\n}"
              },
              "taxonomy-alias-scientific-name-by-taxonomy-id": {
                "map": "function (doc) {\r\n  if (doc.type == 'taxonomy-alias' && doc.aliasType == 'scientific name') { \r\n    emit(doc.taxonomy._id, null);\r\n  }\r\n}"
              },
              "all-catch-groupings": {
                "map": "function (doc) {\r\n  if (doc.type == 'catch-grouping') { \r\n    emit(doc.name, null);\r\n  }\r\n}"
              },
              "taxonomy-alias-by-ashop-id": {
                "map": "function (doc) {\r\n  if (doc.type == 'taxonomy-alias' && doc.isAshop && doc.aliasType == 'common name' && doc.taxonomy.legacy.ashopSpeciesId) { \r\n    emit(doc.taxonomy.legacy.ashopSpeciesId, null);\r\n  }\r\n}"
              },
              "taxonomy-alias-by-wcgop-id": {
                "map": "function (doc) {\r\n  if (doc.type == 'taxonomy-alias' && doc.isWcgop && doc.aliasType == 'common name' && doc.taxonomy.legacy.wcgopSpeciesId) { \r\n    emit(doc.taxonomy.legacy.wcgopSpeciesId, null);\r\n  }\r\n}"
              },
              "catch-grouping-by-catch-category-id": {
                "map": "function (doc) {\r\n  if (doc.type == 'catch-grouping' && doc.definition == 'Wcgop catch category') { \r\n    emit(doc.legacy.wcgopCatchCategoryId, null);\r\n  }\r\n}"
              }
        },
        "language": "javascript"
    })

    // obsweb
    DesignDocs.push({
        "_id": "_design/obs-web",
        "views": {
            "all_em_efp": {
                "map": "function(doc) {\n    if (doc.type == 'emefp' \n    // && doc.efpTypes[0].description !== 'Whiting'\n    ) {\n        emit(doc.emEfpNumber, doc.vessel.vesselName);\n    }\n}"
            },
            "all_observed_trips": {
                "map": "function (doc) {\n  if (doc.type === \"wcgop-trip\"&& doc.observer.userName) {\n    emit(doc.observer.userName, 1);\n  }\n}"
            },
            "all_observer_activities": {
                "map": "function (doc) {\n  if (doc.type === \"observer-activity\") {\n    emit(doc.observer.userName, 1);\n  }\n}"
            },
            "all_observers": {
                "map": "function (doc) {\n  if (doc.type === \"person\" && (doc.applicationRoles.indexOf(\"Observer\") !== -1)) {\n    emit(doc._id, 1);\n  }\n}"
            },
            "all_ots_targets": {
                "map": "function (doc) {\n  if (doc.type === \"ots-target\") {\n    emit(doc._id, doc);\n  }\n}"
            },
            "all_permits": {
                "map": "function (doc) {\n  if (doc.type === \"permit\") {\n    emit(doc._id, 1);\n  }\n}"
            },
            "all_persons": {
                "map": "function (doc) {\n  if (doc.type === \"person\" && doc.firstName && doc.lastName) {\n    var name = doc.firstName + doc.lastName\n    emit(name, 1);\n  }\n}"
            },
            "all_us_states": {
                "map": "function (doc) {\n  if (doc.type === 'usstate') {\n    emit(doc._id, 1);\n  }\n}"
            },
            "all_usernames": {
                "map": "function (doc) {\n  if (doc.type === \"person\" && doc.firstName && doc.lastName) {\n    emit(doc.apexUserAdminUserName, 1);\n  }\n}"
            },
            "all_vessels": {
                "map": "function(doc) {\n    if (doc.type == 'vessel') { \n      emit(doc.vesselName, doc);\n    }\n}"
            },
            "efp_type_options": {
                "map": "function(doc) {\n    if (doc.type == 'efp-type') { \n      emit(doc.description, doc);\n    }\n}"
            },
            "em-efp-trips": {
                "map": "function (doc) {\n  if (doc.type == \"wcgop-trip\" && doc.fishery) {\n    if (doc.fishery.name == \"EM EFP\") {\n      emit(doc._id, 1);\n    }\n  }\n}"
            },
            "findbaddoc": {
                "map": "function (doc) {\n  if (doc.type === 'em-efp') {\n    emit(doc._id, 1);\n  }\n}"
            },
            "gear-type-options": {
                "map": "function(doc) {\n    if (doc.type == 'gear-type') { \n      emit(doc.description, doc);\n    }\n}"
            },
            "ots-target-trips": {
                "map": "function (doc) {\n  if (doc.type == 'OTSTarget') {\n    emit([doc.value, 0], doc);\n  }\n  if (doc.type == 'OTSTrip') {\n    emit([doc.value, 0], doc)\n  }\n}"
            },
            "reg-num": {
                "map": "function(doc) {\n    if (doc.type == 'vessel') { \n      var regNum = (doc.coastGuardNumber ? doc.coastGuardNumber : doc.stateRegulationNumber)\n      emit(regNum, doc.vesselName);\n    }\n}"
            },
            "sector-options": {
                "map": "function(doc) {\n    if (doc.type == 'sector-type') { \n      emit(doc.description, doc);\n    }\n}"
            },
            "vessel_captains": {
                "map": "function (doc) {\n    if (doc.type == 'vessel' && doc.captains.length > 0) {\n      var vesselId = doc.coastGuardNumber ? doc.coastGuardNumber : doc.stateRegulationNumber;\n      emit(vesselId, doc.captains)\n    }\n}"
            },
            "searchable_vessels": {
                "map": "function (doc) {\n  var i;\n  if (doc.type === 'vessel' && doc.vesselName) {\n    for (i = 0; i < doc.vesselName.length; i += 1) {\n      emit(doc.vesselName.slice(i), doc);\n    }\n  }\n  emit(doc._id, 1);\n}"
            },
            "findSeth": {
                "map": "function (doc) {\n  if (doc.type === \"person\" && doc.firstName === 'Seth') {\n    var name = doc.firstName + doc.lastName\n    emit(name, 1);\n  }\n}"
            },
            "all_doc_types": {
                "reduce": "_approx_count_distinct",
                "map": "function (doc) {\n  emit(doc.type, 1);\n}"
            },
            "all_active_persons": {
                "map": "function (doc) {\n  if (doc.type === \"person\" && !doc.isLegacy) {\n    emit(doc.apexUserAdminUserName, 1);\n  }\n}"
            },
            "all_em_hardware": {
                "map": "function (doc) {\n  if (doc.type === 'em-hardware')\n  emit(doc._id, doc.name);\n}"
            },
            "all_thrird_party_reviewers": {
                "map": "function (doc) {\n  if (doc.type === 'third-party-reviewer') {\n    emit(doc._id, doc.name);\n  }\n}"
            },
            "all_phone_number_types": {
                "map": "function (doc) {\n  if (doc.type === 'phone-number-type') {\n    emit(doc.description, doc.lookupVal);\n  }\n}"
            }
        },
        "language": "javascript"
    })

    // data access
    DesignDocs.push({
        "_id": "_design/data-access",
        "views": {
            "sea-days": {
                "map": "function (doc) {\r\n    if (doc.type == 'wcgop-trip' && doc.returnDate) {\r\n\r\n        var regNum = (doc.vessel.coastGuardNumber ? doc.vessel.coastGuardNumber : doc.vessel.stateRegulationNumber);\r\n\r\n        // var seaDays =\r\n        //     (\r\n        //         (\r\n        //             Date.parse(doc.returnDate).getTime() - Date.parse(doc.departureDate).getTime()\r\n        //         ) / (\r\n        //             1000 * 3600 * 24\r\n        //         )\r\n        //     ) + 1;\r\n        \r\n        emit([doc.program.name, doc.fishery.description, doc.returnDate, regNum], 1)\r\n    }\r\n}"
            },
            "observer-tripstatus": {
                "map": "function (doc) {\n  if (doc.type === \"wcgop-trip\") {\n    emit([doc.observer, doc.tripStatus.description], 1);\n  }\n}"
            },
            "observer-returndate": {
                "map": "function (doc) {\n  if (doc.type === \"wcgop-trip\") {\n    emit([doc.observer, doc.returnDate], 1);\n  }\n}"
            }
        },
        "language": "javascript"
    })

    // trips api
    DesignDocs.push({
        "_id": "_design/trips-api",
        "views": {
            "all_api_trips": {
                "map": "function (doc) {\n  if (doc.type === 'trips-api') {\n    emit(doc.tripId, 1);\n  }\n}",
                "reduce": "_stats"
            }
        },
        "language": "javascript"
    })

    // obtecs trawl
    DesignDocs.push({
        "_id": "_design/obtects-trawl",
        "views": {
            "all_vessel_names": {
                "map": "function(doc) {\n    if (doc.type == 'vessel') { \n      var regNum = (doc.coastGuardNumber ? doc.coastGuardNumber : doc.stateRegulationNumber);\n      emit(doc.vesselName.toLowerCase(), doc.vesselName + ' (' + regNum + ')');\n    }\n}"
              },
              "all_port_names": {
                "map": "function(doc) {\n    if (doc.type == 'port') { \n     const portNameInfo = (doc.code? doc.code + ': ': '') + doc.name + ' (' + doc.state + ')';\n     emit(doc.name.toLowerCase(), portNameInfo);\n    }\n}"
              },
              "all_program_names": {
                "map": "function (doc) {\n  if (doc.type === 'program') {\n    emit(doc.name, doc.description);\n  }\n}"
              },
              "all_tally_species": {
                "map": "function (doc) {\n  if (doc.type === \"tally-species\" && doc.active != 0 && doc.shortCode) {\n    emit(doc.shortCode, { commonName: doc.commonName, scientificName: doc.scientificName});\n  }\n}"
              },
              "all-wcgop-operations": {
                "map": "function (doc) {\n  if (doc.type === 'wcgop-operation') {\n    emit(doc._id, 1)\n  }\n}"
              }
        },
        "language": "javascript"
    })





    await couchConnection.bulk({ docs: DesignDocs }).then((data: any) => {
        console.log(data)
    }).catch((error: any) => {
        console.log("update failed", error, DesignDocs);

    });
}

export async function FetchDocument(Key: string, ViewName: string, DesignName: string) {
    // note: query may return more than one item, this function will always return the first item in the returned
    // this function assumes whatever calls it, is feeding it a Key that knowingly only has a single associated document
    let strDocID;
    let strDocRev;
    let Document;

    await couchConnection.view(DesignName, ViewName, {
        'key': Key,
        'include_docs': true
    }).then((data: any) => {
        if (data.rows.length > 0) {
            strDocID = data.rows[0].id;
            strDocRev = data.rows[0].value;
            Document = data.rows[0].doc
        }
    }).catch((error: any) => {
        console.log(error, DesignName, ViewName);
    });


    return [strDocID, strDocRev, Document];
}

// Checks if document exists in dictionary instance, if not, fetches from couch and adds to global dict passed in
// key is either string or int
export async function GetDocFromDict(dictDocuments: { [id: string]: any; }, Key: any, ViewName: string, DesignName: string) {
    let Document;
    let keyToQueryWith = Key;
    if (Key == null) {
        // console.log('error here', ViewName, DesignName)
    }
    if (Key != null) {
        // Key = Key.toString();
        if (Key in dictDocuments) {
            Document = dictDocuments[Key];
        } else {
            [, , Document] = await FetchDocument(keyToQueryWith, ViewName, DesignName);
            dictDocuments[Key] = Document;
        }
    } else {
        Document = null;
    }
    return Document;
}

// Will remove every document from a given database in such a way that deleted docs will all replicate to be deleted elsewhere as well
export async function RemoveEverything() {
    let RemoveAll: any = {
        "_id": "_design/RemoveAll",
        "views": {
            "all-docs": {
                "map": "function (doc) {\r\n  emit(doc._id, doc._rev);\r\n}"
            }
        },
        "language": "javascript"
    }

    await couchConnection.get('_design/RemoveAll').then((body: any) => {
        RemoveAll._rev = body._rev;
    }).catch((error: any) => {
    });


    await couchConnection.insert(RemoveAll).then((data: any) => {
        console.log(data)
    }).catch((error: any) => {
        console.log("update failed", error, RemoveAll);

    });

    let lstDocsToDelete: any[] = [];
    await couchConnection.view('RemoveAll', 'all-docs', {
        'include_docs': true
    }).then((data: any) => {
        if (data.rows.length > 0) {
            for (let i = 0; i < data.rows.length; i++) {
                let newDoc = data.rows[i].doc;
                newDoc._deleted = true;
                lstDocsToDelete.push(newDoc);
            }
        }
    }).catch((error: any) => {
        console.log(error);
    });

    await couchConnection.bulk({ docs: lstDocsToDelete }).then((body: any) => {
        console.log(body);
    });


}

export async function QueryLookupView(ViewName: string, iLookupID: number) {
    let strDocID, strDocRev: string;
    await couchConnection.view('LookupDocs', ViewName, {
        'key': iLookupID,
        'include_docs': true
    }).then((data: any) => {
        if (data.rows.length > 0) {
            strDocID = data.rows[0].id;
            strDocRev = data.rows[0].value;
        }
    }).catch((error: any) => {
        console.log(error, ViewName, iLookupID);
    });
    return [strDocID, strDocRev]
}


export async function RemoveAllFromView(DesignName: String, ViewName: String) {
    let lstDocsToDelete: any[] = [];
    let dbConnection = couchDB.use(couchConnection);
    await dbConnection.view(DesignName, ViewName, {
        'include_docs': false
    }).then((data: any) => {
        if (data.rows.length > 0) {
            for (let i = 0; i < data.rows.length; i++) {
                let newDoc = {
                    _id: data.rows[i].id,
                    _rev: data.rows[i].value,
                    _deleted: true
                }
                lstDocsToDelete.push(newDoc);
            }
        }
    }).catch((error: any) => {
        console.log(error);
    });

    await dbConnection.bulk({ docs: lstDocsToDelete }).then((body: any) => {
        console.log(body);
    }).catch((error: any) => {
        console.log(error);
    });;

}


export function ConvertToMomentIso8601(dateString: string){
    if(dateString){
        return moment(dateString, moment.ISO_8601).format()
    } else {
        return null;
    }
}




