import * as dbconnections from './../../dbconnections'
import { Taxonomy, CatchGrouping, CatchGroupingTypeName, TaxonomyAlias } from '../libs/bn-models';
import { getPacfinSpeciesTable } from '../TaxonomyToCouch/query-pacfin-species';
import { RetrieveEntireViewCouchDB, ExecuteOracleSQL } from '../TaxonomyAliases';
import { WarehouseConnection, ReleasePostgres, InsertBulkCouchDB, WcgopConnection } from '../TaxonomyToCouch';



var UploadedBy = 'nicholas.shaffer@noaa.gov';
var UploadedDate: any;
var CreatedBy = 'nicholas.shaffer@noaa.gov';
var CreatedDate: any;

var oracledb = require('oracledb');
var moment = require('moment');
const { Pool, Client } = require('pg')

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


function getLowestTaxonLevelName(dwTaxonObj: any) {
    // ugly function to "recursively" get the lowest grain level of the taxonomy for a given record
    // this is saved in the database record already for taxonomic items, however, 'non-std taxon' labeled items do not have this easy access but still hold taxon data

    if (dwTaxonObj.subspecies_82 != null) {
        return dwTaxonObj.subspecies_82;
    }
    else if (dwTaxonObj.species_80 != null) {
        return dwTaxonObj.species_80;
    }
    else if (dwTaxonObj.genus_70 != null) {
        return dwTaxonObj.genus_70;
    }
    else if (dwTaxonObj.tribe_60 != null) {
        return dwTaxonObj.tribe_60;
    }
    else if (dwTaxonObj.subfamily_52 != null) {
        return dwTaxonObj.subfamily_52;
    }
    else if (dwTaxonObj.family_50 != null) {
        return dwTaxonObj.family_50;
    }
    else if (dwTaxonObj.superfamily_48 != null) {
        return dwTaxonObj.superfamily_48;
    }
    else if (dwTaxonObj.infraorder_44 != null) {
        return dwTaxonObj.infraorder_44;
    }
    else if (dwTaxonObj.suborder_42 != null) {
        return dwTaxonObj.suborder_42;
    }
    else if (dwTaxonObj.order_40 != null) {
        return dwTaxonObj.order_40;
    }
    else if (dwTaxonObj.superorder_38 != null) {
        return dwTaxonObj.superorder_38;
    }
    else if (dwTaxonObj.infraclass_34 != null) {
        return dwTaxonObj.infraclass_34;
    }
    else if (dwTaxonObj.subclass_32 != null) {
        return dwTaxonObj.subclass_32;
    }
    else if (dwTaxonObj.class_30 != null) {
        return dwTaxonObj.class_30;
    }
    else if (dwTaxonObj.superclass_28 != null) {
        return dwTaxonObj.superclass_28;
    }
    else if (dwTaxonObj.subphylum_22 != null) {
        return dwTaxonObj.subphylum_22;
    }
    else if (dwTaxonObj.phylum_20 != null) {
        return dwTaxonObj.phylum_20;
    }
    else if (dwTaxonObj.kingdom_10 != null) {
        return dwTaxonObj.kingdom_10;
    }
    else {
        return null;
    }
}

async function PacfinCatchGroupingsETL() {
    // definitions pulled from meta-data pdf found publicly: 
    // nominal species: The term "nominal" implies that the market category, while ostensibly comprised of a single species, may actually be represented by additional species.
    // management groupings: PacFIN species management group after application of species proportions
    // complex: PacFIN species groupings after application of species proportions

    let pacfinSpeciesTable: string[][] = await getPacfinSpeciesTable();
    let dictTaxonomyByScientificName: { [id: string]: any; } = {};
    let dictTaxonomyAliasByTaxonID: { [id: string]: any; } = {};
    let docsToBeInserted: CatchGrouping[] = [];
    let allTaxonomyDocs: Taxonomy[] = await RetrieveEntireViewCouchDB('Taxonomy', 'taxonomy-by-scientific-name');
    let allTaxonomyAliasScientificNames: TaxonomyAlias[] = await RetrieveEntireViewCouchDB('Taxonomy', 'taxonomy-alias-scientific-name-by-taxonomy-id');
    let uniqueManagementCodes: string[] = [];

    for (let i = 0; i < allTaxonomyDocs.length; i++) {
        dictTaxonomyByScientificName[allTaxonomyDocs[i].scientificName.toLowerCase()] = allTaxonomyDocs[i];
    }

    for (let i = 0; i < allTaxonomyAliasScientificNames.length; i++) {
        dictTaxonomyAliasByTaxonID[allTaxonomyAliasScientificNames[i].taxonomy._id] = allTaxonomyAliasScientificNames[i];
    }

    for (let i = 0; i < pacfinSpeciesTable.length; i++) {
        let speciesCode: string = pacfinSpeciesTable[i][0]
        let commonName: string = pacfinSpeciesTable[i][1];
        let scientificName: string = pacfinSpeciesTable[i][2];
        let managementGroupCode: string = pacfinSpeciesTable[i][3];
        let complex: string = pacfinSpeciesTable[i][4];

        if (commonName.includes('NOM.')) {

            let membersOfGroup: TaxonomyAlias[] = null;
            if (scientificName == 'N/A') {
                membersOfGroup = null;
            } else {
                scientificName = scientificName.replace('SPP.', '').trim().toLowerCase();
                if (scientificName in dictTaxonomyByScientificName) {
                    let taxonomyID: string = dictTaxonomyByScientificName[scientificName]._id;
                    let taxonomyAlias: TaxonomyAlias = dictTaxonomyAliasByTaxonID[taxonomyID];
                    membersOfGroup = [taxonomyAlias];
                }
            }

            let newCatchGrouping: CatchGrouping = {
                type: CatchGroupingTypeName,
                createdBy: CreatedBy,
                createdDate: CreatedDate,
                uploadedBy: UploadedBy,
                uploadedDate: UploadedDate,
                code: speciesCode,
                name: commonName,
                members: membersOfGroup, // todo, remove spp. and search taxonomy, or if n/a leave blank
                definition: 'Pacfin nominal grouping.',
            }
            docsToBeInserted.push(newCatchGrouping);
        }
        else if (commonName.includes("UNSP.") || commonName == 'THORNYHEADS (MIXED)' || commonName == 'FLOUNDERS (NO FSOL)') {
            // logic to deal with unspecified species records
            let membersOfGroup: TaxonomyAlias[] = null;

            if (scientificName == 'N/A') {
                membersOfGroup = null;
            } else {
                scientificName = scientificName.replace('SPP.', '').trim().toLowerCase();
                if (scientificName in dictTaxonomyByScientificName) {
                    let taxonomyID: string = dictTaxonomyByScientificName[scientificName]._id;
                    let taxonomyAlias: TaxonomyAlias = dictTaxonomyAliasByTaxonID[taxonomyID];
                    membersOfGroup = [taxonomyAlias];
                }
            }

            let newCatchGrouping: CatchGrouping = {
                type: CatchGroupingTypeName,
                createdBy: CreatedBy,
                createdDate: CreatedDate,
                uploadedBy: UploadedBy,
                uploadedDate: UploadedDate,
                code: speciesCode,
                name: commonName,
                members: membersOfGroup, // todo, remove spp. and search taxonomy, or if n/a leave blank
                definition: 'Pacfin "unspecified" item groupings.',
            }
            docsToBeInserted.push(newCatchGrouping);
        }
        else if (commonName.includes("__")) {
            // logic to deal with high level groups (ie: "_ALL ROCKFISH")
            // side note: a few select items will have the same common and scientific name, but different management groupings            
            let membersOfGroup: TaxonomyAlias[] = null;

            if (scientificName == 'N/A') {
                membersOfGroup = null;
            } else {
                scientificName = scientificName.replace('SPP.', '').trim().toLowerCase();
                if (scientificName in dictTaxonomyByScientificName) {
                    let taxonomyID: string = dictTaxonomyByScientificName[scientificName]._id;
                    let taxonomyAlias: TaxonomyAlias = dictTaxonomyAliasByTaxonID[taxonomyID];
                    membersOfGroup = [taxonomyAlias];
                }
            }

            let newCatchGrouping: CatchGrouping = {
                type: CatchGroupingTypeName,
                createdBy: CreatedBy,
                createdDate: CreatedDate,
                uploadedBy: UploadedBy,
                uploadedDate: UploadedDate,
                code: speciesCode,
                name: commonName,
                members: membersOfGroup, // todo, remove spp. and search taxonomy, or if n/a leave blank
                definition: 'Pacfin misc/high level grouping. Management code = ' + managementGroupCode,
            }
            docsToBeInserted.push(newCatchGrouping);
        }
        else if (commonName.includes("+")) {
            // logic to deal with finite number of specific species mentioned (ie: "SHORTRAKER+ROUGHEYE")
            let membersOfGroup: TaxonomyAlias[] = null;

            if (scientificName == 'N/A') {
                membersOfGroup = null;
            } else {
                scientificName = scientificName.replace('SPP.', '').trim().toLowerCase();
                if (scientificName in dictTaxonomyByScientificName) {
                    let taxonomyID: string = dictTaxonomyByScientificName[scientificName]._id;
                    let taxonomyAlias: TaxonomyAlias = dictTaxonomyAliasByTaxonID[taxonomyID];
                    membersOfGroup = [taxonomyAlias];
                }
            }

            let newCatchGrouping: CatchGrouping = {
                type: CatchGroupingTypeName,
                createdBy: CreatedBy,
                createdDate: CreatedDate,
                uploadedBy: UploadedBy,
                uploadedDate: UploadedDate,
                code: speciesCode,
                name: commonName,
                members: membersOfGroup, // todo, remove spp. and search taxonomy, or if n/a leave blank
                definition: 'Pacfin multiple finite number of specific species. Management code = ' + managementGroupCode,
            }
            docsToBeInserted.push(newCatchGrouping);
        }

        // todo: management group codes and complex codes
    }

    await InsertBulkCouchDB(docsToBeInserted);

    // let newCatchGrouping: CatchGrouping = {}


}
async function WarehouseCatchGroupingsETL() {
    // mostly any item that has a clear and obvious reference to multiple species in its name/record, ie: "(fish1 / fish2)"
    // this is partly hard coded to grab the edge cases to deal with

    let dictTaxonomyByScientificName: { [id: string]: any; } = {};
    let dictTaxonomyAliasByTaxonID: { [id: string]: any; } = {};
    let docsToBeInserted: CatchGrouping[] = [];
    let allTaxonomyDocs: Taxonomy[] = await RetrieveEntireViewCouchDB('Taxonomy', 'taxonomy-by-scientific-name');
    let allTaxonomyAliasScientificNames: TaxonomyAlias[] = await RetrieveEntireViewCouchDB('Taxonomy', 'taxonomy-alias-scientific-name-by-taxonomy-id');

    for (let i = 0; i < allTaxonomyDocs.length; i++) {
        dictTaxonomyByScientificName[allTaxonomyDocs[i].scientificName.toLowerCase()] = allTaxonomyDocs[i];
    }
    for (let i = 0; i < allTaxonomyAliasScientificNames.length; i++) {
        dictTaxonomyAliasByTaxonID[allTaxonomyAliasScientificNames[i].taxonomy._id] = allTaxonomyAliasScientificNames[i];
    }

    // sebastes items:
    let sebastesIDs = '(7271, 7272, 7270, 6460, 6249, 7269, 2170, 7218, 7220, 2172, 7219)';
    let client = await WarehouseConnection();
    let dwTaxonomyData = await client.query('SELECT * FROM dw.taxonomy_dim WHERE taxonomy_whid IN ' + sebastesIDs);
    dwTaxonomyData = dwTaxonomyData.rows;
    await ReleasePostgres(client);

    for (let i = 0; i < dwTaxonomyData.length; i++) {

        let membersOfGroup: TaxonomyAlias[] = [];

        if (dwTaxonomyData[i].species_80 == null) {
            membersOfGroup = [dictTaxonomyByScientificName['sebastes']];
        } else {
            let memberNames: string[] = dwTaxonomyData[i].species_80.replace('sp. (', '').replace(')', '').toLowerCase().split(' / ')
            for (let j = 0; j < memberNames.length; j++) {
                let tempScientificName = ('sebastes ' + memberNames[j]).toLowerCase()
                if (tempScientificName in dictTaxonomyByScientificName) {
                    let taxonomyID: string = dictTaxonomyByScientificName[tempScientificName]._id;
                    let taxonomyAlias: TaxonomyAlias = dictTaxonomyAliasByTaxonID[taxonomyID];
                    membersOfGroup.push(taxonomyAlias);
                } else {
                    console.log('error, scientific name "sebastes ' + memberNames[j] + '" is not in couch taxonomy');
                }
            }
        }

        let newCatchGrouping: CatchGrouping = {
            type: CatchGroupingTypeName,
            createdBy: CreatedBy,
            createdDate: CreatedDate,
            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,
            code: dwTaxonomyData[i].taxonomy_whid,
            name: dwTaxonomyData[i].common_name,
            members: membersOfGroup,
            definition: 'Data warehouse specific sebastes (rockfish) items.',
        }
        docsToBeInserted.push(newCatchGrouping);
    }

    // unidentified items
    client = await WarehouseConnection();
    dwTaxonomyData = await client.query("SELECT * FROM dw.taxonomy_dim WHERE lower(common_name) like '%unid%' and scientific_name_taxonomic_level = 'non-std taxon' AND taxonomy_whid NOT IN (7270, 7271)");
    dwTaxonomyData = dwTaxonomyData.rows;
    await ReleasePostgres(client);

    for (let i = 0; i < dwTaxonomyData.length; i++) {
        let lowestGrainTaxonName: string = getLowestTaxonLevelName(dwTaxonomyData[i]);
        let membersOfGroup: TaxonomyAlias[] = null;
        if (lowestGrainTaxonName != null && lowestGrainTaxonName.toLowerCase() in dictTaxonomyByScientificName) {
            let taxonomyID: string = dictTaxonomyByScientificName[lowestGrainTaxonName.toLowerCase()]._id;
            let taxonomyAlias: TaxonomyAlias = dictTaxonomyAliasByTaxonID[taxonomyID];
            membersOfGroup = [taxonomyAlias];
        } else {
            console.log('error unhandled: lowest grain name of ' + lowestGrainTaxonName + ' doesnt exist in couch');
        }

        let newCatchGrouping: CatchGrouping = {
            type: CatchGroupingTypeName,
            createdBy: CreatedBy,
            createdDate: CreatedDate,
            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,
            code: dwTaxonomyData[i].taxonomy_whid,
            name: dwTaxonomyData[i].common_name,
            members: membersOfGroup,
            definition: 'Data warehouse unidentified item.',
        }
        docsToBeInserted.push(newCatchGrouping);
    }

    // possible edge cases to deal with manually: 
    // Beringraja/Raja
    // Pholidae/Stichaeidae
    // Clupeidae/Osmeridae

    await InsertBulkCouchDB(docsToBeInserted);
    // edge cases:
    // unsorted shab
    // 
}

async function WcgopCatchGroupingsETL() {
    // data parsed from catch categories / species catch categories 
    let dictTaxonomyByWcgopID: { [id: string]: any; } = {};
    let dictTaxonomyAliasByTaxonID: { [id: string]: any; } = {};
    let docsToBeInserted: CatchGrouping[] = [];
    let allTaxonomyDocs: Taxonomy[] = await RetrieveEntireViewCouchDB('Taxonomy', 'taxonomy-by-wcgop-id');
    let allTaxonomyAliasScientificNames: TaxonomyAlias[] = await RetrieveEntireViewCouchDB('Taxonomy', 'taxonomy-alias-scientific-name-by-taxonomy-id');
    let connWcgop = await WcgopConnection();
    let catchCategoryRecords = await ExecuteOracleSQL(connWcgop, 'SELECT CATCH_CATEGORY_ID, CATCH_CATEGORY_NAME, CATCH_CATEGORY_CODE FROM OBSPROD.CATCH_CATEGORIES')

    for (let i = 0; i < allTaxonomyDocs.length; i++) {
        dictTaxonomyByWcgopID[allTaxonomyDocs[i].legacy.wcgopSpeciesId] = allTaxonomyDocs[i];
    }
    for (let i = 0; i < allTaxonomyAliasScientificNames.length; i++) {
        dictTaxonomyAliasByTaxonID[allTaxonomyAliasScientificNames[i].taxonomy._id] = allTaxonomyAliasScientificNames[i];
    }

    for (let i = 0; i < catchCategoryRecords.length; i++) {
        let catchCategoryID: number = catchCategoryRecords[i][0];
        let catchCategoryName: string = catchCategoryRecords[i][1];
        let catchCategoryCode: string = catchCategoryRecords[i][2];
        let membersOfGroup: TaxonomyAlias[] = [];
        let speciesCatchCategoryRecords = await ExecuteOracleSQL(connWcgop, 'SELECT CATCH_CATEGORY_ID, SPECIES_ID, SPECIES_CATCH_CATEGORY_ID FROM OBSPROD.SPECIES_CATCH_CATEGORIES WHERE CATCH_CATEGORY_ID = ' + catchCategoryID.toString())

        for (let j = 0; j < speciesCatchCategoryRecords.length; j++) {
            let speciesID: number = speciesCatchCategoryRecords[j][1];
            if (speciesID in dictTaxonomyByWcgopID) {
                let taxonomyID = dictTaxonomyByWcgopID[speciesID]._id;
                let taxonomyAlias: TaxonomyAlias = dictTaxonomyAliasByTaxonID[taxonomyID];
                membersOfGroup.push(taxonomyAlias)
            } else {
                console.log('error: species id not in couch taxonomy, wcgop id = ' + speciesID);
            }
        }

        let newCatchGrouping: CatchGrouping = {
            type: CatchGroupingTypeName,
            createdBy: CreatedBy,
            createdDate: CreatedDate,
            uploadedBy: UploadedBy,
            uploadedDate: UploadedDate,
            code: catchCategoryCode,
            name: catchCategoryName,
            members: membersOfGroup,
            definition: 'Wcgop catch category',

            legacy: {
                wcgopCatchCategoryCode: catchCategoryCode
            }
        }
        docsToBeInserted.push(newCatchGrouping);
    }
    await InsertBulkCouchDB(docsToBeInserted);

}

async function AshopCatchGroupingsETL() {


    // non-prohibited species code groupings 


    // prohibited species code groupings


}

async function OtherCatchGroupings() {
    // catch all function for hardcoded catch grouping items not found in databases


}




export async function CatchGroupingsETL() {
    await PacfinCatchGroupingsETL();
    await WarehouseCatchGroupingsETL();
    await WcgopCatchGroupingsETL();
}


