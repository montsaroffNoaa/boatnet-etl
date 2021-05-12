import { RetrieveEntireViewCouchDB, InsertBulkCouchDB } from "../Common/common-functions";
import { couchConnection } from "../Common/db-connection-variables";






async function CompareEM(){


    let allAliasDocs = await RetrieveEntireViewCouchDB('taxonomy-views', 'taxonomy-alias-by-scientific-name');
    let allEMitems = ["", "Diomedeidae", "Alcidae", "Fulica americana", "Synthliboramphus antiquus", "Atheresthes stomias", "Sebastes aurora", "Berardius bairdii", "Sebastes rufus", "Ziphiidae", "Hippoglossina stomata", "Aves", "Sebastes melanops", "Oceanodroma melania", "Diomedea nigripes", "Rissa tridactyla", "Puffinus opisthomelas", "Sebastes melanostomus", "Mesoplodon densirostris", "Sebastes mystinus", "Balaenoptera musculus", "Sebastes paucispinus", "Tursiops truncatus", "Phalacrocorax penicillatus", "Sebastes gilli", "Sula leucogaster", "Pelecanus occidentalis", "Pleuronectes isolepis", "Pleuronichthys coenosus", "Larus californicus", "Paralichthys californicus", "Zalophus californianus", "Sebastes pinniger", "Sterna caspia", "Ptychoramphus aleuticus", "Cetacea", "Sebastes phillipsi", "Sebastes goodei", "Uria aalge", "Gavia immer", "Delphinus", "Phalacrocoracidae", "Sebastes levis", "Pleuronichthys decurrens", "Ziphius cavirostris", "Phocoenoides dalli", "Sebastes crameri", "Decomposed fish", "Embassichthys bathybius", "Oncorhynchus keta", "Delphinidae", "Phalacrocorax auritus", "Microstomus pacificus", "Cancer magister", "Kogia breviceps", "Sebastes rufianus", "Pleuronectes vetulus", "Thaleichthys pacificus", "Xystreurys liolepis", "Balaenoptera physalus", "Fish Unidentified", "IFQM", "Sebastes rubrivinctus", "Pleuronectiformes", "IFQFF", "Hippoglossoides elassodon", "Oceanodroma furcata", "Sebastes lentiginosus", "Arctocephalinae", "Mesoplodon ginkgodens", "Larus glaucescens", "Eschrichtius robustus", "Podicipedidae", "Acipenser medirostris", "Chelonia mydas/ agassizi", "Sebastes rosenblatti", "Reinhardtius hippoglossoides", "Sebastes chlorostictus", "Sebastes elongates", "Arctocephalus townsendi", "Cepphus", "Larinae", "Larinae", "Sebastes semicinctus", "Phocoena phocoena", "Phoca vitulina", "Sebastes variegatus", "Eretmochelysimbricata", "Mesoplodon hectori", "Larus heermanni", "Larus argentatus", "Sebastes umbrosus", "Podiceps auritus", "Pleuronichthys verticalis", "Mesoplodon carlhubbsi", "Megapteranovaeangliae", "Inopsetta ischyra", "Orcinus orca", "Oncorhynchus tshawytscha", "Diomedea immutabilis", "Oceanodroma leucorhoa", "Oceanodroma microsoma", "Dermochelys coriacea", "Ophiodon elongatus", "Caretta caretta", "Delphinus capensis", "Citharichthys xanthostigma", "Sebastolobus altivelis", "Gaviidae", "Brachyramphus marmoratus", "Marine mammal,Unid", "Larus canus", "Sebastes macdonaldi", "Balaenopteraacutorostrata", "Aggregate", "Aggregate", "Aggregate", "Uria", "Miroungaangustirostris", "Fulmarus glacialis", "Callorhinus ursinus", "Eubalaena glacialis", "Lissodelphis borealis", "Sebastes polyspinis", "Lepidochelys olivacea", "Sebastes serranoides", "Aggregate", "Gadus macrocephalus", "Merluccius productus", "Hippoglossus stenolepis", "Gavia pacifica", "Sebastes alutus", "Citharichthys sordidus", "Microgadus proximus", "Lagenorhynchus obliquidens", "Stercorarius parasiticus", "Phalacrocorax pelagicus", "Eopsetta jordani", "Cepphus columba", "Oncorhynchus gorbuscha", "Sebastes eos", "Puffinus creatopus", "Sebastes simulator", "Caniformia", "Phocoenidae", "Sebastes emphaeus", "Sebastes wilsoni", "Kogia breviceps", "Oncorhynchus nerka", "Podiceps grisegena", "Gavia stellata", "Sebastes babcocki", "Sebastes proriger", "Errex zachirus", "Cerorhinca monocerata", "Larus delawarensis", "Grampus griseus", "Pleuronectes bilineatus", "Sebastes", "IFQRF", "Sebastes helvomaculatus", "Sebastes rosaceus", "Sebastes aleutianus", "Roundfish unid.", "IFQRD", "Anoplopoma fimbria", "Oncorhynchus", "Psettichthys melanostictus", "Citharichthys", "Otariindae", "Enhydra lutris", "Phocidae", "Balaenoptera borealis", "Sebastes melanosema", "Sebastes zacentrus", "Puffinus", "Delphinus delphis", "Globicephalamacrorhynchus", "Diomedea albatrus", "Puffinus tenuirostris", "Sebastes jordani", "Sebastes borealis", "Sebastolobus alascanus", "Sebastolobus", "Oncorhynchus kisutch", "Sebastes brevispinus", "Halargyreus johnsonii", "Eopsetta exilis", "Charadrius alexandrinus", "Puffinus griseus", "Stercorarius maccormicki", "Sebastes ovalis", "Citharichthys stigmaeus", "Physeter catodon", "Sebastes diploproa", "Pleuronichthys ritteri", "Sebastes hopkinsi", "Platichthys stellatus", "Sebastes constellatus", "Mesoplodon stejnegeri", "Eumetopias jubatus", "Hydrobatidae", "Stenella coeruleoalba", "Sebastes saxicola", "Acipenser", "Sebastes ensifer", "Sebastes nigrocinctus", "Fratercula cirrhata", "Chelonidae", "Unknown", "Sebastes miniatus", "Theragra chalcogramma", "Aechmophorus occidentalis", "Larus occidentalis", "Whale unid.", "Sebastes entomelas", "Sebastes ruberrimus", "Sebastes reedi", "Sebastes flavidus"]
    let itemsNotInCouch = [];
    let itemsInCouch = [];



    for(let i = 0; i < allAliasDocs.length; i++){
        itemsInCouch.push(allAliasDocs[i].taxonomy.scientificName);
    }

    for(let i = 0; i < allEMitems.length; i++){
        if(itemsInCouch.indexOf(allEMitems[i]) == -1 ){
            itemsNotInCouch.push(allEMitems[i]);
        }
    }

    for(let i = 0; i < itemsNotInCouch.length; i++){
        console.log(itemsNotInCouch[i]);
    }

}



async function EditEMAliases(){

    let itemsToEdit: any[] = [
        //["1019","Fur Seal Unid","Otariidae","","NON","",""],
        ["1037","Minke Whale","Balaenoptera acutorostrata","","NON","",""],
        ["1071","Green/Black Turtle","Chelonia mydas","","NON","",""],
        ["1070","Turtle Unid","Cheloniidae","","NON","",""],
        ["1010","Long-beaked Common Dolphin","Delphinus delphis","","NON","",""],
        ["950","Short-tailed Albatross","Phoebastria albatrus","","NON","",""],
        ["951","Laysan Albatross","Phoebastria immutabilis","","NON","",""],
        ["952","Black-footed Albatross","Phoebastria nigripes","","NON","",""],
        ["111","Slender Sole","Lyopsetta exilis","SLNS","NON","",""],
        ["1072","Hawksbill Turtle","Eretmochelys imbricata","","NON","",""],
        ["105","Rex Sole","Glyptocephalus zachirus","REX","IFQ","",""],
        ["1041","Short-finned Pilot Whale","Globicephala macrorhynchus","","NON","",""],
        ["974","Gull Unid","Laridae","MISC","NON","",""],
        ["974","Gull Unid","Laridae","","NON","",""],
        ["1035","Humpback Whale","Megaptera novaeangliae","","NON","",""],
        ["1004","Gingko-toothed Beaked Whale","Mesoplodon ginkgodens","","NON","",""],
        ["1029","Northern Elephant Seal","Mirounga angustirostris","","NON","",""],
        ["1026","Sea Lion Unid","Otariidae","","NON","",""],
        ["1042","Sperm Whale","Physeter macrocephalus","","NON","",""],
        ["104","Rock Sole","Paraplagusia bilineata","RSOL","IFQ","",""],
        ["109","Butter Sole","Isopsetta isolepis","BSOL","IFQ","",""],
        ["108","English Sole","Parophrys vetulus","EGLS","IFQ","",""],
        ["310","Silvergray Rockfish","Sebastes brevispinis","SLGR","IFQ","",""],
        ["313","Greenstriped Rockfish","Sebastes elongatus","GSRK","IFQ","",""],
        ["302","Bocaccio Rockfish","Sebastes paucispinis","BCAC","IFQ","",""],
        ["361","Dwarf-red Rockfish","Sebastes rufinanus","DWRF","IFQ","",""],
        ["911","Caspian Tern","Hydroprogne caspia","","NON","",""],
        ["201","Walleye Pollock","Gadus chalcogrammus","PLCK","NON","",""],
        ["1008","Beaked Whale Unid","Hyperoodontidae","","NON","",""],
        ["230","Sturgeon Unid","Acipenser","USTG","NON","",""],
        ["231","Green Sturgeon","Acipenser medirostris","GSTG","NON","",""],
        ["943","Western Grebe","Aechmophorus occidentalis","","NON","",""],
        ["983","Alcid Unid","Alcidae","","NON","",""],
        ["203","Sablefish","Anoplopoma fimbria","SABL","IFQ","",""],
        ["1017","Guadalupe Fur Seal","Arctocephalus townsendi","","NON","",""],
        ["141","Arrowtooth Flounder","Atheresthes stomias","ARTH","IFQ","",""],
        ["900","Bird Unid","Aves","","NON","",""],
        ["1040","Sei Whale","Balaenoptera borealis","","NON","",""],
        ["1031","Blue Whale","Balaenoptera musculus","","NON","",""],
        ["1033","Fin Whale","Balaenoptera physalus","","NON","",""],
        ["1001","Bairds Beaked Whale","Berardius bairdii","","NON","",""],
        ["994","Marbled Murrelet","Brachyramphus marmoratus","","NON","",""],
        ["1018","Northern Fur Seal","Callorhinus ursinus","","NON","",""],
        ["12","Dungeness Crab","Cancer magister","DCRB","NON","",""],
        ["1020","Pinniped Unid","Caniformia","","NON","",""],
        ["1074","Loggerhead Turtle","Caretta caretta","","NON","",""],
        ["948","Guillemot Unid","Cepphus","","NON","",""],
        ["947","Pigeon Guillemot","Cepphus columba","","NON","",""],
        ["995","Rhinoceros Auklet","Cerorhinca monocerata","","NON","",""],
        ["1295","Cetacean unid.","Cetacea","","NON","",""],
        ["1282","Snowy Plover","Charadrius alexandrinus","","NON","",""],
        ["136","Sanddab Unid","Citharichthys","UDAB","MIXED","",""],
        ["137","Pacific Sanddab","Citharichthys sordidus","PDAB","IFQ","",""],
        ["126","Speckled Sanddab","Citharichthys stigmaeus","SSDB","NON","",""],
        ["125","Longfin Sanddab","Citharichthys xanthostigma","LDAB","NON","",""],
        ["1016","Dolphin Unid","Delphinidae","","NON","",""],
        ["1044","Common Unid Dolphin","Delphinus","","NON","",""],
        ["1014","Short-beaked Common Dolphin","Delphinus delphis","","NON","",""],
        ["1073","Leatherback Turtle","Dermochelys coriacea","","NON","",""],
        ["949","Albatross Unid","Diomedeidae","","NON","",""],
        ["110","Deepsea Sole","Embassichthys bathybius","DSOL","NON","",""],
        ["1027","Sea Otter","Enhydra lutris","","NON","",""],
        ["112","Petrale Sole","Eopsetta jordani","PTRL","IFQ","",""],
        ["1034","Gray Whale","Eschrichtius robustus","","NON","",""],
        ["1038","Northern Right Whale","Eubalaena glacialis","","NON","",""],
        ["1025","Stellar Sea Lion","Eumetopias jubatus","","NON","",""],
        ["992","Tufted Puffin","Fratercula cirrhata","","NON","",""],
        ["912","American Coot","Fulica americana","","NON","",""],
        ["954","Northern Fulmar","Fulmarus glacialis","","NON","",""],
        ["202","Pacific Cod","Gadus macrocephalus","PCOD","IFQ","",""],
        ["941","Common Loon","Gavia immer","","NON","",""],
        ["940","Pacific Loon","Gavia pacifica","","NON","",""],
        ["939","Red-throated Loon","Gavia stellata","","NON","",""],
        ["944","Loon Unid","Gaviidae","","NON","",""],
        ["1013","Rissos Dolphin","Grampus griseus","","NON","",""],
        ["860","Slender Codling","Halargyreus johnsonii","MSC2","NON","",""],
        ["119","Bigmouth Sole","Hippoglossina stomata","BMOL","NON","",""],
        ["103","Flathead Sole","Hippoglossoides elassodon","FSOL","IFQ","",""],
        ["101","Pacific Halibut","Hippoglossus stenolepis","PHLB","IFQ","",""],
        ["958","Storm-Petrel Unid","Hydrobatidae","","NON","",""],
        ["1032","Dwarf Sperm Whale","Kogia breviceps","","NON","",""],
        ["1039","Pygmy Sperm Whale","Kogia breviceps","","NON","",""],
        ["1012","Pacific White-sided Dolphin","Lagenorhynchus obliquidens","","NON","",""],
        ["977","Herring Gull","Larus argentatus","","NON","",""],
        ["975","California Gull","Larus californicus","","NON","",""],
        ["980","Mew Gull","Larus canus","","NON","",""],
        ["981","Ring-billed Gull","Larus delawarensis","","NON","",""],
        ["979","Glaucous-winged Gull","Larus glaucescens","","NON","",""],
        ["978","Heermanns Gull","Larus heermanni","","NON","",""],
        ["982","Western Gull","Larus occidentalis","","NON","",""],
        ["1075","Olive Ridley Turtle","Lepidochelys olivacea","","NON","",""],
        ["1011","Northern Right Whale Dolphin","Lissodelphis borealis","","NON","",""],
        ["206","Pacific Hake","Merluccius productus","PWHT","IFQ","",""],
        ["1006","Hubbs Beaked Whale","Mesoplodon carlhubbsi","","NON","",""],
        ["1002","Blainevilles Beaked Whale","Mesoplodon densirostris","","NON","",""],
        ["1005","Hectors Beaked Whale","Mesoplodon hectori","","NON","",""],
        ["1007","Stejnegers Beaked Whale","Mesoplodon stejnegeri","","NON","",""],
        ["209","Pacific Tom Cod","Microgadus proximus","TCOD","NON","",""],
        ["107","Dover Sole","Microstomus pacificus","DOVR","IFQ","",""],
        ["960","Fork-tailed Storm-Petrel","Oceanodroma furcata","","NON","",""],
        ["965","Leachs Storm-Petrel","Oceanodroma leucorhoa","","NON","",""],
        ["959","Black Storm-Petrel","Oceanodroma melania","","NON","",""],
        ["966","Least Storm-Petrel","Oceanodroma microsoma","","NON","",""],
        ["220","Salmon Unid","Oncorhynchus","USMN","NON","",""],
        ["225","Pink (Humpback) Salmon","Oncorhynchus gorbuscha","PINK","NON","",""],
        ["221","Dog (Chum) Salmon","Oncorhynchus keta","CHUM","NON","",""],
        ["223","Silver (Coho) Salmon","Oncorhynchus kisutch","COHO","NON","",""],
        ["224","Red (Sockeye) Salmon","Oncorhynchus nerka","SOCK","NON","",""],
        ["222","King (Chinook) Salmon","Oncorhynchus tshawytscha","CHNK","NON","",""],
        ["603","Lingcod","Ophiodon elongatus","LCOD","IFQ","",""],
        ["1036","Killer Whale","Orcinus orca","","NON","",""],
        ["124","California Halibut","Paralichthys californicus","CHLB","NON","",""],
        ["910","Brown Pelican","Pelecanus occidentalis","","NON","",""],
        ["961","Cormorant Unid","Phalacrocoracidae","","NON","",""],
        ["963","Double-crested Cormorant","Phalacrocorax auritus","","NON","",""],
        ["964","Pelagic Cormorant","Phalacrocorax pelagicus","","NON","",""],
        ["962","Brandts Cormorant","Phalacrocorax penicillatus","","NON","",""],
        ["1028","Harbor Seal","Phoca vitulina","","NON","",""],
        ["1030","Seal Unid","Phocidae","","NON","",""],
        ["1022","Harbor Porpoise","Phocoena phocoena","","NON","",""],
        ["1023","Porpoise Unid","Phocoenidae","","NON","",""],
        ["1021","Dalls Porpoise","Phocoenoides dalli","","NON","",""],
        ["142","Starry Flounder","Platichthys stellatus","STRY","IFQ","",""],
        ["100","Flatfish Unid","Pleuronectiformes","UFLT","MIXED","",""],
        ["118","C-O (C-O Turbot) Sole","Pleuronichthys coenosus","CTRB","NON","",""],
        ["117","Curlfin Turbot","Pleuronichthys decurrens","CSOL","IFQ","",""],
        ["123","Spotted Turbot","Pleuronichthys ritteri","OFLT","NON","",""],
        ["122","Hornyhead Turbot","Pleuronichthys verticalis","HTRB","NON","",""],
        ["945","Horned Grebe","Podiceps auritus","","NON","",""],
        ["942","Red-necked Grebe","Podiceps grisegena","","NON","",""],
        ["946","Grebe Unid","Podicipedidae","","NON","",""],
        ["115","Sand Sole","Psettichthys melanostictus","SSOL","IFQ","",""],
        ["996","Cassins Auklet","Ptychoramphus aleuticus","","NON","",""],
        ["997","Shearwater Unid","Puffinus","","NON","",""],
        ["955","Pink-footed Shearwater","Puffinus creatopus","","NON","",""],
        ["956","Sooty Shearwater","Puffinus griseus","","NON","",""],
        ["953","Black-vented Shearwater","Puffinus opisthomelas","","NON","",""],
        ["957","Short-tailed Shearwater","Puffinus tenuirostris","","NON","",""],
        ["102","Greenland Turbot","Reinhardtius hippoglossoides","GTRB","NON","",""],
        ["976","Black-legged Kittiwake","Rissa tridactyla","","NON","",""],
        ["300","Rockfish Unid","Sebastes","URCK","MIXED","",""],
        ["307","Rougheye Rockfish","Sebastes aleutianus","REYE","IFQ","",""],
        ["301","Pacific Ocean Perch Rockfish","Sebastes alutus","POP","IFQ","",""],
        ["334","Aurora Rockfish","Sebastes aurora","ARRA","IFQ","",""],
        ["308","Redbanded Rockfish","Sebastes babcocki","RDBD","IFQ","",""],
        ["326","Shortraker Rockfish","Sebastes borealis","SRKR","IFQ","",""],
        ["339","Greenspotted Rockfish","Sebastes chlorostictus","GSPT","IFQ","",""],
        ["378","Starry Rockfish","Sebastes constellatus","STAR","IFQ","",""],
        ["311","Darkblotched Rockfish","Sebastes crameri","DBRK","IFQ","",""],
        ["315","Splitnose Rockfish","Sebastes diploproa","SNOS","IFQ","",""],
        ["374","Puget Sound Rockfish","Sebastes emphaeus","PUGT","NON","",""],
        ["379","Swordspine Rockfish","Sebastes ensifer","SWSP","IFQ","",""],
        ["305","Widow Rockfish","Sebastes entomelas","WDOW","IFQ","",""],
        ["372","Pink Rockfish","Sebastes eos","PNKR","IFQ","",""],
        ["321","Yellowtail Rockfish","Sebastes flavidus","YTRK","IFQ","",""],
        ["356","Bronzespotted Rockfish","Sebastes gilli","BRNZ","IFQ","",""],
        ["325","Chilipepper Rockfish","Sebastes goodei","CLPR","IFQ","",""],
        ["309","Rosethorn Rockfish","Sebastes helvomaculatus","RSTN","IFQ","",""],
        ["377","Squarespot Rockfish","Sebastes hopkinsi","SQRS","IFQ","",""],
        ["318","Shortbelly Rockfish","Sebastes jordani","SBLY","NON","",""],
        ["363","Freckled Rockfish","Sebastes lentiginosus","FRCK","IFQ","",""],
        ["360","Cowcod Rockfish","Sebastes levis","CWCD","IFQ","",""],
        ["370","Mexican Rockfish","Sebastes macdonaldi","MXRF","IFQ","",""],
        ["306","Black Rockfish","Sebastes melanops","BLCK","NON","",""],
        ["375","Semaphore Rockfish","Sebastes melanosema","URCK","NON","",""],
        ["319","Blackgill Rockfish","Sebastes melanostomus","BLGL","IFQ","",""],
        ["331","Vermilion Rockfish","Sebastes miniatus","VRML","IFQ","",""],
        ["316","Blue Rockfish","Sebastes mystinus","BLUR","NON","",""],
        ["329","Tiger Rockfish","Sebastes nigrocinctus","TIGR","IFQ","",""],
        ["376","Speckled Rockfish","Sebastes ovalis","SPKL","IFQ","",""],
        ["358","Chameleon Rockfish","Sebastes phillipsi","CMEL","IFQ","",""],
        ["314","Canary Rockfish","Sebastes pinniger","CNRY","IFQ","",""],
        ["303","Northern Rockfish","Sebastes polyspinis","NRCK","NON","",""],
        ["324","Redstripe Rockfish","Sebastes proriger","REDS","IFQ","",""],
        ["320","Yellowmouth Rockfish","Sebastes reedi","YMTH","IFQ","",""],
        ["312","Rosy Rockfish","Sebastes rosaceus","ROSY","IFQ","",""],
        ["366","Greenblotched Rockfish","Sebastes rosenblatti","GBLC","IFQ","",""],
        ["322","Yelloweye Rockfish","Sebastes ruberrimus","YEYE","IFQ","",""],
        ["362","Flag Rockfish","Sebastes rubrivinctus","FLAG","IFQ","",""],
        ["337","Bank Rockfish","Sebastes rufus","BANK","IFQ","",""],
        ["328","Stripetail Rockfish","Sebastes saxicola","STRK","IFQ","",""],
        ["367","Halfbanded Rockfish","Sebastes semicinctus","HBRK","IFQ","",""],
        ["371","Olive Rockfish","Sebastes serranoides","OLVE","NON","",""],
        ["373","Pinkrose Rockfish","Sebastes simulator","PRRK","IFQ","",""],
        ["368","Honeycomb Rockfish","Sebastes umbrosus","HNYC","IFQ","",""],
        ["323","Harlequin Rockfish","Sebastes variegatus","HLQN","IFQ","",""],
        ["335","Pygmy Rockfish","Sebastes wilsoni","PGMY","IFQ","",""],
        ["304","Sharpchin Rockfish","Sebastes zacentrus","SHRP","IFQ","",""],
        ["349","Shortspine/ Longspine Thornyhead","Sebastolobus","THDS","MIXED","",""],
        ["350","Shortspine Thornyhead","Sebastolobus alascanus","SSPN","IFQ","",""],
        ["352","Longspine Thornyhead","Sebastolobus altivelis","LSPN","IFQ","",""],
        ["1015","Striped Dolphin","Stenella coeruleoalba","","NON","",""],
        ["1280","South Polar Skua","Stercorarius maccormicki","","NON","",""],
        ["1279","Parasitic Jaeger","Stercorarius parasiticus","","NON","",""],
        ["998","Brown Booby","Sula leucogaster","","NON","",""],
        ["993","Ancient Murrelet","Synthliboramphus antiquus","","NON","",""],
        ["601","Eulachon","Thaleichthys pacificus","EULC","NON","",""],
        ["1009","Bottlenose Dolphin","Tursiops truncatus","","NON","",""],
        ["987","Murre Unid","Uria","","NON","",""],
        ["989","Common (Guillemot) Murre","Uria aalge","","NON","",""],
        ["120","Fantail Sole","Xystreurys liolepis","FNTS","NON","",""],
        ["1024","California Sea Lion","Zalophus californianus","","NON","",""],
        ["1003","Cuviers Beaked Whale","Ziphius cavirostris","","NON","",""]
        ]

    let couchScientificNames = [];
    let docsToInsert: any[] = [];

    let allAliasDocs = await RetrieveEntireViewCouchDB('taxonomy-views', 'taxonomy-alias-by-scientific-name');

    for(let i = 0; i < allAliasDocs.length; i++){
        couchScientificNames.push(allAliasDocs[i].taxonomy.scientificName);
    }


    for(let i = 0; i < itemsToEdit.length; i++){
        itemsToEdit[i][0] = Number(itemsToEdit[i][0]);
    }

    
    for(let i = 0; i < itemsToEdit.length; i++){
        let wcemSpeciesCode = itemsToEdit[i][0];
        let commonName = itemsToEdit[i][1];
        let scientificName = itemsToEdit[i][2];
        let pacfinSpeciesCode = itemsToEdit[i][3];
        let ifqType = itemsToEdit[i][4];

        let couchDocIndex =  couchScientificNames.indexOf(scientificName);
        let docToEdit = allAliasDocs[couchDocIndex];

        docToEdit.wcemSpeciesCode = wcemSpeciesCode;

        if(docToEdit.commonNames){
            if(docToEdit.commonNames.indexOf(commonName) != -1){
                docToEdit.commonNames.push(commonName);
            }
        } else  {
            docToEdit.commonNames = [commonName];
        }

        if(pacfinSpeciesCode != ""){
            docToEdit.pacfinSpeciesCode = pacfinSpeciesCode;
        }

        if(ifqType != ""){
            docToEdit.ifqType = ifqType;
        }

        docToEdit.isEm = true;        
        //delete docToEdit._rev;
        docsToInsert.push(docToEdit);

    }

    console.log(docsToInsert.length)
    console.log()

    for( let i = 0; i < docsToInsert.length; i++){
        // delete docsToInsert[i]._rev;
        // delete docsToInsert[i]._id;
        await couchConnection.insert(docsToInsert[i]).then((data: any) => {
            console.log(data)
        }).catch((error: any) => {
            console.log("update failed", error, docsToInsert[i]);
    
        });
    }

    //console.log(InsertBulkCouchDB(docsToInsert));

}


async function deleteItems(){
    

    let itemsToDelete = [
    {_id: "59f2882e24d117a1b1083dc9a1606f25", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16074e2", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a160760c", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1607ed2", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1608a31", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1608a6e", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1608e49", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1609744", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1609af2", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a160a605", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a160ad73", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a160b81e", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a160baed", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a160bc79", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a160c4d8", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a160c505", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a160c558", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a160c581", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a160d0d0", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a160d823", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a160dc1b", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a160e12d", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a160ec1d", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a160ecaa", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a160f6d9", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1610269", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1610acd", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16111ba", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a161190d", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1611bd3", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a161231d", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16127f3", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1612922", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16130a0", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1613b7f", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1614524", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a161479b", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1614e1f", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16151b7", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1615bf0", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16168b8", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a161717d", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a161781c", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1618335", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1618404", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1619300", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1619cdf", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a161ac32", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a161b732", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a161b9ef", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a161be83", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a161bffd", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a161cfbd", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a161dcd4", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a161e7e4", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a161f4d7", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a161fc6b", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1620ba9", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1621417", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1621c8c", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1621d0c", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1621d1c", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1622859", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1622d47", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1622ff8", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1623861", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1624542", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1624a4e", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16251a3", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1625f15", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1626c28", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1627801", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a162819d", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1628da7", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1629a42", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1629e04", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a162a395", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a162a48a", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a162aa85", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a162afa4", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a162be91", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a162c3fe", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a162c66f", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a162d613", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a162de07", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a162ee04", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a162fda1", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1630ab5", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16314a2", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1631cd5", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a163291b", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1632f25", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1633992", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16341fa", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a163499f", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1634b0d", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a163578f", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a163678c", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a163749c", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16380a5", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a163874c", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a163927b", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a163a06a", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a163a663", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a163ad21", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a163b647", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a163bac2", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a163c73f", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a163d20b", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a163db8e", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a163ea75", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a163f72a", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a164065a", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16408a9", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1641319", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16419a4", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16426a4", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1642a0b", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1642faf", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a164373e", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16446ec", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16448c4", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16448fb", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16455c8", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a164622b", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1646a33", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a164754f", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1647943", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1647cb0", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1647d44", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a164880a", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16497a4", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1649e6a", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a164ab23", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a164b22a", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a164b8b8", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a164c341", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a164c51a", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a164c5bc", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a164c833", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a164d4c6", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a164d88f", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a164e2d0", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a164f025", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a164ffd4", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a165000e", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1650b0c", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1650ddc", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1650ef6", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a165147d", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a165230f", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a165314e", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1653341", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1653f0d", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1654ac8", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16555ca", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1655b78", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1656485", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1656a85", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1656fa7", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16571ed", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16575d0", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16580d7", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1658dee", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16595d5", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1659e88", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a165a1c5", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a165a2e0", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a165ac01", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a165af20", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a165b1d5", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a165bb77", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a165c2eb", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a165d190", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a165e05a", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a165ec66", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a165ecb3", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a165f289", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1660153", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1660ec1", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a166137d", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16614f4", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1661fc3", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1662e00", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1663d58", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16646e0", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1664f3f", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16651b8", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a166558e", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1665faf", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1666406", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1666db1", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16676ee", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a16685ab", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1668d76", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a1669a87", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a166a7bc", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a166a7d7", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a166b14c", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a166b81f", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a166c709", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a166d20e", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true},
    {_id: "59f2882e24d117a1b1083dc9a166db37", _rev: "1-48ea91049d8b6b77b5b67d65fa3163d0", "_deleted": true}]
    
    console.log(await InsertBulkCouchDB(itemsToDelete));


}



async function EditEverything(){
    let dictTaxonomy: { [id: string]: any; } = {};

    let allAliasDocs = await RetrieveEntireViewCouchDB('em-views', 'taxonomy-alias-by-wcem');
    let allTaxDocs = await RetrieveEntireViewCouchDB('taxonomy-views', 'taxonomy-by-scientific-name');
    let allCatchGroupingDocs = await RetrieveEntireViewCouchDB('em-views', 'groupings-and-alias-by-wcem');

    let docsToUpdate: any[] = [];

    for(let i = 0; i < allTaxDocs.length; i++){
        // if(allTaxDocs[i].legacy && allTaxDocs[i].legacy.wcgopSpeciesCode){
        //     delete allTaxDocs[i].legacy.wcgopSpeciesCode;
        // }
        // if(allTaxDocs[i].legacy && allTaxDocs[i].legacy.wcgopCatchCategoryCode){
        //     delete allTaxDocs[i].legacy.wcgopSpeciesCode;
        // }
        // if(allTaxDocs[i].pacfinSpeciesCode){
        //     delete allTaxDocs[i].legacy.wcgopSpeciesCode;
        // }
        // if(allTaxDocs[i].pacfinNomCode){
        //     delete allTaxDocs[i].legacy.wcgopSpeciesCode;
        // }
        // if(allTaxDocs[i].isCommon){
        //     delete allTaxDocs[i].legacy.wcgopSpeciesCode;
        // }

        dictTaxonomy[allTaxDocs[i]._id] = allTaxDocs[i];
        // docsToUpdate.push(allTaxDocs[i]);
    }
    
    for(let i = 0; i < allAliasDocs.length; i++){
        allAliasDocs[i].wcgopSpeciesCode = allAliasDocs[i].wcemSpeciesCode;

        if(allAliasDocs[i].wcemSpeciesCode){
            delete allAliasDocs[i].wcemSpeciesCode;
        }
        
        if(allAliasDocs[i].wcemSpeciesCode){
            delete allAliasDocs[i].isCommon;
        }
        
        if(allAliasDocs[i].ifqType == 'MIXED'){
            allAliasDocs[i].isMixed =  true;
        }
        if(allAliasDocs[i].ifqType){
            delete allAliasDocs[i].ifqType;
        }

        let docTaxonomy = dictTaxonomy[allAliasDocs[i].taxonomy._id];
        allAliasDocs[i].taxonomy = docTaxonomy;
        docsToUpdate.push(allAliasDocs[i]);
        
    }
    
    // for(let i = 0; i < allCatchGroupingDocs.length; i++){
    //     if(allCatchGroupingDocs[i].ifqType){
    //         delete allCatchGroupingDocs[i].ifqType;
    //     }

    //     if(allCatchGroupingDocs[i].wcemSpeciesCode){
    //         allCatchGroupingDocs[i].wcgopSpeciesCode = allCatchGroupingDocs[i].wcemSpeciesCode;
    //         delete allCatchGroupingDocs[i].wcemSpeciesCode;
    //     }
    //     if(allCatchGroupingDocs[i].isCommon){
    //         delete allCatchGroupingDocs[i].isCommon;
    //     }


    //     docsToUpdate.push(allCatchGroupingDocs[i]);
    // }


    console.log();

    for( let i = 0; i < docsToUpdate.length; i++){
        // delete docsToInsert[i]._rev;
        // delete docsToInsert[i]._id;
        await couchConnection.insert(docsToUpdate[i]).then((data: any) => {
            console.log(data)
        }).catch((error: any) => {
            console.log("update failed", error, docsToUpdate[i]);
    
        });
    }

    // console.log(await InsertBulkCouchDB(docsToUpdate));

}


// deleteItems();

//CompareEM();

//EditEMAliases();

//pacfinSpeciesCode

//EditEverything(); 






















