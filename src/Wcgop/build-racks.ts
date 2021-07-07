import { ExecuteOracleSQL, ReleaseOracle, InsertBulkCouchDB, WcgopConnection, GetDocFromDict } from '../Common/common-functions';
import { Rack, RackType } from '@boatnet/bn-models/lib';
import { dictObservers } from "./wcgop-etl";
import { filter, get } from 'lodash';
import { couchConnection } from '../Common/db-connection-variables';

async function BuildRacks() {
    let odb = await WcgopConnection();
    let oracleRacks = await ExecuteOracleSQL(odb, `Select * from racks`);
    let racks: Rack[] = [];

    let locations: any[] = [];
    let species: any[] = [];
    let dissections: any[] = [];

    await couchConnection.view('obs_web', 'wcgop-lookups', {
        'key': 'bs-location',
        'include_docs': true
    }).then((data: any) => {
        locations = data.rows;
    });

    await couchConnection.view('Taxonomy', 'taxonomy-alias-by-wcgop-id', {
        'include_docs': true
    }).then((data: any) => {
        species = data.rows;
    });

    await couchConnection.view('obs_web', 'wcgop-lookups', {
        key: 'biostructure-type',
        'include_docs': true
    }).then((data: any) => {
        dissections = data.rows;
    })

    for (let i = 0; i < oracleRacks.length; i++) {
        const currRack = oracleRacks[i];

        let createdBy = await GetDocFromDict(dictObservers, currRack[7], 'observers-by-userid', 'wcgop');
        let modifiedBy = await GetDocFromDict(dictObservers, currRack[9], 'observers-by-userid', 'wcgop');
        const loc: any = filter(locations, { value: currRack[3] });
        let spec: any = filter(species, { key: currRack[4]});
        const dissection: any = filter(dissections, { value: currRack[2] });

        let specInfo: any = {};
        let dissect: any = {};

        if (spec[0]) {
            specInfo = {
                _id: get(spec[0], 'doc._id'),
                commonNames: get(spec[0], 'doc.commonNames'),
                wcgopSpeciesId: get(spec[0], 'doc.taxonomy.legacy.wcgopSpeciesId')
            }
        }
        dissect = {
            _id: get(dissection[0], 'doc._id'),
            description: get(dissection[0], 'doc.description'),
            lookupVal: get(dissection[0], 'doc.lookupValue'),
        }

        const newRack: Rack = {
            type: RackType,
            rackId: currRack[0],
            rackName: currRack[1],
            dissectionType: dissect,
            rackLocation: loc[0].doc,
            speciesId: spec[0] ? specInfo : currRack[4],
            rackColumns: currRack[5],
            rackRows: currRack[6],
            createdDate: currRack[8],
            createdBy: get(createdBy, 'firstName', '') + ' ' + get(createdBy, 'lastName', ''),
            updatedDate: currRack[10],
            updatedBy: get(modifiedBy, 'firstName', '') + ' ' + get(modifiedBy, 'lastName', ''),
        }
        racks.push(newRack);
    }

    await ReleaseOracle(odb);
    const r = await InsertBulkCouchDB(racks);
    console.log(r)
}

BuildRacks();


async function DeleteAllRacks() {
    let locations: any[] = [];
    await couchConnection.view('obs_web', 'rack', {
        'include_docs': true
    }).then((data: any) => {
        for (let i = 0; i < data.rows.length; i++) {
            const currDoc: any = data.rows[i].doc;
            currDoc._deleted = true;
            locations.push(currDoc)
        }
    });
    await couchConnection.bulk({ docs: locations });
}

async function InsertBSLocationLookups() {
    let odb = await WcgopConnection();
    let oracleRacks = await ExecuteOracleSQL(odb, `select * from lookups where lookup_type='BS_LOCATIONS'`);
    let racks: Rack[] = [];

    for (let i = 0; i < oracleRacks.length; i++) {
        const currRack = oracleRacks[i];

        const newRack: Rack = {
            type: 'bs-location',
            lookupValue: currRack[2],
            description: currRack[3],
            createdBy: currRack[4],
            createdDate: currRack[5],
            updatedBy: currRack[6],
            updatedDate: currRack[7],
            isActive: true, 
            isWcgop: true
        }
        racks.push(newRack);
    }

    await ReleaseOracle(odb);
    const r = await InsertBulkCouchDB(racks);
}
