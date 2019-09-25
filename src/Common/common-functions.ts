import oracledb = require("oracledb");

import { NorpacUser, NorpacPass, IFQUser, IFQPass, DWUser, DWHost, DWInitialDB, DWPass, DWPort } from "../../../dbconnections";

import { strNorpacConnection, strIFQConnection, dbName } from "./db-connection-variables";

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

    await dbName.uuids(1).then((data: any) => {
        //console.log(data);
        CouchID = data.uuids[0]
    });

    return CouchID;
}

export async function GenerateCouchIDs(iNumToGenerate: number) {

    let CouchIDs: string[];

    await dbName.uuids(iNumToGenerate).then((data: any) => {
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
    await dbName.view(strDesignName, strViewName, {
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

export async function InsertBulkCouchDB(lstDocuments: any) {
    let lstDocumentIDs: string[];
    lstDocumentIDs = [];

    await dbName.bulk({ docs: lstDocuments }).then((lstReturn: any) => {
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

export function Transpose(aInput: any) {
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





