import { Col, Pagination, Row } from "react-bootstrap";
import Select from "react-select";

interface ITablePagination {
  total: number;
  currentPage: number;
  perPage: number;
  handlePageChange: any;
  setPerPage: any;
}

export default function TablePagination(props: ITablePagination) {
  const onPageChange = (pageNumber: number) => {
    props.handlePageChange(pageNumber);
  };

  const nextPage = () => {
    props.handlePageChange(props.currentPage + 1);
  };

  const prevPage = () => {
    props.handlePageChange(props.currentPage - 1);
  };

  const pageSizes = [
    { value: 10, label: "10 per page" },
    { value: 20, label: "20 per page" },
    { value: 40, label: "40 per page" },
    { value: 50, label: "50 per page" },
  ];

  return (
    <div className="bg-white">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <Select
            options={pageSizes}
            value={pageSizes.find((item) => item.value === props.perPage)}
            onChange={(e: any) => props.setPerPage(e.value)}
            className="fs-12"
          />
        </div>
        <div className="d-flex  align-items-center">
          <div>
            <p className="small mb-0">
              Showing {props.currentPage * props.perPage - props.perPage + 1} -{" "}
              {Math.min(props.currentPage * props.perPage, props.total)} of{" "}
              {props.total} results
            </p>
          </div>
          <div className="ms-3">
            <Pagination
              size="sm"
              className="justify-content-end align-items-center mb-0"
            >
              {/* <Pagination.First /> */}
              {props.currentPage - 1 > 0 && (
                <Pagination.Prev className="previous" onClick={prevPage} />
              )}
              {props.currentPage - 3 > 0 && (
                <Pagination.Item
                  onClick={() => onPageChange(props.currentPage - 3)}
                >
                  {props.currentPage - 3}
                </Pagination.Item>
              )}
              {props.currentPage - 2 > 0 && (
                <Pagination.Item
                  onClick={() => onPageChange(props.currentPage - 2)}
                >
                  {props.currentPage - 2}
                </Pagination.Item>
              )}
              {props.currentPage - 1 > 0 && (
                <Pagination.Item
                  onClick={() => onPageChange(props.currentPage - 1)}
                >
                  {props.currentPage - 1}
                </Pagination.Item>
              )}
              <Pagination.Item active>{props.currentPage}</Pagination.Item>
              {props.total / props.currentPage > props.perPage && (
                <Pagination.Item
                  onClick={() => onPageChange(props.currentPage + 1)}
                >
                  {props.currentPage + 1}
                </Pagination.Item>
              )}
              {props.total / (props.currentPage + 1) > props.perPage && (
                <Pagination.Item
                  onClick={() => onPageChange(props.currentPage + 2)}
                >
                  {props.currentPage + 2}
                </Pagination.Item>
              )}
              {props.total / (props.currentPage + 2) > props.perPage && (
                <Pagination.Item
                  onClick={() => onPageChange(props.currentPage + 3)}
                >
                  {props.currentPage + 3}
                </Pagination.Item>
              )}
              {props.total / props.currentPage > props.perPage && (
                <Pagination.Next className="next" onClick={nextPage} />
              )}
              {/* <Pagination.Last /> */}
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
