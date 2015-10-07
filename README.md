HG
===

! __wip__

HG is the new Histograph, a node-express application aiming at providing digital humanities specialists with an online *collaborative* environment.
Connections between **people**, **documents** and **pictures** are stored in a [Neo4j](http://neo4j.com/) graph database.

	git clone https://github.com/CVCEeu-dh/histograph.git

## installation
Once cloned,
	
	npm install

Then copy the `settings.example.js` file to `settings.js`
	
	cp settings.example.js settings.js

adjust the `paths` section of your `settings.js` file, then create the folders and permissions accordingly. For instance, if using the default settings:
	
	cd histograph
    mkdir contents
 	mkdir contents/media	
    mkdir contents/txt
    mkdir contents/cache
	mkdir contents/cache/disambiguation
    mkdir contents/cache/dbpedia
    mkdir contents/cache/queries

Histograph makes use of [node js passport](https://www.npmjs.com/package/passport) social auth as authentication method. It has been tested with [twitter](https://www.npmjs.com/package/passport-twitter) and [google plus](passport-google-oauth).
Obtain the tokens and credentials for those services, then fill the twitter and google section of the `settings.js` file accordingly.

Install [Neo4j](http://neo4j.com/) (v 2.2.*) and configure the database indexing features with auto_indexing in `conf/neo4j.properties` file.

	# Autoindexing

	# Enable auto-indexing for nodes, default is false
	node_auto_indexing=true

	# The node property keys to be auto-indexed, if enabled
	node_keys_indexable=full_search,name_search

Complete the neo4j installation by pointing to a location in your system that will store the neo4j data (`conf/neo4j-server.properties`)

	
	# location of the database directory
	org.neo4j.server.database.location=data/graph.db

start the neo4j server , modify the password and fill the `neo4j.host` section in `settings.js`:

  	neo4j : { // > 2.2
    	host : {
      		server: 'http://localhost:7474',
      		user: 'neo4j',
      		pass: 'neo4j'
    	}
  	},

Run then the setup script: it will add the required constraints to neo4j db.

	node scripts\manage.js --task=setup

Modify neo4j related configuration in your histograph `settings.js` file, then run the unit tests in order to check that everything runs properly.

	npm test


## import data: manage.js script
Once histograph has been installed, documents can be loaded from a csv file via the **import** script by running:
	
	node scripts\manage.js --task=import-resources --source=contents\resources.tsv.example

For detailed instructions about import and annotation process, see the [related wiki page](https://github.com/CVCEeu-dh/histograph/wiki/importing-text-documents-and-configure-the-annotation-script)
	
## Named Entity Recognition
Histograph enable the enrichment of resources with different webservices that extract and disambiguate the name entities found. Among them, we use  (AIDA)[https://github.com/yago-naga/aida] web service, developed by Max Plank Institute.
AIDA entity extracton is enabled by default, but the disambiguation engine works only for english texts.

First of all, set the correct endpoint to yago aida in settings.js:


  	yagoaida: {
    	endpoint: 'https://gate.d5.mpi-inf.mpg.de/aida/service/disambiguate' 
  	},

Then make sure that the disambiguation services include AIDA:

  	disambiguation: {
    	fields: [
      		"title",
      		"caption"
    	],
        services: {
            "yagoaida": ['en']
        }
	}
 

## troubleshooting
### geocoding api setup
Create a new project at [console.developers.google](https://console.developers.google.com/project "https://console.developers.google.com/project"), then select the **geocoding api**
under the `api & auth` menu, copy the api key to the geocoding section of your `settings.js` file.
	
	geocoding: { // google geocoding api
    	endpoint: 'https://maps.googleapis.com/maps/api/geocode/json',
    	key: ''
  	},

 More info available at [geocoding documentation page](https://developers.google.com/maps/documentation/geocoding/)

