export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number; // Общее количество записей
    page: number; // Текущая страница
    limit: number; // Элементов на странице
    totalPages: number; // Всего страниц
    hasNextPage: boolean; // Есть ли следующая страница
    hasPrevPage: boolean; // Есть ли предыдущая страница
  };
}
