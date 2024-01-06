import { Pagination } from "@nextui-org/react"

const PaginateTable = ({ page, pages, setPage, paginationKey }: { page: number, pages: number, setPage: any, paginationKey: number }) => {
  return (
    <Pagination
      className="flex justify-center"
      color="primary"
      variant="light"
      page={page}
      total={pages}
      onChange={(page) => setPage(page)}
      showControls={true}
      key={paginationKey}
      dotsJump={10}
      boundaries={5}
    />
  )
}

export default PaginateTable