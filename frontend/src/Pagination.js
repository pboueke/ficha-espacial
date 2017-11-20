import React from "react";
import { Icon, Menu } from "semantic-ui-react";
import { filter, range } from "ramda";

export default ({page, rowsPerPage, total, onRowsPerPageChange, onPageChange}) => {
  let maxPage = Math.ceil(total/rowsPerPage)
  let inRange = (p) => p >= 1 && p <= Math.ceil(total/rowsPerPage)
  let pages = filter(inRange, range(page-3, page+4))

  let pageButtons = pages.map((p) => (
      <Menu.Item as='a' key={p} active={p == page} onClick={() => onPageChange(p)}>{p}</Menu.Item>
  ))

  let prevPageBtn = page > 1 ? (
      <Menu.Item as='a' icon onClick={() => onPageChange(page-1)}>
      <Icon name='left chevron' />
      </Menu.Item>
  ) : null

  let nextPageBtn = page < maxPage ? (
      <Menu.Item as='a' icon onClick={() => onPageChange(page+1)}>
      <Icon name='right chevron' />
      </Menu.Item>
  ) : null

  return (
      <Menu floated='right' pagination>
      { prevPageBtn }
    { pageButtons }
    { nextPageBtn }
    </Menu>
  )
}
