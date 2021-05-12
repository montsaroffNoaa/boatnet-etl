import { AshopConnection, WcgopConnection, ReleaseOracle, ExecuteOracleSQL, InsertBulkCouchDB } from "../Common/common-functions";
import { Person, PersonTypeName, Vessel, Permit, VesselTypeName, Port } from '@boatnet/bn-models';
import moment = require("moment");
import { UploadedBy, UploadedDate } from "../Common/common-variables";
import { couchDB } from "../Common/db-connection-variables";
import { MigratePorts, MigrateVesselType } from "../Ashop/build-lookups";
import { MigrateLookupDocuments } from "../Wcgop/wcgop-etl";
import { BuildPort } from "../Wcgop/build-port";

export async function MigrateAllAshopObservers() {
    let connAshop = await AshopConnection();
    let observerSQL: string = `
        SELECT DISTINCT 
            OLS_OBSERVER.LAST_NAME, 
            OLS_OBSERVER.FIRST_NAME, 
            OLS_OBSERVER.MIDDLE_NAME, 
            OLS_OBSERVER.OBSERVER_SEQ,	
            OLS_OBSERVER.CREATE_DATE,
            OLS_OBSERVER.LAST_UPDATE_DATE,
            OLS_OBSERVER.LAST_UPDATED_BY

        FROM 
            NORPAC.ATL_HAUL JOIN
            NORPAC.ATL_FMA_TRIP ON ATL_HAUL.TRIP_SEQ = ATL_FMA_TRIP.TRIP_SEQ AND ATL_HAUL.PERMIT = ATL_FMA_TRIP.PERMIT AND ATL_HAUL.CRUISE = ATL_FMA_TRIP.CRUISE JOIN
            NORPAC.ATL_CRUISE_VESSEL ON ATL_FMA_TRIP.CRUISE_VESSEL_SEQ = ATL_CRUISE_VESSEL.CRUISE_VESSEL_SEQ AND ATL_FMA_TRIP.PERMIT = ATL_CRUISE_VESSEL.PERMIT AND ATL_FMA_TRIP.CRUISE = ATL_CRUISE_VESSEL.CRUISE JOIN
            NORPAC.ATL_OBSERVER_CRUISE ON ATL_CRUISE_VESSEL.CRUISE = ATL_OBSERVER_CRUISE.CRUISE JOIN
            NORPAC.OLS_OBSERVER_CRUISE ON ATL_OBSERVER_CRUISE.CRUISE = OLS_OBSERVER_CRUISE.CRUISE JOIN
            NORPAC.OLS_OBSERVER_CONTRACT ON OLS_OBSERVER_CRUISE.CONTRACT_NUMBER = OLS_OBSERVER_CONTRACT.CONTRACT_NUMBER JOIN
            NORPAC.OLS_OBSERVER ON OLS_OBSERVER_CONTRACT.OBSERVER_SEQ = OLS_OBSERVER.OBSERVER_SEQ
        
        WHERE
            ATL_HAUL.DEPLOY_LATITUDE_DEGREES < 49 AND
            ATL_HAUL.HAUL_PURPOSE_CODE = 'HAK'
        `;

    let newPersonDocs: Person[] = [];
    let observerRecords: any[] = await ExecuteOracleSQL(connAshop, observerSQL);

    for (let i = 0; i < observerRecords.length; i++) {
        let newPersonDoc: any = { // turn back to person after bn-models update
            type: PersonTypeName,
            createdBy: null,
            createdDate: observerRecords[i][4],
            updatedBy: observerRecords[i][6],
            updatedDate: observerRecords[i][5],

            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,

            firstName: observerRecords[i][1],
            lastName: observerRecords[i][0],
            middleName: observerRecords[i][2],

            isAshopObserver: true,

            legacy: {
                observerSeq: observerRecords[i][3]
            }
        }
        newPersonDocs.push(newPersonDoc)
    }

    await InsertBulkCouchDB(newPersonDocs);

    await ReleaseOracle(connAshop);



}

export async function MigrateAllWcgopObservers() {

    let connWcgop = await WcgopConnection();
    let observerSQL: string = `
    SELECT DISTINCT 
        USERS.LAST_NAME, 
        USERS.FIRST_NAME, 
        USERS.USER_ID,
        USERS.STATUS,
        USERS.CREATED_DATE,
        USERS.RECORD_LAST_EDITED_BY_USER,
        USERS.RECORD_LAST_EDITED_ON_DATE,
        USERS.RECORD_COMPUTER_LOAD_ON_DATE

    FROM 
        OBSPROD.USERS JOIN 
        OBSPROD.USER_PROGRAM_ROLES ON USERS.USER_ID = USER_PROGRAM_ROLES.USER_ID JOIN 
        OBSPROD.PROGRAM_ROLES ON PROGRAM_ROLES.PROGRAM_ROLE_ID = USER_PROGRAM_ROLES.PROGRAM_ROLE_ID
        
    WHERE 
        USERS.USER_ID IN (SELECT DISTINCT TRIPS.USER_ID FROM OBSPROD.TRIPS) AND 
        (PROGRAM_ROLES.ROLE_ID = 1 OR PROGRAM_ROLES.ROLE_ID = 10 OR USERS.USER_ID = 1784)
        
    ORDER BY USERS.LAST_NAME
    `;

    let newPersonDocs: Person[] = [];
    let observerRecords: any[] = await ExecuteOracleSQL(connWcgop, observerSQL);


    for (let i = 0; i < observerRecords.length; i++) {
        let isActive: boolean = null;
        if (observerRecords[i][3] == 1) {
            isActive = true;
        } else if (observerRecords[i][3] == 2) {
            isActive = false;
        }
        let newPersonDoc: Person = {
            type: PersonTypeName,
            createdBy: null,
            createdDate: observerRecords[i][4],
            updatedBy: observerRecords[i][5],
            updatedDate: observerRecords[i][6],

            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,

            firstName: observerRecords[i][1],
            lastName: observerRecords[i][0],
            isActive: isActive,

            isWcgopObserver: true,

            legacy: {
                obsprodLoadDate: observerRecords[i][7],
                userId: observerRecords[i][2]
            }
        }
        newPersonDocs.push(newPersonDoc)
    }

    await InsertBulkCouchDB(newPersonDocs);

    await ReleaseOracle(connWcgop);
}

export async function MapAshopAndWcgopObservers() {
    // todo change db references
    // todo rethink date logic

    let updatedDate = moment().toISOString(true);

    let wcgopObserversByName: { [id: string]: any; } = {};

    let masterDev = couchDB.use('master-dev-temp');
    // let nickTestNorpac = couchDB.use('nick-test-norpac');
    let ashopObservers: any[] = []; // turn back to person after bn models update
    let docsToUpdate: Person[] = [];
    await masterDev.view('obs-web', 'all_persons_by_ashop_id', {
        'keys': [11328, 11336, 11412],
        'include_docs': true
    }).then((data: any) => {
        for (let i = 0; i < data.rows.length; i++) {
            if (data.rows[i].doc.isWcgopOBserver) {
                let wcgopName: string = data.rows[i].doc.firstName.toLowerCase() + ',' + data.rows[i].doc.lastName.toLowerCase();
                wcgopObserversByName[wcgopName] = data.rows[i].doc
            } else if (data.rows[i].doc.isAshopObserver) {
                ashopObservers.push(data.rows[i].doc);
            }
        }
    }).catch((error: any) => {
        console.log(error);
    });

    for(let i = 0; i < ashopObservers.length; i++){
        let ashopName: string = ashopObservers[i].firstName.toLowerCase() + ',' + ashopObservers[i].lastName.toLowerCase();

        if(ashopName in wcgopObserversByName){
            let updatedDoc = wcgopObserversByName[ashopName];
            updatedDoc.middleName = ashopObservers[i].middleName;
            updatedDoc.legacy.observerSeq = ashopObservers[i].legacy.observerSeq;
            updatedDoc.updatedBy = 'nicholas.shaffer@noaa.gov';
            updatedDoc.updatedDate = updatedDate;
            docsToUpdate.push(updatedDoc);
        }
    }

    await InsertBulkCouchDB(docsToUpdate);
}

export async function MapAndMigrateAllAshopVessels() {
    
    await MigrateVesselType();

    let connAshop = await AshopConnection();

    let vesselSQL = `
    SELECT DISTINCT 
        ATL_LOV_VESSEL.NAME,
        ATL_LOV_VESSEL.VESSEL_SEQ,
        ATL_LOV_VESSEL.PERMIT,
        ATL_LOV_VESSEL.ADFG_NUMBER,
        ATL_LOV_VESSEL.COAST_GUARD_NUMBER,
        ATL_LOV_VESSEL.LENGTH,
        ATL_LOV_VESSEL.VESSEL_CODE,
        ATL_LOV_VESSEL.FFP_STATUS,
        ATL_LOV_VESSEL.RMD_CHANGED_BY,
        ATL_LOV_VESSEL.RMD_TS_CHANGED

    FROM 
        NORPAC.ATL_HAUL JOIN
        NORPAC.ATL_FMA_TRIP ON ATL_HAUL.TRIP_SEQ = ATL_FMA_TRIP.TRIP_SEQ AND ATL_HAUL.PERMIT = ATL_FMA_TRIP.PERMIT AND ATL_HAUL.CRUISE = ATL_FMA_TRIP.CRUISE JOIN
        NORPAC.ATL_CRUISE_VESSEL ON ATL_FMA_TRIP.CRUISE_VESSEL_SEQ = ATL_CRUISE_VESSEL.CRUISE_VESSEL_SEQ AND ATL_FMA_TRIP.PERMIT = ATL_CRUISE_VESSEL.PERMIT AND ATL_FMA_TRIP.CRUISE = ATL_CRUISE_VESSEL.CRUISE JOIN
        NORPAC.ATL_LOV_VESSEL ON ATL_CRUISE_VESSEL.VESSEL_SEQ = ATL_LOV_VESSEL.VESSEL_SEQ

    WHERE
        ATL_HAUL.DEPLOY_LATITUDE_DEGREES < 49 AND
        ATL_HAUL.HAUL_PURPOSE_CODE = 'HAK'`;

    let vesselRecords: any[] = await ExecuteOracleSQL(connAshop, vesselSQL)
    let allVesselDocs: Vessel[] = [];

    for (let i = 0; i < vesselRecords.length; i++) {

        // let newVesselDoc: Vessel = await GetDocFromDict(dictVesselByName, vesselRecords[i][0], 'vessels-by-name', 'MainDocs');

        let newVesselDoc: Vessel = null;

        let docPermit = {
            permitNumber: vesselRecords[i][2]
        }

        if (newVesselDoc != null) {
            newVesselDoc.isAshop = true;
            newVesselDoc.vesselSeq = vesselRecords[i][1];
            newVesselDoc.adfgNumber = vesselRecords[i][3];
            newVesselDoc.length = vesselRecords[i][5];
            // todo, check coast guard number and status against each other
            newVesselDoc.vesselCode = vesselRecords[i][6];
        } else {
            newVesselDoc = {
                type: VesselTypeName,
                createdBy: null,
                createdDate: null,
                updatedBy: vesselRecords[i][8],
                updatedDate: moment(vesselRecords[i][9], 'YYYY-MM-DD HH:mm:ss').toISOString(true),
                uploadedBy: UploadedBy,
                uploadedDate: UploadedDate,

                vesselName: vesselRecords[i][0],
                vesselStatus: vesselRecords[i][7],
                // permits: docPermit,
                coastGuardNumber: vesselRecords[i][4],
                isAshop: true,
                vesselSeq: vesselRecords[i][1],
                adfgNumber: vesselRecords[i][3],
                length: vesselRecords[i][5],
                vesselCode: vesselRecords[i][6]
            }
        }

        // dictVesselByName[newVesselDoc.vesselName.toUpperCase()] = newVesselDoc;
        allVesselDocs.push(newVesselDoc);
    }
    await InsertBulkCouchDB(allVesselDocs);

}

export async function MapAndMigrateAllAshopPorts() {
    // todo change db references
    
    await MigratePorts();

    let masterDev = couchDB.use('master-dev-temp');
    // let nickTestNorpac = couchDB.use('nick-test-norpac');
    let portsToUpdate: any[] = []; // turn back to ports after update to bn-models

    await masterDev.view('wcgop', 'all-ports', {
        'keys': [11328, 11336, 11412],
        'include_docs': true
    }).then((data: any) => {
        for (let i = 0; i < data.rows.length; i++) {
            switch (data.rows[i].doc.legacy.portId) {

                case 11348:
                    data.rows[i].doc.portCode = 15;
                    data.rows[i].doc.isAshop = true;
                    break;
                case 11336:
                    data.rows[i].doc.portCode = 20;
                    data.rows[i].doc.isAshop = true;
                    break;
                // case 11412:
                //     data.rows[i].doc.portCode = 107;
                //     data.rows[i].doc.isAshop = true;
                //     break;
            }
            portsToUpdate.push(data.rows[i].doc);
        }
    }).catch((error: any) => {
        console.log(error);
    });

    // await masterDev.view('ETL-LookupDocs', 'ashop-port-lookup', {
    //     'keys': [15, 20, 107],
    //     'include_docs': true
    // }).then((data: any) => {
    //     for (let i = 0; i < data.rows.length; i++) {
    //         portsToUpdate.push(data.rows[i].doc);

    //         switch (portsToUpdate[i].legacy.portId) {
    //             case 11328:
    //                 portsToUpdate[i].legacy.ashopPortCode = 15;
    //                 break;
    //             case 11336:
    //                 portsToUpdate[i].legacy.ashopPortCode = 20;
    //                 break;
    //             case 11412:
    //                 portsToUpdate[i].legacy.ashopPortCode = 107;
    //                 break;
    //         }
    //     }
    // }).catch((error: any) => {
    //     console.log(error);
    // });

    await InsertBulkCouchDB(portsToUpdate)

}

async function ObserversVesselsAndPorts() {

    await MigrateAllAshopObservers();
    // await MigrateAllWcgopObservers(); // This function is ran during the wcgop data pull 
    await MapAshopAndWcgopObservers();

    // wcgop vessels and ports should already be migrated by the time this is executed
    await MapAndMigrateAllAshopVessels();
    await MapAndMigrateAllAshopPorts();

}




async function getPorts(){
    let strDateCompare: string = '1000-01-01 00:00:00';
    let DateCompare: Date = new Date(strDateCompare);
    // console.log(moment().toISOString(true))
    let strDateLimit: string = moment().toISOString(true);
    strDateLimit = moment(strDateLimit, moment.ISO_8601).format('YYYY-MM-DD HH:mm:ss');
    
    await MigrateLookupDocuments('legacy.portId', 'port', BuildPort, DateCompare, strDateCompare, strDateLimit, 'PORTS', 'PORT_ID', 'all-ports');
    // await MapAndMigrateAllAshopPorts();
}


// getPorts();



// MapAndMigrateAllAshopPorts();

// ObserversVesselsAndPorts();

