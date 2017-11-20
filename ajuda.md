### Ok, qual é a ideia?

Conectar todos os candidatos ELEITOS a todos os municipios graduados anualmente, com seus respectivos índices/indicatores inclusos, para medir o impacto de políticos nos crescimento desses mesmos indicadores.

### Como foi feito?

#### Para os municípios:

Os dados do indicador geral da FIRJAN foram lidos e carregados na colecão firjan-geral. Nela constam os valores dos indicadores para todos os , para todos os anos. O objeto é o seguinte:

```
obj.year //ano do dado
obj.cod 
obj.region // regiao
obj.uf 
obj.city_name      
obj.score // valor do indicador
obj.rank // ranking entre todos os municipios
obj.location = // 'hash' contendo UF e nome da cidade
obj._key = obj.location + "_" + obj.year; // identificador unico 
```

Como dá pra ver, o mesmo município tem varios registros, um para cada ano (foram carregados de 2005 a 2013). Registros subsequentes estao ligados por uma aresta contendo a diferenca entre o indicador do ano mais recente e o do ano mais antigo. Essas arestas estão na colecao firjan-geral-edges, e podem ser fácilmente vizualisadas no grafo cities-yearly

#### Para os candidatos eleitos:

Os dados de votacao por municipio do TRE foram agregados por candidato e por cidade. Esses dados foram carregados na colecao elected-candidate. O objeto é o seguinte:

```
obj.year
obj.candidate_name
obj.city_name
obj.uf
obj.job  // cargo político (foramn excluidos deputados, devido ao numero exponencialmente grande que a inclusao causaria)
obj.status // sempre ELEITO
obj.votes // total de votos na cidade (não tenho certeza)
obj.location// 'hash' uf + cidade
obj._key = string.normalizePolName(obj.candidate_name)+"_"+obj.location+"_"+year; // identificado unico
```

Além disso, cada um ganhou um registro unico na colecao elected-candidate-person. Esse registro só contem seu nome. Ele está linkado como o atributo "_from", das arestas na colecao elected-candidate-edges, que ligam os candidatos aos objetos da colecao firjam-geral (atributp "_to"). Essa colecao contem as arestas que (também) fazem parte fo grafo cities-elected-yearly.

#### Enfim

O grafo cities-elected-yearly relaciona a evolucao dos indicadores para todas as cidades com os candidatos eleitos para todas elas. A ideia final é que, olhando para um candidato qualquer do grafo, podemos facilemnte detectar de ele tende a gerar um impacto positivo nos municipios nos quais ele atuou.

Escolhendo um candidato qualquer, descemos um nível no grafo, em todas as direcoes. Entao chegamos em todas as cidades e anos nos quais ele atuou. olhando para as arestas que saem das cidades, obtemos imediatamente a variacao do indicador nessas cidades. Olhando para todas as variacoes, sabemos se o candidato teve um efeito positivo ou nao.

Devemos, entao, calucalar a media anual das variacoes municipais e calcular um indice de impacto amortizado para todos os candidatos!