import React, { Component } from "react";
import { Table } from 'semantic-ui-react'
import { reduce, sortWith, ascend, descend, filter, pipe, min, max } from "ramda";
import Pagination from "./Pagination";


let removeWithoutValue = filter(({value}) => value)
let pipeline = sortFn => pipe(
  removeWithoutValue,
  sortWith([sortFn])
)

class Ranking extends Component {
  state = {
    rowsPerPage: 25,
    page: 1,
    sortCol: "value",
    sortOrder: "descending",
    candidates: []
  }

  candidates = () => pipeline(this.sortFn())(this.props.candidates)

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

  render() {
    let candidates = this.candidates()
    let {rowsPerPage, page, sortCol, sortOrder} = this.state

    let cols = [
      { id: "name", title: "Nome" },
      { id: "value", title: "Score" },
      { id: "uf", title: "UF" },
      { id: "city", title: "Cidade" },
      { id: "job", title: "Cargo"},
      { id: "years", title: "Anos" },
    ]

    let rows = candidates
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((c) => (
      <Table.Row>
        {
          cols.map(({id}) => (
            <Table.Cell key={id}> { id == "years" ? c[id].join(", ") : c[id] } </Table.Cell>
          ))
        }
      </Table.Row>
    ))

    return (
      <Table celled sortable>
        <Table.Header>
          <Table.Row>
            {cols.map(({id, title}) => (
              <Table.HeaderCell sorted={sortCol == id && sortOrder} onClick={this.handleSort(id)}>
                { title }
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          { rows }
        </Table.Body>

        <Table.Footer>
          <Table.HeaderCell colSpan='5'>
            <Pagination
              page={page}
              rowsPerPage={25}
              total={candidates.length}
              onPageChange={this.handleChangePage}
              />
          </Table.HeaderCell>
        </Table.Footer>
      </Table>
    )
  }
}

export default Ranking;
