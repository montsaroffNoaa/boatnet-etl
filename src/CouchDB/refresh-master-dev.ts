import { RetrieveEntireViewCouchDB, RemoveEverything, RemoveAllFromView, WcgopConnection, ConvertToMomentIso8601, ExecuteOracleSQL, ReleaseOracle } from "../Common/common-functions";
import { couchDB, couchConnection } from "../Common/db-connection-variables";
import moment = require("moment");



async function RefreshMasterDev() {

    try {

        let newDocs: any[] = [];

        let masterDevTEMP = couchDB.use('master-dev-temp');
        // newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('obs-web', 'all_em_efp'));
        // newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('obs-web', 'all_observer_activities'));
        // newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('obs-web', 'all_ots_targets'));
        // newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('obs-web', 'all_permits'));
        // newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('obs-web', 'all_us_states'));
        // newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('obs-web', 'efp_type_options'));
        // newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('obs-web', 'all_em_hardware'));
        // newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('obs-web', 'all_thrird_party_reviewers'));

        // melina stuff
        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('LookupDocs', 'boatnet-config-lookup'));
        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('LookupDocs', 'non-fishing-day-reason-code'));
        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('LookupDocs', 'non-flow-scale-reason'));
        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('LookupDocs', 'tribal-delivery-reason-code'));

        // sara stuff
        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('OLEDeclarations', 'all_ole_vessels'));

        // seth stuff
        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('Backups', 'Obs-Web - all_em_efp'));
        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('Backups', 'Obs-Web - all_em_hardware'));
        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('Backups', 'Obs-Web - all_observer_activities'));
        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('Backups', 'Obs-Web - all_ots_targets'));
        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('Backups', 'Obs-Web - all_phone_number_types'));
        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('Backups', 'Obs-Web - all_third_party_reviewers'));
        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('Backups', 'Obs-Web - all_us_states'));
        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('Backups', 'Obs-Web - efp_type_options'));
        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('Backups', 'Obs-Web - vessel_permissions'));
        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('Backups', 'boatnet-config-lookup'));
        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('Backups', 'model_definition'));

        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('TripsApi', 'all_api_catch'));
        newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('TripsApi', 'all_api_trips'));


        let designDocs = []
        let designDoc;

        designDocs.push(await couchConnection.get('_design/Extra'))
        // designDocs.push(await dbName.get('_design/dataAccess'))
        // designDocs.push(await dbName.get('_design/melina'))  
        designDocs.push(await couchConnection.get('_design/obs_web'))
        designDocs.push(await couchConnection.get('_design/optecs_trawl'))
        designDocs.push(await couchConnection.get('_design/TripsApi'))
        designDocs.push(await couchConnection.get('_design/Backups'))
        designDocs.push(await couchConnection.get('_design/OLEDeclarations'))
        // designDocs.push(await dbName.get('_design/sethtest'))
        designDocs.push(await couchConnection.get('_design/validation'))
        // designDocs.push(await dbName.get('_design/0fbf818efb2cdc16d08510331f6087501d7ab0e7'))
        // designDocs.push(await dbName.get('_design/3d1a704ee913c1a0de17313ccb901b2be055ed05'))
        // designDocs.push(await dbName.get('_design/dataAccess'))
        // designDocs.push(await dbName.get('_design/f575a27912830c4e209263e501bb60f415955e58'))
        // designDocs.push(await dbName.get('_design/fc2984d9ce2fd1c30f3f3d4b041e10d095dd8e8c'))

        newDocs = newDocs.concat(designDocs);

        for (let i = 0; i < newDocs.length; i++) {
            delete newDocs[i]._rev
        }


        // designDocs = dbName.get('_design/replication_filters')

        console.log()
        await masterDevTEMP.bulk({ docs: newDocs }).then((body: any) => {
            console.log(body);
        });

    } catch (error) {
        console.log(error)

    }

}



async function ReplaceMissingItems() {

    let masterDev = couchDB.use('master-dev');
    let newDocs: any[] = [];
    let docsToDelete: any[] = [];

    newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('current_lookups_obs_web', 'all_fisheries'));
    newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('current_lookups_obs_web', 'all_phone_number_types'));
    newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('current_lookups_obs_web', 'ots-target-types'));

    newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('current_lookups_obs_web', 'all_em_hardware'));
    newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('current_lookups_obs_web', 'all_ots_targets'));
    newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('current_lookups_obs_web', 'all_third_party_reviewers'));
    newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('current_lookups_obs_web', 'all_us_states'));
    newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('current_lookups_obs_web', 'efp-type-options'));
    newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('obs-web', 'all_observer_activities'));
    newDocs = newDocs.concat(await RetrieveEntireViewCouchDB('obs-web', 'all_permits'));

    docsToDelete = docsToDelete.concat(await RetrieveEntireViewCouchDB('current_lookups_obs_web', 'all_em_hardware'));
    docsToDelete = docsToDelete.concat(await RetrieveEntireViewCouchDB('current_lookups_obs_web', 'all_ots_targets'));
    docsToDelete = docsToDelete.concat(await RetrieveEntireViewCouchDB('current_lookups_obs_web', 'all_third_party_reviewers'));
    docsToDelete = docsToDelete.concat(await RetrieveEntireViewCouchDB('current_lookups_obs_web', 'all_us_states'));
    docsToDelete = docsToDelete.concat(await RetrieveEntireViewCouchDB('current_lookups_obs_web', 'efp-type-options'));
    docsToDelete = docsToDelete.concat(await RetrieveEntireViewCouchDB('obs-web', 'all_observer_activities'));
    docsToDelete = docsToDelete.concat(await RetrieveEntireViewCouchDB('obs-web', 'all_permits'));


    for (let i = 0; i < newDocs.length; i++) {
        delete newDocs[i]._rev
        delete newDocs[i]._id
    }

    for (let i = 0; i < docsToDelete.length; i++) {
        docsToDelete[i]._deleted = true;
    }


    console.log();

    await masterDev.bulk({ docs: newDocs }).then((body: any) => {
        console.log(body);
    });

    await masterDev.bulk({ docs: docsToDelete }).then((body: any) => {
        console.log(body);
    });


}

async function RefreshNonLegacyPersonDocs() {
    let masterDev = couchDB.use('master-dev');
    let newDocs = await RetrieveEntireViewCouchDB('PersonDocs', 'non-legacy-person-docs');

    for (let i = 0; i < newDocs.length; i++) {
        delete newDocs[i]._rev
        delete newDocs[i]._id
    }

    console.log();

    await masterDev.bulk({ docs: newDocs }).then((body: any) => {
        console.log(body);
    });

}



// RefreshNonLegacyPersonDocs();


// ReplaceMissingItems();


// RefreshMasterDev()

// RemoveAllFromView('ET', 'all-docs');



async function AddEmptyCommonNameArrayToTaxonomyAliases(){
    let lstDocsToUpdate: any[] = [];
    await couchConnection.view('Taxonomy', 'taxonomy-by-itistsn', {
        'include_docs': true
    }).then((data: any) => {
        if (data.rows.length > 0) {
            for (let i = 0; i < data.rows.length; i++) {
                if(!(data.rows[i].doc)){
                    let updatedDoc = data.rows[i].doc;
                    updatedDoc.commonNames = [];
                    lstDocsToUpdate.push(updatedDoc);
                }
            }
        }
    }).catch((error: any) => {
        console.log(error);
    });

    console.log();
    
    await couchConnection.bulk({ docs: lstDocsToUpdate }).then((body: any) => {
        console.log(body);
    }).catch((error: any) => {
        console.log(error);
    });;
}

// AddEmptyCommonNameArrayToTaxonomyAliases();



async function testDatesOfOracleToCouch(){

    let wcgopConn = await WcgopConnection();

    let sql = 'SELECT TRIP_ID, RETURN_DATE FROM OBSPROD.TRIPS WHERE TRIPS.TRIP_ID = 39303'

    let returnedData = await ExecuteOracleSQL(wcgopConn, sql);
    returnedData = returnedData[0];
    let returnDate = returnedData[1];

    console.log(returnDate);
    // console.log(ConvertToMomentIso8601(returnDate));
    console.log(moment(returnDate));
    // console.log(moment(returnDate).format());
    console.log(moment(returnDate, moment.ISO_8601));
    // console.log(moment(returnDate, moment.ISO_8601).format());

    // console.log();
    // console.log(ConvertToMomentIso8601(returnDate));



    await ReleaseOracle(wcgopConn);

}


// testDatesOfOracleToCouch();













