var moment = require('moment');
import * as WebRequest from 'web-request';
import { PacfinSpeciesETL } from './query-pacfin-species';
import { TaxonomyAliasETL } from './taxonomy-alias-etl';
import { CatchGroupingsETL } from '../CatchGroupings/catch-groupings-etl';
import { couchConnection } from '../Common/db-connection-variables';
import { ReplaceAll, InsertBulkCouchDB, ReleasePostgres, GenerateCouchID, WarehouseConnectionClient, sleep } from '../Common/common-functions';
import { Taxonomy } from '@boatnet/bn-models/lib';

// Setting this process var to "0" is extremely unsafe in most situations, use with care.
// It is unsafe because Node does not like self signed TLS (SSL) certificates, 
// this setting disables Node's rejection of invalid or unauthorized certificates, and allows them.
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
// console.log('CouchDB connection configured successfully.');

var dictTaxLevels: { [id: string]: any; } = {};
var dictTaxonomyByItisID: { [id: number]: any; } = {};
var dictDwTaxLevelNames: { [id: string]: any; } = {};

function FillLocalDictionaries() {

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
}

async function FetchAllDocs(Key: number | string, ViewName: string, DesignName: string) {
  let strDocID;
  let strDocRev;
  let Document;
  let AllDocs: any[] = [];

  await couchConnection.view(DesignName, ViewName, {
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
      },
      "catch-grouping-by-catch-category-id": {
        "map": "function (doc) {\r\n  if (doc.type == 'catch-grouping' && doc.legacy.wcgopCatchCategoryId) { \r\n    emit(doc.legacy.wcgopCatchCategoryId, null);\r\n  }\r\n}"
      }





    },
    "language": "javascript"
  }

  await couchConnection.get('_design/LookupDocs').then((body: any) => {
    LookupDocs._rev = body._rev;
  }).catch((error: any) => {
    // Ignore if document does not exist
  });


  await couchConnection.insert(LookupDocs).then((data: any) => {
    console.log(data)
  }).catch((error: any) => {
    console.log("update failed", error, LookupDocs);
  });

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

  let lstAllTaxDocs: Taxonomy[] = [];
  let lstUpdatedDocs: Taxonomy[] = [];

  // get all docs
  await couchConnection.view('Taxonomy', 'taxonomy-by-itisTSN', {
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

  let lstDocs: any = [];

  await couchConnection.view('Taxonomy', 'taxonomy-by-itisTSN', {
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
  let client = await WarehouseConnectionClient();
  let lstWarehouseTaxonomy = await client.query('SELECT * FROM dw.taxonomy_dim WHERE scientific_name IS NOT NULL ORDER BY taxonomy_whid');
  lstWarehouseTaxonomy = lstWarehouseTaxonomy.rows;
  await ReleasePostgres(client);

  console.log(new Date().toLocaleTimeString(), ' DW data returned, beginning calls to API');

  for (let i = 0; i < lstWarehouseTaxonomy.length; i++) {
    let objDWdata: any = lstWarehouseTaxonomy[i];
    // if(objDWdata.taxonomy_whid == 7247){
    await sleep(1000);
    getItisDataAsynchonously(objDWdata).catch((error: any) => {
      console.log(error);
    });
    // }
  }
  return 1;
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
        await couchConnection.insert(objNewTaxDocument).then((data: any) => {
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
        await couchConnection.insert(objNewTaxDocument).then((data: any) => {
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

  await FillLocalDictionaries();

  let uniqueLevels: string[] = [];
  let allTaxDocs: Taxonomy[] = [];

  await couchConnection.view('Taxonomy', 'taxonomy-by-itistsn', {
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
          let objParetDoc = await couchConnection.get(strParentID);
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
        let objParetDoc = await couchConnection.get(strParentID);
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

  let lstUniqueLevels: string[] = [];
  let lstAllTaxDocs: Taxonomy[] = [];

  await couchConnection.view('Taxonomy', 'taxonomy-by-itisTSN', {
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
  let client = await WarehouseConnectionClient();
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
  await couchConnection.view('Taxonomy', 'taxonomy-with-dwid', {
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

  // itis_tsn on left, observer id on right
  let obsprodItems: [string, number][] = [
    ['612597', 10717],
    ['174634', 10715],
    ['174673', 10703],
    ['176735', 10709]
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
        await couchConnection.insert(newTaxDocument).then((data: any) => {
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
        await couchConnection.insert(newTaxDocument).then((data: any) => {
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


export async function InitializeAllTaxonomyETL() {
  // overall this whole process takes a little over an hour
  FillLocalDictionaries();
  console.log(new Date().toLocaleTimeString(), ' Initializing full taxonomy ETL.');
  await BeginAsynchETL(); // this step will take and hour  so, largest percentage of this entire process
  console.log(new Date().toLocaleTimeString(), ' Finished warehouse ETL, getting missing observer items.');
  await addMissingObserverIDs();
  await getObserverItemsNotInWarehouse();
  console.log(new Date().toLocaleTimeString(), ' Finished incorporating missing obvserver items, beginning incorporation of pacfin species.');
  await PacfinSpeciesETL();
  console.log(new Date().toLocaleTimeString(), ' Finished pacfin incorporation, beginning parent/child mapping of taxonomy hierarchies.');
  await MapTaxChildren();
  console.log(new Date().toLocaleTimeString(), ' Finished parent/child mapping, beginning ETL of aliases.');
  await TaxonomyAliasETL();
  console.log(new Date().toLocaleTimeString(), ' Finished ETL of aliases, beginning ETL of catch-groupings.');
  await CatchGroupingsETL();
  console.log(new Date().toLocaleTimeString(), ' Finished ETL of catch-grpupings, flattening taxonomy documents.');
  await FlattenTaxonomyDocs();
  console.log(new Date().toLocaleTimeString(), ' Finished taxonomy flattening, full ETL successful.');
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

// random dev/test stuff
// testSpecificInvalidNames();
// lstGetAcceptedTsns('154451');
// getAllUniqueLevels();
// getDwIDsForBadSearches();
// vTestViews();
// FlattenTaxonomyDocs();
// lstGetFullHierarchy(['162635'], 'species', 'Lampanyctus ritteri')

// InitializeAllTaxonomyETL();


function comparedata() {
  let source = [644717,
    644687,
    168822,
    170289,
    172510,
    162214,
    170303,
    171335,
    171345,
    171337,
    171553,
    171611,
    162527,
    172565,
    170426,
    6622318,
    162247,
    162244,
    622321,
    162279,
    553188,
    162274,
    173414,
    172482,
    96970,
    154520,
    68422,
    155054,
    52308,
    48739,
    98420,
    98421,
    97921,
    97957,
    174466,
    174476,
    166402,
    174513,
    174515,
    554378,
    554379,
    174532,
    174536,
    174543,
    174553,
    174554,
    174619,
    174713,
    174982,
    175160,
    175161,
    175153,
    714757,
    176445,
    176568,
    176790,
    176802,
    176845,
    176875,
    176824,
    176808,
    176814,
    176885,
    176967,
    176984,
    176973,
    176978,
    176974,
    657623,
    177029,
    177032,
    176967,
    176996,
    177023,
    176998,
    174371,
    174371,
    202423,
    202423,
    161030,
    202423,
    179916,
    73975,
    73989,
    71294,
    74302,
    72619,
    72712,
    74786,
    74053,
    74778,
    567936,
    74047,
    73753,
    73737,
    73777,
    73728,
    656331,
    73726,
    73977,
    73990,
    73986,
    74007,
    73996,
    73881,
    74049,
    74059,
    74061,
    205081,
    567381,
    73018,
    73892,
    73895,
    73893,
    73893,
    73913,
    73912,
    73901,
    75203,
    74036,
    73330,
    655966,
    73772,
    73754,
    73331,
    73335,
    567439,
    566970,
    73975,
    74026,
    72601,
    170287,
    162212,
    644691,
    162463,
    162565,
    567574,
    174371,
    95599,
    97934,
    98427,
    98429,
    98428,
    97936,
    98665,
    660179,
    98422,
    97937,
    97951,
    98675,
    97935,
    97919,
    97774,
    97942,
    97946,
    98431,
    98430,
    156862,
    157359,
    157325,
    98663,
    157062,
    78156,
    46861,
    156755,
    82338,
    79118,
    69459,
    97931,
    914163,
    92120,
    69459,
    51483,
    69459,
    98423,
    97947,
    98419,
    157821,
    158140,
    159484,
    158854,
    78807,
    204927,
    97162,
    98427,
    89433,
    98677,
    82367,
    82438,
    914192,
    158541,
    914166,
    52485,
    83545,
    159498,
    52348,
    64360,
    82589,
    82586,
    160610,
    159916,
    160181,
    54678,
    160620,
    159910,
    159988,
    160424,
    96106,
    96979,
    96995,
    621110,
    98996,
    159697,
    160208,
    159753,
    159819,
    159699,
    165332,
    165334,
    165427,
    649753,
    96993,
    160935,
    160939,
    160849,
    160939,
    160942,
    160806,
    160806,
    564114,
    160833,
    160848,
    160851,
    160854,
    160937,
    160937,
    161015,
    172702,
    172932,
    172930,
    172875,
    172879,
    172978,
    172901,
    172887,
    172921,
    172919,
    172866,
    172871,
    172868,
    173077,
    172864,
    172928,
    172892,
    172924,
    172923,
    616058,
    616392,
    172917,
    172743,
    172714,
    172716,
    172907,
    172862,
    172893,
    172860,
    172911,
    172876,
    172913,
    172861,
    616064,
    172860,
    160717,
    167221,
    167413,
    159907,
    160928,
    564248,
    564249,
    564264,
    564262,
    564263,
    649715,
    564124,
    160846,
    160928,
    172389,
    172412,
    161030,
    934083,
    164711,
    167123,
    167120,
    171659,
    164792,
    168586,
    164708,
    164719,
    164673,
    164706,
    167125,
    550672,
    164670,
    164701,
    164692,
    161974,
    161976,
    161980,
    161977,
    161979,
    161975,
    161989,
    201900,
    162000,
    161064,
    161067,
    170919,
    170945,
    170951,
    170949,
    170947,
    164807,
    165267,
    165215,
    165265,
    165269,
    165219,
    165261,
    164856,
    165006,
    550588,
    165253,
    165258,
    165214,
    630999,
    631029,
    165260,
    172580,
    168731,
    168584,
    171663,
    166092,
    166094,
    166108,
    625294,
    166326,
    166704,
    166707,
    166733,
    166735,
    166744,
    166719,
    166727,
    166706,
    166710,
    166723,
    166711,
    166715,
    166738,
    166717,
    166734,
    166716,
    166730,
    166721,
    166725,
    166728,
    166737,
    166720,
    166740,
    166742,
    166736,
    166722,
    166712,
    166713,
    166741,
    166732,
    644604,
    166729,
    166708,
    166770,
    166709,
    166743,
    166763,
    166761,
    166749,
    166748,
    166758,
    166760,
    166757,
    166726,
    166705,
    166714,
    166731,
    166705,
    166705,
    166782,
    166783,
    166785,
    166784,
    643715,
    166705,
    166705,
    166753,
    166705,
    167108,
    167113,
    167110,
    167111,
    167112,
    167305,
    167318,
    167312,
    643429,
    167265,
    167287,
    167293,
    167292,
    167315,
    167318,
    167279,
    644643,
    167220,
    167283,
    167304,
    167267,
    167193,
    167280,
    167281,
    167347,
    167291,
    167276,
    167329,
    167225,
    167226,
    167414,
    167275,
    167302,
    167369,
    167374,
    167269,
    167367,
    167189,
    171632,
    167271,
    167190,
    167368,
    167384,
    167187,
    167311,
    167426,
    643895,
    644358,
    643719,
    167434,
    167445,
    1674448,
    167450,
    167428,
    643726,
    167467,
    167449,
    167436,
    167456,
    167273,
    167371,
    167268,
    555701,
    167488,
    167568,
    167571,
    167513,
    167557,
    167587,
    167556,
    167575,
    167561,
    167529,
    82538,
    167483,
    167543,
    167485,
    167541,
    162785,
    169237,
    161612,
    161624,
    161619,
    166339,
    161700,
    162051,
    162028,
    167116,
    162035,
    162041,
    161702,
    165609,
    166341,
    162305,
    161828,
    551209,
    162048,
    162030,
    161729,
    623625,
    162053,
    162068,
    162080,
    162098,
    162057,
    162101,
    162099,
    182875,
    162303,
    551136,
    172378,
    171672,
    644719,
    162550,
    162548,
    164655,
    164653,
    164625,
    164631,
    162163,
    162632,
    162575,
    162584,
    162664,
    162673,
    162633,
    164414,
    166356,
    171554,
    171583,
    171596,
    171603,
    171576,
    171594,
    171580,
    171572,
    553223,
    171612,
    553189,
    622320,
    162080,
    166152,
    175081,
    176893,
    554127,
    177008,
    174471,
    176890,
    175420,
    176574,
    176839,
    177938,
    179167,
    177013,
    174999,
    174469,
    175185,
    179725,
    177019,
    176982,
    175042,
    176605,
    174548,
    174625,
    175599,
    175149,
    179191,
    174482,
    554378,
    179526,
    177020,
    176564,
    176656,
    174628,
    175147,
    176794,
    176832,
    175613,
    174569,
    177898,
    175074,
    179814,
    175590,
    554029,
    176793,
    174725,
    175604,
    176792,
    176830,
    176830,
    174728,
    176659,
    179091,
    179538,
    176571,
    176866,
    176816,
    177935,
    178660,
    177896,
    176697,
    660062,
    176967,
    176479,
    174983,
    714011,
    823970,
    175280,
    572771,
    176967,
    177854,
    178265,
    174619,
    175299,
    174371,
    179839,
    176568,
    176967,
    179122,
    179455,
    176817,
    177021,
    178973,
    175163,
    178483,
    172419,
    718925,
    52839,
    52079,
    51940,
    52016,
    161996,
    172398,
    202423,
    166133,
    172422]


  let taxon_test = [46861,
    48739,
    51483,
    51940,
    52016,
    52016,
    52308,
    52348,
    52485,
    52839,
    64360,
    69459,
    71294,
    72601,
    72619,
    72712,
    73018,
    73330,
    73331,
    73335,
    73726,
    73728,
    73737,
    73753,
    73754,
    73772,
    73777,
    73892,
    73895,
    73901,
    73913,
    73975,
    73977,
    73977,
    73986,
    73989,
    73990,
    73996,
    74007,
    74026,
    74049,
    74059,
    74302,
    74778,
    74786,
    75203,
    78156,
    78807,
    79118,
    82338,
    82367,
    82438,
    82538,
    82586,
    82589,
    83545,
    89433,
    92120,
    95599,
    96106,
    96970,
    96979,
    96993,
    96995,
    97162,
    97774,
    97919,
    97921,
    97931,
    97934,
    97935,
    97936,
    97937,
    97942,
    97946,
    97947,
    97951,
    97957,
    98419,
    98420,
    98421,
    98422,
    98423,
    98427,
    98428,
    98429,
    98430,
    98431,
    98663,
    98665,
    98675,
    98996,
    154520,
    155054,
    156755,
    156862,
    157062,
    157325,
    157359,
    157821,
    158140,
    158140,
    158541,
    158854,
    159484,
    159498,
    159697,
    159753,
    159819,
    159907,
    159910,
    159916,
    159988,
    160181,
    160208,
    160424,
    160610,
    160620,
    160806,
    160833,
    160846,
    160848,
    160849,
    160851,
    160854,
    160928,
    160935,
    160937,
    160939,
    160942,
    161015,
    161064,
    161067,
    161612,
    161619,
    161624,
    161700,
    161702,
    161729,
    161828,
    161974,
    161975,
    161976,
    161977,
    161979,
    161980,
    161989,
    161996,
    162000,
    162028,
    162030,
    162035,
    162041,
    162048,
    162051,
    162053,
    162057,
    162068,
    162080,
    660062,
    162098,
    162099,
    162101,
    162163,
    162212,
    162214,
    162244,
    162247,
    162274,
    162279,
    162303,
    162303,
    162305,
    162463,
    162527,
    162548,
    162550,
    162565,
    162575,
    162584,
    162632,
    162633,
    162664,
    162673,
    162785,
    164414,
    164625,
    164631,
    164653,
    164655,
    164670,
    164673,
    164692,
    164701,
    164706,
    164708,
    164711,
    164719,
    164792,
    164807,
    164856,
    165006,
    165214,
    165215,
    165219,
    165253,
    165258,
    165260,
    165261,
    165265,
    165267,
    165269,
    165332,
    165334,
    165427,
    165609,
    166092,
    166094,
    166108,
    166133,
    166152,
    166326,
    166339,
    166341,
    166356,
    166402,
    166704,
    166705,
    166705,
    166706,
    166707,
    166708,
    166709,
    166710,
    166711,
    166712,
    166713,
    166714,
    166715,
    166716,
    166717,
    166719,
    166720,
    166721,
    166722,
    166723,
    166725,
    166726,
    166727,
    166728,
    166729,
    166730,
    166731,
    166732,
    166733,
    166734,
    166735,
    166736,
    166737,
    166738,
    166740,
    166741,
    166742,
    166743,
    166744,
    166748,
    166749,
    166753,
    166757,
    166758,
    166760,
    166761,
    166763,
    166770,
    166782,
    166783,
    166784,
    166785,
    167108,
    167110,
    167111,
    167112,
    167113,
    167116,
    167120,
    167123,
    167125,
    167187,
    167189,
    167190,
    167193,
    167220,
    167221,
    167225,
    167226,
    167265,
    167267,
    167268,
    167269,
    167271,
    167273,
    167275,
    167276,
    167279,
    167280,
    167283,
    167287,
    167291,
    167292,
    167293,
    167302,
    167304,
    167305,
    167311,
    167312,
    167315,
    167318,
    167329,
    167347,
    167367,
    167368,
    167369,
    167371,
    167374,
    167384,
    167413,
    167414,
    167426,
    167428,
    167434,
    167436,
    167445,
    167449,
    167450,
    167456,
    167467,
    167483,
    167485,
    167488,
    167513,
    167529,
    167541,
    167543,
    167556,
    167557,
    167561,
    167568,
    167571,
    167575,
    167587,
    168584,
    168586,
    168731,
    168822,
    169237,
    170287,
    170289,
    170303,
    170426,
    170919,
    170945,
    170947,
    170949,
    170951,
    171335,
    171337,
    171345,
    171553,
    171554,
    171572,
    171576,
    171580,
    171583,
    171594,
    171596,
    171603,
    171612,
    171632,
    171659,
    171663,
    171672,
    172378,
    172389,
    172398,
    172412,
    172419,
    172482,
    172510,
    172565,
    172580,
    172702,
    172714,
    172716,
    172743,
    172860,
    172861,
    172862,
    172864,
    172866,
    172868,
    172871,
    172875,
    172876,
    172879,
    172887,
    172892,
    172893,
    172901,
    172907,
    172911,
    172913,
    172917,
    172919,
    172921,
    172923,
    172924,
    172928,
    172930,
    172932,
    172978,
    173414,
    174371,
    174466,
    174469,
    174471,
    174476,
    174482,
    174513,
    174532,
    174536,
    174543,
    174548,
    174553,
    174554,
    174569,
    174619,
    174625,
    174628,
    174713,
    174725,
    174728,
    174982,
    174983,
    174999,
    175042,
    175074,
    175081,
    175147,
    175149,
    175153,
    175160,
    175161,
    175163,
    175185,
    175280,
    175420,
    175590,
    175599,
    175604,
    175613,
    176445,
    176479,
    176564,
    176568,
    176571,
    176605,
    176656,
    176659,
    176697,
    176790,
    176792,
    176793,
    176794,
    176802,
    176802,
    176808,
    176814,
    176816,
    176817,
    176824,
    176830,
    176832,
    176845,
    176866,
    176875,
    176885,
    176890,
    176967,
    176973,
    176974,
    176978,
    176982,
    176984,
    176996,
    176998,
    177008,
    177013,
    177019,
    177020,
    177021,
    177023,
    177029,
    177032,
    177854,
    177898,
    177935,
    177938,
    178265,
    178483,
    178660,
    179091,
    179122,
    179167,
    179455,
    179526,
    179538,
    179725,
    179814,
    179839,
    179916,
    182875,
    201900,
    202423,
    205081,
    550588,
    550672,
    551136,
    551209,
    553188,
    553189,
    553223,
    554029,
    554127,
    554378,
    554379,
    555701,
    564114,
    564124,
    564248,
    564249,
    564262,
    564263,
    564264,
    566970,
    567381,
    567439,
    567574,
    567574,
    567936,
    616058,
    616064,
    616392,
    621110,
    622320,
    622321,
    623625,
    625294,
    630999,
    631029,
    643429,
    643715,
    643895,
    644358,
    644604,
    644643,
    644687,
    644691,
    644717,
    644719,
    649753,
    660179,
    714011,
    718925,
    823970,
    914163,
    934083]


  for (let i = 0; i < source.length; i++){
    if (!(taxon_test.includes(source[i]))){
      console.log(source[i])
    }
  }

}


// comparedata();





