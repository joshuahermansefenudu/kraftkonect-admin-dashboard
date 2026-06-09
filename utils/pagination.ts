// Pure client-side pagination helper. Slices an already-fetched array into a
// page and returns paging metadata.
export function paginateData<T>(data: T[], page: number, pageSize: number) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(data.length / pageSize);

  return {
    data: paginatedData,
    total: data.length,
    page,
    pageSize,
    totalPages,
  };
}
