
import * as dbconnections from './../../dbconnections'
import { Taxonomy } from '../libs/bn-models';
import { TaxonomyAlias, Port, Vessel } from '../libs/bn-models/dist';

export var UploadedBy = 'nicholas.shaffer@noaa.gov';
export var UploadedDate: any;


var oracledb = require('oracledb');
var moment = require('moment');
const { Pool, Client } = require('pg')
import * as WebRequest from 'web-request';
import { PacfinSpeciesETL, getPacfinSpeciesTable } from './query-pacfin-species';
import { TaxonomyAliasETL } from '../TaxonomyAliases';
import { CatchGroupingsETL } from '../CatchGroupings';

// Couch Connection
var CouchDBName: string = dbconnections['CouchDBName']
var CouchHost: string = dbconnections['CouchHost']
var CouchPass: string = dbconnections['CouchPass']
var CouchPort: string = dbconnections['CouchPort']
var CouchUser: string = dbconnections['CouchUser']

// Data Warehouse Connection
var DWHost: string = dbconnections['DWHost']
var DWPort: string = dbconnections['DWPort']
var DWUser: string = dbconnections['DWUser']
var DWPass: string = dbconnections['DWPass']
var DWInitialDB: string = dbconnections['DWInitialDB']


// ASHOP Connection
var NorpacServiceName: string = dbconnections['NorpacServiceName']
var NorpacHost: string = dbconnections['NorpacHost']
var NorpacPass: string = dbconnections['NorpacPass']
var NorpacPort: string = dbconnections['NorpacPort']
var NorpacUser: string = dbconnections['NorpacUser']
var strNorpacConnection: string = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=" + NorpacHost + ")(PORT=" + NorpacPort + "))(CONNECT_DATA =(SERVICE_NAME=" + NorpacServiceName + ")))"

// WCGOP Connection
var IFQServiceName: string = dbconnections['IFQServiceName']
var IFQHost: string = dbconnections['IFQHost']
var IFQPass: string = dbconnections['IFQPass']
var IFQPort: string = dbconnections['IFQPort']
var IFQUser: string = dbconnections['IFQUser']
var strIFQConnection: string = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=" + IFQHost + ")(PORT=" + IFQPort + "))(CONNECT_DATA =(SERVICE_NAME=" + IFQServiceName + ")))"

// Create connection to Couch to last entire runtime of application
var couchurl: string = "https://" + CouchUser + ":" + CouchPass + "@" + CouchHost + ":" + CouchPort
const couchDB = require('nano')({
  url: couchurl,
  requestDefaults: {
    pool: {
      maxSockets: Infinity
    }
  }
});

var dbName = couchDB.use(CouchDBName);

// Setting this process var to "0" is extremely unsafe in most situations, use with care.
// It is unsafe because Node does not like self signed TLS (SSL) certificates, 
// this setting disables Node's rejection of invalid or unauthorized certificates, and allows them.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
console.log('CouchDB connection configured successfully.');



var dictTaxLevels: { [id: string]: any; } = {};
var dictTaxonomyByItisID: { [id: number]: any; } = {};
var dictDwTaxLevelNames: { [id: string]: any; } = {};


dictTaxLevels['Kingdom'] = 0
dictTaxLevels['Subkingdom'] = 1
dictTaxLevels['Infrakingdom'] = 2
dictTaxLevels['Superphylum'] = 3
dictTaxLevels['Phylum'] = 4
dictTaxLevels['Subphylum'] = 5
dictTaxLevels['Infraphylum'] = 6
dictTaxLevels['Superclass'] = 7
dictTaxLevels['Class'] = 8
dictTaxLevels['Subclass'] = 9
dictTaxLevels['Infraclass'] = 10
dictTaxLevels['Superorder'] = 11
dictTaxLevels['Order'] = 12
dictTaxLevels['Suborder'] = 13
dictTaxLevels['Infraorder'] = 14
dictTaxLevels['Section'] = 15
dictTaxLevels['Superfamily'] = 16
dictTaxLevels['Family'] = 17
dictTaxLevels['Subfamily'] = 18
dictTaxLevels['Tribe'] = 19
dictTaxLevels['Genus'] = 20
dictTaxLevels['Subgenus'] = 21
dictTaxLevels['Species'] = 22
dictTaxLevels['Subspecies'] = 23
dictTaxLevels['Variety'] = 24


dictDwTaxLevelNames['superclass'] = 'superclass_28'
dictDwTaxLevelNames['order'] = 'order_40'
dictDwTaxLevelNames['family'] = 'family_50'
dictDwTaxLevelNames['kingdom'] = 'kingdom_10'
dictDwTaxLevelNames['subphylum'] = 'subphylum_22'
dictDwTaxLevelNames['infraclass'] = 'infraclass_34'
dictDwTaxLevelNames['subspecies'] = 'subspecies_82'
dictDwTaxLevelNames['subfamily'] = 'subfamily_52'
dictDwTaxLevelNames['phylum'] = 'phylum_20'
dictDwTaxLevelNames['genus'] = 'genus_70'
dictDwTaxLevelNames['infraorder'] = 'infraorder_44'
dictDwTaxLevelNames['class'] = 'class_30'
dictDwTaxLevelNames['species'] = 'species_80'
dictDwTaxLevelNames['superfamily'] = 'superfamily_48'
dictDwTaxLevelNames['suborder'] = 'suborder_42'
dictDwTaxLevelNames['tribe'] = 'tribe_60'
dictDwTaxLevelNames['superorder'] = 'superorder_38'
dictDwTaxLevelNames['subclass'] = 'subclass_32'


export async function WarehouseConnection() {
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
export async function ReleasePostgres(client: any) {
  client.end()
}
async function AshopConnection() {
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
export async function ReleaseOracle(connection: any) {
  await connection.close(
    function (err: Error) {
      if (err)
        console.error(err.message);
      else
        console.log('Oracle released successfully.')
    });
}
async function ExecuteOracleSQL(dbconnection: any, strSQL: string) {
  let aData = await dbconnection.execute(strSQL).catch((error: any) => {
    console.log("oracle query failed", error, strSQL);
  });
  if (aData) {
    return aData.rows;
  } else {
    return null;
  }
}
async function UpdateDocCouchDB(UpdatedDoc: any) {
  const dbName = couchDB.use(CouchDBName);
  await dbName.insert(UpdatedDoc).then((data: any) => {
    //console.log(data)
  }).catch((error: any) => {
    console.log("update failed", error, UpdatedDoc);

  });

}
export async function InsertBulkCouchDB(lstDocuments: any) {
  let lstDocumentIDs: string[];
  lstDocumentIDs = [];
  const dbName = couchDB.use(CouchDBName);

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
async function FetchAllDocs(Key: number | string, ViewName: string, DesignName: string) {
  let strDocID;
  let strDocRev;
  let Document;
  let AllDocs: any[] = [];
  const dbName = couchDB.use(CouchDBName);

  await dbName.view(DesignName, ViewName, {
    'key': Key,
    'include_docs': true
  }).then((data: any) => {
    if (data.rows.length > 0) {
      for (let i = 0; i < data.rows.length; i++) {

        AllDocs.push(data.rows[i].doc)
        // strDocID = data.rows[0].id;
        // strDocRev = data.rows[0].value;
        // Document = data.rows[0].doc
      }
    }
  }).catch((error: any) => {
    console.log(error, DesignName, ViewName);
  });


  return AllDocs;
}

async function CreateViews() {


  const dbName = couchDB.use(CouchDBName);
  let LookupDocs: any = {
    "_id": "_design/Taxonomy",
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
      }

      

    },
    "language": "javascript"
  }

  await dbName.get('_design/LookupDocs').then((body: any) => {
    LookupDocs._rev = body._rev;
  }).catch((error: any) => {
    // Ignore if document does not exist
  });


  await dbName.insert(LookupDocs).then((data: any) => {
    console.log(data)
  }).catch((error: any) => {
    console.log("update failed", error, LookupDocs);
  });

}

export async function GenerateCouchID() {

  const dbName = couchDB.use(CouchDBName);
  let CouchID: string;

  await couchDB.uuids(1).then((data: any) => {
    //console.log(data);
    CouchID = data.uuids[0]
  });

  return CouchID;
}

async function GenerateCouchIDs(iNumToGenerate: number) {

  const dbName = couchDB.use(CouchDBName);
  let CouchIDs: string[];

  await couchDB.uuids(iNumToGenerate).then((data: any) => {
    //console.log(data);
    CouchIDs = data.uuids
  });

  return CouchIDs;
}

function RemoveDocNullVals(Document: any) {

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

async function BuildTaxonomy(objTaxRecord: any) {

  let strCouchID = await GenerateCouchID();
  let docNewTax: Taxonomy = {
    _id: strCouchID,
    type: 'taxonomy',
    taxonomyId: strCouchID,
    level: objTaxRecord.scientific_name_taxonomic_level,
    taxonomyName: objTaxRecord.species_80,
    scientificName: objTaxRecord.species_80,
    parent: 'n/a',
    // wcgopTallyShortCode: null,
    // pacfinNomCode: objTaxRecord.pacfin_nom_spid,
    itisTSN: objTaxRecord.itis_taxonomic_serial_no,
    wormsAphiaId: objTaxRecord.worms_aphiaid,
    isInactive: null,

    legacy: {
      wcgopSpeciesId: objTaxRecord.observer_species_id,
      ashopSpeciesId: objTaxRecord.norpac_species_id,
      dwId: [objTaxRecord.taxonomy_whid]
    }

  }

  strCouchID = await GenerateCouchID();
  let docNewAlias: TaxonomyAlias = {
    _id: strCouchID,
    type: 'taxonomy-alias',
    taxonomy: docNewTax,
    alias: objTaxRecord.common_name,
    aliasType: 'Common Name'
  }


  return [docNewTax, docNewAlias];

}
export function ReplaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(find, 'g'), replace);
}

async function CleanItisString(strItisData: string) {
  // make data more readable while coding by removing unnecessary prefixes from properties in the raw data
  let strCleanedString: string = ReplaceAll(strItisData, "ns:", "")
  strCleanedString = ReplaceAll(strCleanedString, "ax21:", "")
  strCleanedString = ReplaceAll(strCleanedString, "xsi:", "")
  return strCleanedString;
}

async function GetItisTsnBySciNameAndKingdom(strScientificName: string, strKingdom: string) {
  let convert = require('xml-js')

  // I have already confirmed that this API is not case sensitive.
  let strUrl: string = 'https://www.itis.gov/ITISWebService/services/ITISService/searchByScientificName?srchKey=' + strScientificName;
  let xmlstrSpeciesData = await WebRequest.json<any>(strUrl);
  let jsonstrSpeciesData = convert.xml2json(xmlstrSpeciesData, { compact: true });
  jsonstrSpeciesData = await CleanItisString(jsonstrSpeciesData);
  let jsonSpeciesData = JSON.parse(jsonstrSpeciesData);
  let lstItisTSNs: string[] = [];

  // loop through each item returned, return all TSN's that match the scientific name exactly and match the kingdom to reduce number of hierarchies to query later
  if (jsonSpeciesData.searchByScientificNameResponse.return.scientificNames.length) {
    for (let i = 0; i < jsonSpeciesData.searchByScientificNameResponse.return.scientificNames.length; i++) {
      if (strKingdom == jsonSpeciesData.searchByScientificNameResponse.return.scientificNames[i].kingdom._text) {
        if (jsonSpeciesData.searchByScientificNameResponse.return.scientificNames[i].combinedName._text.toLowerCase() == strScientificName.toLowerCase()) {
          lstItisTSNs.push(jsonSpeciesData.searchByScientificNameResponse.return.scientificNames[i].tsn._text)
        }
      }
    }
  } else if (jsonSpeciesData.searchByScientificNameResponse.return.scientificNames._attributes.nil == 'true') {
    // do nothing, return the empty string
  } else {
    // only one item returned, return that one item in length 1 list
    lstItisTSNs.push(jsonSpeciesData.searchByScientificNameResponse.return.scientificNames.tsn._text)
  }

  return lstItisTSNs
}

export async function GetItisTsnsByScientificName(strScientificName: string) {
  let convert = require('xml-js')

  // I have already confirmed that this API is not case sensitive.
  let strUrl: string = 'https://www.itis.gov/ITISWebService/services/ITISService/searchByScientificName?srchKey=' + strScientificName;
  let xmlstrSpeciesData = await WebRequest.json<any>(strUrl);
  let jsonstrSpeciesData = convert.xml2json(xmlstrSpeciesData, { compact: true });
  jsonstrSpeciesData = await CleanItisString(jsonstrSpeciesData);
  let jsonSpeciesData = JSON.parse(jsonstrSpeciesData);
  let lstItisTSNs: string[] = [];

  // loop through each item returned, return all TSN's that match the scientific name exactly to reduce number of hierarchies
  if (jsonSpeciesData.searchByScientificNameResponse.return.scientificNames.length) {
    for (let i = 0; i < jsonSpeciesData.searchByScientificNameResponse.return.scientificNames.length; i++) {
      if (jsonSpeciesData.searchByScientificNameResponse.return.scientificNames[i].combinedName._text.toLowerCase() == strScientificName.toLowerCase()) {
        lstItisTSNs.push(jsonSpeciesData.searchByScientificNameResponse.return.scientificNames[i].tsn._text)
      }
    }
  } else if (jsonSpeciesData.searchByScientificNameResponse.return.scientificNames._attributes.nil == 'true') {
    // do nothing, return the empty array
  } else {
    // only one item returned, return that one item in length 1 list
    lstItisTSNs.push(jsonSpeciesData.searchByScientificNameResponse.return.scientificNames.tsn._text)
  }

  return lstItisTSNs
}

async function GetFullHierarchyByMultTsns(lstTSNs: string[], strDwTaxLevel: string, strScientificName: string, objDWdata: any) {
  // This function takes many TSNs, and attempts to query itis with each one and (hopefully) return only a single, valid hierarchy, but potentially multiple 
  let convert = require('xml-js')
  strDwTaxLevel = strDwTaxLevel.toLowerCase();
  strScientificName = strScientificName.toLowerCase();
  let lstAllHierarchies: any[] = [];
  for (let i = 0; i < lstTSNs.length; i++) {
    try {
      // Get full record as json
      let strUrl = 'http://www.itis.gov/ITISWebService/services/ITISService/getFullHierarchyFromTSN?tsn=' + lstTSNs[i];
      let xmlstrSpeciesData = await WebRequest.json<any>(strUrl);
      let jsonstrSpeciesData = convert.xml2json(xmlstrSpeciesData, { compact: true });
      jsonstrSpeciesData = await CleanItisString(jsonstrSpeciesData);
      let jsonSpeciesData = JSON.parse(jsonstrSpeciesData);
      let lstHierarchyList: any = jsonSpeciesData.getFullHierarchyFromTSNResponse.return.hierarchyList;

      // _attributes only exists if no real data is returned
      if (lstHierarchyList._attributes) {
        // return string to flag a check on return 
        // lstAllHierarchies.push('invalid name');
      } else {

        // Iterate backwards, removing unnecessary direct child records of given Tsn returned by API
        for (let j = lstHierarchyList.length - 1; j >= 0; j--) {
          if (lstHierarchyList[j].parentTsn._text == lstTSNs[i]) {
            lstHierarchyList.splice(j, 1);
          }
        }

        let objLowestGrain = lstHierarchyList[lstHierarchyList.length - 1];
        if (lstHierarchyList.length == 1 && objLowestGrain.rankName._text.toLowerCase() != 'kingdom') {
          // invalid name, return empty list
        }
        else if (lstTSNs.length == 1) {
          // this is not an invalid name and only one hierarchy was searched for, return it
          lstAllHierarchies.push(lstHierarchyList);
        }
        // there are multiple hierarchies, parse through to find the right one
        else if (objLowestGrain.rankName._text.toLowerCase() == strDwTaxLevel && objLowestGrain.taxonName._text.toLowerCase() == strScientificName) {
          // Valid unless length == 1 and isnt a kingdom
          if (lstHierarchyList.length > 1 || objLowestGrain.rankName._text.toLowerCase() == 'kingdom') {
            lstAllHierarchies.push(lstHierarchyList);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  return lstAllHierarchies
}
export async function GetFullHierarchyByTsn(strTsn: string) {
  // This function takes many TSNs, and attempts to query itis with each one and (hopefully) return only a single, valid hierarchy, but potentially multiple 
  let convert = require('xml-js')
  try {
    // Get full record as json
    let strUrl = 'http://www.itis.gov/ITISWebService/services/ITISService/getFullHierarchyFromTSN?tsn=' + strTsn;
    let xmlstrSpeciesData = await WebRequest.json<any>(strUrl);
    let jsonstrSpeciesData = convert.xml2json(xmlstrSpeciesData, { compact: true });
    jsonstrSpeciesData = await CleanItisString(jsonstrSpeciesData);
    let jsonSpeciesData = JSON.parse(jsonstrSpeciesData);
    let lstHierarchyList: any = jsonSpeciesData.getFullHierarchyFromTSNResponse.return.hierarchyList;

    // Iterate backwards, removing unnecessary direct child records of given Tsn returned by API
    for (let i = lstHierarchyList.length - 1; i >= 0; i--) {
      if (lstHierarchyList[i].parentTsn._text == strTsn) {
        lstHierarchyList.splice(i, 1);
      }
    }

    return lstHierarchyList;
  } catch (error) {
    console.log(error);
  }
}

async function GetAcceptedTsns(strTsn: string) {
  let convert = require('xml-js')
  let strUrl = 'https://www.itis.gov/ITISWebService/services/ITISService/getAcceptedNamesFromTSN?tsn=' + strTsn;
  let xmlstrSpeciesData = await WebRequest.json<any>(strUrl);
  let jsonstrSpeciesData = convert.xml2json(xmlstrSpeciesData, { compact: true });
  jsonstrSpeciesData = await CleanItisString(jsonstrSpeciesData);
  let jsonSpeciesData = JSON.parse(jsonstrSpeciesData);
  jsonSpeciesData = jsonSpeciesData.getAcceptedNamesFromTSNResponse.return.acceptedNames;
  let lstAcceptedTsnAndName: any[] = [];
  try {

    if (jsonSpeciesData.length) {
      for (let i = 0; i < jsonSpeciesData.length; i++) {
        lstAcceptedTsnAndName.push([jsonSpeciesData[i].acceptedTsn._text, jsonSpeciesData[i].acceptedName._text]);
      }
    }
    else if (jsonSpeciesData._attributes.nil) {
      // the null will indicate that this tsn is already valid and should be ignored
      lstAcceptedTsnAndName.push([strTsn, null]);
    }
    else {
      lstAcceptedTsnAndName.push([jsonSpeciesData.acceptedTsn._text, jsonSpeciesData.acceptedName._text]);
    }
  } catch (error) {
    console.log(error, strTsn)
  }

  return lstAcceptedTsnAndName;
}

async function MapTaxChildren() {

  const dbName = couchDB.use(CouchDBName);
  let lstAllTaxDocs: Taxonomy[] = [];
  let lstUpdatedDocs: Taxonomy[] = [];

  // get all docs
  await dbName.view('Taxonomy', 'taxonomy-by-itisTSN', {
    'include_docs': true
  }).then((data: any) => {
    if (data.rows.length > 0) {
      for (let i = 0; i < data.rows.length; i++) {
        lstAllTaxDocs.push(data.rows[i].doc);
      }
    }
  }).catch((error: any) => {
    console.log(error);
  });

  // look through all docs
  for (let i = 0; i < lstAllTaxDocs.length; i++) {

    // Get docs with parentId = this doc _id
    let lstChildDocs = await FetchAllDocs(lstAllTaxDocs[i]._id, 'taxonomy-get-child-docs', 'Taxonomy');
    let lstChildIDs: string[] = [];

    // append all child ids to list and put into document
    for (let j = 0; j < lstChildDocs.length; j++) {
      lstChildIDs.push(lstChildDocs[j]._id);
    }

    let objUpdatedDoc = lstAllTaxDocs[i];
    if (lstChildIDs.length > 0) {
      objUpdatedDoc.children = lstChildIDs;
      lstUpdatedDocs.push(objUpdatedDoc);
    }
  }

  await InsertBulkCouchDB(lstUpdatedDocs)
}

async function vTestViews() {

  const dbName = couchDB.use(CouchDBName);
  let lstDocs: any = [];

  await dbName.view('Taxonomy', 'taxonomy-by-itisTSN', {
    'include_docs': true
  }).then((data: any) => {
    if (data.rows.length > 0) {
      for (let i = 0; i < data.rows.length; i++) {
        lstDocs.push(data.rows[i].doc);
      }
    }
  }).catch((error: any) => {
    console.log(error);
  });

  for (let i = 0; i < lstDocs.length; i++) {
    if (!(lstDocs[i].level in dictTaxLevels)) {
      console.log(lstDocs[i].level)
    }
  }


  console.log(lstDocs.length);
}


async function BeginAsynchETL() {
  await CreateViews();
  let client = await WarehouseConnection();
  let lstWarehouseTaxonomy = await client.query('SELECT * FROM dw.taxonomy_dim WHERE scientific_name IS NOT NULL ORDER BY taxonomy_whid');
  lstWarehouseTaxonomy = lstWarehouseTaxonomy.rows;
  await ReleasePostgres(client);

  console.log(new Date().toLocaleTimeString(), ' DW data returned, beginning calls to API');

  for (let i = 0; i < lstWarehouseTaxonomy.length; i++) {
    let objDWdata: any = lstWarehouseTaxonomy[i];
    // if(objDWdata.taxonomy_whid == 7247){
    await Sleep(1000);
    getItisDataAsynchonously(objDWdata).catch((error: any) => {
      console.log(error);
    });
    // }
  }
  return 1;
}

function Sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getItisDataAsynchonously(objDWdata: any) {

  try {
    let strScientificName = objDWdata.scientific_name;
    strScientificName = strScientificName.replace("  ", " "); // some DW records have this issue which breaks the api query
    let strDwTaxLevel: string = objDWdata.scientific_name_taxonomic_level;
    let strKingdom: string = objDWdata.kingdom_10;
    let lstTSNs: string[] = [];
    let lstHierarchy: any[] = [];

    lstTSNs = await GetItisTsnBySciNameAndKingdom(strScientificName, strKingdom);

    if (lstTSNs.length == 0) {
      console.log('failed due to bad name, itis returned nil: ', objDWdata.taxonomy_whid);
    }

    let lstTaxHierarchies: any[] = [];
    if (lstTSNs.length > 0) {
      lstTaxHierarchies = await GetFullHierarchyByMultTsns(lstTSNs, strDwTaxLevel, strScientificName, objDWdata);
      if (lstTaxHierarchies.length > 1) {
        // lets variable to empty array so the loop below is passed over without issue
        console.log('Sci name and level check failed here, mult hierarchies returned', objDWdata.taxonomy_whid, lstTSNs);
      } else if (lstTaxHierarchies.length == 0) {
        // this catches when no hierarchies are given for a TSN, which implies its an invalid name
        let lstNewTsnsAndNames: any = [];

        // query for accepted names for each TSN, create list of all returned items
        for (let i = 0; i < lstTSNs.length; i++) {
          let lstReturnedAcceptedTsns = await GetAcceptedTsns(lstTSNs[i]);
          for (let j = 0; j < lstReturnedAcceptedTsns.length; j++) {
            if (lstReturnedAcceptedTsns[j][1] != null) {
              lstNewTsnsAndNames.push(lstReturnedAcceptedTsns[j]);
            }
          }
        }
        if (lstNewTsnsAndNames.length > 1) {
          // if more than one item has been returned, log it, do nothing
          console.log('Multiple accepted TSNs: ', objDWdata.taxonomy_whid);
        } else {
          // attempt to query the hierarchy again with the single new accepted tsn and scientific name
          strScientificName = lstNewTsnsAndNames[0][1];
          lstTSNs = [lstNewTsnsAndNames[0][0]];
          lstTaxHierarchies = await GetFullHierarchyByMultTsns(lstTSNs, strDwTaxLevel, strScientificName, objDWdata);
          if (lstTaxHierarchies.length > 0) {
            lstHierarchy = lstTaxHierarchies[0];
          } else {
            // i dont think this should ever happen
            console.log('error: hierarchy length is zero: ', objDWdata.taxonomy_whid)
          }
          if (lstTaxHierarchies.length == 0 || lstTaxHierarchies[0] == 'invalid name') {
            // i dont think this should ever happen
            console.log('hierarchy from new accepted tsn failed: ', objDWdata.taxonomy_whid)
            lstHierarchy = [];
          }
        }
      } else if (lstTaxHierarchies.length == 1) {
        // exactly one hierarchy was returned as desired
        lstHierarchy = lstTaxHierarchies[0];
      }
    }

    let strParentID: string = null;

    // Loop through each item in the hierarchy, build each one as document in couch
    for (let j = 0; j < lstHierarchy.length; j++) {
      // For taxonomy, an Id must be grabed ahead of time, due to taxonomyId and _id both existing. REVIEW.
      let strCouchID = await GenerateCouchID();
      if (objDWdata.taxonomy_whid == 50) {
        console.log()
      }
      // get parent id, if exists
      if (lstHierarchy[j].parentTsn) {
        if (lstHierarchy[j].parentTsn._text in dictTaxonomyByItisID) {
          strParentID = dictTaxonomyByItisID[lstHierarchy[j].parentTsn._text]._id;
        }
      }

      // build tax document
      let objNewTaxDocument: Taxonomy = {
        _id: strCouchID,
        type: 'taxonomy',
        taxonomyId: strCouchID,
        level: lstHierarchy[j].rankName._text,
        taxonomyName: lstHierarchy[j].taxonName._text,
        scientificName: lstHierarchy[j].taxonName._text,
        parent: strParentID,
        // wcgopTallyShortCode: null,
        // pacfinNomCode: null,
        itisTSN: parseInt(lstHierarchy[j].tsn._text),
        wormsAphiaId: null,
        isInactive: null,

        legacy: {
          wcgopSpeciesId: null,
          ashopSpeciesId: null,
          dwId: null
        }
      }
      // if end of loop, then this is the level that was queried from the DW, set dw taxonomy info
      if (j == lstHierarchy.length - 1) {
        objNewTaxDocument.legacy.wcgopSpeciesId = objDWdata.observer_species_id;
        objNewTaxDocument.legacy.ashopSpeciesId = objDWdata.norpac_species_id;
        objNewTaxDocument.legacy.dwId = [objDWdata.taxonomy_whid];
        // objNewTaxDocument.pacfinNomCode = objDWdata.pacfin_nom_spid;
        objNewTaxDocument.wormsAphiaId = objDWdata.worms_aphiaid;
      }

      // variables for insert logic
      let strDocID: string = null;
      let iItisID: number = objNewTaxDocument.itisTSN;
      let bNeedsUpdate: boolean = false;

      if (iItisID in dictTaxonomyByItisID) {
        strDocID = dictTaxonomyByItisID[iItisID]._id;
        if (j == lstHierarchy.length - 1 && !(dictTaxonomyByItisID[iItisID].legacy.dwId)) {
          // if this taxonomy level was the one that was queried from the DW but it already has been created, then the dw taxonomy info must be added to doc and updated.
          bNeedsUpdate = true
          objNewTaxDocument._id = dictTaxonomyByItisID[iItisID]._id;
          objNewTaxDocument._rev = dictTaxonomyByItisID[iItisID]._rev;
        } else if (j == lstHierarchy.length - 1 && objNewTaxDocument.legacy.dwId != null && dictTaxonomyByItisID[iItisID].legacy.dwId != objNewTaxDocument.legacy.dwId) {
          // this catches multiple DW tax records that correlate to a single itis tsn
          bNeedsUpdate = true;
          objNewTaxDocument.legacy.dwId = objNewTaxDocument.legacy.dwId.concat(dictTaxonomyByItisID[iItisID].legacy.dwId)
          objNewTaxDocument._id = dictTaxonomyByItisID[iItisID]._id;
          objNewTaxDocument._rev = dictTaxonomyByItisID[iItisID]._rev;
        }
      }

      if (bNeedsUpdate) {
        // if document needs to be updated with dw info
        strParentID = strDocID;
        await dbName.insert(objNewTaxDocument).then((data: any) => {
          strParentID = data.id;
          objNewTaxDocument._rev = data.rev
          dictTaxonomyByItisID[iItisID] = objNewTaxDocument;
        }).catch((error: any) => {
          console.log("insert failed", error, objNewTaxDocument);
        });
      } else if (strDocID != null) {
        // if exists and no updated is needed
        strParentID = strDocID;
      } else {
        // if not exists, create
        await dbName.insert(objNewTaxDocument).then((data: any) => {
          strParentID = data.id;
          objNewTaxDocument._rev = data.rev
          dictTaxonomyByItisID[iItisID] = objNewTaxDocument;
        }).catch((error: any) => {
          console.log("insert failed", error, objNewTaxDocument);
        });
      }
    }
  } catch (error) {
    console.log(error, objDWdata.taxonomy_whid)
  }
}


async function FlattenTaxonomyDocs() {

  const dbName = couchDB.use(CouchDBName);
  let uniqueLevels: string[] = [];
  let allTaxDocs: Taxonomy[] = [];

  await dbName.view('Taxonomy', 'taxonomy-by-itisTSN', {
    'include_docs': true
  }).then((data: any) => {
    if (data.rows.length > 0) {
      for (let i = 0; i < data.rows.length; i++) {
        allTaxDocs.push(data.rows[i].doc);
      }
    }
  }).catch((error: any) => {
    console.log(error);
  });

  let flattenedDataset: any[] = [];
  let strParentID: string = allTaxDocs[0].parent;
  let headings: any[] = Array(28);
  let iNewTaxonomyID: number = 10000;

  for (let key in dictTaxLevels) {
    let iTaxLevel = dictTaxLevels[key];
    headings[iTaxLevel] = key.toLowerCase();
  }
  headings[25] = 'taxonomy_id';
  headings[26] = 'scientific_name';
  headings[27] = 'itis_tsn';
  // lstFlattenedDataset.push(lstHeadings);

  for (let i = 0; i < allTaxDocs.length; i++) {

    if (allTaxDocs[i].legacy.dwId) {
      for (let j = 0; j < allTaxDocs[i].legacy.dwId.length; j++) {

        strParentID = allTaxDocs[i].parent;
        let flattenedRecord: any[] = Array(27);
        flattenedRecord[25] = allTaxDocs[i].legacy.dwId[j];
        let iTaxLevel: number = dictTaxLevels[allTaxDocs[i].level];
        flattenedRecord[iTaxLevel] = allTaxDocs[i].taxonomyName;
        flattenedRecord[26] = allTaxDocs[i].taxonomyName;
        flattenedRecord[27] = allTaxDocs[i].itisTSN;

        while (strParentID != null) {
          let objParetDoc = await dbName.get(strParentID);
          if (objParetDoc.parent) {
            strParentID = objParetDoc.parent
          } else {
            strParentID = null;
          }
          iTaxLevel = dictTaxLevels[objParetDoc.level];
          flattenedRecord[iTaxLevel] = objParetDoc.taxonomyName;
        }
        flattenedDataset.push(flattenedRecord);
      }
    } else {
      if (allTaxDocs[i].parent) {
        strParentID = allTaxDocs[i].parent;
      } else {
        strParentID = null;
      }
      let lstFlattenedRecord: any[] = Array(27);
      lstFlattenedRecord[25] = iNewTaxonomyID;
      iNewTaxonomyID += 1;
      let iTaxLevel = dictTaxLevels[allTaxDocs[i].level];
      lstFlattenedRecord[iTaxLevel] = allTaxDocs[i].taxonomyName;
      lstFlattenedRecord[26] = allTaxDocs[i].taxonomyName;
      lstFlattenedRecord[27] = allTaxDocs[i].itisTSN;

      while (strParentID != null) {
        let objParetDoc = await dbName.get(strParentID);
        if (objParetDoc.parent) {
          strParentID = objParetDoc.parent
        } else {
          strParentID = null;
        }
        iTaxLevel = dictTaxLevels[objParetDoc.level];
        lstFlattenedRecord[iTaxLevel] = objParetDoc.taxonomyName;
      }
      flattenedDataset.push(lstFlattenedRecord);
    }
  }

  const createCsvWriter = await require('csv-writer').createArrayCsvWriter;
  const csvWriter = await createCsvWriter({
    header: headings,
    path: "C:\\Users\\Nicholas.Shaffer\\Desktop\\FlattenedCouchTaxonomy.csv"
  });

  csvWriter
    .writeRecords(flattenedDataset)
    .then(() => console.log('The CSV file was written successfully'));


  console.log(flattenedDataset);

}

async function getAllUniqueLevels() {

  const dbName = couchDB.use(CouchDBName);
  let lstUniqueLevels: string[] = [];
  let lstAllTaxDocs: Taxonomy[] = [];

  await dbName.view('Taxonomy', 'taxonomy-by-itisTSN', {
    'include_docs': true
  }).then((data: any) => {
    if (data.rows.length > 0) {
      for (let i = 0; i < data.rows.length; i++) {
        lstAllTaxDocs.push(data.rows[i].doc);
      }
    }
  }).catch((error: any) => {
    console.log(error);
  });


  for (let i = 0; i < lstAllTaxDocs.length; i++) {

    if (lstAllTaxDocs[i].level == 'Section') {
      // console.log(lstAllTaxDocs[i])
    }

    if (!(lstUniqueLevels.indexOf(lstAllTaxDocs[i].level) >= 0)) {
      lstUniqueLevels.push(lstAllTaxDocs[i].level)
    }
  }

  for (let i = 0; i < lstUniqueLevels.length; i++) {
    console.log(lstUniqueLevels[i]);
  }


}

async function getDwIDsForBadSearches() {
  let client = await WarehouseConnection();
  const dbName = couchDB.use(CouchDBName);
  let dwTaxonomyData = await client.query('SELECT * FROM dw.taxonomy_dim WHERE scientific_name IS NOT NULL');
  dwTaxonomyData = dwTaxonomyData.rows;
  await ReleasePostgres(client);


  let lstIDsOfVagueNames: number[] = [];

  console.log(new Date().toLocaleTimeString(), ' DW data returned, beginning calls to API');
  // console.log(new Date().toLocaleTimeString());

  for (let i = 0; i < dwTaxonomyData.length - 1; i++) {
    let objDWdata: any = dwTaxonomyData[i];
    let scientificName = objDWdata.scientific_name;
    let strTsn = await GetItisTsnBySciNameAndKingdom(scientificName, null);

    if (strTsn.length > 0) {
      lstIDsOfVagueNames.push(objDWdata.taxonomy_whid);
      console.log(objDWdata.taxonomy_whid)
    }
  }

  // for(let i = 0; i < lstIDsOfVagueNames.length - 1; i++){
  //   console.log(lstIDsOfVagueNames[i]);
  // }


}

async function addMissingObserverIDs() {
  // this is a hardcoded bruteforce workaround for a few edge cases designed to be ran after a fresh run of the main portion of the ETL
  // I have purposefully not added the missing IDs yet to the taxonomy_dim table incase I have made an error in associating two foreign records

  let allTaxDocs: Taxonomy[] = [];
  let updatedDocs: Taxonomy[] = [];
  await dbName.view('Taxonomy', 'taxonomy-with-dwid', {
    'include_docs': true
  }).then((data: any) => {
    if (data.rows.length > 0) {
      for (let i = 0; i < data.rows.length; i++) {
        allTaxDocs.push(data.rows[i].doc);
      }
    }
  }).catch((error: any) => {
    console.log(error);
  });

  for (let i = 0; i < allTaxDocs.length; i++) {

    let iObsprodID: number = null;

    if (allTaxDocs[i].legacy.dwId.indexOf(2050) >= 0) {
      iObsprodID = 10691;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(774) >= 0) {
      iObsprodID = 10690;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(1972) >= 0) {
      iObsprodID = 10708;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(1892) >= 0) {
      iObsprodID = 10711;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(619) >= 0) {
      iObsprodID = 10180;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(6480) >= 0) {
      iObsprodID = 10712;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(5912) >= 0) {
      iObsprodID = 10301;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(1713) >= 0) {
      iObsprodID = 10703;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(2135) >= 0) {
      iObsprodID = 10704;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(5561) >= 0) {
      iObsprodID = 10687;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(772) >= 0) {
      iObsprodID = 10688;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(1824) >= 0) {
      iObsprodID = 10714;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(7321) >= 0) {
      iObsprodID = 10707;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(7322) >= 0) {
      iObsprodID = 10706;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(6579) >= 0) {
      iObsprodID = 10716;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(5568) >= 0) {
      iObsprodID = 10689;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(5707) >= 0) {
      iObsprodID = 10586;
    }

    let iNorpacID: number = null;
    if (allTaxDocs[i].legacy.dwId.indexOf(5736) >= 0) {
      iNorpacID = 60;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(517) >= 0) {
      iNorpacID = 771;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(451) >= 0) {
      iNorpacID = 699;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(6524) >= 0) {
      iNorpacID = 874;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(2023) >= 0) {
      iNorpacID = 784;
    } else if (allTaxDocs[i].legacy.dwId.indexOf(530) >= 0) {
      iNorpacID = 753;
    }

    if (iObsprodID || iNorpacID) {
      allTaxDocs[i].legacy.wcgopSpeciesId = iObsprodID;
      allTaxDocs[i].legacy.ashopSpeciesId = iNorpacID;
      updatedDocs.push(allTaxDocs[i]);
    }
  }

  await InsertBulkCouchDB(updatedDocs);



}

async function getObserverItemsNotInWarehouse() {
  // this is a hardcoded bruteforce workaround for a few edge cases designed to be ran after a fresh run of the main portion of the ETL

  await dbName.view('Taxonomy', 'taxonomy-by-itisTSN', {
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

  // itis_tsn on left, observer id on right
  let obsprodItems: [string, number][] = [
    ['612597', 10717],
    ['174634', 10715],
    ['174673', 10703],
    ['176735', 10704]
  ]

  let norpacItems: [string, number][] = [
    ['176568', 868],
    ['176568', 1174],
    ['824103', 1101]
  ]

  let strParentID: string = null;
  for (let i = 0; i < obsprodItems.length; i++) {
    let taxonHierarchy = await GetFullHierarchyByTsn(obsprodItems[i][0]);

    for (let j = 0; j < taxonHierarchy.length; j++) {

      let strCouchID = await GenerateCouchID();
      // get couch parent id, if exists
      if (taxonHierarchy[j].parentTsn) {
        if (taxonHierarchy[j].parentTsn._text in dictTaxonomyByItisID) {
          strParentID = dictTaxonomyByItisID[taxonHierarchy[j].parentTsn._text]._id;
        }
      }

      // build tax document
      let newTaxDocument: Taxonomy = {
        _id: strCouchID,
        type: 'taxonomy',
        taxonomyId: strCouchID,
        level: taxonHierarchy[j].rankName._text,
        taxonomyName: taxonHierarchy[j].taxonName._text,
        scientificName: taxonHierarchy[j].taxonName._text,
        parent: strParentID,
        // wcgopTallyShortCode: null,
        // pacfinNomCode: null,
        itisTSN: parseInt(taxonHierarchy[j].tsn._text),
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
      let itisID: number = newTaxDocument.itisTSN;
      let bAlreadyExists: boolean = false;

      if (j == taxonHierarchy.length - 1) {
        newTaxDocument.legacy.wcgopSpeciesId = obsprodItems[i][1];

        if (itisID in dictTaxonomyByItisID) {
          console.log('base level already exists');
        }
      }


      if (itisID in dictTaxonomyByItisID) {
        // strDocID = dictTaxonomyByItisID[iItisID]._id;
        bAlreadyExists = true;
      }

      if (!bAlreadyExists) {
        await dbName.insert(newTaxDocument).then((data: any) => {
          strParentID = data.id;
          newTaxDocument._rev = data.rev
          dictTaxonomyByItisID[itisID] = newTaxDocument;
        }).catch((error: any) => {
          console.log("insert failed", error, newTaxDocument);
        });
      }
    }
  }

  for (let i = 0; i < norpacItems.length; i++) {
    let taxonHierarchy = await GetFullHierarchyByTsn(norpacItems[i][0]);

    for (let j = 0; j < taxonHierarchy.length; j++) {

      let strCouchID = await GenerateCouchID();
      // get couch parent id, if exists
      if (taxonHierarchy[j].parentTsn) {
        if (taxonHierarchy[j].parentTsn._text in dictTaxonomyByItisID) {
          strParentID = dictTaxonomyByItisID[taxonHierarchy[j].parentTsn._text]._id;
        }
      }

      // build tax document
      let newTaxDocument: Taxonomy = {
        _id: strCouchID,
        type: 'taxonomy',
        taxonomyId: strCouchID,
        level: taxonHierarchy[j].rankName._text,
        taxonomyName: taxonHierarchy[j].taxonName._text,
        scientificName: taxonHierarchy[j].taxonName._text,
        parent: strParentID,
        // wcgopTallyShortCode: null,
        // pacfinNomCode: null,
        itisTSN: parseInt(taxonHierarchy[j].tsn._text),
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
      let itisID: number = newTaxDocument.itisTSN;
      let bAlreadyExists: boolean = false;
      let bNeedsUpdate: boolean = false;

      if (j == taxonHierarchy.length - 1) {
        newTaxDocument.legacy.ashopSpeciesId = norpacItems[i][1];

        if (itisID in dictTaxonomyByItisID) {
          console.log('base level already exists');
          newTaxDocument = dictTaxonomyByItisID[itisID];
          newTaxDocument.legacy.ashopSpeciesId = norpacItems[i][1];
          bNeedsUpdate = true;
        }
      }


      if (itisID in dictTaxonomyByItisID) {
        // strDocID = dictTaxonomyByItisID[iItisID]._id;
        bAlreadyExists = true;
      }

      if (!bAlreadyExists || bNeedsUpdate) {
        await dbName.insert(newTaxDocument).then((data: any) => {
          strParentID = data.id;
          newTaxDocument._rev = data.rev
          dictTaxonomyByItisID[itisID] = newTaxDocument;
        }).catch((error: any) => {
          console.log("insert failed", error, newTaxDocument);
        });
      }
    }
  }
}


async function Initialize() {
  // overall this whole process takes a little over an hour

  await CatchGroupingsETL();


  // console.log()
  // console.log(new Date().toLocaleTimeString(), ' Initializing full taxonomy ETL.'); 
  // await BeginAsynchETL(); // this step will take and hour  so, largest percentage of this entire process
  // console.log(new Date().toLocaleTimeString(), ' Finished warehouse ETL, getting missing observer items.');
  // await addMissingObserverIDs();
  // await getObserverItemsNotInWarehouse();
  // console.log(new Date().toLocaleTimeString(), ' Finished incorporating missing obvserver items, beginning incorporation of pacfin species.');
  // await PacfinSpeciesETL();
  // console.log(new Date().toLocaleTimeString(), ' Finished pacfin incorporation, beginning parent/child mapping of taxonomy hierarchies.');
  // await MapTaxChildren();
  // console.log(new Date().toLocaleTimeString(), ' Finished parent/child mapping, beginning ETL of aliases.');
  // await TaxonomyAliasETL();
  // console.log(new Date().toLocaleTimeString(), ' Finished ETL of aliases, flattening taxonomy documents.');
  // await FlattenTaxonomyDocs();
  // console.log(new Date().toLocaleTimeString(), ' Finished taxonomy flattening, full ETL successful.');
}

async function testSpecificInvalidNames() {

  let lstAllInvalidNames: string[] = ['Bathyraja taranetzi', 'Inopsetta ischyra', 'Symphurus atricauda', 'Percis japonicus', 'Bathylagus milleri', 'Bathylagus ochotensis', 'Thecopterus aleuticus', 'Hemilepidotus papilio', 'Triglops forficata', 'Rhamphocottus richardsoni', 'Eumicrotremus birulai', 'Liparis bristolense', 'Careproctus ovigerum', 'Lampanyctus ritteri', 'Lampanyctus regalis', 'Leptocephalus', 'Lumpenus medius', 'Lepidopus xantusi', 'Lycodapus grossidens', 'Sebastes dalli', 'Sebastomus', 'Gorgonacea', 'Paragorgia pacifica', 'Euplexaura marki', 'Stylatula gracile', 'Urticina crassicornis', 'Errinopora pourtalesi', 'Notostomobdella', 'Balanus evermanni', 'Balanus hesperius', 'Scalpellum cornutum', 'Crangon abyssorum', 'Crangon communis', 'Calastacus investigatoris', 'Callianassa goniophthalma', 'Callianassa californiensis', 'Aplacophora', 'Placiphorella pacifica', 'Leptochiton mesogonus', 'Euspira monterona', 'Colus hypolispus', 'Colus spitzbergensis', 'Colus halli', 'Volutopsius filosus', 'Volutopsius castaneus', 'Volutopsius simplex', 'Volutopsius stefanssoni', 'Beringius frielei', 'Beringius beringii', 'Neptunea phoenicia', 'Neptunea borealis', 'Neptunea stilesi', 'Neptunea magna', 'Plicifusus kroyeri', 'Plicifusus incisus', 'Plicifusus brunneus', 'Plicifusus verkruzeni', 'Volutopsius callorhinus', 'Plicifusus griseus', 'Mohnia robusta', 'Liomesus ooides', 'Boreotrophon muriciformis', 'Boreotrophon pacificus', 'Buccinum polare', 'Buccinum castaneum', 'Searlesia dira', 'Delectopecten randolphi', 'Panomya arctica', 'Nucula tenuis', 'Yoldia montereyensis', 'Yoldia thraciaeformis', 'Nuculana fossa', 'Nuculana buccata', 'Limopsis vaginata', 'Crenella seminuda', 'Tridonta rollandi', 'Kellia laperousii', 'Clinocardium funcanum', 'Saxidomus giganteus', 'Xylophaga californica', 'Pododesmus macroschisma', 'Pododesmus cepio', 'Evasterias troschelii', 'Diamphiodia occidentalis', 'Henricia multispina', 'Hippasteria kurilensis', 'Hippasteria armata', 'Cryptopeltaster lepidonotus', 'Asterina miniata', 'Lophaster vexator', 'Astropecten californicus', 'Brisingella pusilla', 'Brisingella exilis', 'Brisingella', 'Zoroaster evermanni', 'Strongylocentrotus echinoides', 'Brisaster townsendi', 'Stegophiura ponderosa', 'Ophiacantha diplasia', 'Cucumaria japonica', 'Parastichopus leukothele', 'Parastichopus californicus', 'Stichopus japonicus', 'Acoela', 'Priapula', 'Tunicata', 'Amaroucium', 'Maynea californica', 'Radulinus taylori', 'Hypsagonus mozinoi', 'Cymatogaster gracilis', 'Parastichopus parvimensis', 'Paelopatides confundus', 'Halocynthia igaboja', 'Cryptopeltaster', 'Inopsetta', 'Thecopterus', 'Tridonta', 'Eleutherozoa', 'Asterozoa', 'Cryptosyringida', 'Osteichthyes', 'Neopterygii', 'Ectoprocta', 'Palpata', 'Phyllodocida', 'Scolecida', 'Leptognathina', 'Neomeniomorpha', 'Neoloricata', 'Dendrochirotacea', 'Granulosina', 'Euhirudinea', 'Eugnathina', 'Pythonasteridae', 'Agnatha', 'Pogonophora', 'Lamellibrachiida', 'Lamellibrachiidae', 'Apodacea', 'Molpadiida', 'Aspidochirotacea', 'Aspidochirotida', 'Holocephalimorpha', 'Doryteuthis', 'Arctocephalinae', 'Haliotididae', 'Polychaeta'];

  for (let i = 0; i < lstAllInvalidNames.length; i++) {

    lstAllInvalidNames[i] = lstAllInvalidNames[i].replace("  ", " ");
    let lstBadTsns = await GetItisTsnBySciNameAndKingdom(lstAllInvalidNames[i], 'Animalia');

    if (lstBadTsns.length > 1) {
      console.log('more than one tsn here: ', lstAllInvalidNames[i])
    } else {

      let strAcceptedTsn = await GetAcceptedTsns(lstBadTsns[0]);
      if (lstBadTsns[0][0] == strAcceptedTsn[0]) {
        console.log('Tsn given is already accepted: ', lstAllInvalidNames[i], strAcceptedTsn)
      }

      console.log('name, bad tsn, accepted tsn: ', lstAllInvalidNames[i], lstBadTsns, strAcceptedTsn);

    }
  }


}

// testSpecificInvalidNames();


// lstGetAcceptedTsns('154451');


// getAllUniqueLevels();


// getDwIDsForBadSearches();

// vTestViews();

Initialize();


// FlattenTaxonomyDocs();





// lstGetFullHierarchy(['162635'], 'species', 'Lampanyctus ritteri')