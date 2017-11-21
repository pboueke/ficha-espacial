import React, { Component } from "react";
import { Dropdown, Form } from "semantic-ui-react";
import {
  allPass,
  any,
  map,
  uniq,
  ascend,
  descend,
  filter,
  max,
  min,
  pipe,
  prop,
  range,
  reduce,
  sortWith,
} from "ramda";
import RankingTable from "./RankingTable"

let yearFilter = start => end => pipe(
  prop("years"),
  any((y) => y >= start && y <= end)
)

// This is not working properly
let fuzzyCityFilter = text => ({city}) => (
  city.toLowerCase().indexOf(text.toLowerCase()) >= 0
)

let ufFilter = (ufs) => ({uf}) => ufs.length == 0 || ufs.indexOf(uf) >= 0

let removeWithoutValue = filter(({value}) => value)
let pipeline = (sortFn, filters) => pipe(
  removeWithoutValue,
  sortWith([sortFn]),
  filter(allPass(filters))
)

class Ranking extends Component {
  state = {
    rowsPerPage: 25,
    page: 1,
    sortCol: "value",
    sortOrder: "descending",
    filters: {
      startYear: 2000,
      endYear: 2020,
      fuzzyCity: "",
      uf: []
    },
    candidates: []
  }

  candidates = () => pipeline(this.sortFn(), this.filters())(this.props.candidates)

  sortFn = () => {
    let {sortCol, sortOrder} = this.state

    let ascending = sortOrder == "ascending"

    // Get first or last year depending on direction
    let getYear = reduce(
      ascending ? min : max,
      ascending ? Infinity : -Infinity,
    )
    let g = sortCol == "years" ? (x) => getYear(x.years) : (x) => x[sortCol]

    return ascending ? ascend(g) : descend(g)
  }

  filters = () => [
    yearFilter(this.state.filters.startYear)(this.state.filters.endYear),
    fuzzyCityFilter(this.state.filters.fuzzyCity),
    ufFilter(this.state.filters.uf),
  ]

  handleChangePage = (page) => this.setState({page})
  handleChangeRowsPerPage = (rowsPerPage) => this.setState({rowsPerPage})

  handleSort = (clickedColumn) => () => {
    const { sortCol, sortOrder } = this.state

    if (sortCol !== clickedColumn) {
      this.setState({
        sortCol: clickedColumn,
        sortOrder: 'ascending'
      })

      return
    }

    this.setState({
      sortOrder: sortOrder === 'ascending' ? 'descending' : 'ascending'
    })
  }

  handleChangeFilter = (filter) => (_, {value}) => this.changeFilter(filter)(value)

  changeFilter = (filter) => (value) => {
    console.log(filter, value)
    this.setState({filters: {
      ...this.state.filters,
      [filter]: value
    }})
  }

  render() {
    let candidates = this.candidates()
    let {rowsPerPage, page, sortCol, sortOrder} = this.state
    let {handleChangePage, handleSort} = this
    let tableProps = {rowsPerPage, page, sortCol, sortOrder, candidates, handleChangePage, handleSort}

    let years = range(2000, 2021)
    let valToOption = (y) => ({ key: y, value: y, text: y })
    let yearOptions = years.map(valToOption)
    let ufs = [
      'AC', 'AL', 'AM', 'AP', 'BA',
      'CE', 'DF', 'ES', 'GO', 'MA',
      'MG', 'MS', 'MT', 'PA', 'PB',
      'PE', 'PI', 'PR', 'RJ', 'RN',
      'RO', 'RR', 'RS', 'SC', 'SE',
      'SP', 'TO'
    ]
    let ufOptions = ufs.map(valToOption)

    let yearFilter = (
      <Form>
        <Form.Dropdown inline selection
                       label="Ano Inicio"
                       onChange={this.handleChangeFilter("startYear")}
                       options={yearOptions}/>
        <Form.Dropdown inline selection
                       label="Ano Fim"
                       onChange={this.handleChangeFilter("endYear")}
                       options={yearOptions}/>
        <Form.Dropdown inline selection multiple
                       label="UF"
                       onChange={this.handleChangeFilter("uf")}
                       options={ufOptions}/>
        <Form.Input inline label="Cidade" onChange={this.handleChangeFilter("fuzzyCity")}/>
      </Form>
    )

    return (
      <div>
        { yearFilter }
        <RankingTable {...tableProps}/>
      </div>
    )
  }
}

export default Ranking;
