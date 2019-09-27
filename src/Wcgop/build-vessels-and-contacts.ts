import { dbName } from "../Common/db-connection-variables";
import { WcgopConnection, ExecuteOracleSQL, RemoveDocNullVals, InsertBulkCouchDB, GetDocFromDict, ReleaseOracle } from "../Common/common-functions";
import { VesselCaptain, Vessel, Person, VesselTypeName, PersonTypeName, Port } from "../../../boatnet/libs/bn-models";
import { dictContacts, dictVesselStatus, dictContactType, dictContactCategory, dictRelation } from "./wcgop-etl";
import { strContactSQL, strVesselSQL } from "./oracle-sql";
import { dictPorts } from "../Ashop/ashop-etl";
import moment = require("moment");
import { BoatnetUser } from "../../../boatnet/libs/bn-auth";

// todo: edit this function for update logic, and split vessels and contacts
export async function vReplaceVesselsAndContacts() {
    let lstDocsToDelete: any[] = []

    await dbName.view('MainDocs', 'all-vessels', {
        'include_docs': true
    }).then((data: any) => {
        if (data.rows.length > 0) {
            for (let i = 0; i < data.rows.length; i++) {
                let newDoc: object = {
                    _id: data.rows[i].doc._id,
                    _rev: data.rows[i].doc._rev,
                    type: 'vessel',
                    _deleted: true
                }
                // let newDoc = data.rows[i].doc;
                // newDoc._deleted = true;
                lstDocsToDelete.push(newDoc);
            }
        }
    }).catch((error: any) => {
        console.log(error);
    });

    await dbName.view('MainDocs', 'all-contacts', {
        'include_docs': true
    }).then((data: any) => {
        if (data.rows.length > 0) {
            for (let i = 0; i < data.rows.length; i++) {
                // let newDoc = {
                //   _id: data.rows[i].doc._id,
                //   _rev: data.rows[i].doc._rev,
                //   _deleted: true
                // }
                let newDoc = data.rows[i].doc;
                newDoc._deleted = true;
                lstDocsToDelete.push(newDoc);
            }
        }
    }).catch((error: any) => {
        console.log(error);
    });

    await dbName.bulk({ docs: lstDocsToDelete }).then((body: any) => {
        console.log(body);
    });


    let connWcgop = await WcgopConnection();

    // let strGetVesselIDs = `
    //   SELECT DISTINCT VESSEL_ID
    //   FROM OBSPROD.SELECTION_HISTORY JOIN OBSPROD.SELECTION_PERIODS ON SELECTION_HISTORY.SELECTION_PERIOD_ID = SELECTION_PERIODS.SELECTION_PERIOD_ID
    //   WHERE 
    //     SELECTION_PERIODS.START_DATE >= '01-JAN-19' AND
    //     SELECTION_HISTORY.VESSEL_ID IS NOT NULL
    //   `;

    let strGetVesselIDs = `
      SELECT DISTINCT VESSEL_ID
      FROM OBSPROD.VESSELS
      `;

    let strGetContactIDs = `
    SELECT CONTACT_ID
    FROM OBSPROD.VESSEL_CONTACTS
    WHERE 
      VESSEL_CONTACTS.CONTACT_STATUS = 'A' AND 
      VESSEL_CONTACTS.CONTACT_TYPE IN (1,3)
    `;

    let strGetActiveVessels = `
    SELECT DISTINCT VESSEL_ID
    FROM OBSPROD.VESSEL_CONTACTS
    WHERE 
      VESSEL_CONTACTS.CONTACT_STATUS = 'A'
    `;

    let strGetVesselContactsByContactID = `
    SELECT VESSEL_ID, CONTACT_STATUS
    FROM OBSPROD.VESSEL_CONTACTS 
    WHERE 
      CONTACT_ID = `;

    let strGetVesselContactsByVesselID = `
  SELECT VESSEL_ID, CONTACT_STATUS, CONTACT_ID 
  FROM OBSPROD.VESSEL_CONTACTS 
  WHERE 
    CONTACT_ID in (
      SELECT CONTACT_ID
      FROM OBSPROD.VESSEL_CONTACTS
      WHERE 
        VESSEL_CONTACTS.CONTACT_STATUS = 'A' AND 
        VESSEL_CONTACTS.CONTACT_TYPE IN (1,3)
    ) AND
    VESSEL_ID = `;

    let lstVesselIDs = await ExecuteOracleSQL(connWcgop, strGetVesselIDs);
    let lstContactIDs = await ExecuteOracleSQL(connWcgop, strGetContactIDs);
    let lstActiveVessels = await ExecuteOracleSQL(connWcgop, strGetActiveVessels);
    let lstNewContacts: VesselCaptain[] = [];

    for (let i = 0; i < lstContactIDs.length; i++) {
        let newContact: any = await BuildContact(connWcgop, lstContactIDs[i]);
        newContact.isLegacy = true;
        RemoveDocNullVals(newContact);
        lstNewContacts.push(newContact);
    };

    await InsertBulkCouchDB(lstNewContacts);
    let lstNewVessels: Vessel[] = []

    for (let i = 0; i < lstVesselIDs.length; i++) {
        let newVessel: any = await BuildVessel(connWcgop, lstVesselIDs[i]);
        if (newVessel.vesselStatus) {
            if (newVessel.vesselStatus.description == 'Active') {
                newVessel.isActive = true;
            }
        }
        // if(lstActiveVessels.indexOf(lstVesselIDs[i]) > -1){
        //   newVessel.isActive = true;
        // }
        let lstVesselContactData = await ExecuteOracleSQL(connWcgop, strGetVesselContactsByVesselID + lstVesselIDs[i]);
        let lstCaptains: Person[] = [];

        for (let i = 0; i < lstVesselContactData.length; i++) {
            if (lstVesselContactData[i][1] == 'A') {
                let objNewCaptain: Person = await GetDocFromDict(dictContacts, lstVesselContactData[i][2], 'all-contacts', 'MainDocs')
                RemoveDocNullVals(objNewCaptain);
                lstCaptains.push(objNewCaptain);
            }
        }
        if (lstCaptains.length > 0) {
            newVessel.captains = lstCaptains;
        }

        RemoveDocNullVals(newVessel);
        newVessel._deleted = false;
        lstNewVessels.push(newVessel);
    };

    console.log('test')
    await InsertBulkCouchDB(lstNewVessels);

    // let lstContactsToUpdate: any[] = [];
    // await dbName.view('MainDocs', 'all-contacts', {
    //   'include_docs': true
    // }).then((data: any) => {
    //   if (data.rows.length > 0){   
    //     for(let i = 0; i < data.rows.length; i++){
    //       lstContactsToUpdate.push(data.rows[i].doc);
    //     }   
    //   }
    // }).catch((error: any) => {
    //   console.log(error);
    // });

    // for(let i = 0; i < lstContactsToUpdate.length; i++){
    //   let lstVesselContactData = await ExecuteOracleSQL(connWcgop, strGetVesselContactsByContactID + lstContactsToUpdate[i].legacy.PersonId.toString());

    //   for(let i = 0; i < lstVesselContactData.length; i++){
    //     if(lstVesselContactData[i][1] == 'A'){
    //       let objActiveVessel: Vessel = await GetDocFromDict(dictVessels, lstVesselContactData[i][0], 'all-vessels', 'MainDocs')
    //       lstContactsToUpdate[i].activeVessel = objActiveVessel;
    //       lstContactsToUpdate[i].isCaptainActive = true;
    //       break;
    //     }
    //   }
    // }

    // await InsertBulkCouchDB(lstContactsToUpdate);
    await ReleaseOracle(connWcgop);

}

async function BuildContact(odb: any, iContactID: number) {
    if (iContactID != undefined) {
        let lstContactData = await ExecuteOracleSQL(odb, strContactSQL + iContactID);
        lstContactData = lstContactData[0];

        let iContactUserID = lstContactData[1];
        let iPortID = lstContactData[17];
        let iUserCreatedByID = lstContactData[22];
        let iUserModifiedByID = lstContactData[24];

        let ContactUser = iContactUserID // await GetDocFromDict(dictUsers, iContactUserID, 'legacy.userId');    
        let Port = await GetDocFromDict(dictPorts, iPortID, 'all-ports', 'MainDocs');
        if (Port != null) {
            Port.legacy = undefined;
        }
        let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId'); 
        let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');

        let cContact: Person = await ConstructPerson(lstContactData, ContactUser, Port, CreatedBy, ModifiedBy);
        return cContact;

    } else {
        return null;
    }
}

async function BuildVessel(odb: any, iVesselID: number) {
    if (iVesselID != undefined) {
        let lstVesselData = await ExecuteOracleSQL(odb, strVesselSQL + iVesselID);
        lstVesselData = lstVesselData[0];
        let iPortID = lstVesselData[1];
        let iUserCreatedByID = lstVesselData[11];
        let iUserModifiedByID = lstVesselData[13];

        let Port: Port = await GetDocFromDict(dictPorts, iPortID, 'all-ports', 'MainDocs');
        if (Port != null) {
            Port.legacy = undefined;
        }
        let CreatedBy = iUserCreatedByID // await GetDocFromDict(dictUsers, iUserCreatedByID, 'legacy.userId');
        let ModifiedBy = iUserModifiedByID // await GetDocFromDict(dictUsers, iUserModifiedByID, 'legacy.userId');

        let cVessel: Vessel = await ConstructVessel(lstVesselData, CreatedBy, ModifiedBy, Port);
        return cVessel;
    } else {
        return null;
    }
}

async function ConstructVessel(VesselData: any, CreatedBy: Person, ModifiedBy: Person, Port: Port) {

    let ModifiedDate = VesselData[15];
    let ComputerEditedDate = VesselData[14]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = VesselData[16];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = VesselData[13];
    }

    let VesselType = await GetDocFromDict(dictVesselStatus, VesselData[3], 'vessel-type-lookup', 'LookupDocs');
    if (VesselType != null) {
        VesselType = {
            description: VesselType.description,
            _id: VesselType._id
        }
    }

    let VesselStatus = await GetDocFromDict(dictVesselStatus, VesselData[9], 'vessel-status-lookup', 'LookupDocs');
    if (VesselStatus != null) {
        VesselStatus = {
            description: VesselStatus.description,
            _id: VesselStatus._id
        }
    } else if (VesselData[9] == 'NA') {
        // do nothing
    } else {
        console.log('missing status')
    }

    let NewVessel: Vessel = {
        type: VesselTypeName,
        homePort: Port,
        vesselName: VesselData[2],
        vesselType: VesselType,
        coastGuardNumber: VesselData[4],
        stateRegulationNumber: VesselData[5],
        registeredLength: {
            measurementType: 'length',
            value: VesselData[6],
            units: VesselData[7]
        },
        vesselStatus: VesselStatus,
        notes: VesselData[10],
        createdBy: VesselData[11],
        createdDate: moment(VesselData[12], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        isActive: false,

        legacy: {
            vesselId: VesselData[0],
            safetyDecalExpiration: VesselData[8],
            obsprodLoadDate: moment(VesselData[17], moment.ISO_8601).format()
        }
    }
    return NewVessel;
}

async function ConstructPerson(ContactData: any, ContactUser: Person, Port: Port, CreatedBy: BoatnetUser, ModifiedBy: BoatnetUser) {
    let ModifiedDate = ContactData[29];
    let ComputerEditedDate = ContactData[25]
    let UpdatedDate = null;
    let UpdatedBy = null;

    if (ComputerEditedDate != null) {
        UpdatedDate = moment(ComputerEditedDate, moment.ISO_8601).format();
        UpdatedBy = ContactData[30];
    } else if (ModifiedDate != null) {
        UpdatedDate = moment(ModifiedDate, moment.ISO_8601).format();
        UpdatedBy = ContactData[24];
    }

    let ContactType = await GetDocFromDict(dictContactType, ContactData[18], 'contact-type-lookup', 'LookupDocs');
    let ContactCategory = await GetDocFromDict(dictContactCategory, ContactData[19], 'contact-category-lookup', 'LookupDocs');
    let RelationToObserver = await GetDocFromDict(dictRelation, ContactData[20], 'relationship-lookup', 'LookupDocs');

    let NewPerson: Person = {
        type: PersonTypeName,
        firstName: ContactData[2],
        lastName: ContactData[3],
        addressLine1: ContactData[4],
        addressLine2: ContactData[5],
        city: ContactData[6],
        state: ContactData[7],
        zipCode: ContactData[8],
        country: ContactData[9],
        homePhone: ContactData[10],
        workPhone: ContactData[11],
        cellPhone: ContactData[12],
        workEmail: ContactData[13],
        homeEmail: ContactData[14],
        epirbNum: [ContactData[15], ContactData[16], ContactData[28]],
        port: Port,
        //contactType: ContactType, // LOOKUP
        //contactCategory: ContactCategory, // LOOKUP
        //relationToObserver: RelationToObserver, // LOOKUP
        notes: ContactData[21],
        createdBy: ContactData[22],
        createdDate: moment(ContactData[23], moment.ISO_8601).format(),
        updatedBy: UpdatedBy,
        updatedDate: UpdatedDate,
        birthdate: ContactData[26],
        // license: ContactData[27], todo 


        // etl'd to array
        //epirbIdNum: ContactData[15],
        //epirbSerialNum: ContactData[16],
        //epirbIdNum_2: ContactData[28],

        legacy: {
            PersonId: ContactData[0],
            userId: ContactData[1]
        }
    }
    return NewPerson;

}