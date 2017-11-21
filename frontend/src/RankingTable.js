import React from "react";
import { Table } from 'semantic-ui-react'
import Pagination from "./Pagination";

export default ({
  rowsPerPage,
  page,
  sortCol,
  sortOrder,
  candidates,
  handleChangePage,
  handleSort
}) => {
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
            <Table.HeaderCell sorted={sortCol == id && sortOrder} onClick={handleSort(id)}>
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
            onPageChange={handleChangePage}
            />
        </Table.HeaderCell>
      </Table.Footer>
    </Table>
  )
}
