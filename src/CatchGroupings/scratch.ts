import { CatchGrouping } from "@boatnet/bn-models/lib";
import { InsertBulkCouchDB } from "../Common/common-functions";


let newGroupings: any[] = [

    //wcgop ones
{
    type: 'catch-grouping',
    name: 'Brachyura/Anomura',
    members: [{
        "_id": "3d83f643207b459498c792605ef981d7",
        "_rev": "2-567e759cc31fe55c02ddc7a4edbd59b2",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605ef981d7",
        "level": "Infraorder",
        "taxonomyName": "Brachyura",
        "scientificName": "Brachyura",
        "parent": "3d83f643207b459498c792605ed679c1",
        "itisTSN": 98276,
        "wormsAphiaId": 106673,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": null,
          "ashopSpeciesId": null,
          "dwId": [
            995
          ]
        },
        "children": [
          "3bc91f904fea9979442fd59935602e11",
          "3bc91f904fea9979442fd599356131c7",
          "3bc91f904fea9979442fd5993561ba98",
          "3bc91f904fea9979442fd59935621d0e",
          "3d83f643207b459498c792605ef9e259",
          "3d83f643207b459498c792605efc6ed4",
          "3d83f643207b459498c792605efce9df",
          "3d83f643207b459498c792605efd8727",
          "3d83f643207b459498c792605efe282a"
        ]
      },
      {
        "_id": "3bde698df7af02fdb273e1f5ae054cd9",
        "_rev": "2-3ea4a80024d781694d10e6eac1d703b7",
        "type": "taxonomy",
        "taxonomyId": "3bde698df7af02fdb273e1f5ae054cd9",
        "level": "Infraorder",
        "taxonomyName": "Anomura",
        "scientificName": "Anomura",
        "parent": "3d83f643207b459498c792605ed679c1",
        "itisTSN": 97698,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": null,
          "ashopSpeciesId": null,
          "dwId": [
            1020
          ]
        },
        "children": [
          "3bde698df7af02fdb273e1f5ae05b1ef",
          "3bde698df7af02fdb273e1f5ae1f8199",
          "3bde698df7af02fdb273e1f5ae2192d5"
        ]
      }
    
    ],
    definition: 'Crab Unid',
    isWcgop: true,

    legacy: {
        wcgopSpeciesId: 10073
    }
},

{
    type: 'catch-grouping',
    name: 'Percichthyidae/Serranidae',
    members: [{
        "_id": "3bc91f904fea9979442fd599353625f0",
        "_rev": "1-8a8a882b531b6e3ff02b6551263b8a81",
        "type": "taxonomy",
        "taxonomyId": "3bc91f904fea9979442fd599353625f0",
        "level": "Family",
        "taxonomyName": "Percichthyidae",
        "scientificName": "Percichthyidae",
        "parent": "4fa0ab1f2ccf04160ab89da3e3bb664d",
        "itisTSN": 170315,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": null,
          "ashopSpeciesId": null,
          "dwId": [
            1984
          ]
        }
      },{
        "_id": "4fa0ab1f2ccf04160ab89da3e3f1d322",
        "_rev": "3-f0a418386c73b48820ba015a11b9549a",
        "type": "taxonomy",
        "taxonomyId": "3bc91f904fea9979442fd59935368aa7",
        "level": "Family",
        "taxonomyName": "Serranidae",
        "scientificName": "Serranidae",
        "parent": "4fa0ab1f2ccf04160ab89da3e3bb664d",
        "itisTSN": 167674,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": null,
          "ashopSpeciesId": null,
          "dwId": [
            1985
          ]
        },
        "children": [
          "3bc91f904fea9979442fd59935370d59",
          "3bc91f904fea9979442fd59935782ac8",
          "4fa0ab1f2ccf04160ab89da3e3f1d864"
        ]
      }
    
    ],
    definition: 'Bass Unid',
    isWcgop: true,

    legacy: {
        wcgopSpeciesId: 10029
    }
},

{
    type: 'catch-grouping',
    name: 'Sebastes Shortraker/Rougheye/Blackspotted',
    members: [{
        "_id": "3d83f643207b459498c792605e9ac6d0",
        "_rev": "2-a2fb97153f5f7eb42a94c621e3a4c1a8",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605e9ac6d0",
        "level": "Species",
        "taxonomyName": "Sebastes borealis",
        "scientificName": "Sebastes borealis",
        "parent": "3d83f643207b459498c792605e7fff41",
        "itisTSN": 166712,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": 10254,
          "ashopSpeciesId": 326,
          "dwId": [
            695
          ]
        },
        "pacfinSpeciesCode": "SRKR"
      },{
        "_id": "3d83f643207b459498c792605e80f140",
        "_rev": "2-d9b6db13089d40099447db08c478ea33",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605e80f140",
        "level": "Species",
        "taxonomyName": "Sebastes aleutianus",
        "scientificName": "Sebastes aleutianus",
        "parent": "3d83f643207b459498c792605e7fff41",
        "itisTSN": 166706,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": 10490,
          "ashopSpeciesId": 307,
          "dwId": [
            638
          ]
        },
        "pacfinSpeciesCode": "REYE"
      }
    
    ],
    definition: 'Shortraker/Rougheye/Blackspotted Rockfish',
    isWcgop: true,

    legacy: {
        wcgopSpeciesId: 10427
    }
},






//ashop one

{
    type: 'catch-grouping',
    name: 'ETMOPTERUS SPP, EUPROTOMICRUS SPP',
    members: [{
        "_id": "59f2882e24d117a1b1083dc9a132ef9a",
        "type": "taxonomy",
        "level": "Genus",
        "taxonomyName": "Etmopterus",
        "scientificName": "Etmopterus",
        "parent": "4fa0ab1f2ccf04160ab89da3e37ee17c",
        "itisTSN": 160654,
        "isAshop": true,
        "children": [
        ]
      },{
        "_id": "59f2882e24d117a1b1083dc9a13367ec",
        "_rev": "1-ef571b67d0b5a4229e87eb32e4b15d09",
        "type": "taxonomy",
        "taxonomyId": "59f2882e24d117a1b1083dc9a13367ec",
        "level": "Genus",
        "taxonomyName": "Euprotomicrus",
        "scientificName": "Euprotomicrus",
        "parent": "59f2882e24d117a1b1083dc9a13349a2",
        "itisTSN": 160717,
        "wormsAphiaId": null,
        "isInactive": null,
        "children": []
      }
    
    ],
    definition: 'PYGMY SHARK',
    isAshop: true,

    legacy: {
        ashopSpeciesId: 10029
    }
},


//warehouse ones


{
    type: 'catch-grouping',
    name: 'Brisaster spp/Brissopsis pacifica unident.',
    members: [{
        "_id": "3bde698df7af02fdb273e1f5aedb075c",
        "_rev": "2-963302ae4a0a1521630ec0bda36bbe8d",
        "type": "taxonomy",
        "taxonomyId": "3bde698df7af02fdb273e1f5aedb075c",
        "level": "Genus",
        "taxonomyName": "Brisaster",
        "scientificName": "Brisaster",
        "parent": "3bde698df7af02fdb273e1f5aedafd9c",
        "itisTSN": 158079,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": null,
          "ashopSpeciesId": null,
          "dwId": [
            1666
          ]
        },
        "children": [
          "3bde698df7af02fdb273e1f5aedb6bfb"
        ]
      },{
        "_id": "3bde698df7af02fdb273e1f5aedc90eb",
        "_rev": "1-06f021e8185f58b3af27853057f62551",
        "type": "taxonomy",
        "taxonomyId": "3bde698df7af02fdb273e1f5aedc90eb",
        "level": "Species",
        "taxonomyName": "Brissopsis pacifica",
        "scientificName": "Brissopsis pacifica",
        "parent": "3bde698df7af02fdb273e1f5aedc8b01",
        "itisTSN": 158113,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": null,
          "ashopSpeciesId": null,
          "dwId": [
            1672
          ]
        }
      }
    
    ],
    definition: 'Brisaster spp/Brissopsis pacifica unident.',

    legacy: {
        "dwId": [
            2147
        ]
      },
},
{
    type: 'catch-grouping',
    name: 'Heteropod/Pteropod unident.',
    members: ['not in couch'],
    definition: 'Heteropod/Pteropod unident.',

    legacy: {
        "dwId": [
            2154
        ]
      },
},



{
    type: 'catch-grouping',
    name: 'Sebastes sp. (miniatus / crocotulus)',
    members: [{
        "_id": "3d83f643207b459498c792605e8f9119",
        "_rev": "2-8c69ef7c77061d1d35893e9a5aeed96a",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605e8f9119",
        "level": "Species",
        "taxonomyName": "Sebastes miniatus",
        "scientificName": "Sebastes miniatus",
        "parent": "3d83f643207b459498c792605e7fff41",
        "itisTSN": 166729,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": 10265,
          "ashopSpeciesId": 331,
          "dwId": [
            671
          ]
        },
        "pacfinSpeciesCode": "VRML"
      }],
    definition: 'vermilion and sunset rockfish',

    legacy: {
        "dwId": [
            2172

        ]
      },
},



{
    type: 'catch-grouping',
    name: 'Sebastes sp. (aleutianus / melanostictus)',
    members: [{
        "_id": "3d83f643207b459498c792605e80f140",
        "_rev": "2-d9b6db13089d40099447db08c478ea33",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605e80f140",
        "level": "Species",
        "taxonomyName": "Sebastes aleutianus",
        "scientificName": "Sebastes aleutianus",
        "parent": "3d83f643207b459498c792605e7fff41",
        "itisTSN": 166706,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": 10490,
          "ashopSpeciesId": 307,
          "dwId": [
            638
          ]
        },
        "pacfinSpeciesCode": "REYE"
      }],
    definition: 'rougheye and blackspotted rockfish',

    legacy: {
        "dwId": [
            6249
        ]
      },
},



{
    type: 'catch-grouping',
    name: 'Brachyura/Anomura crabs',
    members: [{
        "_id": "3d83f643207b459498c792605ef981d7",
        "_rev": "2-567e759cc31fe55c02ddc7a4edbd59b2",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605ef981d7",
        "level": "Infraorder",
        "taxonomyName": "Brachyura",
        "scientificName": "Brachyura",
        "parent": "3d83f643207b459498c792605ed679c1",
        "itisTSN": 98276,
        "wormsAphiaId": 106673,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": null,
          "ashopSpeciesId": null,
          "dwId": [
            995
          ]
        },
        "children": [
          "3bc91f904fea9979442fd59935602e11",
          "3bc91f904fea9979442fd599356131c7",
          "3bc91f904fea9979442fd5993561ba98",
          "3bc91f904fea9979442fd59935621d0e",
          "3d83f643207b459498c792605ef9e259",
          "3d83f643207b459498c792605efc6ed4",
          "3d83f643207b459498c792605efce9df",
          "3d83f643207b459498c792605efd8727",
          "3d83f643207b459498c792605efe282a"
        ]
      },
      {
        "_id": "3bde698df7af02fdb273e1f5ae054cd9",
        "_rev": "2-3ea4a80024d781694d10e6eac1d703b7",
        "type": "taxonomy",
        "taxonomyId": "3bde698df7af02fdb273e1f5ae054cd9",
        "level": "Infraorder",
        "taxonomyName": "Anomura",
        "scientificName": "Anomura",
        "parent": "3d83f643207b459498c792605ed679c1",
        "itisTSN": 97698,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": null,
          "ashopSpeciesId": null,
          "dwId": [
            1020
          ]
        },
        "children": [
          "3bde698df7af02fdb273e1f5ae05b1ef",
          "3bde698df7af02fdb273e1f5ae1f8199",
          "3bde698df7af02fdb273e1f5ae2192d5"
        ]
      }
    
    ],
    definition: 'crab unident.',

    legacy: {
        "dwId": [
            6391
        ]
      },
},



{
    type: 'catch-grouping',
    name: 'Percichthyidae/Serranidae',
    members: [{
        "_id": "3bc91f904fea9979442fd599353625f0",
        "_rev": "1-8a8a882b531b6e3ff02b6551263b8a81",
        "type": "taxonomy",
        "taxonomyId": "3bc91f904fea9979442fd599353625f0",
        "level": "Family",
        "taxonomyName": "Percichthyidae",
        "scientificName": "Percichthyidae",
        "parent": "4fa0ab1f2ccf04160ab89da3e3bb664d",
        "itisTSN": 170315,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": null,
          "ashopSpeciesId": null,
          "dwId": [
            1984
          ]
        }
      },{
        "_id": "4fa0ab1f2ccf04160ab89da3e3f1d322",
        "_rev": "3-f0a418386c73b48820ba015a11b9549a",
        "type": "taxonomy",
        "taxonomyId": "3bc91f904fea9979442fd59935368aa7",
        "level": "Family",
        "taxonomyName": "Serranidae",
        "scientificName": "Serranidae",
        "parent": "4fa0ab1f2ccf04160ab89da3e3bb664d",
        "itisTSN": 167674,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": null,
          "ashopSpeciesId": null,
          "dwId": [
            1985
          ]
        },
        "children": [
          "3bc91f904fea9979442fd59935370d59",
          "3bc91f904fea9979442fd59935782ac8",
          "4fa0ab1f2ccf04160ab89da3e3f1d864"
        ]
      }
    
    
    ],
    definition: 'bass unident.',

    legacy: {
        "dwId": [
            6427
        ]
      },
},



{
    type: 'catch-grouping',
    name: 'Sebastes sp. (aleutianus / borealis)',
    members: [{
        "_id": "3d83f643207b459498c792605e80f140",
        "_rev": "2-d9b6db13089d40099447db08c478ea33",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605e80f140",
        "level": "Species",
        "taxonomyName": "Sebastes aleutianus",
        "scientificName": "Sebastes aleutianus",
        "parent": "3d83f643207b459498c792605e7fff41",
        "itisTSN": 166706,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": 10490,
          "ashopSpeciesId": 307,
          "dwId": [
            638
          ]
        },
        "pacfinSpeciesCode": "REYE"
      },
      {
        "_id": "3d83f643207b459498c792605e9ac6d0",
        "_rev": "2-a2fb97153f5f7eb42a94c621e3a4c1a8",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605e9ac6d0",
        "level": "Species",
        "taxonomyName": "Sebastes borealis",
        "scientificName": "Sebastes borealis",
        "parent": "3d83f643207b459498c792605e7fff41",
        "itisTSN": 166712,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": 10254,
          "ashopSpeciesId": 326,
          "dwId": [
            695
          ]
        },
        "pacfinSpeciesCode": "SRKR"
      }
    
    
    
    ],
    definition: 'non-eulachon smelt unident.',

    legacy: {
        "dwId": [
            6460
        ]
      },
},



{
    type: 'catch-grouping',
    name: 'Sebastes sp. (goodei / paucispinis)',
    members: [{
        "_id": "3d83f643207b459498c792605e8ae54e",
        "_rev": "2-8f3689088b2f231909f22873ee78920e",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605e8ae54e",
        "level": "Species",
        "taxonomyName": "Sebastes goodei",
        "scientificName": "Sebastes goodei",
        "parent": "3d83f643207b459498c792605e7fff41",
        "itisTSN": 166722,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": 10485,
          "ashopSpeciesId": 325,
          "dwId": [
            661
          ]
        },
        "pacfinSpeciesCode": "CLPR"
      },
      {
        "_id": "3d83f643207b459498c792605e920a90",
        "_rev": "2-c1d8c0c0eeafcc9977d737c6103441ae",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605e920a90",
        "level": "Species",
        "taxonomyName": "Sebastes paucispinis",
        "scientificName": "Sebastes paucispinis",
        "parent": "3d83f643207b459498c792605e7fff41",
        "itisTSN": 166733,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": 10220,
          "ashopSpeciesId": 302,
          "dwId": [
            676
          ]
        },
        "pacfinSpeciesCode": "BCAC"
      }
    
    
    ],
    definition: 'shortraker and rougheye rockfish',

    legacy: {
        "dwId": [
            7218
        ]
      },
},



{
    type: 'catch-grouping',
    name: 'Sebastes sp. (miniatus / pinniger)',
    members: [{
        "_id": "3d83f643207b459498c792605e8f9119",
        "_rev": "2-8c69ef7c77061d1d35893e9a5aeed96a",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605e8f9119",
        "level": "Species",
        "taxonomyName": "Sebastes miniatus",
        "scientificName": "Sebastes miniatus",
        "parent": "3d83f643207b459498c792605e7fff41",
        "itisTSN": 166729,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": 10265,
          "ashopSpeciesId": 331,
          "dwId": [
            671
          ]
        },
        "pacfinSpeciesCode": "VRML"
      },
      {
        "_id": "3d83f643207b459498c792605e9257c7",
        "_rev": "2-32078efdcc8e46b6beb7ecf53d8b3bf3",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605e9257c7",
        "level": "Species",
        "taxonomyName": "Sebastes pinniger",
        "scientificName": "Sebastes pinniger",
        "parent": "3d83f643207b459498c792605e7fff41",
        "itisTSN": 166734,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": 10223,
          "ashopSpeciesId": 314,
          "dwId": [
            677
          ]
        },
        "pacfinSpeciesCode": "CNRY"
      }
    
    ],
    definition: 'vermilion and canary rockfish',

    legacy: {
        "dwId": [
            7219
        ]
      },
},



{
    type: 'catch-grouping',
    name: 'Sebastes sp. (melanops / mystinus)',
    members: [{
        "_id": "3d83f643207b459498c792605e8ebe82",
        "_rev": "2-1c33af94ee62288c58ab1d0d4f0a3722",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605e8ebe82",
        "level": "Species",
        "taxonomyName": "Sebastes melanops",
        "scientificName": "Sebastes melanops",
        "parent": "3d83f643207b459498c792605e7fff41",
        "itisTSN": 166727,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": 10216,
          "ashopSpeciesId": 306,
          "dwId": [
            669
          ]
        },
        "pacfinSpeciesCode": "BLCK"
      },
      {
        "_id": "3d83f643207b459498c792605e901b15",
        "_rev": "2-b6795e61f00195b4c9670de1e7591895",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605e901b15",
        "level": "Species",
        "taxonomyName": "Sebastes mystinus",
        "scientificName": "Sebastes mystinus",
        "parent": "3d83f643207b459498c792605e7fff41",
        "itisTSN": 166730,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": 10219,
          "ashopSpeciesId": 316,
          "dwId": [
            672
          ]
        },
        "pacfinSpeciesCode": "BLUR"
      }
    
    
    ],
    definition: 'black and blue rockfish',

    legacy: {
        "dwId": [
            7220
        ]
      },
},



{
    type: 'catch-grouping',
    name: 'Beringraja/Raja',
    members: [{
        "_id": "4fa0ab1f2ccf04160ab89da3e382bccf",
        "_rev": "2-2d438b4a41d751eac91b8db5320d6a5b",
        "type": "taxonomy",
        "taxonomyId": "4fa0ab1f2ccf04160ab89da3e382bccf",
        "level": "Genus",
        "taxonomyName": "Raja",
        "scientificName": "Raja",
        "parent": "4fa0ab1f2ccf04160ab89da3e3827b47",
        "itisTSN": 160846,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": null,
          "ashopSpeciesId": null,
          "dwId": [
            38
          ]
        },
        "children": [
          "4fa0ab1f2ccf04160ab89da3e3845ce1",
          "4fa0ab1f2ccf04160ab89da3e384d166",
          "4fa0ab1f2ccf04160ab89da3e3856342",
          "4fa0ab1f2ccf04160ab89da3e38654bb"
        ]
      }],
    definition: 'stiff snout skate unident.',

    legacy: {
        "dwId": [
            7256
        ]
      },
},



{
    type: 'catch-grouping',
    name: 'Pholidae/Stichaeidae',
    members: [{
        "_id": "3d83f643207b459498c792605e5b6e04",
        "_rev": "2-ffc0b0058c023b645dd877bd134b5fe2",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605e5b6e04",
        "level": "Family",
        "taxonomyName": "Pholidae",
        "scientificName": "Pholidae",
        "parent": "4fa0ab1f2ccf04160ab89da3e3aff701",
        "itisTSN": 171632,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": 10134,
          "ashopSpeciesId": 430,
          "dwId": [
            546
          ]
        },
        "children": [
          "3bc91f904fea9979442fd599354413cb",
          "3d83f643207b459498c792605e5bd29a"
        ]
      },
    
      {
        "_id": "3d83f643207b459498c792605e52a966",
        "_rev": "2-fef6820d1e6f1a890cb2bd17cd920737",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605e52a966",
        "level": "Family",
        "taxonomyName": "Stichaeidae",
        "scientificName": "Stichaeidae",
        "parent": "4fa0ab1f2ccf04160ab89da3e3aff701",
        "itisTSN": 171554,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": 10205,
          "ashopSpeciesId": 750,
          "dwId": [
            525
          ]
        },
        "children": [
          "3d83f643207b459498c792605e531f9b",
          "3d83f643207b459498c792605e537f05",
          "3d83f643207b459498c792605e53e6bd",
          "3d83f643207b459498c792605e547a09",
          "3d83f643207b459498c792605e54d753",
          "3d83f643207b459498c792605e55559a",
          "3d83f643207b459498c792605e5669c4",
          "3d83f643207b459498c792605e56cd04",
          "3d83f643207b459498c792605e5727eb",
          "3d83f643207b459498c792605e58727c",
          "3d83f643207b459498c792605e595f7c",
          "3d83f643207b459498c792605e5aafe6",
          "b630d3c9a52c46b9eb7325eda1228ee4"
        ]
      }
    ],
    definition: 'blenny unident.',

    legacy: {
        "dwId": [
            7261
        ]
      },
},



{
    type: 'catch-grouping',
    name: 'Sebastes sp. (ciliatus / variabilis)',
    members: [{
        "_id": "3d83f643207b459498c792605e84b820",
        "_rev": "2-34f3bc3a36a4072dc0fd3eb9c053cd7f",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605e84b820",
        "level": "Species",
        "taxonomyName": "Sebastes ciliatus",
        "scientificName": "Sebastes ciliatus",
        "parent": "3d83f643207b459498c792605e7fff41",
        "itisTSN": 166714,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": null,
          "ashopSpeciesId": 345,
          "dwId": [
            648
          ]
        },
        "pacfinSpeciesCode": "DARK"
      },
    
      {
        "_id": "3d83f643207b459498c792605e853279",
        "_rev": "2-4f2ce59a39d94857f8ee84cd8e1ee1b1",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605e853279",
        "level": "Species",
        "taxonomyName": "Sebastes variabilis",
        "scientificName": "Sebastes variabilis",
        "parent": "3d83f643207b459498c792605e7fff41",
        "itisTSN": 644604,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": null,
          "ashopSpeciesId": 330,
          "dwId": [
            649
          ]
        },
        "pacfinSpeciesCode": "DUSK"
      }
    ],
    definition: 'dark (dusky) and dusky rockfish',

    legacy: {
        "dwId": [
            7269
        ]
      },
},



{
    type: 'catch-grouping',
    name: 'Clupeidae/Osmeridae',
    members: [{
        "_id": "4fa0ab1f2ccf04160ab89da3e3c517aa",
        "_rev": "3-cc06a2fb40db092d4a98dc41b35051ba",
        "type": "taxonomy",
        "taxonomyId": "3bc91f904fea9979442fd599351fcc24",
        "level": "Family",
        "taxonomyName": "Clupeidae",
        "scientificName": "Clupeidae",
        "parent": "4fa0ab1f2ccf04160ab89da3e3b405b4",
        "itisTSN": 161700,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": 10662,
          "ashopSpeciesId": null,
          "dwId": [
            1928
          ]
        },
        "children": [
          "4fa0ab1f2ccf04160ab89da3e3c518a0",
          "4fa0ab1f2ccf04160ab89da3e3c5959e",
          "b630d3c9a52c46b9eb7325eda125f71c"
        ]
      },
    
      {
        "_id": "3d83f643207b459498c792605e43e223",
        "_rev": "2-7131377790d219fe8df8449de5898689",
        "type": "taxonomy",
        "taxonomyId": "3d83f643207b459498c792605e43e223",
        "level": "Family",
        "taxonomyName": "Osmeridae",
        "scientificName": "Osmeridae",
        "parent": "3d83f643207b459498c792605e43d995",
        "itisTSN": 162028,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": 10502,
          "ashopSpeciesId": 602,
          "dwId": [
            490
          ]
        },
        "children": [
          "3d83f643207b459498c792605e4441dd",
          "3d83f643207b459498c792605e44c5da",
          "3d83f643207b459498c792605e451e49",
          "3d83f643207b459498c792605e458132",
          "3d83f643207b459498c792605e46059a",
          "3d83f643207b459498c792605e4663b6"
        ]
      }
    
    ],
    definition: 'smelt/herring unident.',

    legacy: {
        "dwId": [
            7275
        ]
      },
},



{
    type: 'catch-grouping',
    name: 'Alcidae auklet/murrelet',
    members: [{
        "_id": "b630d3c9a52c46b9eb7325eda132a924",
        "_rev": "3-ad2a9123544158becdfd479890f53570",
        "type": "taxonomy",
        "taxonomyId": "b630d3c9a52c46b9eb7325eda1377ffb",
        "level": "Family",
        "taxonomyName": "Alcidae",
        "scientificName": "Alcidae",
        "parent": "b630d3c9a52c46b9eb7325eda132a44b",
        "itisTSN": 176967,
        "wormsAphiaId": null,
        "isInactive": null,
        "legacy": {
          "wcgopSpeciesId": 10012,
          "ashopSpeciesId": 883,
          "dwId": [
            6506
          ]
        },
        "children": [
          "b630d3c9a52c46b9eb7325eda132b494",
          "b630d3c9a52c46b9eb7325eda1338572",
          "b630d3c9a52c46b9eb7325eda134816a",
          "b630d3c9a52c46b9eb7325eda1353022",
          "b630d3c9a52c46b9eb7325eda135d6e9",
          "b630d3c9a52c46b9eb7325eda1368249",
          "b630d3c9a52c46b9eb7325eda1372254",
          "b630d3c9a52c46b9eb7325eda19cd30f",
          "b630d3c9a52c46b9eb7325eda19e5b3d"
        ]
      }],
    definition: 'auklet/murrelet unident.',

    legacy: {
        "dwId": [
            7302

        ]
      },
}



















];


async function InsertStuff(newStuff: any[]){



    console.log(newStuff.length);
    console.log();

    await InsertBulkCouchDB(newStuff);

}



//InsertStuff(newGroupings);



















