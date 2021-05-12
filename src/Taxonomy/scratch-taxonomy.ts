import { Taxonomy } from "@boatnet/bn-models/lib";

const CouchUser = '';
const CouchPass = '';
const CouchHost = '';
const CouchPort = '';

var couchurl: string = "https://" + CouchUser + ":" + CouchPass + "@" + CouchHost + ":" + CouchPort
const couchDB = require('nano')({
    url: couchurl,
    requestDefaults: {
        pool: {
            maxSockets: Infinity
        }
    }
});

const dbName = couchDB.use('insert db name here');

var dictTaxLevels: { [id: string]: any; } = {};

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

}

async function FlattenTaxonomyDocs() {
    await FillLocalDictionaries();

    let uniqueLevels: string[] = [];
    let allTaxDocs: Taxonomy[] = [];

    await dbName.view('Taxonomy', 'taxonomy-by-itistsn', {
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
    let headerRow: any[] = Array(28);
    let iNewTaxonomyID: number = 100000;

    for (let key in dictTaxLevels) {
        let iTaxLevel = dictTaxLevels[key];
        headerRow[iTaxLevel] = key.toLowerCase();
    }
    headerRow[25] = 'taxonomy_id';
    headerRow[26] = 'scientific_name';
    headerRow[27] = 'itis_tsn';
    // lstFlattenedDataset.push(lstHeadings);

    for (let i = 0; i < allTaxDocs.length; i++) {

        // If/else uses largely the same logic but slight differences based on if the taxon document has a 1:1 record in the data warehouse
        if (allTaxDocs[i].legacy.dwId) {
            for (let j = 0; j < allTaxDocs[i].legacy.dwId.length; j++) {

                strParentID = allTaxDocs[i].parent;
                let flattenedRecord: any[] = Array(27);
                flattenedRecord[25] = allTaxDocs[i].legacy.dwId[j];
                let iTaxLevel: number = dictTaxLevels[allTaxDocs[i].level];
                flattenedRecord[iTaxLevel] = allTaxDocs[i].taxonomyName;
                flattenedRecord[26] = allTaxDocs[i].taxonomyName;
                flattenedRecord[27] = allTaxDocs[i].itisTSN;

                // makes calls to parent taxon document until top of hierarchy is reached
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

            // makes calls to parent taxon document until top of hierarchy is reached
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
        header: headerRow,
        path: "insert path here"
    });

    csvWriter
        .writeRecords(flattenedDataset)
        .then(() => console.log('The CSV file was written successfully'));

    console.log(flattenedDataset);
}

//   FlattenTaxonomyDocs();
