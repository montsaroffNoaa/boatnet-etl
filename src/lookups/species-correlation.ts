import { ExecuteOracleSQL, WcgopConnection, ReleaseOracle, InsertBulkCouchDB } from '../Common/common-functions';

async function fetchFromSpeciesCorrelation() {
    let odb = await WcgopConnection();
    let fetchSQL = 'select * from species_correlation';
    let species_correlation = await ExecuteOracleSQL(odb, fetchSQL);

    let species_correlation_couch: any = [];
    let resultIds = [];

    for (let species of species_correlation) {
        species_correlation_couch.push({
            type: 'phlb-length-weight-conversion',
            speciesCorrelationId: species[0],
            speciesId: species[1],
            length: species[2],
            weight: species[3],
            createdDate: species[4]
        })
    }
    resultIds = await InsertBulkCouchDB(species_correlation_couch);
    console.log('results')
    console.log(resultIds)
    console.log(resultIds.length)
    await ReleaseOracle(odb);
}

fetchFromSpeciesCorrelation();