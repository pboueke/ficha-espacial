# ficha-espacial
Projeto que visa realizar o cruzamento de dados eleitorais brasileiros com indicadores sociais a partir de dados abertos e geolocalizados

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