
import * as dbconnections from './../../dbconnections'
import { Taxonomy } from '../libs/bn-models';
import { TaxonomyAlias, Port, Vessel } from '../libs/bn-models/dist';

export var UploadedBy = 'nicholas.shaffer@noaa.gov';
export var UploadedDate: any;


var oracledb = require('oracledb');
var moment = require('moment');
const { Pool, Client } = require('pg')
import * as WebRequest from 'web-request';

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

// Setting this process var to "0" is extremely unsafe in most situations, use with care.
// It is unsafe because Node does not like self signed TLS (SSL) certificates, 
// this setting disables Node's rejection of invalid or unauthorized certificates, and allows them.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
console.log('CouchDB connection configured successfully.');



var dictTaxLevels: { [id: string] : any; } = {};
var dictTaxonomyByItisID: { [id: number] : any; } = {};
var dictDwTaxLevelNames: { [id: string] : any; } = {};


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


async function WarehouseConnection(){
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
async function ReleasePostgres(client: any){
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
async function WcgopConnection(){
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
async function ReleaseOracle(connection: any) {
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
  if(aData){
    return aData.rows;
  } else {
    return null;
  }
}
async function UpdateDocCouchDB(UpdatedDoc: any){
  const dbName = couchDB.use(CouchDBName);
  await dbName.insert(UpdatedDoc).then((data: any) => {
    //console.log(data)
  }).catch((error: any) => {
    console.log("update failed", error, UpdatedDoc);
  
  });

}
async function InsertBulkCouchDB(lstDocuments: any){
  let lstDocumentIDs: string[];
  lstDocumentIDs = [];
  const dbName = couchDB.use(CouchDBName);

  await dbName.bulk({docs:lstDocuments}).then((lstReturn: any) => {
    //console.log(lstReturn);
    for (let i = 0; i < lstReturn.length; i++){
      lstDocumentIDs.push(lstReturn[i].id)
    }
  }).catch((error: any) => {
    console.log("bulk insert failed", error, lstDocuments);
  });

  return lstDocumentIDs;
}
async function FetchAllDocs(Key: number | string, ViewName:string, DesignName: string){
  let strDocID;
  let strDocRev;
  let Document;
  let AllDocs: any[] = [];
  const dbName = couchDB.use(CouchDBName);

  await dbName.view(DesignName, ViewName, {
    'key': Key,
    'include_docs': true
  }).then((data: any) => {
    if (data.rows.length > 0){      
      for(let i = 0; i < data.rows.length; i++){

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

async function CreateViews(){

  
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
      "map": "function (doc) {\r\n  if (doc.type == 'taxonomy' && !(doc.children)) { \r\n    emit(doc.legacy.dwId, null);\r\n  }\r\n}"
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

async function GenerateCouchID(){
  
  const dbName = couchDB.use(CouchDBName);
  let CouchID: string;

  await couchDB.uuids(1).then((data: any) => {
    //console.log(data);
    CouchID = data.uuids[0]
  });

  return CouchID;
}

async function GenerateCouchIDs(iNumToGenerate: number){
  
  const dbName = couchDB.use(CouchDBName);
  let CouchIDs: string[];

  await couchDB.uuids(iNumToGenerate).then((data: any) => {
    //console.log(data);
    CouchIDs = data.uuids
  });

  return CouchIDs;
}

function RemoveDocNullVals(Document: any){

    // setting property to undefined instead of deleting is much faster, and adequate for the purpose of migrating to couch
    for (let item in Document){
      if (Document[item] == null){
        //delete Document[item];
        Document[item] = undefined;
      } else if (typeof(Document[item]) === 'object'){
        let subdoc = RemoveDocNullVals(Document[item]);
        Document[item] = subdoc;
      } else if (typeof(Document[item]) === 'string') {
          if(!Document[item].replace(/\s/g, '').length){
            // string only contains whitespace
            Document[item] = undefined;
          }
      }
    }

    return Document;
}

async function BuildTaxonomy(objTaxRecord: any){

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
      dwId: objTaxRecord.taxonomy_whid
    }

  }

  strCouchID = await GenerateCouchID();
  let docNewAlias: TaxonomyAlias = {
    _id: strCouchID,
    type: 'taxonomy-alias',
    taxonomy:docNewTax,
    alias: objTaxRecord.common_name,
    aliasType: 'Common Name'
  }


  return [docNewTax, docNewAlias];

}
function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(find, 'g'), replace);
}

async function strCleanItisString(strItisData: string){
  // make data more readable while coding by removing unnecessary prefixes from properties in the raw data

  let strCleanedString: string = replaceAll(strItisData, "ns:", "")
  strCleanedString = replaceAll(strCleanedString, "ax21:", "")
  strCleanedString = replaceAll(strCleanedString, "xsi:", "")
  return strCleanedString;
}

async function strGetItisTsnByScientificName(strScientificName: string, strKingdom: string){
  let convert = require('xml-js')

  // I have already confirmed that this API is not case sensitive.
  let strUrl: string = 'https://www.itis.gov/ITISWebService/services/ITISService/searchByScientificName?srchKey=' + strScientificName;
  let xmlstrSpeciesData = await WebRequest.json<any>(strUrl);
  let jsonstrSpeciesData = convert.xml2json(xmlstrSpeciesData, {compact: true});
  jsonstrSpeciesData = await strCleanItisString(jsonstrSpeciesData);
  let jsonSpeciesData = JSON.parse(jsonstrSpeciesData);
  let lstItisTSNs: string[] = [];
  // let strItisTSN: string = '';

  // loop through each item returned, return all TSN's that match the scientific name exactly and match the kingdom to reduce number of hierarchies to query later
  if(jsonSpeciesData.searchByScientificNameResponse.return.scientificNames.length){
    for(let i = 0; i < jsonSpeciesData.searchByScientificNameResponse.return.scientificNames.length; i++){
      if(strKingdom == jsonSpeciesData.searchByScientificNameResponse.return.scientificNames[i].kingdom._text){
        if(jsonSpeciesData.searchByScientificNameResponse.return.scientificNames[i].combinedName._text.toLowerCase() == strScientificName.toLowerCase()){
          lstItisTSNs.push(jsonSpeciesData.searchByScientificNameResponse.return.scientificNames[i].tsn._text)
        }
      }
    }
  } else if(jsonSpeciesData.searchByScientificNameResponse.return.scientificNames._attributes.nil == 'true') {
    // do nothing, return the empty string
  } else {
    lstItisTSNs.push(jsonSpeciesData.searchByScientificNameResponse.return.scientificNames.tsn._text)
    // strItisTSN = jsonSpeciesData.searchByScientificNameResponse.return.scientificNames.tsn._text;
  }

  return lstItisTSNs
}

async function lstGetFullHierarchy(lstTSNs: string[], strDwTaxLevel: string, strScientificName: string, objDWdata: any){
  // This function takes many TSNs, and attempts to query itis with each one and (hopefully) return only a single, valid hierarchy, but potentially multiple 
  let convert = require('xml-js')
  strDwTaxLevel = strDwTaxLevel.toLowerCase();
  strScientificName = strScientificName.toLowerCase();
  let lstAllHierarchies: any[] = [];
  for(let i = 0; i < lstTSNs.length; i++){
    try {
      // Get full record as json
      let strUrl = 'http://www.itis.gov/ITISWebService/services/ITISService/getFullHierarchyFromTSN?tsn=' + lstTSNs[i];
      let xmlstrSpeciesData = await WebRequest.json<any>(strUrl);
      let jsonstrSpeciesData = convert.xml2json(xmlstrSpeciesData, {compact: true});
      jsonstrSpeciesData = await strCleanItisString(jsonstrSpeciesData);
      let jsonSpeciesData = JSON.parse(jsonstrSpeciesData);
      let lstHierarchyList: any = jsonSpeciesData.getFullHierarchyFromTSNResponse.return.hierarchyList;
    
      // _attributes only exists if no real data is returned
      if (lstHierarchyList._attributes){
        // return string to flag a check on return 
        // lstAllHierarchies.push('invalid name');
      } else {

        // Iterate backwards, removing unnecessary direct child records of given Tsn returned by API
        for(let j = lstHierarchyList.length - 1; j >= 0; j--){
          if(lstHierarchyList[j].parentTsn._text == lstTSNs[i]){
            lstHierarchyList.splice(j, 1);
          }
        }

        let objLowestGrain = lstHierarchyList[lstHierarchyList.length - 1];
        if(lstHierarchyList.length == 1 && objLowestGrain.rankName._text.toLowerCase() != 'kingdom'){
          //invalid name, return empty list
        }
        else if(lstTSNs.length == 1){
          // this is not an invalid name and only one hierarchy was searched for, return it
          lstAllHierarchies.push(lstHierarchyList);
        }
        // there are multiple hierarchies, parse through to find the right one
        else if(objLowestGrain.rankName._text.toLowerCase() == strDwTaxLevel && objLowestGrain.taxonName._text.toLowerCase() == strScientificName ){
          // Valid unless length == 1 and isnt a kingdom
          if((lstHierarchyList.length > 1) || (objLowestGrain.rankName._text.toLowerCase() == 'kingdom')){
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

async function lstGetAcceptedTsns(strTsn: string){
  let convert = require('xml-js')
  let strUrl = 'https://www.itis.gov/ITISWebService/services/ITISService/getAcceptedNamesFromTSN?tsn=' + strTsn;
  let xmlstrSpeciesData = await WebRequest.json<any>(strUrl);
  let jsonstrSpeciesData = convert.xml2json(xmlstrSpeciesData, {compact: true});
  jsonstrSpeciesData = await strCleanItisString(jsonstrSpeciesData);
  let jsonSpeciesData = JSON.parse(jsonstrSpeciesData);
  jsonSpeciesData = jsonSpeciesData.getAcceptedNamesFromTSNResponse.return.acceptedNames;
  let lstAcceptedNames: any[] = [];
  try {
    
    if(jsonSpeciesData.length){
      for(let i = 0; i < jsonSpeciesData.length; i++){
        lstAcceptedNames.push([jsonSpeciesData[i].acceptedTsn._text, jsonSpeciesData[i].acceptedName._text]);
      }
    } 
    else if(jsonSpeciesData._attributes.nil){
      // do nothing
      lstAcceptedNames.push([strTsn, null]);
    } 
    else {
      lstAcceptedNames.push([jsonSpeciesData.acceptedTsn._text, jsonSpeciesData.acceptedName._text]);
    }
  } catch (error) {
    console.log(error, strTsn)
  }
  
  return lstAcceptedNames;
}

async function vMapTaxChildren(){
  
  const dbName = couchDB.use(CouchDBName);
  let lstAllTaxDocs: Taxonomy[] = [];
  let lstUpdatedDocs: Taxonomy[] = [];

  // get all docs
  await dbName.view('Taxonomy', 'taxonomy-by-itisTSN', {
    'include_docs': true
  }).then((data: any) => {
    if (data.rows.length > 0){   
      for(let i = 0; i < data.rows.length; i++){
        lstAllTaxDocs.push(data.rows[i].doc);
      }   
    }
  }).catch((error: any) => {
    console.log(error);
  });

  // look through all docs
  for(let i = 0; i < lstAllTaxDocs.length; i++){

    // Get docs with parentId = this doc _id
    let lstChildDocs = await FetchAllDocs(lstAllTaxDocs[i]._id, 'taxonomy-get-child-docs', 'Taxonomy');
    let lstChildIDs: string[] = [];

    // append all child ids to list and put into document
    for(let j = 0; j < lstChildDocs.length; j++){
      lstChildIDs.push(lstChildDocs[j]._id);
    }

    let objUpdatedDoc = lstAllTaxDocs[i];
    if(lstChildIDs.length > 0){
      objUpdatedDoc.children = lstChildIDs;
      lstUpdatedDocs.push(objUpdatedDoc);
    }
  }

  await InsertBulkCouchDB(lstUpdatedDocs)
}

async function vTestViews(){
  
  const dbName = couchDB.use(CouchDBName);
  let lstDocs: any = [];

  await dbName.view('Taxonomy', 'taxonomy-by-itisTSN', {
    'include_docs': true
  }).then((data: any) => {
    if (data.rows.length > 0){   
      for(let i = 0; i < data.rows.length; i++){
        lstDocs.push(data.rows[i].doc);
      }   
    }
  }).catch((error: any) => {
    console.log(error);
  });

  for(let i = 0; i < lstDocs.length; i++){
    if(!(lstDocs[i].level in dictTaxLevels)){
      console.log(lstDocs[i].level)
    }
  }


  console.log(lstDocs.length);
}


async function beginAsynchETL(){
  await CreateViews();
  let client = await WarehouseConnection();
  let lstWarehouseTaxonomy = await client.query('SELECT * FROM dw.taxonomy_dim WHERE scientific_name IS NOT NULL ORDER BY taxonomy_whid');
  lstWarehouseTaxonomy = lstWarehouseTaxonomy.rows;
  await ReleasePostgres(client);

  console.log(new Date().toLocaleTimeString(), ' DW data returned, beginning calls to API');

  for(let i = 0; i < lstWarehouseTaxonomy.length; i++){
    let objDWdata: any = lstWarehouseTaxonomy[i];
    if(objDWdata.taxonomy_whid == 7247){
      await sleep(1000);
      getItisDataAsynchonously(objDWdata).catch((error: any) => {
        console.log(error);
      });
    }
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getItisDataAsynchonously(objDWdata: any){
  
  try {
  let strScientificName = objDWdata.scientific_name;
  strScientificName = strScientificName.replace("  ", " ")
  let strDwTaxLevel: string = objDWdata.scientific_name_taxonomic_level;
  let strKingdom: string = objDWdata.kingdom_10;
  // let strDwTaxName: string = 
  let lstTSNs: string[] = [];
  
  lstTSNs = await strGetItisTsnByScientificName(strScientificName, strKingdom);
  
  // let lstTSNs: string[] = await strGetItisTsnByScientificName(strScientificName, strKingdom);

  if(lstTSNs.length == 0){
    // lstFailedDwIDs.push(objDWdata.taxonomy_whid);
    console.log('failed due to bad name: ', objDWdata.taxonomy_whid);
  }

  if( lstTSNs[0] == '649715'){
    console.log()
  }
  let lstTaxHierarchy: any[] = [];
  if(lstTSNs.length > 0){
    lstTaxHierarchy = await lstGetFullHierarchy(lstTSNs, strDwTaxLevel, strScientificName, objDWdata);
    if(lstTaxHierarchy.length > 1){
      console.log('Sci name and level check failed here, mult hierarchies returned', objDWdata.taxonomy_whid, lstTSNs);
      lstTaxHierarchy = [];
      // No matching hierarchies given, check if name is invalid by checking for valid names
    } else if(lstTaxHierarchy.length == 0){
        lstTSNs = await lstGetAcceptedTsns(lstTSNs[0]);
        lstTaxHierarchy = [];
        let lstNewTsns: any = [];
        // If one of the Tsns is an already valid TSN, then lstGetAcceptedTsns will return [oldTsn, null]
        for(let n = 0; n < lstTSNs.length; n++){
          let newTsn = await lstGetAcceptedTsns(lstTSNs[n]);
          if(newTsn[0][1] != null){
            lstNewTsns.append(newTsn);
          }
        }
        lstTSNs = lstNewTsns;
        if(lstTSNs.length > 1){
          console.log('Multiple accepted TSNs: ', objDWdata.taxonomy_whid);
        } else {
          strScientificName = lstTSNs[0][1];
          lstTSNs = [lstTSNs[0][0]];
          lstTaxHierarchy = await lstGetFullHierarchy(lstTSNs, strDwTaxLevel, strScientificName, objDWdata);
          if(lstTaxHierarchy.length > 0){
            lstTaxHierarchy = lstTaxHierarchy[0] //TODO FIX THIS WORKAROUND
          } else {
            console.log('error: hierarchy length is zero: ', objDWdata.taxonomy_whid)
          }
          // mult hierarchy returns shouldnt happen here, nor should invalid names
          if(lstTaxHierarchy.length == 0 || lstTaxHierarchy[0] == 'invalid name'){
            console.log('hierarchy from new accepted tsn failed: ', objDWdata.taxonomy_whid)
            lstTaxHierarchy = [];
          }
        }
    } else if(lstTaxHierarchy.length == 1){
      lstTaxHierarchy = lstTaxHierarchy[0];
    } else if(lstTaxHierarchy.length == 0){
      // failed due to bad name
      // lstFailedDwIDs.push(objDWdata.taxonomy_whid);
      console.log('no hierarchies returned, other issue', objDWdata.taxonomy_whid);
    }
  }

  let strParentID: string = null;
  // if strTsn is == '', lstTaxHierarchy.length will be undefined and the loop won't iterate 
  // the hierarchy is already given from highest to lowest, so parent docs are always created first
  if(lstTaxHierarchy[0] == 'invalid name'){
    console.log()
  }
  for(let j = 0; j < lstTaxHierarchy.length; j++){
    // For taxonomy, an Id must be grabed ahead of time, due to taxonomyId and _id both existing. REVIEW.
    let strCouchID = await GenerateCouchID();
    if(objDWdata.taxonomy_whid == 50){
      console.log()
    }
    // get parent id, if exists
    if(lstTaxHierarchy[j].parentTsn){
      if(lstTaxHierarchy[j].parentTsn._text in dictTaxonomyByItisID){
        strParentID = dictTaxonomyByItisID[lstTaxHierarchy[j].parentTsn._text]._id;
      }
    }

    // if(objDWdata.taxonomy_whid == 50){
    //   console.log()
    // }

    let objNewTaxDocument: Taxonomy = {
      _id: strCouchID,
      type: 'taxonomy',
      taxonomyId: strCouchID,
      level: lstTaxHierarchy[j].rankName._text,
      taxonomyName: lstTaxHierarchy[j].taxonName._text,
      scientificName: lstTaxHierarchy[j].taxonName._text,
      parent: strParentID,
      // wcgopTallyShortCode: null,
      // pacfinNomCode: null,
      itisTSN: parseInt(lstTaxHierarchy[j].tsn._text),
      wormsAphiaId: null,
      isInactive: null,
  
      legacy: {
        wcgopSpeciesId: null,
        ashopSpeciesId: null,
        dwId: null
      }
    }

    // if(objNewTaxDocument.itisTSN == 166705){
    //   console.log()
    // }
    
    // if end of loop, then this is the level that was queried from the DW, set dw taxonomy info
    if(j == lstTaxHierarchy.length - 1){
      
      objNewTaxDocument.legacy.wcgopSpeciesId = objDWdata.observer_species_id,
      objNewTaxDocument.legacy.ashopSpeciesId = objDWdata.norpac_species_id,
      objNewTaxDocument.legacy.dwId = objDWdata.taxonomy_whid
      // objNewTaxDocument.pacfinNomCode = objDWdata.pacfin_nom_spid;
      objNewTaxDocument.wormsAphiaId = objDWdata.worms_aphiaid
    }

    let strDocID: string = null;
    let iItisID: number = objNewTaxDocument.itisTSN;

    let bNeedsUpdate: boolean = false;
    if(iItisID in dictTaxonomyByItisID){
      strDocID = dictTaxonomyByItisID[iItisID]._id;

      // if this is the level that was queried from the DW but it already has been created, then the dw taxonomy info must be added to doc and updated.
      if(j == lstTaxHierarchy.length - 1 && !(dictTaxonomyByItisID[iItisID].legacy.dwId)){
        bNeedsUpdate = true
        objNewTaxDocument._id = dictTaxonomyByItisID[iItisID]._id;
        objNewTaxDocument._rev = dictTaxonomyByItisID[iItisID]._rev;
      } else if (j == lstTaxHierarchy.length - 1 && objNewTaxDocument.legacy.dwId != null && dictTaxonomyByItisID[iItisID].legacy.dwId != objNewTaxDocument.legacy.dwId){
        console.log('two dwIds for same ITIS record: ', dictTaxonomyByItisID[iItisID].legacy.dwId, objNewTaxDocument.legacy.dwId)
      }
    }


    if(bNeedsUpdate){
      // if document needs to be updated with dw info
      strParentID = strDocID;
      await dbName.insert(objNewTaxDocument).then((data: any) => {
        strParentID = data.id;
        objNewTaxDocument._rev = data.rev
        dictTaxonomyByItisID[iItisID] = objNewTaxDocument;
      }).catch((error: any) => {
        console.log("insert failed", error, objNewTaxDocument);
      });

    } else if(strDocID != null) {
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

async function FlattenTaxonomyDocs(){

  const dbName = couchDB.use(CouchDBName);
  let lstUniqueLevels: string[] = [];
  let lstAllTaxDocs: Taxonomy[] = [];

  await dbName.view('Taxonomy', 'taxonomy-with-dwid', {
    'include_docs': true
  }).then((data: any) => {
    if (data.rows.length > 0){   
      for(let i = 0; i < data.rows.length; i++){
        lstAllTaxDocs.push(data.rows[i].doc);
      }   
    }
  }).catch((error: any) => {
    console.log(error);
  });

  let lstFlattenedDataset: any[] = [];
  let strParentID: string = lstAllTaxDocs[0].parent;

  let lstHeadings: any[] = Array(27);

  for(let key in dictTaxLevels){
    let iTaxLevel = dictTaxLevels[key];
    lstHeadings[iTaxLevel] = key.toLowerCase();
  }
  lstHeadings[25] = 'taxonomy_id';
  lstHeadings[26] = 'scientific_name';
  // lstFlattenedDataset.push(lstHeadings);


  for(let i = 0; i < lstAllTaxDocs.length; i++){
    if(lstAllTaxDocs[i].legacy.dwId == 607){
      console.log()
    }
    strParentID = lstAllTaxDocs[i].parent;
    let lstFlattenedRecord: any[] = Array(27);
    lstFlattenedRecord[25] = lstAllTaxDocs[i].legacy.dwId;
    let iTaxLevel = dictTaxLevels[lstAllTaxDocs[i].level];
    lstFlattenedRecord[iTaxLevel] = lstAllTaxDocs[i].taxonomyName;
    lstFlattenedRecord[26] = lstAllTaxDocs[i].taxonomyName;

    while(strParentID != null){
    
      let objParetDoc = await dbName.get(strParentID);
      if(objParetDoc.parent){
        strParentID = objParetDoc.parent
      } else {
        strParentID = null;
      }
      iTaxLevel = dictTaxLevels[objParetDoc.level];
      lstFlattenedRecord[iTaxLevel] = objParetDoc.taxonomyName;
    }
    lstFlattenedDataset.push(lstFlattenedRecord);

  }

  const createCsvWriter = await require('csv-writer').createArrayCsvWriter;
  const csvWriter = await createCsvWriter({
    header: lstHeadings,
    path: "C:\\Users\\Nicholas.Shaffer\\Desktop\\FlattenedCouchTaxonomy.csv"
  });

  csvWriter
    .writeRecords(lstFlattenedDataset)
    .then(()=> console.log('The CSV file was written successfully'));


  console.log(lstFlattenedDataset);

}

async function getAllUniqueLevels(){
  
  const dbName = couchDB.use(CouchDBName);
  let lstUniqueLevels: string[] = [];
  let lstAllTaxDocs: Taxonomy[] = [];

  await dbName.view('Taxonomy', 'taxonomy-by-itisTSN', {
    'include_docs': true
  }).then((data: any) => {
    if (data.rows.length > 0){   
      for(let i = 0; i < data.rows.length; i++){
        lstAllTaxDocs.push(data.rows[i].doc);
      }   
    }
  }).catch((error: any) => {
    console.log(error);
  });


  for(let i = 0; i < lstAllTaxDocs.length; i++){

    if(lstAllTaxDocs[i].level == 'Section'){
      // console.log(lstAllTaxDocs[i])
    }

    if(!(lstUniqueLevels.indexOf(lstAllTaxDocs[i].level) >= 0)){
      lstUniqueLevels.push(lstAllTaxDocs[i].level)
    }
  }

  for(let i = 0; i < lstUniqueLevels.length; i++){
    console.log(lstUniqueLevels[i]);
  }


}

async function getDwIDsForBadSearches(){
  let client = await WarehouseConnection();
  const dbName = couchDB.use(CouchDBName);
  let lstWarehouseTaxonomy = await client.query('SELECT * FROM dw.taxonomy_dim WHERE scientific_name IS NOT NULL');
  lstWarehouseTaxonomy = lstWarehouseTaxonomy.rows;
  await ReleasePostgres(client);


  let lstIDsOfVagueNames: number[] = [];
  
  console.log(new Date().toLocaleTimeString(), ' DW data returned, beginning calls to API');
  // console.log(new Date().toLocaleTimeString());

  for(let i = 0; i < lstWarehouseTaxonomy.length - 1; i++){
    let objDWdata: any = lstWarehouseTaxonomy[i];
    let strScientificName = objDWdata.scientific_name;
    let strTsn = await strGetItisTsnByScientificName(strScientificName, null);

    if(strTsn.length > 0){
      lstIDsOfVagueNames.push(objDWdata.taxonomy_whid);
      console.log(objDWdata.taxonomy_whid)
    }
  }

  // for(let i = 0; i < lstIDsOfVagueNames.length - 1; i++){
  //   console.log(lstIDsOfVagueNames[i]);
  // }


}


async function Initialize(){

  // await getItisData();
  await beginAsynchETL();
  await vMapTaxChildren();
  await FlattenTaxonomyDocs();
}

var dbName = couchDB.use(CouchDBName);


async function testSpecificInvalidNames(){

  let lstAllInvalidNames: string[] = ['Bathyraja taranetzi', 'Inopsetta ischyra', 'Symphurus atricauda', 'Percis japonicus', 'Bathylagus milleri', 'Bathylagus ochotensis', 'Thecopterus aleuticus', 'Hemilepidotus papilio', 'Triglops forficata', 'Rhamphocottus richardsoni', 'Eumicrotremus birulai', 'Liparis bristolense', 'Careproctus ovigerum', 'Lampanyctus ritteri', 'Lampanyctus regalis', 'Leptocephalus', 'Lumpenus medius', 'Lepidopus xantusi', 'Lycodapus grossidens', 'Sebastes dalli', 'Sebastomus', 'Gorgonacea', 'Paragorgia pacifica', 'Euplexaura marki', 'Stylatula gracile', 'Urticina crassicornis', 'Errinopora pourtalesi', 'Notostomobdella', 'Balanus evermanni', 'Balanus hesperius', 'Scalpellum cornutum', 'Crangon abyssorum', 'Crangon communis', 'Calastacus investigatoris', 'Callianassa goniophthalma', 'Callianassa californiensis', 'Aplacophora', 'Placiphorella pacifica', 'Leptochiton mesogonus', 'Euspira monterona', 'Colus hypolispus', 'Colus spitzbergensis', 'Colus halli', 'Volutopsius filosus', 'Volutopsius castaneus', 'Volutopsius simplex', 'Volutopsius stefanssoni', 'Beringius frielei', 'Beringius beringii', 'Neptunea phoenicia', 'Neptunea borealis', 'Neptunea stilesi', 'Neptunea magna', 'Plicifusus kroyeri', 'Plicifusus incisus', 'Plicifusus brunneus', 'Plicifusus verkruzeni', 'Volutopsius callorhinus', 'Plicifusus griseus', 'Mohnia robusta', 'Liomesus ooides', 'Boreotrophon muriciformis', 'Boreotrophon pacificus', 'Buccinum polare', 'Buccinum castaneum', 'Searlesia dira', 'Delectopecten randolphi', 'Panomya arctica', 'Nucula tenuis', 'Yoldia montereyensis', 'Yoldia thraciaeformis', 'Nuculana fossa', 'Nuculana buccata', 'Limopsis vaginata', 'Crenella seminuda', 'Tridonta rollandi', 'Kellia laperousii', 'Clinocardium funcanum', 'Saxidomus giganteus', 'Xylophaga californica', 'Pododesmus macroschisma', 'Pododesmus cepio', 'Evasterias troschelii', 'Diamphiodia occidentalis', 'Henricia multispina', 'Hippasteria kurilensis', 'Hippasteria armata', 'Cryptopeltaster lepidonotus', 'Asterina miniata', 'Lophaster vexator', 'Astropecten californicus', 'Brisingella pusilla', 'Brisingella exilis', 'Brisingella', 'Zoroaster evermanni', 'Strongylocentrotus echinoides', 'Brisaster townsendi', 'Stegophiura ponderosa', 'Ophiacantha diplasia', 'Cucumaria japonica', 'Parastichopus leukothele', 'Parastichopus californicus', 'Stichopus japonicus', 'Acoela', 'Priapula', 'Tunicata', 'Amaroucium', 'Maynea californica', 'Radulinus taylori', 'Hypsagonus mozinoi', 'Cymatogaster gracilis', 'Parastichopus parvimensis', 'Paelopatides confundus', 'Halocynthia igaboja', 'Cryptopeltaster', 'Inopsetta', 'Thecopterus', 'Tridonta', 'Eleutherozoa', 'Asterozoa', 'Cryptosyringida', 'Osteichthyes', 'Neopterygii', 'Ectoprocta', 'Palpata', 'Phyllodocida', 'Scolecida', 'Leptognathina', 'Neomeniomorpha', 'Neoloricata', 'Dendrochirotacea', 'Granulosina', 'Euhirudinea', 'Eugnathina', 'Pythonasteridae', 'Agnatha', 'Pogonophora', 'Lamellibrachiida', 'Lamellibrachiidae', 'Apodacea', 'Molpadiida', 'Aspidochirotacea', 'Aspidochirotida', 'Holocephalimorpha', 'Doryteuthis', 'Arctocephalinae', 'Haliotididae', 'Polychaeta'];

  for(let i = 0; i < lstAllInvalidNames.length; i++){
    
    lstAllInvalidNames[i] = lstAllInvalidNames[i].replace("  ", " ");
    let lstBadTsns = await strGetItisTsnByScientificName(lstAllInvalidNames[i], 'Animalia');

    if(lstBadTsns.length > 1){
      console.log('more than one tsn here: ', lstAllInvalidNames[i])
    } else {

      let strAcceptedTsn = await lstGetAcceptedTsns(lstBadTsns[0]);
      if (lstBadTsns[0][0] == strAcceptedTsn[0]){
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