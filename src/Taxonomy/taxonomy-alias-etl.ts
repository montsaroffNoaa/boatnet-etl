

var moment = require('moment');
import * as WebRequest from 'web-request';
import { getPacfinSpeciesTable } from './query-pacfin-species';
import { WarehouseConnectionPool, RetrieveEntireViewCouchDB, AshopConnection, ExecuteOracleSQL, WcgopConnection, ReleaseOracle, InsertBulkCouchDB } from '../Common/common-functions';
import { CreatedBy, UploadedBy } from '../Common/common-variables';
import { Taxonomy, TaxonomyAlias, TaxonomyAliasTypeName } from '../../../boatnet/libs/bn-models/models';

// Setting this process var to "0" is extremely unsafe in most situations, use with care.
// It is unsafe because Node does not like self signed TLS (SSL) certificates, 
// this setting disables Node's rejection of invalid or unauthorized certificates, and allows them.
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
// console.log('CouchDB connection configured successfully.');

var dictTaxLevels: { [id: string]: any; } = {};
var dictTaxonomyByItisID: { [id: number]: any; } = {};
var dictDwTaxLevelNames: { [id: string]: any; } = {};
var dictPacfinSpecies: { [id: string]: any; } = {};

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

async function FillPacfinSpeciesDictionary() {
  let pacfinSpeciesTable = await getPacfinSpeciesTable();
  for (let i = 0; i < pacfinSpeciesTable.length; i++) {
    let speciesCode: string = pacfinSpeciesTable[i][0]
    dictPacfinSpecies[speciesCode] = pacfinSpeciesTable[i];
  }

}

async function BeginAsynchETL() {
  //   await CreateViews();
  let WarehousePool: any = await WarehouseConnectionPool();
  let lstAllTaxDocs: Taxonomy[] = await RetrieveEntireViewCouchDB('Taxonomy', 'taxonomy-by-itisTSN');
  let connWcgop = await WcgopConnection();
  let connAshop = await AshopConnection();
  await FillPacfinSpeciesDictionary();
  let lstAllPromises: any[] = []
  // let teststring = await ExecuteOracleSQL(connWcgop, 'SELECT * FROM OBSPROD.SPECIES where ROWNUM < 2')
  // await ReleaseOracle(connWcgop);
  console.log(new Date().toLocaleTimeString(), ' Connections to databases made, beginning creation of aliases in Couch');

  for (let i = 0; i < lstAllTaxDocs.length; i++) {
    try {
      let objTaxonomyDoc: Taxonomy = lstAllTaxDocs[i];
      // await sleep(100);
      lstAllPromises.push(EtlAliases(objTaxonomyDoc, WarehousePool, connWcgop, connAshop).catch((error: any) => {
        console.log(error);
      }));
    } catch (error) {
      console.log(error);
    }
  }

  await Promise.all(lstAllPromises);
  await ReleaseOracle(connWcgop);
  await ReleaseOracle(connAshop);
  console.log(new Date().toLocaleTimeString(), ' All alias documents created and connections released.');

}

async function EtlAliases(objTaxonomyDoc: Taxonomy, connWarehouse: any, connWcgop: any, connAshop: any) {

  let bAshop: boolean = false;
  let bWcgop: boolean = false;
  let bHakeSurvey: boolean = false;
  let bHookAndLineSurvey: boolean = false;
  let bTrawlSurvey: boolean = false;

  let lstAllNewTaxAliasDocs: TaxonomyAlias[] = [];
  // get warehouse common name
  if (objTaxonomyDoc.legacy.dwId) {
    for (let i = 0; i < objTaxonomyDoc.legacy.dwId.length; i++) {
      let client: any;
      let objTaxNames: any;
      try {
        client = await connWarehouse.connect();
        let strSQL: string = 'SELECT scientific_name, common_name, trawl_survey_species_id, hookandline_species_id, acoustics_species_id FROM dw.taxonomy_dim WHERE taxonomy_whid = ' + objTaxonomyDoc.legacy.dwId[i].toString();
        objTaxNames = await client.query(strSQL);
      } catch (error) {
        console.log(error);
      } finally {
        client.release();
      }

      if (objTaxNames.rows[0].trawl_survey_species_id || objTaxNames.rows[0].hookandline_species_id || objTaxNames.rows[0].acoustics_species_id) {
        bHakeSurvey = true;
        bHookAndLineSurvey = true;
        bTrawlSurvey = true;
      }

      if (objTaxNames.rows[0].common_name && objTaxNames.rows[0].common_name != objTaxNames.rows[0].scientific_name) {
        let newTaxAlias: TaxonomyAlias = {
          type: TaxonomyAliasTypeName,
          createdBy: CreatedBy,
          createdDate: null,
          uploadedBy: UploadedBy,
          uploadedDate: null,

          taxonomy: objTaxonomyDoc,
          alias: objTaxNames.rows[0].common_name,
          aliasType: 'common name',
          isAshop: null,
          isWcgop: null,
          isHakeSurvey: bHakeSurvey,
          isHookAndLineSurvey: bHookAndLineSurvey,
          isTrawlSurvey: bTrawlSurvey
        }
        lstAllNewTaxAliasDocs.push(newTaxAlias);
      } else {
        // console.log('no common name: dwId = ', objTaxonomyDoc.legacy.dwId[i]);
      }
    }
  }

  // get wcgop common name
  if (objTaxonomyDoc.legacy.wcgopSpeciesId) {
    let strSQL: string = 'SELECT COMMON_NAME, SCIENTIFIC_NAME, RACE_CODE, PACFIN_CODE, SPECIES_CODE FROM OBSPROD.SPECIES WHERE SPECIES_ID = ' + objTaxonomyDoc.legacy.wcgopSpeciesId;
    let lstSpeciesRecord = await ExecuteOracleSQL(connWcgop, strSQL);
    lstSpeciesRecord = lstSpeciesRecord[0];
    bWcgop = true;

    if (lstSpeciesRecord[0] != lstSpeciesRecord[1]) {
      let newTaxAlias: TaxonomyAlias = {
        type: TaxonomyAliasTypeName,
        createdBy: CreatedBy,
        createdDate: null,
        uploadedBy: UploadedBy,
        uploadedDate: null,

        taxonomy: objTaxonomyDoc,
        alias: lstSpeciesRecord[0],
        aliasType: 'common name',
        isAshop: null,
        isWcgop: bWcgop,
        isHakeSurvey: null,
        isHookAndLineSurvey: null,
        isTrawlSurvey: null
      }
      lstAllNewTaxAliasDocs.push(newTaxAlias);
    }
  }

  // get ashop common name
  if (objTaxonomyDoc.legacy.ashopSpeciesId) {

    let strSQL: string = 'SELECT COMMON_NAME, SCIENTIFIC_NAME, ITIS_CODE FROM NORPAC.ATL_LOV_SPECIES_CODE WHERE SPECIES_CODE = ' + objTaxonomyDoc.legacy.ashopSpeciesId.toString();
    let lstSpeciesRecord = await ExecuteOracleSQL(connAshop, strSQL);
    lstSpeciesRecord = lstSpeciesRecord[0]
    bAshop = true;
    if (lstSpeciesRecord[2] != objTaxonomyDoc.itisTSN) {
      // console.log("error: itis tsn in couch doesn't match tsn in norpac. DwId = " + objTaxonomyDoc.legacy.dwId.toString(), " norpac code = " + objTaxonomyDoc.legacy.ashopSpeciesId.toString());
      // console.log("https://www.itis.gov/ITISWebService/services/ITISService/getFullHierarchyFromTSN?tsn=" + lstSpeciesRecord[2]);
    }

    if (lstSpeciesRecord[0] != lstSpeciesRecord[1]) {
      let newTaxAlias: TaxonomyAlias = {
        type: TaxonomyAliasTypeName,
        createdBy: CreatedBy,
        createdDate: null,
        uploadedBy: UploadedBy,
        uploadedDate: null,

        taxonomy: objTaxonomyDoc,
        alias: lstSpeciesRecord[0],
        aliasType: 'common name',
        isAshop: bAshop,
        isWcgop: null,
        isHakeSurvey: null,
        isHookAndLineSurvey: null,
        isTrawlSurvey: null
      }
      lstAllNewTaxAliasDocs.push(newTaxAlias);
    }
  }

  if (objTaxonomyDoc.pacfinSpeciesCode) {

    let speciesRecord: string[] = dictPacfinSpecies[objTaxonomyDoc.pacfinSpeciesCode];
    let newTaxAlias: TaxonomyAlias = {
      type: TaxonomyAliasTypeName,
      createdBy: CreatedBy,
      createdDate: null,
      uploadedBy: UploadedBy,
      uploadedDate: null,

      taxonomy: objTaxonomyDoc,
      alias: speciesRecord[1],
      aliasType: 'common name',
      isAshop: null,
      isWcgop: null,
      isHakeSurvey: null,
      isHookAndLineSurvey: null,
      isTrawlSurvey: null,
      isPacfin: true
    }
    lstAllNewTaxAliasDocs.push(newTaxAlias);

  }

  // get scientific name from taxonomy document
  let newTaxAlias: TaxonomyAlias = {
    type: TaxonomyAliasTypeName,
    createdBy: CreatedBy,
    createdDate: null,
    uploadedBy: UploadedBy,
    uploadedDate: null,

    taxonomy: objTaxonomyDoc,
    alias: objTaxonomyDoc.scientificName,
    aliasType: 'scientific name',
    isAshop: bAshop,
    isWcgop: bWcgop,
    isHakeSurvey: bHakeSurvey,
    isHookAndLineSurvey: bHookAndLineSurvey,
    isTrawlSurvey: bTrawlSurvey
  }
  lstAllNewTaxAliasDocs.push(newTaxAlias);

  await InsertBulkCouchDB(lstAllNewTaxAliasDocs);
}

export async function TaxonomyAliasETL() {
  FillLocalDictionaries();
  await BeginAsynchETL();
}

