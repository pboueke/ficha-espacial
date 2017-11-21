# ficha-espacial

Project that aims at cross-referencing Brazilian electoral data with social indicators from open and geolocalized data.

[PT-BR] Pitch: https://pboueke.github.io/ficha-espacial/presentation/

Elected candidates ranking: http://ficha-espacial.surge.sh

## Modelling

Simply put, the idea is to use a social indicator variation to infer a relative effectiveness rate for the elected political entities over the years for the many cities of Brazil. 

For the first iteration, we will be using the social and economic indicators produced by FRIJAN and the TRERJ election data, which have the needed year granularity for a proper yearly analysis. 

The basic model consists of creating yearly nodes for cities, containing the indicator value for that year. Those nodes are connected to the following year with an edge of wheight defined by the indicator variation. Political entitiy nodes (say, the elected officials and legislators) are also connected to the yearly city nodes, but by wheightless edges. All political nodes are connected to all cities for which they have been elected.

By such model, we can iterate over the yearly variations for cities, for political entities and for the global state as a hole. Hopefully, this will also allow us to apply graph related analysis to the problem. 

## Setup

### Node

Simply install the node dependencies and add a .env file containing: 

* ARANGODB_HOST=dbhost
* ARANGODB_PORT=dbport
* ARANGODB_DB=dbname
* ARANGODB_USERNAME=dbuser
* ARANGODB_PASSWORD=dbpassword

### Database

#### Instalation 

You must have a running instance of the [ArangoDb](https://www.arangodb.com/). You can install it locally (which is really easy on linux) or load an image. If you are into AWS, they have a free AMI at the marketplace.

#### Configuration

Create a new database and create a new collection for each data source you intend to load. The collection names should have the same name as the data source.

#### Loading Data

Data loading is done by using the 'load' command, currently as: 

```$ node fichae load <source> <year> <path/to/file> ```

There are examples of loading data at the 'Data Sources' section.

#### Creating Data

##### Edges

Graphs require edges. This is how you create them.

```$ node fichae create-edges -t <type> -s <source> -y <year> -d <destiny>```

* ```-t, --type```
    * Required
    * Possible values:
        * ```years```: creates edges between firjan index nodes (cities), containing a delta attribute consisting of the firjan index variation
        * ```elections```: creates edgest from candidates (elected-candidate-person vertexes) to cities (firjan-geral vertexes) 

* ```-y, --year```
    * Required
    * The year, same as the second argument of the load command

* ```-d , --destiny```
    * Required only for type ```elections```. It is the cities collection, the ```_to``` source collection.

* ```-s, --source```
    * Required
    * The collection for the ```_from``` attribure of the edge.

##### Measurements

```$ node fichae measure -m <measure> -s <collection>```

* ```-m, --measure```
    * Required
    * The type of measure. Supported types:
        * ```m1```: a simple average of all indicator vaariations for firjan type indicators, for all the cities for each candidate by year
        * ```m2```: same as ```m1```, but subtracts the yearly average increase from each time the indicatior variation was measured
    
* ```-s, --save```
    * Required
    * The collection where the indicator will be saved

## Data Sources

Definition of data sources used by the "load" command at src/fichae-load.js  

### TRE

The readme file (LEIAME.pdf) provided by the tre data source contains the table headers and column descriptions in portuguese.

1. tre-consulta-cand
    * Type: .txt delimited by ";"
    * Source: http://www.tre-rj.jus.br/site/eleicoes/repositorio_dados/repositorio.jsp
    * Example: consulta_cand_2016_RJ.txt @ Candidatos > 2016 > Candidatos (formato ZIP)
    * Loading: "node fichae load tre-consulta-cand 2016 ~/Data/consulta_cand_2016_RJ.txt"

2. tre-bem-candidato
    * Type: .txt delimited by ";"
    * Source: http://www.tre-rj.jus.br/site/eleicoes/repositorio_dados/repositorio.jsp
    * Example: bem_candidato_2016_RJ.txt @ Candidatos > 2016 > Bens de candidatos (formato ZIP)
    * Loading: "node fichae load tre-bem-candidato 2016 ~/Data/bem_candidato_2016_RJ.txt"

3. tre-votacao-candidato
    * Type: .txt delimited by ";"
    * Source: http://www.tre-rj.jus.br/site/eleicoes/repositorio_dados/repositorio.jsp
    * Example: votacao_candidato_munzona_2016_RJ.txt @ Candidatos > 2016 > Votação nominal por município e zona (formato ZIP)
    * Loading: "node fichae load tre-votacao-candidato 2016 ~/Data/votacao_candidato_munzona_2016_RJ.txt"

4. tre-perfil-eleitor
    * Type: .txt delimited by ";"
    * Source: http://www.tre-rj.jus.br/site/eleicoes/repositorio_dados/repositorio.jsp
    * Example: perfil_eleitor_secao_2016_RJ.txt @ Candidatos > 2016 > Perfil do eleitorado por seção eleitoral
    * Loading: "node fichae load tre-perfil-eleitor 2016 ~/Data/perfil_eleitor_secao_2016_RJ.txt"

### Firjan

1. firjan-*
    * Type: .txt delimited by "\t"
    * Source: http://www.firjan.com.br/ifdm/consulta-ao-indice/
    * Example: any text file with a header like "Code\tRegion\tState\tCity\tScore\tRanking", generated from one of the .xlsx files at the firjan website.
    * Loading: "node fichae load firjan-geral 2016 ~/Data/firjan-geral_2016_RJ.txt"

### TRE - Custom

1. elected-candidate
    * type .csv delimited by ","
    * Aggregated elections results by candidate and by city (see model: elected-candidate.js)
    * Loading: "node fichae load elected-candidate 2012 ~/Data/eleicoes_2012.csv "
